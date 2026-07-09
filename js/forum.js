/**
 * Smart Farmer Assistant - Community Forum Interactions
 * Uses modular services (forumService, forumRealtime) to connect with Supabase.
 * Enforces dynamic loading state text, offline connection recovery, and realtime cross-device syncing.
 */

import { forumService } from './forumService.js';
import { forumRealtime } from './forumRealtime.js';
import { forumStorage } from './forumStorage.js';
import { authService, notify } from '../services/supabase.service.js';

let currentUser = null;

// Initialize Forum
async function initForum() {
  // Check online status initially
  if (!navigator.onLine) {
    showOfflineBanner();
  } else {
    hideOfflineBanner();
  }

  renderLoadingSkeleton("Connecting...");

  try {
    const session = await authService.getSession();
    if (!session || !session.user) {
      renderLoginRequired();
      return;
    }

    await checkUserSession(session);
    await loadForumData();
    
    // Subscribe to PostgreSQL Realtime events (INSERT, UPDATE, DELETE)
    forumRealtime.subscribe(
      (payload) => {
        console.log('Realtime post change:', payload);
        loadForumData(false); // Silent reload
      },
      (payload) => {
        console.log('Realtime comment change:', payload);
        loadForumData(false); // Silent reload
      }
    );

  } catch (error) {
    console.error("Initialization failed:", error);
    renderErrorState("Failed to connect to authentication server. Please try again.");
  }
}

// Check user session
async function checkUserSession(session) {
  try {
    const profile = await authService.getProfile(session.user.id);
    let displayName = (profile && profile.full_name) || (profile && profile.username) || session.user.email;
    let village = profile && profile.village_name;
    
    if (village) {
      displayName += ` (Farmer, ${village})`;
    }

    currentUser = {
      id: session.user.id,
      name: displayName,
      isExpert: session.user.email.endsWith('@tnau.ac.in') || session.user.email.includes('expert')
    };

    const authorInput = document.getElementById("post-author");
    if (authorInput) {
      authorInput.value = (profile && profile.full_name) || (profile && profile.username) || "";
    }
  } catch (err) {
    console.warn("Failed to retrieve user session:", err.message);
  }
}

// Load forum posts and comments
async function loadForumData(showSkeleton = true) {
  if (showSkeleton) {
    renderLoadingSkeleton("Loading Posts...");
  }

  try {
    const processedPosts = await forumService.loadData();
    renderForumPosts(processedPosts);
  } catch (error) {
    console.error("Failed to load forum data:", error);
    renderErrorState(error.message || "An unexpected database connection error occurred.");
  }
}

window.retryLoadData = function () {
  loadForumData(true);
};

// Render Login Required screen
function renderLoginRequired() {
  const stream = document.getElementById("forum-posts-stream");
  if (!stream) return;
  
  stream.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 50px 30px; text-align: center; color: white; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
      <i class="fas fa-lock" style="font-size: 3.5rem; color: #ffd54f; margin-bottom: 20px; text-shadow: 0 0 10px rgba(255, 213, 79, 0.3);"></i>
      <h3 style="font-size: 1.5rem; margin-bottom: 10px; font-weight: 700;">Authentication Required</h3>
      <p style="color: #ccc; margin-bottom: 25px; max-width: 450px; margin-left: auto; margin-right: auto; line-height: 1.6;">
        To view discussion threads and participate, please sign in.
      </p>
      <a href="login.html" class="btn" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 30px; border-radius: 30px; font-weight: bold; background: var(--primary-green); color: white; text-decoration: none; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
        <i class="fas fa-sign-in-alt"></i> Login Now
      </a>
    </div>
  `;
  
  const formBox = document.getElementById("forum-post-form")?.parentElement;
  if (formBox) {
    formBox.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <i class="fas fa-user-shield" style="font-size: 2.5rem; color: #81c784; margin-bottom: 12px;"></i>
        <h4 style="color: #333; margin-bottom: 6px;">Secure Access</h4>
        <p style="font-size: 0.82rem; color: #666; margin: 0; line-height: 1.4;">
          Your posts are completely private and only visible to you.
        </p>
      </div>
    `;
  }
}

