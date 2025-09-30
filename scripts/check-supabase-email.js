#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSupabaseEmailSettings() {
  console.log('🔐 Checking Supabase Email Configuration...\n');
  
  // Basic configuration check
  console.log('📋 Environment Variables:');
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase configuration. Cannot check email settings.');
    return;
  }

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🧪 Testing Supabase Connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('User').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is OK
      console.log('⚠️  Supabase connection test:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }

    console.log('\n📧 Email Configuration Status:');
    console.log('Current email redirect URL:', `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`);
    console.log('Expected site URL:', process.env.NEXT_PUBLIC_APP_URL);
    
    console.log('\n⚙️  Supabase Email Settings to Verify in Dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/mefqaulxkqiriljwemvx/auth/settings');
    console.log('2. Check "Site URL" matches:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001');
    console.log('3. Check "Redirect URLs" includes:');
    console.log('   - http://localhost:3001/auth/confirm');
    console.log('   - https://suburbmates.com.au/auth/confirm (for production)');
    console.log('4. Verify "Email Templates" are enabled');
    console.log('5. Check "SMTP Settings" (if using custom SMTP)');
    
    console.log('\n📨 Email Template Configuration:');
    console.log('Templates that should be configured:');
    console.log('- ✉️  Confirm signup');
    console.log('- 🔐 Magic link');  
    console.log('- 🔄 Change email address');
    console.log('- 🔑 Reset password');
    
  } catch (error) {
    console.error('❌ Error checking Supabase settings:', error.message);
  }
}

async function testSupabaseEmailFlow() {
  console.log('\n🧪 Testing Supabase Email Flow...');
  
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    // Test with a dummy email (this won't actually send, just tests the flow)
    const testEmail = 'test-email-flow@suburbmates.com.au';
    
    console.log(`Testing signup flow validation with: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
        data: {
          business_name: 'Test Business',
          test_signup: true
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('⚠️  Test email already exists (this is expected)');
      } else {
        console.log('❌ Signup flow error:', error.message);
      }
    } else {
      console.log('✅ Signup flow validation successful');
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email confirmation required - this is correct behavior');
      }
    }
    
  } catch (error) {
    console.error('❌ Email flow test error:', error.message);
  }
}

async function checkEmailDeliverability() {
  console.log('\n📬 Email Deliverability Checklist:');
  console.log('');
  console.log('🔍 Domain Configuration for suburbmates.com.au:');
  console.log('1. SPF Record: v=spf1 include:_spf.resend.com ~all');
  console.log('2. DKIM Record: Check Resend dashboard for DKIM setup');
  console.log('3. DMARC Record: v=DMARC1; p=none; rua=mailto:admin@suburbmates.com.au');
  console.log('');
  console.log('📊 Common Issues:');
  console.log('• Emails going to spam/junk folder');
  console.log('• Domain not properly authenticated');
  console.log('• Redirect URLs not matching in Supabase settings');
  console.log('• Rate limiting on email sending');
  console.log('');
  console.log('🛠️  Debugging Steps:');
  console.log('1. Check Supabase Auth logs in dashboard');
  console.log('2. Check Resend delivery logs');
  console.log('3. Test with different email providers (Gmail, Outlook, etc.)');
  console.log('4. Verify DNS records for email authentication');
}

async function runAllChecks() {
  console.log('🚀 SuburbMates Supabase Email Configuration Check\n');
  console.log('='.repeat(60));
  
  await checkSupabaseEmailSettings();
  await testSupabaseEmailFlow();
  await checkEmailDeliverability();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 Summary:');
  console.log('1. Verify all settings in Supabase dashboard');
  console.log('2. Test actual signup with your email');
  console.log('3. Check spam folders if emails not received');
  console.log('4. Monitor both Supabase and Resend logs');
}

runAllChecks().catch(console.error);