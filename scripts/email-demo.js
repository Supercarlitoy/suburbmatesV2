#!/usr/bin/env node
/**
 * SuburbMates Email Management Demo
 * Examples of using the email system from WARP IDE or scripts
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { emailManager, quickSendTest, quickSystemCheck } from '../lib/email-manager.ts';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

async function runDemo() {
  console.log('🚀 SuburbMates Email Management Demo\n');

  // 1. System Status Check
  console.log('📊 1. Checking email system status...');
  const status = await quickSystemCheck();
  console.log(`✅ Resend Connected: ${status.resendConnected}`);
  console.log(`✅ Domain Verified: ${status.domainVerified}`);
  console.log(`✅ Templates Loaded: ${status.templatesLoaded}`);
  console.log(`✅ Environment Configured: ${status.envConfigured}`);
  
  if (status.errors.length > 0) {
    console.log('⚠️ Issues found:');
    status.errors.forEach(error => console.log(`   • ${error}`));
  }
  console.log('');

  // 2. Available Templates
  console.log('📧 2. Available email templates:');
  const templates = emailManager.getAvailableTemplates();
  Object.entries(templates).forEach(([key, template]) => {
    console.log(`   • ${key}: ${template.subject}`);
    console.log(`     ${template.description}`);
  });
  console.log('');

  // 3. Domain Status
  console.log('🌐 3. Domain verification status:');
  const domainStatus = await emailManager.checkDomainStatus();
  if (domainStatus) {
    console.log(`   Domain: ${domainStatus.domain}`);
    console.log(`   Verified: ${domainStatus.verified ? '✅' : '❌'}`);
    console.log(`   Status: ${domainStatus.status}`);
    if (domainStatus.records) {
      console.log('   DNS Records:');
      domainStatus.records.forEach(record => {
        console.log(`     ${record.type}: ${record.name} → ${record.value.substring(0, 50)}...`);
      });
    }
  } else {
    console.log('   ❌ Domain not found in Resend account');
  }
  console.log('');

  // 4. Email Analytics (if available)
  console.log('📈 4. Email analytics:');
  const analytics = await emailManager.getEmailAnalytics(10);
  if (analytics) {
    console.log(`   Total sent: ${analytics.totalSent}`);
    console.log(`   Delivery rate: ${analytics.deliveryRate.toFixed(1)}%`);
    console.log(`   Open rate: ${analytics.openRate.toFixed(1)}%`);
    console.log(`   Bounce rate: ${analytics.bounceRate.toFixed(1)}%`);
    
    if (analytics.recentEmails.length > 0) {
      console.log('   Recent emails:');
      analytics.recentEmails.slice(0, 5).forEach(email => {
        console.log(`     ${email.status === 'delivered' ? '✅' : '⏳'} ${email.subject} → ${email.to}`);
      });
    }
  } else {
    console.log('   📊 Analytics not available (may require paid Resend plan)');
  }
  console.log('');

  // 5. Test Email Example (commented out to avoid sending in demo)
  console.log('🧪 5. Test email example (not sending):');
  console.log('   To send a test email, use:');
  console.log('   await quickSendTest("your@email.com", "basic");');
  console.log('   await emailManager.sendTestEmail("user@example.com", "welcome", { businessName: "My Business" });');
  console.log('');

  // 6. Business Email Examples
  console.log('📤 6. Business email examples (not sending):');
  console.log('   // Send welcome email');
  console.log('   await emailManager.sendBusinessEmail("welcome", "owner@business.com", {');
  console.log('     ownerName: "John Smith",');
  console.log('     businessName: "Smith\'s Cafe",');
  console.log('     profileUrl: "https://suburbmates.com.au/business/smiths-cafe",');
  console.log('     approvalStatus: "APPROVED"');
  console.log('   });');
  console.log('');
  
  console.log('   // Send inquiry notification');
  console.log('   await emailManager.sendBusinessEmail("inquiry", "owner@business.com", {');
  console.log('     customerName: "Sarah Johnson",');
  console.log('     customerEmail: "sarah@example.com",');
  console.log('     message: "I\'d like to book a table for 4 people",');
  console.log('     businessName: "Smith\'s Cafe",');
  console.log('     inquiryId: "INQ-123456"');
  console.log('   });');
  console.log('');

  // 7. Bulk Email Example
  console.log('📦 7. Bulk email example (not sending):');
  console.log('   const bulkRequests = [');
  console.log('     {');
  console.log('       type: "welcome",');
  console.log('       recipient: "owner1@business.com",');
  console.log('       data: { businessName: "Business 1", ownerName: "Owner 1" }');
  console.log('     },');
  console.log('     {');
  console.log('       type: "claim-approved",');
  console.log('       recipient: "owner2@business.com",');
  console.log('       data: { businessName: "Business 2", businessSlug: "business-2" }');
  console.log('     }');
  console.log('   ];');
  console.log('   const results = await emailManager.sendBulkEmails(bulkRequests);');
  console.log('');

  // 8. CLI Usage Examples
  console.log('⌨️  8. CLI Usage Examples:');
  console.log('   npm run email:control status              # Full system status');
  console.log('   npm run email:control domains            # Check domain verification');
  console.log('   npm run email:control test user@email.com # Send test email');
  console.log('   npm run email:control send welcome owner@business.com "Business Name"');
  console.log('   npm run email:control analytics          # View email stats');
  console.log('   npm run email:control templates          # List all templates');
  console.log('');

  console.log('✅ Demo completed! Your email system is ready to use.');
  console.log('💡 Check the scripts/email-control.js for full CLI functionality');
}

// Run demo if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDemo().catch(console.error);
}

export { runDemo };
export default runDemo;