// Render Loading Skeleton
function renderLoadingSkeleton(statusText = "Loading Posts...") {
  const stream = document.getElementById("forum-posts-stream");
  if (!stream) return;
  
  stream.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.95); border: 1.5px solid #e8f5e9; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; color: #333; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow);">
      <i class="fas fa-spinner fa-spin" style="color: var(--primary-green);"></i>
      <span>${statusText}</span>
    </div>
    <div style="background: white; border: 1px solid #e8f5e9; border-radius: 12px; padding: 25px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 15px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
        <div style="width: 120px; height: 16px; background: #eee; border-radius: 4px; animation: skeleton-pulse 1.5s infinite;"></div>
        <div style="width: 80px; height: 16px; background: #eee; border-radius: 12px; animation: skeleton-pulse 1.5s infinite;"></div>
      </div>
      <div style="width: 70%; height: 22px; background: #eee; border-radius: 4px; animation: skeleton-pulse 1.5s infinite;"></div>
      <div style="width: 100%; height: 14px; background: #eee; border-radius: 4px; animation: skeleton-pulse 1.5s infinite;"></div>
      <div style="width: 90%; height: 14px; background: #eee; border-radius: 4px; animation: skeleton-pulse 1.5s infinite;"></div>
    </div>
    <style>
      @keyframes skeleton-pulse {
        0% { opacity: 0.6; }
        50% { opacity: 0.9; }
        100% { opacity: 0.6; }
      }
    </style>
  `;
}

// Render Error State
function renderErrorState(message) {
  const stream = document.getElementById("forum-posts-stream");
  if (!stream) return;
  
  stream.innerHTML = `
    <div style="background: white; border: 1px solid #ffebee; border-radius: 12px; padding: 40px; text-align: center; color: #c62828; box-shadow: var(--shadow);">
      <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #e53935; margin-bottom: 15px;"></i>
      <h4 style="margin: 0 0 10px 0; color: #333;">Error Loading Forum</h4>
      <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">${message}</p>
      <button onclick="retryLoadData()" class="btn" style="width: auto; display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 20px; font-weight: 700;">
        <i class="fas fa-sync-alt"></i> Retry Connection
      </button>
    </div>
  `;
}

// Render Forum Feed
function renderForumPosts(posts) {
  const stream = document.getElementById("forum-posts-stream");
  if (!stream) return;

  const isTamil = typeof currentLang !== "undefined" && currentLang === "ta";

  if (posts.length === 0) {
    stream.innerHTML = `
      <div style="background: white; border: 1px solid #e8f5e9; border-radius: 12px; padding: 40px; text-align: center; color: #888; font-style: italic; box-shadow: var(--shadow);">
        <i class="far fa-comments" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
        <p>No questions found matching your filter criteria.</p>
      </div>
    `;
    return;
  }

  stream.innerHTML = posts
    .map((p) => {
      // Badges
      const categoryBadge =
        p.category === "pest"
          ? `<span style="background: #ffebee; color: #c62828; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;">Pest & Disease</span>`
          : p.category === "market"
            ? `<span style="background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;">Market Prices</span>`
            : p.category === "irrigation"
              ? `<span style="background: #e0f7fa; color: #00838f; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;">Irrigation</span>`
              : `<span style="background: #f3e5f5; color: #6a1b9a; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;">General</span>`;

      // Attached Image with Lazy Loading
      const postImg = p.image_url
        ? `<img src="${p.image_url}" loading="lazy" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin: 15px 0; border: 1px solid #ddd; object-fit: cover;" />`
        : "";

      // Comments list
      const commentsHtml = p.comments
        .map(
          (c) => {
            const isExpert = c.author.includes('Expert') || c.author.includes('TNAU');
            return `
              <div style="background: ${isExpert ? "#f1f8e9" : "#f9f9f9"}; border-left: 3px solid ${isExpert ? "var(--primary-green)" : "#ccc"}; padding: 12px 15px; border-radius: 4px; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.8rem;">
                  <span style="font-weight: 700; color: ${isExpert ? "#1b5e20" : "#444"}; display: flex; align-items: center; gap: 4px;">
                    ${c.author} ${isExpert ? '<span style="background: var(--primary-green); color: white; padding: 1px 6px; border-radius: 10px; font-size: 0.65rem; font-weight: bold;"><i class="fas fa-check-circle"></i> Expert</span>' : ""}
                  </span>
                  <span style="color: #888;">${c.date}</span>
                </div>
                <p style="margin: 0; font-size: 0.85rem; color: #333; line-height: 1.5;">${c.comment}</p>
              </div>
            `;
          }
        )
        .join("");

      return `
      <div style="background: white; border: 1px solid #e8f5e9; border-radius: 12px; padding: 25px; box-shadow: var(--shadow); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        
        <!-- Post Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700; color: var(--primary-green); font-size: 0.9rem;">${p.author_name}</span>
            <span style="font-size: 0.75rem; color: #888; margin-top: 2px;"><i class="far fa-calendar-alt"></i> ${p.date}</span>
          </div>
          ${categoryBadge}
        </div>

        <!-- Post Body -->
        <h4 style="font-size: 1.15rem; color: #222; font-weight: 700; margin: 0 0 10px 0; line-height: 1.4;">${p.title}</h4>
        <p style="font-size: 0.92rem; color: #444; line-height: 1.6; margin: 0;">${p.description}</p>
        ${postImg}

        <!-- Post Action Bar -->
        <div style="display: flex; gap: 20px; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">
          <button onclick="upvotePost('${p.id}')" style="background: #fff3e0; border: 1px solid #ffe0b2; color: #e65100; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;" onmouseover="this.style.background='#ffe0b2'" onmouseout="this.style.background='#fff3e0'">
            <i class="far fa-thumbs-up"></i> ${isTamil ? "ஆதரவு" : "Upvote"} (${p.upvotes})
          </button>
          <span style="font-size: 0.82rem; color: #666; font-weight: 600;">
            <i class="far fa-comments"></i> ${p.comments.length} ${isTamil ? "பதில்கள்" : "Comments"}
          </span>
        </div>

        <!-- Comments Section -->
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px dashed #eee;">
          ${commentsHtml}
          
          <!-- Comment Input form -->
          <div style="display: flex; gap: 10px; margin-top: 15px; align-items: center;">
            <input type="text" id="reply-input-${p.id}" placeholder="${isTamil ? "உங்கள் பதிலை எழுதுங்கள்..." : "Write a comment..."}" style="flex-grow: 1; padding: 10px 14px; border: 1.5px solid #ddd; border-radius: 20px; font-size: 0.85rem; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--primary-green)'" onblur="this.style.borderColor='#ddd'" />
            <button onclick="submitReply('${p.id}')" class="btn" style="width: auto; margin: 0; padding: 8px 18px; font-size: 0.82rem; border-radius: 20px; font-weight: 700;">
              ${isTamil ? "பதில்" : "Comment"}
            </button>
          </div>
        </div>

      </div>
    `;
    })
    .join("");

  if (typeof window.checkAndTranslate === "function") {
    window.checkAndTranslate();
  }
}

