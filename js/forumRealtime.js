import { supabase } from '../lib/supabase/browser.js';

let postsChannel = null;
let commentsChannel = null;

export const forumRealtime = {
  subscribe(onPostsChange, onCommentsChange) {
    this.unsubscribe();

    // Subscribe to post events (INSERT, UPDATE, DELETE)
    postsChannel = supabase
      .channel('public:forum_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, (payload) => {
        console.log('Realtime change in forum_posts:', payload);
        onPostsChange(payload);
      })
      .subscribe();

    // Subscribe to comment events (INSERT, UPDATE, DELETE)
    commentsChannel = supabase
      .channel('public:forum_comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_comments' }, (payload) => {
        console.log('Realtime change in forum_comments:', payload);
        onCommentsChange(payload);
      })
      .subscribe();
  },

  unsubscribe() {
    if (postsChannel) {
      supabase.removeChannel(postsChannel);
      postsChannel = null;
    }
    if (commentsChannel) {
      supabase.removeChannel(commentsChannel);
      commentsChannel = null;
    }
  }
};
