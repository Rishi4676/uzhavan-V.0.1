/**
 * Smart Farmer Assistant - Community Forum Interactions
 * Allows farmers to post questions, attach photos, comment/reply, and upvote threads.
 */

let forumPosts = [];
let attachedPhotoData = null;

// Mock database of pre-existing posts
const mockForumPosts = [
  {
    id: 301,
    author: "K. Swaminathan (Farmer, Trichy)",
    title: "Black spots appearing on my paddy leaves. Need immediate advice.",
    category: "pest",
    desc: "Hi everyone, I have noticed some diamond-shaped brown spots with greyish centers on my paddy crop leaves. It is starting to spread in some fields. What is this disease and what organic treatment can I spray?",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=350&fit=crop",
    upvotes: 14,
    date: "July 4, 2026",
    replies: [
      {
        id: 3011,
        author: "Dr. A. Murugan (Agri Expert, TNAU)",
        text: "This is definitely Rice Blast disease (குலை நோய்), a fungal infection. For organic control, spray Pseudomonas fluorescens bio-agent at 10g per liter of water. Alternatively, you can use Tricyclazole 75% WP chemical spray (1.5g/L) if the spread is severe. Ensure proper drainage in your nursery.",
        isExpert: true,
        date: "July 4, 2026",
      },
      {
        id: 3012,
        author: "S. Palanisamy (Farmer, Salem)",
        text: "I faced this blast disease last month. Dr. Murugan's suggestion of Pseudomonas worked wonders in 10 days. Spray in early morning hours.",
        isExpert: false,
        date: "July 5, 2026",
      },
    ],
  },
  {
    id: 302,
    author: "M. Harish (Farmer, Madurai)",
    title: "Good cotton market rates in Salem Mandi today!",
    category: "market",
    desc: "I sold my cotton batch at Salem market today for Rs 8,300 per quintal. The demand is strong. Are rates in Coimbatore market comparable? Should I hold my remaining stock or sell now?",
    image: null,
    upvotes: 9,
    date: "July 5, 2026",
    replies: [
      {
        id: 3021,
        author: "R. Rajesh (Market Analyst)",
        text: "Salem rates are currently the best in Western Tamil Nadu. Coimbatore is hovering around Rs 8,100. I advise selling 50% of your remaining cotton crop now and holding the rest, as export orders are active but monsoon arrivals might depress prices slightly next week.",
        isExpert: true,
        date: "July 5, 2026",
      },
    ],
  },
  {
    id: 303,
    author: "S. K. Anand (Farmer, Thanjavur)",
    title: "Banana Drip Irrigation - Emitter spacing query",
    category: "irrigation",
    desc: "I am installing a new drip line for my Grand Naine banana crop. The soil is clayey loam. What is the recommended emitter spacing and flow rate per hour for optimal soil wetting?",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c3a9?w=600&h=350&fit=crop",
    upvotes: 6,
    date: "July 3, 2026",
    replies: [
      {
        id: 3031,
        author: "Dr. L. Meenakshi (Irrigation Specialist)",
        text: "For banana in clayey loam, place online drippers at a spacing of 40cm or 50cm along the lateral lines. Recommended emitter discharge is 2 Liters/hour. Since the soil holds water well, run the system for 45 minutes to 1 hour daily in summer, or alternate days during monsoon.",
        isExpert: true,
        date: "July 4, 2026",
      },
    ],
  },
];