// Combined Filter, Search & Sort function
window.filterAndSearchForum = function () {
  const category = document.getElementById("forum-filter").value;
  const sortBy = document.getElementById("forum-sort").value;
  const searchQuery = document.getElementById("forum-search").value;
  const searchType = document.getElementById("forum-search-type").value;

  forumService.setFilter('category', category);
  forumService.setFilter('sortBy', sortBy);
  forumService.setFilter('searchQuery', searchQuery);
  forumService.setFilter('searchType', searchType);

  const processed = forumService.getProcessedPosts();
  renderForumPosts(processed);
};

// Increment Upvotes (Optimistic UI)
window.upvotePost = async function (id) {
  try {
    const post = forumService.posts.find(p => p.id === id);
    if (post) {
      post.upvotes++;
      const processed = forumService.getProcessedPosts();
      renderForumPosts(processed);

      // Perform background database save
      await forumService.upvote(id);
    }
  } catch (err) {
    console.error("Error upvoting post in Supabase:", err);
    notify("Failed to register upvote. Try again.", "error");
    
    // Rollback
    const post = forumService.posts.find(p => p.id === id);
    if (post) {
      post.upvotes--;
      const processed = forumService.getProcessedPosts();
      renderForumPosts(processed);
    }
  }
};

// Handle Comment submission (Optimistic UI)
window.submitReply = async function (id) {
  const input = document.getElementById(`reply-input-${id}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    alert("Comment text cannot be empty!");
    return;
  }

  let author = "Farmer Member";
  if (currentUser) {
    author = currentUser.name;
  }

  const tempCommentId = `temp-${Date.now()}`;
  const optimisticComment = {
    id: tempCommentId,
    post_id: id,
    author: author,
    comment: forumService.sanitize(text),
    created_at: new Date().toISOString(),
    date: forumService.formatDate(new Date())
  };

  try {
    forumService.comments.push(optimisticComment);
    const processed = forumService.getProcessedPosts();
    renderForumPosts(processed);
    input.value = "";

    await forumService.addComment(id, author, text);
    notify("Comment posted!", "success");
  } catch (err) {
    console.error("Error submitting comment:", err);
    notify("Failed to submit comment. Make sure you are logged in.", "error");

    forumService.comments = forumService.comments.filter(c => c.id !== tempCommentId);
    const processed = forumService.getProcessedPosts();
    renderForumPosts(processed);
    input.value = text;
  }
};

// Image Preview for Question Submission
let selectedFile = null;
window.previewForumImage = function (event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = function (e) {
    const previewBox = document.getElementById("forum-img-preview-box");
    const previewImg = document.getElementById("forum-img-preview");
    if (previewImg) previewImg.src = e.target.result;
    if (previewBox) previewBox.style.display = "block";
  };
  reader.readAsDataURL(file);
};

window.clearForumImage = function () {
  selectedFile = null;
  const fileInput = document.getElementById("forum-file-input");
  const previewBox = document.getElementById("forum-img-preview-box");
  if (fileInput) fileInput.value = "";
  if (previewBox) previewBox.style.display = "none";
};

// Create a new post
window.submitForumPost = async function (event) {
  event.preventDefault();

  const authorInput = document.getElementById("post-author");
  const titleInput = document.getElementById("post-title");
  const descInput = document.getElementById("post-desc");
  const categorySelect = document.getElementById("post-category");

  if (!authorInput || !titleInput || !descInput || !categorySelect) return;

  const author = authorInput.value.trim();
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const category = categorySelect.value;

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const origBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;

  try {
    let imageUrl = null;

    // Phase 1: Upload Image (displays loading status)
    if (selectedFile) {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Image...';
      imageUrl = await forumStorage.uploadImage(selectedFile);
    }

    // Phase 2: Save Post Data (displays loading status)
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    await forumService.createPost(author, title, desc, category, imageUrl);
    
    document.getElementById("forum-post-form").reset();
    window.clearForumImage();
    notify('Question published successfully!', 'success');
    
    await loadForumData(false);

  } catch (err) {
    console.error("Error creating post:", err);
    notify(`Failed to publish: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = origBtnHtml;
  }
};

