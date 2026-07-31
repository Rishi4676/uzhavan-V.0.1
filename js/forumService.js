import { db } from "./firebase-config.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  increment 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const defaultPosts = [
  {
    id: "post-1",
    author_name: "Ramanathan (Madurai)",
    title: "Best organic fertilizers for Tomato crops?",
    description: "I'm looking for organic ways to improve tomato yield. My crop is currently in the flowering stage. Any recommendations for organic fertilizer mixes or natural pesticide alternatives?",
    category: "Crops",
    image_url: null,
    upvotes: 12,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "post-2",
    author_name: "Subramanian (Coimbatore)",
    title: "Subsidy schemes for Solar Water Pumps in Tamil Nadu",
    description: "Does anyone know the procedure to apply for the solar pump set subsidy from the Agricultural Engineering Department? What documents are required for registration?",
    category: "Schemes",
    image_url: null,
    upvotes: 8,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "post-3",
    author_name: "Dr. K. Ramasamy (TNAU Expert)",
    title: "How to control Fall Armyworm in Maize?",
    description: "To manage Fall Armyworm in Maize, farmers are advised to practice deep ploughing, follow synchronous sowing, and use light traps. Biological controls like Metarhizium anisopliae or neem seed kernel extract are also highly effective in the early stages.",
    category: "Pests",
    image_url: null,
    upvotes: 24,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

const defaultComments = [
  {
    id: "comment-1",
    post_id: "post-1",
    author: "Dr. Selvam (Expert)",
    comment: "For tomatoes in the flowering stage, organic Panchagavya (3% spray) works wonders. You can also apply vermicompost around the root zone for micro-nutrient availability.",
    created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "comment-2",
    post_id: "post-1",
    author: "Karthik (Farmer)",
    comment: "I used fish amino acid during the flowering stage and saw a 20% increase in yield. Try it out!",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "comment-3",
    post_id: "post-2",
    author: "Palanisamy",
    comment: "You need to apply through the Agrisnet portal. Make sure you have your land Chitta, Adangal, and Aadhaar card ready.",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

function compressBase64Image(base64Str, maxWidth = 500, maxHeight = 500) {
  return new Promise((resolve) => {
    if (!base64Str) return resolve(null);
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(base64Str);
  });
}

export const forumService = {
  posts: [],
  comments: [],
  filters: {
    category: 'all',
    searchQuery: '',
    searchType: 'title',
    sortBy: 'newest'
  },

  async loadData() {
    try {
      console.log("[Forum] Fetching posts and comments from Cloud Firestore...");
      
      // 1. Fetch Posts from Firestore
      const postsCol = collection(db, "posts");
      const postsSnapshot = await getDocs(postsCol);
      const fetchedPosts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. Fetch Comments from Firestore
      const commentsCol = collection(db, "comments");
      const commentsSnapshot = await getDocs(commentsCol);
      const fetchedComments = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.posts = fetchedPosts;
      this.comments = fetchedComments;

      // Keep localStorage cache updated
      localStorage.setItem("agri_forum_posts", JSON.stringify(fetchedPosts));
      localStorage.setItem("agri_forum_comments", JSON.stringify(fetchedComments));

      console.log(`[Forum] Successfully synced with Cloud Firestore. Loaded ${fetchedPosts.length} posts.`);
      return this.getProcessedPosts();
    } catch (error) {
      console.warn("[Forum] Firestore sync failed (possibly due to security rules). Falling back to local storage cache:", error.message);
      
      // Load Posts from LocalStorage Cache
      let storedPosts = localStorage.getItem("agri_forum_posts");
      if (!storedPosts) {
        localStorage.setItem("agri_forum_posts", JSON.stringify(defaultPosts));
        this.posts = [...defaultPosts];
      } else {
        this.posts = JSON.parse(storedPosts);
      }

      // Load Comments from LocalStorage Cache
      let storedComments = localStorage.getItem("agri_forum_comments");
      if (!storedComments) {
        localStorage.setItem("agri_forum_comments", JSON.stringify(defaultComments));
        this.comments = [...defaultComments];
      } else {
        this.comments = JSON.parse(storedComments);
      }

      return this.getProcessedPosts();
    }
  },

  setFilter(key, value) {
    this.filters[key] = value;
    return this.getProcessedPosts();
  },

  getProcessedPosts() {
    let result = [...this.posts];

    // Filter by Category
    if (this.filters.category !== 'all') {
      result = result.filter(p => p.category === this.filters.category);
    }

    // Filter by Search Query
    if (this.filters.searchQuery) {
      const q = this.filters.searchQuery.toLowerCase();
      if (this.filters.searchType === 'title') {
        result = result.filter(p => p.title.toLowerCase().includes(q));
      } else {
        result = result.filter(p => p.author_name.toLowerCase().includes(q));
      }
    }

    // Sorting
    if (this.filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (this.filters.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (this.filters.sortBy === 'upvoted') {
      result.sort((a, b) => b.upvotes - a.upvotes);
    }

    // Map comments
    return result.map(post => ({
      ...post,
      date: this.formatDate(post.created_at),
      comments: this.comments
        .filter(c => c.post_id === post.id)
        .map(c => ({
          ...c,
          date: this.formatDate(c.created_at)
        }))
    }));
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  },

  async createPost(author, title, desc, category, imageUrl = null) {
    // Compress image base64 if present to save space
    const compressedImage = imageUrl ? await compressBase64Image(imageUrl) : null;
    const tempId = "post-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    const newPost = {
      author_name: this.sanitize(author || 'Anonymous Farmer'),
      title: this.sanitize(title),
      description: this.sanitize(desc),
      category,
      image_url: compressedImage,
      upvotes: 0,
      created_at: new Date().toISOString()
    };

    try {
      console.log("[Forum] Saving new post to Cloud Firestore...");
      const postsCol = collection(db, "posts");
      const docRef = await addDoc(postsCol, newPost);
      newPost.id = docRef.id;
    } catch (error) {
      console.warn("[Forum] Firestore write failed. Saving locally to localStorage fallback:", error.message);
      newPost.id = tempId;
    }

    // Save to local cache anyway
    this.posts.push(newPost);
    localStorage.setItem("agri_forum_posts", JSON.stringify(this.posts));
    return newPost;
  },

  async addComment(postId, author, commentText) {
    const tempId = "comment-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const newComment = {
      post_id: postId,
      author: this.sanitize(author || 'Member'),
      comment: this.sanitize(commentText),
      created_at: new Date().toISOString()
    };

    try {
      console.log("[Forum] Saving comment to Cloud Firestore...");
      const commentsCol = collection(db, "comments");
      const docRef = await addDoc(commentsCol, newComment);
      newComment.id = docRef.id;
    } catch (error) {
      console.warn("[Forum] Firestore write failed. Saving locally to localStorage fallback:", error.message);
      newComment.id = tempId;
    }

    // Save to local cache anyway
    this.comments.push(newComment);
    localStorage.setItem("agri_forum_comments", JSON.stringify(this.comments));
    return newComment;
  },

  async upvote(postId) {
    // 1. Update in-memory copy
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.upvotes++;
      localStorage.setItem("agri_forum_posts", JSON.stringify(this.posts));
    }

    // 2. Try Firestore update
    try {
      // If the post has a local-only generated temp ID, don't write to Firestore
      if (postId.startsWith("post-")) {
        throw new Error("Local-only post upvote. Skipping cloud write.");
      }
      console.log("[Forum] Upvoting post in Cloud Firestore...");
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        upvotes: increment(1)
      });
    } catch (error) {
      console.warn("[Forum] Firestore upvote failed (local upvote cached):", error.message);
    }
  },

  sanitize(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
