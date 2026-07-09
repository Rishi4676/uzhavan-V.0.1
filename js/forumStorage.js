import { supabase } from '../lib/supabase/browser.js';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const forumStorage = {
  async uploadImage(file) {
    if (!file) return null;

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 5MB limit.");
    }

    // Validate extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      throw new Error(`Invalid file type. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('forum-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('forum-images')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
