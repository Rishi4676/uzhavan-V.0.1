import { supabase } from '../lib/supabase/browser.js';

export const forumComments = {
  async getComments() {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createComment(commentData) {
    const { data, error } = await supabase
      .from('forum_comments')
      .insert(commentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
