#!/usr/bin/env node
/**
 * SuburbMates Email Management CLI
 * Provides command-line control for Resend email operations
 */

import { Resend } from 'resend';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment variables');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN = 'suburbmates.com.au';

// Command handlers
const commands = {
  async domains() {
    console.log('🌐 Checking domain status...');
    try {
      const response = await resend.domains.list();
      console.log('Raw API response:', JSON.stringify(response, null, 2));
      
      if (response.error) {
        console.error('❌ API Error:', response.error);
        return;
      }
      
      // Handle nested data structure: {data: {data: [domains]}}
      const domains = response.data?.data || response.data || response;
      
      if (!domains || !Array.isArray(domains)) {
        console.log('⚠️ No domains found or unexpected response format');
        console.log('Response:', response);
        return;
      }
      
      console.log('\n📋 Domain Status:');
      domains.forEach(domain => {
        const status = domain.status === 'verified' ? '✅' : '⏳';
        console.log(`${status} ${domain.name} - ${domain.status}`);
        if (domain.name === DOMAIN) {
          console.log(`   Created: ${new Date(domain.created_at).toLocaleDateString()}`);
          console.log(`   Region: ${domain.region || 'N/A'}`);
        }
      });
      
      // Check if our domain is configured
      const ourDomain = domains.find(d => d.name === DOMAIN);
      if (!ourDomain) {
        console.log(`\n⚠️ Domain ${DOMAIN} not found in Resend account`);
        console.log('📝 Action needed: Add domain to Resend dashboard');
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch domains:', error.message);
      console.error('Full error:', error);
    }
  },

  async test(email = 'test@example.com') {
    console.log(`📧 Sending test email to ${email}...`);
    try {
      const { data, error } = await resend.emails.send({
        from: 'SuburbMates <noreply@suburbmates.com.au>',
        to: [email],
        subject: '🧪 SuburbMates Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Test Email Successful! 🎉</h1>
            <p>This is a test email from your SuburbMates application.</p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin-top: 0;">Email System Status:</h3>
              <ul style="color: #0369a1;">
                <li>✅ Domain: ${DOMAIN}</li>
                <li>✅ Sender: SuburbMates &lt;noreply@suburbmates.com.au&gt;</li>
                <li>✅ Professional branding active</li>
                <li>✅ Email delivery working</li>
              </ul>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        `
      });

      if (error) {
        console.error('❌ Error sending test email:', error);
        return;
      }

      console.log('✅ Test email sent successfully!');
      console.log(`📨 Email ID: ${data.id}`);
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
    }
  },

  async analytics(limit = 10) {
    console.log(`📊 Fetching recent email analytics (last ${limit} emails)...`);
    try {
      // Try different API methods for email listing
      let response;
      try {
        response = await resend.emails.list({ limit });
      } catch (listError) {
        console.log('⚠️ emails.list not available, trying alternative method...');
        // Alternative: Use fetch directly to Resend API
        const apiResponse = await fetch('https://api.resend.com/emails', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        response = await apiResponse.json();
      }
      
      console.log('Raw analytics response:', JSON.stringify(response, null, 2));
      
      if (response.error) {
        console.error('❌ API Error:', response.error);
        return;
      }
      
      const emails = response.data?.data || response.data || response;
      
      if (!emails || !Array.isArray(emails)) {
        console.log('⚠️ No email data found or unexpected response format');
        console.log('Available methods: send emails and check domain status');
        return;
      }

      console.log('\n📈 Recent Email Activity:');
      console.log('─'.repeat(80));
      
      emails.slice(0, limit).forEach((email, index) => {
        const date = new Date(email.created_at).toLocaleString();
        const status = email.last_event === 'delivered' ? '✅' : 
                      email.last_event === 'bounced' ? '❌' : 
                      email.last_event === 'opened' ? '👀' : '⏳';
        
        console.log(`${index + 1}. ${status} ${email.subject || 'No subject'}`);
        console.log(`   To: ${Array.isArray(email.to) ? email.to[0] : email.to || 'Unknown'}`);
        console.log(`   Date: ${date}`);
        console.log(`   Status: ${email.last_event || 'pending'}`);
        console.log('');
      });

      // Summary stats
      const delivered = emails.filter(e => e.last_event === 'delivered').length;
      const opened = emails.filter(e => e.last_event === 'opened').length;
      const bounced = emails.filter(e => e.last_event === 'bounced').length;
      
      console.log('📊 Summary:');
      console.log(`   Total emails: ${emails.length}`);
      console.log(`   Delivered: ${delivered}/${emails.length} (${emails.length > 0 ? Math.round(delivered/emails.length*100) : 0}%)`);
      console.log(`   Opened: ${opened}/${emails.length} (${emails.length > 0 ? Math.round(opened/emails.length*100) : 0}%)`);
      console.log(`   Bounced: ${bounced}/${emails.length} (${emails.length > 0 ? Math.round(bounced/emails.length*100) : 0}%)`);
      
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error.message);
      console.log('💡 Note: Email analytics may require a paid Resend plan');
    }
  },

  async welcome(email, businessName = 'Test Business') {
    if (!email) {
      console.error('❌ Email address required for welcome email');
      console.log('Usage: npm run email:welcome test@example.com "Business Name"');
      return;
    }

    console.log(`📧 Sending welcome email to ${email}...`);
    try {
      const { sendWelcomeEmail } = await import('../lib/config/email.js');
      const result = await sendWelcomeEmail(email, businessName);
      
      if (result.success) {
        console.log('✅ Welcome email sent successfully!');
        console.log(`📨 Email ID: ${result.data.id}`);
      } else {
        console.error('❌ Failed to send welcome email:', result.error);
      }
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
    }
  },

  async confirm(email, businessName = 'Test Business') {
    if (!email) {
      console.error('❌ Email address required for confirmation email');
      console.log('Usage: npm run email:confirm test@example.com "Business Name"');
      return;
    }

    const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/confirm?token=test&email=${encodeURIComponent(email)}`;
    
    console.log(`📧 Sending confirmation email to ${email}...`);
    try {
      const { sendEmailConfirmation } = await import('../lib/config/email.js');
      const result = await sendEmailConfirmation(email, confirmationLink, businessName);
      
      if (result.success) {
        console.log('✅ Confirmation email sent successfully!');
        console.log(`📨 Email ID: ${result.data.id}`);
        console.log(`🔗 Confirmation link: ${confirmationLink}`);
      } else {
        console.error('❌ Failed to send confirmation email:', result.error);
      }
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error.message);
    }
  },

  help() {
    console.log(`
🚀 SuburbMates Email Management CLI
`);
    console.log('Available commands:');
    console.log('  domains              - Check domain verification status');
    console.log('  test [email]         - Send test email (default: test@example.com)');
    console.log('  analytics [limit]    - View recent email analytics (default: 10)');
    console.log('  welcome <email> [name] - Send welcome email');
    console.log('  confirm <email> [name] - Send confirmation email');
    console.log('  help                 - Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  npm run email:domains');
    console.log('  npm run email:test user@example.com');
    console.log('  npm run email:analytics 20');
    console.log('  npm run email:welcome user@example.com "My Business"');
    console.log('');
  }
};

// Parse command line arguments
const [,, command, ...args] = process.argv;

if (!command || !commands[command]) {
  commands.help();
  process.exit(1);
}

// Execute command
commands[command](...args).catch(error => {
  console.error('❌ Command failed:', error.message);
  process.exit(1);
});