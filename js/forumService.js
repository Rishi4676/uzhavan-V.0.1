import { supabaseForum } from './supabaseForum.js';
import { forumComments } from './forumComments.js';
import { forumStorage } from './forumStorage.js';

export const forumService = {
  posts: [],
  comments: [],
  filters: {
    category: 'all',
    searchQuery: '',
    searchType: 'title', // 'title' or 'author'
    sortBy: 'newest' // 'newest', 'upvoted', 'oldest'
  },

  async loadData() {
    const [posts, comments] = await Promise.all([
      supabaseForum.getPosts(),
      forumComments.getComments()
    ]);

    this.posts = posts;
    this.comments = comments;

    return this.getProcessedPosts();
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

  async createPost(author, title, desc, category, imageUrl) {
    return await supabaseForum.createPost({
      author_name: this.sanitize(author),
      title: this.sanitize(title),
      description: this.sanitize(desc),
      category,
      image_url: imageUrl,
      upvotes: 0
    });
  },

  async addComment(postId, author, commentText) {
    return await forumComments.createComment({
      post_id: postId,
      author: this.sanitize(author),
      comment: this.sanitize(commentText)
    });
  },

  async upvote(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    
    const newUpvotes = post.upvotes + 1;
    post.upvotes = newUpvotes;
    return await supabaseForum.upvotePost(postId, newUpvotes);
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