// Offline Banner Controls
function showOfflineBanner() {
  let banner = document.getElementById('forum-offline-banner');
  if (!banner) {
    const container = document.querySelector('.container');
    if (container) {
      banner = document.createElement('div');
      banner.id = 'forum-offline-banner';
      banner.style.cssText = `
        background: #e53935;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100;
      `;
      banner.innerHTML = `
        <i class="fas fa-wifi-slash" style="animation: pulse 1.5s infinite;"></i>
        <span>You are offline. Showing cached posts. Reconnecting automatically...</span>
        <style>
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        </style>
      `;
      container.insertBefore(banner, container.children[2] || container.firstChild);
    }
  } else {
    banner.style.display = 'flex';
  }
  
  const submitBtn = document.querySelector('#forum-post-form button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
}

function hideOfflineBanner() {
  const banner = document.getElementById('forum-offline-banner');
  if (banner) {
    banner.style.display = 'none';
  }
  
  const submitBtn = document.querySelector('#forum-post-form button[type="submit"]');
  if (submitBtn) submitBtn.disabled = false;
}

// Connection Listeners
window.addEventListener('online', async () => {
  hideOfflineBanner();
  notify("Back online! Reconnecting and syncing updates...", "success");
  
  // Re-subscribe and fetch missed updates
  forumRealtime.subscribe(
    () => loadForumData(false),
    () => loadForumData(false)
  );
  await loadForumData(false);
});

window.addEventListener('offline', () => {
  showOfflineBanner();
  notify("Internet connection lost. You are offline.", "error");
});

// Clean up real-time on page unload
window.addEventListener("unload", () => {
  forumRealtime.unsubscribe();
});

// DOM Load Initialization
window.addEventListener("DOMContentLoaded", () => {
  initForum();
});
