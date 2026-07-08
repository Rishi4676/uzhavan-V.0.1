const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oatrxkfpynjrphqdinwl.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseSecretKey) {
  console.warn('SUPABASE_SECRET_KEY is missing on the server. Please check your .env.local file.');
}

const supabaseServer = createClient(supabaseUrl, supabaseSecretKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabaseServer };
