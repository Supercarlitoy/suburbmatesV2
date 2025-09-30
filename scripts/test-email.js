#!/usr/bin/env node

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailConfiguration() {
  console.log('🧪 Testing SuburbMates Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || '❌ Missing'}`);
  console.log(`SENDER_DOMAIN: ${process.env.SENDER_DOMAIN || '❌ Missing'}`);
  console.log(`SKIP_EMAIL_VERIFICATION: ${process.env.SKIP_EMAIL_VERIFICATION}`);
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY is not set. Please check your .env.local file.');
    process.exit(1);
  }

  // Test sending a simple email
  try {
    console.log('📧 Sending test email...');
    
    const testEmail = {
      from: 'SuburbMates Test <noreply@suburbmates.com.au>',
      to: ['admin@suburbmates.com.au'], // Change this to your email for testing
      subject: '🧪 SuburbMates Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Email Configuration Test ✅</h1>
          <p>This is a test email to verify that your SuburbMates email system is working correctly.</p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>Domain:</strong> ${process.env.SENDER_DOMAIN}</li>
              <li><strong>From Email:</strong> ${process.env.FROM_EMAIL}</li>
              <li><strong>Skip Verification:</strong> ${process.env.SKIP_EMAIL_VERIFICATION}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p><em>If you received this email, your Resend integration is working correctly! 🎉</em></p>
        </div>
      `
    };

    const { data, error } = await resend.emails.send(testEmail);

    if (error) {
      console.log('❌ Email test failed:');
      console.error(error);
      return false;
    }

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', data.id);
    console.log('🎯 Sent to:', testEmail.to.join(', '));
    console.log('');
    console.log('💡 Check your inbox to confirm email delivery.');
    
    return true;
    
  } catch (error) {
    console.log('❌ Email test error:');
    console.error(error);
    return false;
  }
}

// Test Supabase connection
async function testSupabaseConfig() {
  console.log('🔐 Testing Supabase Configuration...\n');
  
  console.log('📋 Supabase Environment Check:');
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('❌ Missing Supabase configuration. Auth emails will not work.');
    return false;
  }
  
  console.log('✅ Supabase configuration looks good!');
  return true;
}

async function runAllTests() {
  console.log('🚀 SuburbMates Email System Test\n');
  console.log('=' .repeat(50));
  
  const supabaseOk = await testSupabaseConfig();
  const emailOk = await testEmailConfiguration();
  
  console.log('=' .repeat(50));
  console.log('📊 Test Summary:');
  console.log(`Supabase Config: ${supabaseOk ? '✅' : '❌'}`);
  console.log(`Email Service: ${emailOk ? '✅' : '❌'}`);
  
  if (supabaseOk && emailOk) {
    console.log('\n🎉 All tests passed! Your email system should be working.');
    console.log('\n💡 Next steps:');
    console.log('1. Try signing up with a real email address');
    console.log('2. Check both spam/junk folders');
    console.log('3. Monitor logs for any errors');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration above.');
  }
}

runAllTests().catch(console.error);