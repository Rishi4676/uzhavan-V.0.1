// Local mock forum service to replace Supabase integration completely
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
    // Read from localStorage (fallback to sample dummy data if empty)
    const storedPosts = localStorage.getItem('local_forum_posts');
    const storedComments = localStorage.getItem('local_forum_comments');

    if (storedPosts) {
      this.posts = JSON.parse(storedPosts);
    } else {
      // Seed with some sample posts so the forum is not empty
      this.posts = [
        {
          id: '1',
          author_name: 'Anbarasan (Farmer, Salem)',
          title: 'Best pest control method for tomato leaf curl virus?',
          description: 'My tomato crop has started showing leaf curling symptoms. Looking for organic control recommendations.',
          category: 'pest',
          image_url: null,
          upvotes: 5,
          created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
        },
        {
          id: '2',
          author_name: 'TNAU Expert Advisory',
          title: 'Kharif crop sowing advisory for July 2026',
          description: 'Detailed guidelines on soil preparation and seed treatment for paddy and maize crops.',
          category: 'general',
          image_url: null,
          upvotes: 12,
          created_at: new Date(Date.now() - 3600000 * 5).toISOString()
        }
      ];
      localStorage.setItem('local_forum_posts', JSON.stringify(this.posts));
    }

    if (storedComments) {
      this.comments = JSON.parse(storedComments);
    } else {
      this.comments = [
        {
          id: '101',
          post_id: '1',
          author: 'TNAU Expert',
          comment: 'Spray neem seed kernel extract (NSKE) 5% to control whiteflies, which are vectors of the virus.',
          created_at: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      localStorage.setItem('local_forum_comments', JSON.stringify(this.comments));
    }

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
    const newPost = {
      id: Math.random().toString(36).substring(2, 15),
      author_name: this.sanitize(author || 'Anonymous Farmer'),
      title: this.sanitize(title),
      description: this.sanitize(desc),
      category,
      image_url: imageUrl,
      upvotes: 0,
      created_at: new Date().toISOString()
    };

    this.posts.push(newPost);
    localStorage.setItem('local_forum_posts', JSON.stringify(this.posts));
    return newPost;
  },

  async addComment(postId, author, commentText) {
    const newComment = {
      id: Math.random().toString(36).substring(2, 15),
      post_id: postId,
      author: this.sanitize(author || 'Member'),
      comment: this.sanitize(commentText),
      created_at: new Date().toISOString()
    };

    this.comments.push(newComment);
    localStorage.setItem('local_forum_comments', JSON.stringify(this.comments));
    return newComment;
  },

  async upvote(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    
    post.upvotes++;
    localStorage.setItem('local_forum_posts', JSON.stringify(this.posts));
    return post;
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
