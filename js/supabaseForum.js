import { supabase } from '../lib/supabase/browser.js';

export const supabaseForum = {
  async getPosts() {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPost(postData) {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert(postData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async upvotePost(postId, upvotesCount) {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ upvotes: upvotesCount })
      .eq('id', postId)
      .select();
    if (error) throw error;
    return data;
  },

  async editPost(postId, postData) {
    const { data, error } = await supabase
      .from('forum_posts')
      .update(postData)
      .eq('id', postId)
      .select();
    if (error) throw error;
    return data;
  },

  async deletePost(postId) {
    const { data, error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);
    if (error) throw error;
    return data;
  }
};
