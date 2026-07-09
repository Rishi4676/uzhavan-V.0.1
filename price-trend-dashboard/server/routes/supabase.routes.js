const express = require('express');
const router = express.Router();
const { supabaseServer } = require('../../../lib/supabase/server.cjs');

// Helper to verify connection and table existence
async function checkSupabaseConnection() {
  if (!process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY.includes('your_supabase_secret_key')) {
    return {
      connected: false,
      schemaConfigured: false,
      message: 'SUPABASE_SECRET_KEY is not configured in .env.local',
    };
  }

  try {
    // Attempt to query the health_check table
    const { data, error } = await supabaseServer
      .from('health_check')
      .select('*')
      .limit(1);

    if (error) {
      // If error is code 42P01 (relation does not exist), table is missing
      if (error.code === '42P01' || (error.message && (error.message.includes('does not exist') || error.message.includes('Could not find the table')))) {
        return {
          connected: true,
          schemaConfigured: false,
          message: 'Connected to Supabase, but "health_check" table is missing. Run the schema.sql script in the Supabase SQL editor to create it.',
        };
      }
      throw error;
    }

    // Connection is healthy, check if a row is present. If not, insert one
    let sampleInserted = false;
    if (!data || data.length === 0) {
      const { error: insertError } = await supabaseServer
        .from('health_check')
        .insert([{ status: 'healthy_init' }]);
      
      if (insertError) {
        console.error('Failed to insert sample row:', insertError.message);
      } else {
        sampleInserted = true;
      }
    }

    return {
      connected: true,
      schemaConfigured: true,
      sampleInserted,
      message: 'Supabase connected and verified successfully!',
    };
  } catch (error) {
    console.error('Supabase connection check failed:', error.message);
    return {
      connected: false,
      schemaConfigured: false,
      message: `Connection failed: ${error.message}`,
    };
  }
}

// 1. Health check endpoint
router.get('/health', async (req, res) => {
  const result = await checkSupabaseConnection();
  if (!result.connected) {
    return res.status(500).json(result);
  }
  res.json(result);
});

// 2. Complete CRUD example and testing endpoint
router.get('/test-crud', async (req, res) => {
  const checklist = {
    connected: false,
    insert: false,
    select: false,
    update: false,
    delete: false,
    errors: [],
  };

  try {
    // Check connection
    const health = await checkSupabaseConnection();
    if (!health.connected || !health.schemaConfigured) {
      checklist.errors.push(health.message);
      return res.status(500).json(checklist);
    }
    checklist.connected = true;

    // Test Insert
    const testStatusText = `temp_test_${Date.now()}`;
    const { data: insertData, error: insertError } = await supabaseServer
      .from('health_check')
      .insert([{ status: testStatusText }])
      .select();

    if (insertError) {
      checklist.errors.push(`Insert failed: ${insertError.message}`);
    } else if (insertData && insertData.length > 0) {
      checklist.insert = true;
      const recordId = insertData[0].id;

      // Test Select
      const { data: selectData, error: selectError } = await supabaseServer
        .from('health_check')
        .select('*')
        .eq('id', recordId);

      if (selectError) {
        checklist.errors.push(`Select failed: ${selectError.message}`);
      } else if (selectData && selectData.length > 0) {
        checklist.select = true;

        // Test Update
        const { data: updateData, error: updateError } = await supabaseServer
          .from('health_check')
          .update({ status: 'temp_test_updated' })
          .eq('id', recordId)
          .select();

        if (updateError) {
          checklist.errors.push(`Update failed: ${updateError.message}`);
        } else if (updateData && updateData.length > 0 && updateData[0].status === 'temp_test_updated') {
          checklist.update = true;
        }

        // Test Delete
        const { error: deleteError } = await supabaseServer
          .from('health_check')
          .delete()
          .eq('id', recordId);

        if (deleteError) {
          checklist.errors.push(`Delete failed: ${deleteError.message}`);
        } else {
          checklist.delete = true;
        }
      }
    }

    const success = checklist.connected && checklist.insert && checklist.select && checklist.update && checklist.delete;
    res.status(success ? 200 : 500).json(checklist);

  } catch (error) {
    checklist.errors.push(`Unhandled CRUD test error: ${error.message}`);
    res.status(500).json(checklist);
  }
});

// 3. Register user endpoint (Admin privilege to auto-confirm email)
router.post('/register', async (req, res) => {
  const { email, password, metadata } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: metadata
    });

    if (error) throw error;

    res.json({ user: data.user });
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
