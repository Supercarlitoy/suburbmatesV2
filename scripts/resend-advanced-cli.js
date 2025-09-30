#!/usr/bin/env node
/**
 * SuburbMates Advanced Resend CLI
 * Leveraging latest Resend SDK features (v6.1.1+)
 * 
 * Usage:
 *   node scripts/resend-advanced-cli.js <command> [options]
 *   npm run email:advanced <command> [options]
 */

import { Resend } from 'resend';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

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

// Advanced command handlers
const commands = {
  // =================
  // BATCH OPERATIONS
  // =================
  
  async batch(csvFile) {
    if (!csvFile) {
      console.error('❌ CSV file required for batch operations');
      console.log('Usage: batch path/to/batch-emails.csv');
      console.log('CSV format: to,subject,businessName,type');
      return;
    }

    console.log(`📦 Processing batch emails from ${csvFile}...`);

    try {
      const csvContent = await fs.readFile(csvFile, 'utf-8');
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      
      console.log(`📊 Found ${lines.length - 1} email(s) to process`);

      const batchEmails = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const [to, subject, businessName, type] = values.map(v => v.trim());

        if (to && subject && businessName) {
          const html = generateEmailHTML(type || 'welcome', businessName, { 
            customerName: 'Valued Customer',
            message: 'Thank you for your interest in our services.' 
          });

          batchEmails.push({
            from: `SuburbMates <noreply@${DOMAIN}>`,
            to: [to],
            subject: subject.replace('{businessName}', businessName),
            html,
            tags: [
              { name: 'type', value: type || 'welcome' },
              { name: 'business', value: businessName },
              { name: 'batch', value: 'true' }
            ],
            metadata: {
              business_name: businessName,
              email_type: type || 'welcome',
              batch_sent_at: new Date().toISOString()
            }
          });
        }
      }

      console.log(`🚀 Sending ${batchEmails.length} emails in batch...`);
      const response = await resend.batch.send(batchEmails);

      if (response.error) {
        console.error('❌ Batch send failed:', response.error);
        return;
      }

      console.log('✅ Batch emails sent successfully!');
      console.log(`📨 Sent ${response.data?.length || 0} emails`);
      response.data?.forEach((email, index) => {
        console.log(`   ${index + 1}. ID: ${email.id}`);
      });

    } catch (error) {
      console.error('❌ Failed to process batch emails:', error.message);
    }
  },

  // =================
  // AUDIENCE MANAGEMENT
  // =================

  async audiences(action = 'list', ...args) {
    switch (action) {
      case 'list':
        console.log('📋 Listing all audiences...');
        try {
          const response = await resend.audiences.list();
          if (response.error) {
            console.error('❌ Failed to fetch audiences:', response.error);
            return;
          }

          const audiences = response.data?.data || response.data || [];
          if (audiences.length === 0) {
            console.log('📭 No audiences found');
            console.log('💡 Create one with: audiences create "Audience Name"');
            return;
          }

          console.log(`\n📊 Found ${audiences.length} audience(s):`);
          console.log('─'.repeat(80));
          audiences.forEach((audience, index) => {
            console.log(`${index + 1}. ${audience.name}`);
            console.log(`   📅 Created: ${new Date(audience.created_at).toLocaleString()}`);
            console.log(`   🆔 ID: ${audience.id}`);
            if (audience.description) {
              console.log(`   📝 Description: ${audience.description}`);
            }
            console.log('');
          });
        } catch (error) {
          console.error('❌ Failed to list audiences:', error.message);
        }
        break;

      case 'create':
        const [name, description] = args;
        if (!name) {
          console.error('❌ Audience name required');
          console.log('Usage: audiences create "Audience Name" "Optional description"');
          return;
        }

        console.log(`📝 Creating audience: ${name}...`);
        try {
          const response = await resend.audiences.create({
            name,
            description: description || `SuburbMates ${name} audience`
          });

          if (response.error) {
            console.error('❌ Failed to create audience:', response.error);
            return;
          }

          console.log('✅ Audience created successfully!');
          console.log(`📊 Audience ID: ${response.data?.id}`);
          console.log(`📝 Name: ${name}`);
        } catch (error) {
          console.error('❌ Failed to create audience:', error.message);
        }
        break;

      case 'setup':
        console.log('🔧 Setting up SuburbMates default audiences...');
        
        const defaultAudiences = [
          { name: 'Business Owners', description: 'SuburbMates business owners and claimants' },
          { name: 'Customers', description: 'SuburbMates customers and inquirers' },
          { name: 'Marketing Newsletter', description: 'SuburbMates newsletter subscribers' }
        ];

        let created = 0;
        for (const audience of defaultAudiences) {
          try {
            const response = await resend.audiences.create(audience);
            if (response.error) {
              console.log(`⚠️ Failed to create ${audience.name}: ${response.error.message}`);
            } else {
              console.log(`✅ Created: ${audience.name} (ID: ${response.data?.id})`);
              created++;
            }
          } catch (error) {
            console.log(`⚠️ Failed to create ${audience.name}: ${error.message}`);
          }
        }
        
        console.log(`\n🎉 Successfully created ${created}/${defaultAudiences.length} audiences`);
        break;

      default:
        console.log('Available audience commands:');
        console.log('  audiences list                    - List all audiences');
        console.log('  audiences create "Name" "Desc"    - Create new audience');
        console.log('  audiences setup                   - Setup default SuburbMates audiences');
        break;
    }
  },

  // =================
  // CONTACT MANAGEMENT
  // =================

  async contacts(action = 'list', audienceId, ...args) {
    switch (action) {
      case 'list':
        if (!audienceId) {
          console.error('❌ Audience ID required');
          console.log('Usage: contacts list <audience_id>');
          return;
        }

        console.log(`👥 Listing contacts for audience ${audienceId}...`);
        try {
          const response = await resend.contacts.list({ audienceId });
          if (response.error) {
            console.error('❌ Failed to fetch contacts:', response.error);
            return;
          }

          const contacts = response.data?.data || response.data || [];
          if (contacts.length === 0) {
            console.log('📭 No contacts found in this audience');
            return;
          }

          console.log(`\n👥 Found ${contacts.length} contact(s):`);
          console.log('─'.repeat(80));
          contacts.forEach((contact, index) => {
            console.log(`${index + 1}. ${contact.email}`);
            if (contact.first_name || contact.last_name) {
              console.log(`   👤 Name: ${contact.first_name || ''} ${contact.last_name || ''}`.trim());
            }
            console.log(`   📅 Added: ${new Date(contact.created_at).toLocaleString()}`);
            console.log(`   📧 Unsubscribed: ${contact.unsubscribed ? 'Yes' : 'No'}`);
            console.log('');
          });
        } catch (error) {
          console.error('❌ Failed to list contacts:', error.message);
        }
        break;

      case 'add':
        if (!audienceId) {
          console.error('❌ Audience ID required');
          console.log('Usage: contacts add <audience_id> <email> [firstName] [lastName]');
          return;
        }

        const [email, firstName, lastName] = args;
        if (!email) {
          console.error('❌ Email address required');
          console.log('Usage: contacts add <audience_id> <email> [firstName] [lastName]');
          return;
        }

        console.log(`👤 Adding contact ${email} to audience ${audienceId}...`);
        try {
          const response = await resend.contacts.create({
            email,
            firstName,
            lastName,
            audienceId,
            unsubscribed: false
          });

          if (response.error) {
            console.error('❌ Failed to add contact:', response.error);
            return;
          }

          console.log('✅ Contact added successfully!');
          console.log(`👤 Contact ID: ${response.data?.id}`);
          console.log(`📧 Email: ${email}`);
        } catch (error) {
          console.error('❌ Failed to add contact:', error.message);
        }
        break;

      default:
        console.log('Available contact commands:');
        console.log('  contacts list <audience_id>                     - List contacts in audience');
        console.log('  contacts add <audience_id> <email> [firstName]  - Add contact to audience');
        break;
    }
  },

  // =================
  // BROADCAST CAMPAIGNS
  // =================

  async broadcasts(action = 'list', ...args) {
    switch (action) {
      case 'list':
        console.log('📺 Listing all broadcasts...');
        try {
          const response = await resend.broadcasts.list();
          if (response.error) {
            console.error('❌ Failed to fetch broadcasts:', response.error);
            return;
          }

          const broadcasts = response.data?.data || response.data || [];
          if (broadcasts.length === 0) {
            console.log('📭 No broadcasts found');
            console.log('💡 Create one with: broadcasts create');
            return;
          }

          console.log(`\n📊 Found ${broadcasts.length} broadcast(s):`);
          console.log('─'.repeat(80));
          broadcasts.forEach((broadcast, index) => {
            console.log(`${index + 1}. ${broadcast.name}`);
            console.log(`   📧 Subject: ${broadcast.subject}`);
            console.log(`   📅 Created: ${new Date(broadcast.created_at).toLocaleString()}`);
            console.log(`   📊 Status: ${broadcast.status}`);
            console.log(`   🆔 ID: ${broadcast.id}`);
            console.log('');
          });
        } catch (error) {
          console.error('❌ Failed to list broadcasts:', error.message);
        }
        break;

      case 'create':
        console.log('📺 Creating sample newsletter broadcast...');
        
        // First, get available audiences
        const audiencesResponse = await resend.audiences.list();
        if (audiencesResponse.error || !audiencesResponse.data?.length) {
          console.error('❌ No audiences available. Create one first with: audiences create');
          return;
        }

        const audience = audiencesResponse.data[0];
        console.log(`📋 Using audience: ${audience.name} (${audience.id})`);

        try {
          const response = await resend.broadcasts.create({
            name: 'SuburbMates Weekly Newsletter',
            audienceId: audience.id,
            from: `SuburbMates <newsletter@${DOMAIN}>`,
            subject: '📰 SuburbMates Weekly - New Businesses & Updates',
            html: generateNewsletterHTML()
          });

          if (response.error) {
            console.error('❌ Failed to create broadcast:', response.error);
            return;
          }

          console.log('✅ Broadcast created successfully!');
          console.log(`📺 Broadcast ID: ${response.data?.id}`);
          console.log('💡 Send with: broadcasts send ' + response.data?.id);
        } catch (error) {
          console.error('❌ Failed to create broadcast:', error.message);
        }
        break;

      case 'send':
        const [broadcastId] = args;
        if (!broadcastId) {
          console.error('❌ Broadcast ID required');
          console.log('Usage: broadcasts send <broadcast_id>');
          return;
        }

        console.log(`📤 Sending broadcast ${broadcastId}...`);
        try {
          const response = await resend.broadcasts.send(broadcastId);
          
          if (response.error) {
            console.error('❌ Failed to send broadcast:', response.error);
            return;
          }

          console.log('✅ Broadcast sent successfully!');
        } catch (error) {
          console.error('❌ Failed to send broadcast:', error.message);
        }
        break;

      default:
        console.log('Available broadcast commands:');
        console.log('  broadcasts list       - List all broadcasts');
        console.log('  broadcasts create     - Create sample newsletter broadcast');
        console.log('  broadcasts send <id>  - Send broadcast by ID');
        break;
    }
  },

  // =================
  // ADVANCED EMAIL OPERATIONS
  // =================

  async email(action = 'get', emailId) {
    switch (action) {
      case 'get':
        if (!emailId) {
          console.error('❌ Email ID required');
          console.log('Usage: email get <email_id>');
          return;
        }

        console.log(`📧 Getting email details for ${emailId}...`);
        try {
          const response = await resend.emails.get(emailId);
          
          if (response.error) {
            console.error('❌ Failed to get email details:', response.error);
            return;
          }

          const email = response.data;
          console.log('\n📊 Email Details:');
          console.log('─'.repeat(50));
          console.log(`📧 Subject: ${email.subject}`);
          console.log(`👤 To: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`);
          console.log(`📤 From: ${email.from}`);
          console.log(`📊 Status: ${email.last_event || 'pending'}`);
          console.log(`📅 Sent: ${new Date(email.created_at).toLocaleString()}`);
          
          if (email.opened_at) {
            console.log(`👀 Opened: ${new Date(email.opened_at).toLocaleString()}`);
          }
          if (email.clicked_at) {
            console.log(`🖱️ Clicked: ${new Date(email.clicked_at).toLocaleString()}`);
          }

        } catch (error) {
          console.error('❌ Failed to get email details:', error.message);
        }
        break;

      case 'cancel':
        if (!emailId) {
          console.error('❌ Email ID required');
          console.log('Usage: email cancel <email_id>');
          return;
        }

        console.log(`🚫 Canceling email ${emailId}...`);
        try {
          const response = await resend.emails.cancel(emailId);
          
          if (response.error) {
            console.error('❌ Failed to cancel email:', response.error);
            return;
          }

          console.log('✅ Email canceled successfully!');
        } catch (error) {
          console.error('❌ Failed to cancel email:', error.message);
        }
        break;

      default:
        console.log('Available email commands:');
        console.log('  email get <id>     - Get detailed email information');
        console.log('  email cancel <id>  - Cancel scheduled email');
        break;
    }
  },

  // =================
  // API KEY MANAGEMENT
  // =================

  async apikeys(action = 'list', ...args) {
    switch (action) {
      case 'list':
        console.log('🔑 Listing API keys...');
        try {
          const response = await resend.apiKeys.list();
          if (response.error) {
            console.error('❌ Failed to fetch API keys:', response.error);
            return;
          }

          const keys = response.data?.data || response.data || [];
          if (keys.length === 0) {
            console.log('🔑 No API keys found');
            return;
          }

          console.log(`\n🔑 Found ${keys.length} API key(s):`);
          console.log('─'.repeat(80));
          keys.forEach((key, index) => {
            console.log(`${index + 1}. ${key.name}`);
            console.log(`   📅 Created: ${new Date(key.created_at).toLocaleString()}`);
            console.log(`   🆔 ID: ${key.id}`);
            console.log('');
          });
        } catch (error) {
          console.error('❌ Failed to list API keys:', error.message);
        }
        break;

      case 'create':
        const [name, permission] = args;
        if (!name) {
          console.error('❌ API key name required');
          console.log('Usage: apikeys create "Key Name" [full_access|sending_access]');
          return;
        }

        const keyPermission = permission || 'sending_access';
        console.log(`🔑 Creating API key: ${name} with ${keyPermission}...`);
        
        try {
          const response = await resend.apiKeys.create({
            name,
            permission: keyPermission
          });

          if (response.error) {
            console.error('❌ Failed to create API key:', response.error);
            return;
          }

          console.log('✅ API key created successfully!');
          console.log(`🔑 Key: ${response.data?.token}`);
          console.log('⚠️ Save this key securely - it won\'t be shown again!');
        } catch (error) {
          console.error('❌ Failed to create API key:', error.message);
        }
        break;

      default:
        console.log('Available API key commands:');
        console.log('  apikeys list                              - List all API keys');
        console.log('  apikeys create "Name" [permission]        - Create new API key');
        console.log('  Permissions: full_access, sending_access');
        break;
    }
  },

  // =================
  // SUBURBMATES WORKFLOWS
  // =================

  async workflow(type = 'list', ...args) {
    switch (type) {
      case 'setup':
        console.log('🔧 Setting up complete SuburbMates email system...');
        
        // Setup audiences
        console.log('\n1️⃣ Creating audiences...');
        await commands.audiences('setup');
        
        console.log('\n2️⃣ Email system setup complete! ✅');
        console.log('\nNext steps:');
        console.log('  • Add contacts: contacts add <audience_id> <email>');
        console.log('  • Create broadcasts: broadcasts create');
        console.log('  • Send batch emails: batch emails.csv');
        break;

      case 'digest':
        console.log('📊 Sending weekly business digest...');
        
        // Sample business data
        const sampleBusinesses = [
          {
            email: args[0] || 'owner@example.com',
            businessName: 'Sample Cafe',
            inquiries: 5,
            views: 142,
            newReviews: 2
          }
        ];

        const digestEmails = sampleBusinesses.map(business => ({
          from: `SuburbMates <digest@${DOMAIN}>`,
          to: [business.email],
          subject: `📊 Weekly Digest - ${business.businessName} Performance`,
          html: generateWeeklyDigestHTML(business.businessName, business),
          tags: [
            { name: 'type', value: 'weekly-digest' },
            { name: 'business', value: business.businessName }
          ]
        }));

        try {
          const response = await resend.batch.send(digestEmails);
          if (response.error) {
            console.error('❌ Failed to send digest:', response.error);
            return;
          }
          console.log('✅ Weekly digest sent successfully!');
        } catch (error) {
          console.error('❌ Failed to send digest:', error.message);
        }
        break;

      default:
        console.log('Available workflow commands:');
        console.log('  workflow setup         - Setup complete email system');
        console.log('  workflow digest <email> - Send sample weekly digest');
        break;
    }
  },

  help() {
    console.log(`
🚀 SuburbMates Advanced Resend CLI (v6.1.1+)
═════════════════════════════════════════════════

🎯 New Advanced Features:
  batch <csv-file>               - Send emails in batch for efficiency
  audiences <action> [args]      - Manage subscriber audiences
  contacts <action> [args]       - Manage contacts within audiences
  broadcasts <action> [args]     - Create and send newsletter campaigns
  email <action> <id>            - Advanced email operations (get, cancel)
  apikeys <action> [args]        - Manage API keys programmatically
  workflow <type> [args]         - SuburbMates-specific workflows

📋 Quick Start Examples:
  # Setup complete email system
  workflow setup

  # Create and manage audiences
  audiences setup
  audiences create "VIP Customers"
  contacts add <audience_id> user@example.com "John Doe"

  # Send batch emails efficiently
  batch sample-emails.csv

  # Create newsletter campaigns
  broadcasts create
  broadcasts send <broadcast_id>

  # Advanced email operations
  email get <email_id>
  email cancel <email_id>

  # Weekly business digests
  workflow digest owner@business.com

📁 CSV Format for batch operations:
  to,subject,businessName,type
  owner@cafe.com,Welcome to SuburbMates - {businessName},My Cafe,welcome
  customer@email.com,Thank you for your inquiry,Business Name,inquiry

🔧 API Key Management:
  apikeys list
  apikeys create "Production Key" full_access

💡 Pro Tips:
  • Use batch operations for sending multiple emails efficiently
  • Create audiences to segment your email lists
  • Use broadcasts for newsletters and marketing campaigns
  • Monitor email performance with detailed analytics
  • Setup automated workflows for business operations

📚 More info: https://resend.com/docs/api-reference
`);
  }
};