// Initialize Forum
function initForum() {
  const saved = localStorage.getItem("forum_posts");
  if (saved) {
    forumPosts = JSON.parse(saved);
  } else {
    forumPosts = [...mockForumPosts];
    localStorage.setItem("forum_posts", JSON.stringify(forumPosts));
  }
  renderForumPosts(forumPosts);
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
        <p>No questions found in this category. Be the first to ask!</p>
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

      // Attached Image
      const postImg = p.image
        ? `<img src="${p.image}" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin: 15px 0; border: 1px solid #ddd; object-fit: cover;" />`
        : "";

      // Replies list
      const repliesHtml = p.replies
        .map(
          (r) => `
      <div style="background: ${r.isExpert ? "#f1f8e9" : "#f9f9f9"}; border-left: 3px solid ${r.isExpert ? "var(--primary-green)" : "#ccc"}; padding: 12px 15px; border-radius: 4px; margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.8rem;">
          <span style="font-weight: 700; color: ${r.isExpert ? "#1b5e20" : "#444"}; display: flex; align-items: center; gap: 4px;">
            ${r.author} ${r.isExpert ? '<span style="background: var(--primary-green); color: white; padding: 1px 6px; border-radius: 10px; font-size: 0.65rem; font-weight: bold;"><i class="fas fa-check-circle"></i> Expert</span>' : ""}
          </span>
          <span style="color: #888;">${r.date}</span>
        </div>
        <p style="margin: 0; font-size: 0.85rem; color: #333; line-height: 1.5;">${r.text}</p>
      </div>
    `,
        )
        .join("");

      return `
      <div style="background: white; border: 1px solid #e8f5e9; border-radius: 12px; padding: 25px; box-shadow: var(--shadow); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        
        <!-- Post Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700; color: var(--primary-green); font-size: 0.9rem;">${p.author}</span>
            <span style="font-size: 0.75rem; color: #888; margin-top: 2px;"><i class="far fa-calendar-alt"></i> ${p.date}</span>
          </div>
          ${categoryBadge}
        </div>

        <!-- Post Body -->
        <h4 style="font-size: 1.15rem; color: #222; font-weight: 700; margin: 0 0 10px 0; line-height: 1.4;">${p.title}</h4>
        <p style="font-size: 0.92rem; color: #444; line-height: 1.6; margin: 0;">${p.desc}</p>
        ${postImg}

        <!-- Post Action Bar -->
        <div style="display: flex; gap: 20px; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">
          <button onclick="upvotePost(${p.id})" style="background: #fff3e0; border: 1px solid #ffe0b2; color: #e65100; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;" onmouseover="this.style.background='#ffe0b2'" onmouseout="this.style.background='#fff3e0'">
            <i class="far fa-thumbs-up"></i> ${isTamil ? "ஆதரவு" : "Upvote"} (${p.upvotes})
          </button>
          <span style="font-size: 0.82rem; color: #666; font-weight: 600;">
            <i class="far fa-comments"></i> ${p.replies.length} ${isTamil ? "பதில்கள்" : "Replies"}
          </span>
        </div>

        <!-- Replies Section -->
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px dashed #eee;">
          ${repliesHtml}
          
          <!-- Reply Input form -->
          <div style="display: flex; gap: 10px; margin-top: 15px; align-items: center;">
            <input type="text" id="reply-input-${p.id}" placeholder="${isTamil ? "உங்கள் பதிலை எழுதுங்கள்..." : "Write a reply..."}" style="flex-grow: 1; padding: 10px 14px; border: 1.5px solid #ddd; border-radius: 20px; font-size: 0.85rem; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--primary-green)'" onblur="this.style.borderColor='#ddd'" />
            <button onclick="submitReply(${p.id})" class="btn" style="width: auto; margin: 0; padding: 8px 18px; font-size: 0.82rem; border-radius: 20px; font-weight: 700;">
              ${isTamil ? "பதில்" : "Reply"}
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

// Filter posts by category selection
window.filterForumPosts = function () {
  const filterVal = document.getElementById("forum-filter").value;
  if (filterVal === "all") {
    renderForumPosts(forumPosts);
  } else {
    const filtered = forumPosts.filter((p) => p.category === filterVal);
    renderForumPosts(filtered);
  }
};

// Increment Upvotes
window.upvotePost = function (id) {
  const post = forumPosts.find((p) => p.id === id);
  if (post) {
    post.upvotes++;
    localStorage.setItem("forum_posts", JSON.stringify(forumPosts));
    window.filterForumPosts();
  }
};

// Handle Post Reply submission
window.submitReply = function (id) {
  const input = document.getElementById(`reply-input-${id}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    alert("Reply text cannot be empty!");
    return;
  }

  const post = forumPosts.find((p) => p.id === id);
  if (post) {
    // Generate a default user name or get from login
    const author = "Farmer Member";
    const date = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    post.replies.push({
      id: Date.now(),
      author,
      text,
      isExpert: false,
      date,
    });

    localStorage.setItem("forum_posts", JSON.stringify(forumPosts));
    input.value = "";
    window.filterForumPosts();
  }
};

// Image Preview for Question Submission
window.previewForumImage = function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    attachedPhotoData = e.target.result;
    const previewBox = document.getElementById("forum-img-preview-box");
    const previewImg = document.getElementById("forum-img-preview");
    if (previewImg) previewImg.src = e.target.result;
    if (previewBox) previewBox.style.display = "block";
  };
  reader.readAsDataURL(file);
};

window.clearForumImage = function () {
  attachedPhotoData = null;
  const fileInput = document.getElementById("forum-file-input");
  const previewBox = document.getElementById("forum-img-preview-box");
  if (fileInput) fileInput.value = "";
  if (previewBox) previewBox.style.display = "none";
};

// Create a new post
window.submitForumPost = function (event) {
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
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const newPost = {
    id: Date.now(),
    author,
    title,
    category,
    desc,
    image: attachedPhotoData,
    upvotes: 0,
    date,
    replies: [],
  };

  // Add to top of array
  forumPosts.unshift(newPost);
  localStorage.setItem("forum_posts", JSON.stringify(forumPosts));

  // Reset form and UI
  document.getElementById("forum-post-form").reset();
  window.clearForumImage();
  window.filterForumPosts();

  // Highlight confirmation alert
  alert(
    currentLang === "ta"
      ? "உங்கள் கேள்வி வெற்றிகரமாக வெளியிடப்பட்டது!"
      : "Your question has been published successfully!",
  );
};

// DOM Load Initialization
window.addEventListener("DOMContentLoaded", () => {
  initForum();
});
