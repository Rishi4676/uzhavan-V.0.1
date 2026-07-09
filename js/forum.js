/**
 * Smart Farmer Assistant - Community Forum Interactions
 * Uses modular local forumService with zero Supabase dependencies.
 */

import { forumService } from './forumService.js';

// Initialize Forum
async function initForum() {
  if (!navigator.onLine) {
    showOfflineBanner();
  } else {
    hideOfflineBanner();
  }

  await loadForumData();
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
    renderErrorState("An unexpected connection error occurred.");
  }
}

window.retryLoadData = function () {
  loadForumData(true);
};

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
        <i class="fas fa-sync-alt"></i> Retry
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

// Increment Upvotes
window.upvotePost = async function (id) {
  try {
    await forumService.upvote(id);
    const processed = forumService.getProcessedPosts();
    renderForumPosts(processed);
  } catch (err) {
    console.error("Error upvoting post:", err);
  }
};

// Handle Comment submission
window.submitReply = async function (id) {
  const input = document.getElementById(`reply-input-${id}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    alert("Comment text cannot be empty!");
    return;
  }

  const author = "Farmer Member";

  try {
    await forumService.addComment(id, author, text);
    const processed = forumService.getProcessedPosts();
    renderForumPosts(processed);
    input.value = "";
    notify("Comment posted!", "success");
  } catch (err) {
    console.error("Error submitting comment:", err);
    notify("Failed to submit comment.", "error");
  }
};

// Image Preview for Question Submission
let selectedFileBase64 = null;
window.previewForumImage = function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    selectedFileBase64 = e.target.result;
    const previewBox = document.getElementById("forum-img-preview-box");
    const previewImg = document.getElementById("forum-img-preview");
    if (previewImg) previewImg.src = e.target.result;
    if (previewBox) previewBox.style.display = "block";
  };
  reader.readAsDataURL(file);
};

window.clearForumImage = function () {
  selectedFileBase64 = null;
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
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

  try {
    await forumService.createPost(author, title, desc, category, selectedFileBase64);
    
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
        <span>You are offline. Showing cached posts.</span>
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
}

function hideOfflineBanner() {
  const banner = document.getElementById('forum-offline-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

// Connection Listeners
window.addEventListener('online', async () => {
  hideOfflineBanner();
  notify("Back online!", "success");
  await loadForumData(false);
});

window.addEventListener('offline', () => {
  showOfflineBanner();
  notify("Internet connection lost.", "error");
});

// Toast Notifications Helper
function notify(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#2e7d32' : type === 'error' ? '#c62828' : '#1565c0';
  
  toast.style.cssText = `
    background: ${bgColor};
    color: #ffffff;
    padding: 14px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    min-width: 280px;
    max-width: 400px;
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
  `;

  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  }, 50);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px) scale(0.9)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// DOM Load Initialization
window.addEventListener("DOMContentLoaded", () => {
  initForum();
});
