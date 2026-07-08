import { supabase } from '../lib/supabase/browser.js';

// Show loading indicator (existing spinner overlay in HTML files)
export const showLoader = () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }
};

// Hide loading indicator
export const hideLoader = () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
};

// Show modern toast notifications
export const notify = (message, type = 'success') => {
  let container = document.getElementById('supabase-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'supabase-toast-container';
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

  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  }, 50);

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px) scale(0.9)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
};

// Centralized error handling
export const handleSupabaseError = (error, contextMsg = 'Operation failed') => {
  console.error(`[Supabase Error] ${contextMsg}:`, error);
  const errMsg = error.message || error.details || 'An unexpected database error occurred.';
  notify(`${contextMsg}: ${errMsg}`, 'error');
  return error;
};

// --- AUTHENTICATION SERVICE ---
export const authService = {
  // Sign up with custom metadata (which triggers profile creation)
  async signUp(email, password, metadata = {}) {
    showLoader();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      
      notify('Registration successful! Please check your email for confirmation.', 'success');
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Sign Up Error');
      throw error;
    } finally {
      hideLoader();
    }
  },

  // Log in with email and password
  async signIn(email, password) {
    showLoader();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      notify('Logged in successfully!', 'success');
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Login Error');
      throw error;
    } finally {
      hideLoader();
    }
  },

  // Log out current user
  async signOut() {
    showLoader();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      notify('Logged out successfully!', 'info');
      // Redirect or reload
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    } catch (error) {
      handleSupabaseError(error, 'Logout Error');
    } finally {
      hideLoader();
    }
  },

  // Get current user session details
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Error fetching session:', error.message);
      return null;
    }
    return session;
  },

  // Get user profile data
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Profile not found, user might not have confirmed email yet.', error.message);
      return null;
    }
  }
};

// --- DATA CRUD SERVICE (Complete CRUD Examples) ---
export const dbService = {
  // Create / Insert
  async insert(table, rowData) {
    showLoader();
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(rowData)
        .select()
        .single();

      if (error) throw error;
      notify('Record created successfully!', 'success');
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Insert Error');
      throw error;
    } finally {
      hideLoader();
    }
  },

  // Read / Select all or with filter
  async select(table, queryBuilder = (query) => query) {
    showLoader();
    try {
      let query = supabase.from(table).select('*');
      query = queryBuilder(query);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Fetch Error');
      throw error;
    } finally {
      hideLoader();
    }
  },

  // Update
  async update(table, id, updateData, idField = 'id') {
    showLoader();
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq(idField, id)
        .select();

      if (error) throw error;
      notify('Record updated successfully!', 'success');
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Update Error');
      throw error;
    } finally {
      hideLoader();
    }
  },

  // Delete
  async delete(table, id, idField = 'id') {
    showLoader();
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq(idField, id)
        .select();

      if (error) throw error;
      notify('Record deleted successfully!', 'info');
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Delete Error');
      throw error;
    } finally {
      hideLoader();
    }
  }
};
