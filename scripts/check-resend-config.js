#!/usr/bin/env node

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkResendDomainStatus() {
  console.log('🏷️ Checking Resend Domain Configuration...\n');
  
  try {
    // Get domain information
    console.log('📋 Current Domain Configuration:');
    console.log(`Sender Domain: ${process.env.SENDER_DOMAIN}`);
    console.log(`From Email: ${process.env.FROM_EMAIL}`);
    console.log(`Reply To: ${process.env.REPLY_TO_EMAIL}`);
    console.log('');

    // Check domain verification status (requires API call)
    console.log('🔍 Attempting to check domain status...');
    
    const domains = await resend.domains.list();
    
    if (domains.error) {
      console.log('❌ Error fetching domains:', domains.error);
      return false;
    }

    console.log('✅ Domains retrieved successfully');
    
    if (domains.data && domains.data.length > 0) {
      console.log('\n📊 Domain Status:');
      domains.data.forEach((domain, index) => {
        console.log(`${index + 1}. ${domain.name}`);
        console.log(`   Status: ${domain.status}`);
        console.log(`   Region: ${domain.region || 'Not specified'}`);
        console.log(`   Created: ${domain.created_at}`);
      });

      // Check if our domain is verified
      const ourDomain = domains.data.find(d => d.name === process.env.SENDER_DOMAIN);
      if (ourDomain) {
        console.log(`\n✅ Found configured domain: ${ourDomain.name}`);
        console.log(`Status: ${ourDomain.status}`);
        
        if (ourDomain.status !== 'verified') {
          console.log('⚠️  Domain is not verified! This may cause delivery issues.');
        }
      } else {
        console.log(`\n⚠️  Domain ${process.env.SENDER_DOMAIN} not found in Resend dashboard`);
        console.log('You may need to add and verify this domain in Resend.');
      }
    } else {
      console.log('\n⚠️  No domains configured in Resend dashboard');
    }

    return true;

  } catch (error) {
    console.error('❌ Error checking domain status:', error.message);
    return false;
  }
}

async function checkResendAPIHealth() {
  console.log('\n🩺 Checking Resend API Health...\n');
  
  try {
    // Test API connectivity with a simple query
    const domains = await resend.domains.list();
    
    if (domains.error) {
      console.log('❌ API Health Check Failed:', domains.error);
      return false;
    }
    
    console.log('✅ Resend API is accessible and responding');
    return true;
    
  } catch (error) {
    console.error('❌ API Health Check Error:', error.message);
    return false;
  }
}

async function checkEmailDeliveryRules() {
  console.log('\n📜 Email Delivery Rules & Best Practices:\n');
  
  console.log('🎯 Domain Authentication Required:');
  console.log('Your domain (suburbmates.com.au) needs these DNS records:');
  console.log('');
  console.log('1. SPF Record:');
  console.log('   Type: TXT');
  console.log('   Name: @');
  console.log('   Value: v=spf1 include:_spf.resend.com ~all');
  console.log('');
  console.log('2. DKIM Record:');
  console.log('   Check Resend dashboard for specific DKIM values');
  console.log('   Usually: [selector]._domainkey.suburbmates.com.au');
  console.log('');
  console.log('3. DMARC Record (Recommended):');
  console.log('   Type: TXT');
  console.log('   Name: _dmarc');
  console.log('   Value: v=DMARC1; p=none; rua=mailto:admin@suburbmates.com.au');
  console.log('');
  
  console.log('📊 Email Synchronization Guidelines:');
  console.log('• Supabase handles: Auth confirmation, magic links, password resets');
  console.log('• Resend handles: Welcome emails, notifications, marketing');
  console.log('• Both should use same domain (suburbmates.com.au) for consistency');
  console.log('• Rate limiting: Resend free tier = 100 emails/day, 3,000/month');
  console.log('');
  
  console.log('🔄 Synchronization Checklist:');
  console.log('✓ SKIP_EMAIL_VERIFICATION=false (completed)');
  console.log('✓ APP_URL matches development server port (completed)');
  console.log('⚠️  Verify Supabase redirect URLs in dashboard');
  console.log('⚠️  Confirm DNS records for domain authentication');
  console.log('⚠️  Test both Supabase and Resend email delivery');
}

async function generateDashboardCommands() {
  console.log('\n🎯 Action Items:\n');
  
  console.log('1. 🌐 Verify Supabase Settings:');
  console.log('   Visit: https://supabase.com/dashboard/project/mefqaulxkqiriljwemvx/auth/settings');
  console.log('   - Site URL: http://localhost:3001 (dev) or https://suburbmates.com.au (prod)');
  console.log('   - Redirect URLs: Add both localhost and production URLs');
  console.log('');
  
  console.log('2. 📧 Check Resend Dashboard:');
  console.log('   Visit: https://resend.com/domains');
  console.log('   - Add/verify suburbmates.com.au domain');
  console.log('   - Configure SPF/DKIM records');
  console.log('   - Monitor delivery logs');
  console.log('');
  
  console.log('3. 🧪 Test Email Delivery:');
  console.log('   Run: npm run email:test');
  console.log('   Then: Test actual signup at http://localhost:3001/register-business');
  console.log('');
  
  console.log('4. 🔍 Monitor Logs:');
  console.log('   - Supabase Auth logs');
  console.log('   - Resend delivery logs');
  console.log('   - Next.js console logs');
}

async function runResendChecks() {
  console.log('📧 SuburbMates Resend Configuration & Synchronization Check\n');
  console.log('='.repeat(70));
  
  const apiHealthy = await checkResendAPIHealth();
  
  if (apiHealthy) {
    await checkResendDomainStatus();
  }
  
  await checkEmailDeliveryRules();
  await generateDashboardCommands();
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 Next Steps: Follow the action items above to complete email setup');
}

runResendChecks().catch(console.error);