// Template generators
function generateEmailHTML(type, businessName, data = {}) {
  const templates = {
    welcome: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to SuburbMates! 🎉</h1>
        <p>Congratulations! <strong>${businessName}</strong> is now live on our platform.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's next:</h3>
          <ul>
            <li>Complete your business profile</li>
            <li>Start receiving customer inquiries</li>
            <li>Share your profile link</li>
          </ul>
        </div>
        <a href="https://suburbmates.com.au/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
      </div>
    `,
    inquiry: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">🔥 New Customer Inquiry!</h1>
        <p>Someone is interested in <strong>${businessName}</strong>!</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Customer Details:</h3>
          <p><strong>Name:</strong> ${data.customerName || 'Customer'}</p>
          <p><strong>Message:</strong> ${data.message || 'Inquiry about your services'}</p>
        </div>
      </div>
    `
  };

  return templates[type] || templates.welcome;
}

function generateNewsletterHTML() {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">📰 SuburbMates Weekly Newsletter</h1>
      <p>Discover new businesses and updates from your local Melbourne community!</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🆕 New This Week:</h3>
        <ul>
          <li>5 new cafes joined SuburbMates</li>
          <li>3 new fitness centers in your area</li>
          <li>Local business spotlight features</li>
        </ul>
      </div>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📊 Community Stats:</h3>
        <p>Over 1,200 businesses now call SuburbMates home!</p>
        <p>150+ customer inquiries made this week</p>
      </div>
      
      <a href="https://suburbmates.com.au" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Explore SuburbMates</a>
    </div>
  `;
}

function generateWeeklyDigestHTML(businessName, data) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">📊 Weekly Performance Digest</h1>
      <h2>${businessName}</h2>
      <p>Here's how your business performed this week:</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #2563eb; font-size: 24px;">${data.inquiries}</h3>
          <p style="margin: 5px 0; color: #64748b;">New Inquiries</p>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #059669; font-size: 24px;">${data.views}</h3>
          <p style="margin: 5px 0; color: #64748b;">Profile Views</p>
        </div>
        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #d97706; font-size: 24px;">${data.newReviews}</h3>
          <p style="margin: 5px 0; color: #64748b;">New Reviews</p>
        </div>
      </div>
      
      <a href="https://suburbmates.com.au/dashboard/analytics" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Analytics</a>
    </div>
  `;
}

// Command execution
const [,, command, ...args] = process.argv;

if (!command || !commands[command]) {
  commands.help();
  process.exit(1);
}

// Execute command with error handling
async function executeCommand() {
  try {
    await commands[command](...args);
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

executeCommand();
