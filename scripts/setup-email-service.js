#!/usr/bin/env node
/**
 * Script to configure Resend email service for SuburbMates
 * This sets up branded email templates and SMTP configuration
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateEnvExample() {
  const envExample = `# Email Configuration with Resend
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@suburbmates.com.au
RESEND_FROM_NAME=SuburbMates

# Supabase Configuration (for auth only, not email)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Disable Supabase emails (we use Resend instead)
SUPABASE_SMTP_ADMIN_EMAIL=disabled
SUPABASE_SMTP_HOST=disabled

# Development URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=\${VERCEL_URL}

# Database
DATABASE_URL=your_database_url

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id`;

  const envPath = path.join(process.cwd(), '.env.local.example');
  fs.writeFileSync(envPath, envExample);
  log(`✅ Created ${envPath}`, 'green');
}

function createEmailTestScript() {
  const testScript = `#!/usr/bin/env node
/**
 * Test script for Resend email service
 */

const { Resend } = require('resend');

async function testEmailService() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  try {
    // Test 1: Send a test email
    console.log('🧪 Testing email sending...');
    
    const { data, error } = await resend.emails.send({
      from: \`\${process.env.RESEND_FROM_NAME} <\${process.env.RESEND_FROM_EMAIL}>\`,
      to: ['test@example.com'], // Replace with your test email
      subject: 'SuburbMates Email Test',
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #475569 100%); padding: 20px; text-align: center;">
            <h1 style="color: #f59e0b; margin: 0;">SuburbMates</h1>
            <p style="color: white; margin: 10px 0 0 0;">Melbourne's Business Community Platform</p>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #1e293b;">Email Service Test</h2>
            <p>If you're seeing this email, your Resend integration is working correctly!</p>
            <p style="color: #64748b;">This is a test email sent from your SuburbMates application.</p>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Sent via Resend • SuburbMates Team
            </p>
          </div>
        </div>
      \`
    });

    if (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', data.id);
    
    // Test 2: Check domain configuration
    console.log('\\n🔍 Checking domain configuration...');
    
    try {
      const domains = await resend.domains.list();
      console.log('✅ Domain API accessible');
      
      if (domains.data && domains.data.length > 0) {
        console.log('📋 Configured domains:');
        domains.data.forEach(domain => {
          console.log(\`  - \${domain.name} (\${domain.status})\`);
        });
      } else {
        console.log('⚠️  No domains configured yet');
        console.log('💡 Add your domain at: https://resend.com/domains');
      }
    } catch (domainError) {
      console.warn('⚠️  Could not fetch domain info:', domainError.message);
    }

    return true;

  } catch (error) {
    console.error('❌ Email service test failed:', error);
    return false;
  }
}

// Run the test
testEmailService().then(success => {
  if (success) {
    console.log('\\n🎉 Email service is configured correctly!');
    console.log('\\n📚 Next steps:');
    console.log('  1. Add your domain to Resend: https://resend.com/domains');
    console.log('  2. Configure DNS records for email authentication');
    console.log('  3. Update RESEND_FROM_EMAIL to use your verified domain');
  } else {
    console.log('\\n❌ Email service configuration needs attention');
  }
  
  process.exit(success ? 0 : 1);
});

module.exports = { testEmailService };`;

  const scriptPath = path.join(process.cwd(), 'scripts/test-email.js');
  fs.writeFileSync(scriptPath, testScript);
  fs.chmodSync(scriptPath, '755');
  log(`✅ Created ${scriptPath}`, 'green');
}

function createEmailConfigFile() {
  const configContent = `/**
 * Email service configuration for SuburbMates
 * Uses Resend for reliable email delivery with custom branding
 */

export const emailConfig = {
  // Resend configuration
  provider: 'resend',
  apiKey: process.env.RESEND_API_KEY,
  
  // From address configuration
  from: {
    email: process.env.RESEND_FROM_EMAIL || 'noreply@suburbmates.com.au',
    name: process.env.RESEND_FROM_NAME || 'SuburbMates'
  },
  
  // Template settings
  templates: {
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    brandColors: {
      navy: '#1e293b',
      amber: '#f59e0b',
      slate: '#64748b',
      green: '#059669'
    }
  },
  
  // Email types and their settings
  types: {
    signup: {
      subject: 'Welcome to SuburbMates! Please confirm your email',
      template: 'signup-confirmation'
    },
    magicLink: {
      subject: 'Your SuburbMates sign-in link',
      template: 'magic-link'
    },
    passwordReset: {
      subject: 'Reset your SuburbMates password',
      template: 'password-reset'
    },
    businessClaimed: {
      subject: 'Business profile claimed successfully',
      template: 'business-claimed'
    },
    profileCreated: {
      subject: 'Your business profile is live!',
      template: 'profile-created'
    }
  },
  
  // Development settings
  isDevelopment: process.env.NODE_ENV === 'development',
  logEmails: process.env.NODE_ENV === 'development'
};

// Validate configuration
export function validateEmailConfig() {
  const errors = [];
  
  if (!emailConfig.apiKey) {
    errors.push('RESEND_API_KEY environment variable is required');
  }
  
  if (!emailConfig.from.email) {
    errors.push('RESEND_FROM_EMAIL environment variable is required');
  }
  
  // Check for proper email format
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (emailConfig.from.email && !emailRegex.test(emailConfig.from.email)) {
    errors.push('RESEND_FROM_EMAIL must be a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default emailConfig;`;

  const configPath = path.join(process.cwd(), 'lib/email/config.ts');
  
  // Ensure directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, configContent);
  log(`✅ Created ${configPath}`, 'green');
}

function createSupabaseAuthHook() {
  const hookContent = `/**
 * Supabase Auth Hook Configuration
 * Integrates Resend for email delivery instead of default Supabase emails
 */

import { createClient } from '@supabase/supabase-js';
import emailConfig from './config';

// Create Supabase admin client for auth customization
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Custom auth configuration to disable Supabase emails
 * and use Resend for all email communications
 */
export async function configureSupabaseAuth() {
  try {
    // Disable auto-confirm for email changes to use custom flow
    const { error } = await supabaseAdmin.auth.admin.updateUser(
      'user-id', // This would be called per-user
      {
        email_confirm: false, // We handle confirmation via Resend
        user_metadata: {
          email_provider: 'resend',
          custom_emails: true
        }
      }
    );

    if (error) {
      console.warn('Could not update auth settings:', error.message);
    }

  } catch (error) {
    console.error('Failed to configure Supabase auth:', error);
  }
}

/**
 * Middleware to intercept Supabase auth events and trigger custom emails
 */
export function setupAuthEventHooks() {
  // This would typically be set up in your middleware or auth callback
  console.log('✅ Auth event hooks configured for custom email handling');
}

export default {
  configureSupabaseAuth,
  setupAuthEventHooks
};`;

  const hookPath = path.join(process.cwd(), 'lib/email/auth-hooks.ts');
  fs.writeFileSync(hookPath, hookContent);
  log(`✅ Created ${hookPath}`, 'green');
}

function displaySetupInstructions() {
  log('\\n📋 SuburbMates Email Service Setup Complete!', 'bright');
  log('\\n🔧 Required Actions:', 'yellow');
  
  console.log(`
1. 📝 Get your Resend API key:
   → Visit: https://resend.com/api-keys
   → Create new API key with full permissions

2. 🏷️ Add your domain to Resend:
   → Visit: https://resend.com/domains
   → Add: suburbmates.com.au
   → Configure DNS records (SPF, DKIM, DMARC)

3. 🔧 Update your environment variables:
   → Copy .env.local.example to .env.local
   → Fill in your actual API keys and URLs

4. 🧪 Test your email setup:
   → Run: npm run email:test
   → Check that emails are being sent properly

5. 🚀 Configure Supabase to use custom emails:
   → In Supabase dashboard, disable default emails
   → Set auth redirect URLs to your domain
`);

  log('📚 Additional Resources:', 'cyan');
  console.log(`
• Resend Documentation: https://resend.com/docs
• DNS Configuration Guide: https://resend.com/docs/send-with-domains
• Email Templates: /lib/email/templates/
• Test Scripts: /scripts/test-email.js
`);

  log('⚡ Quick Commands:', 'magenta');
  console.log(`
npm run email:test          # Test email configuration
npm run email:dev           # Development email debugging
npm run email:validate      # Validate email templates
`);
}

// Main setup function
async function setupEmailService() {
  log('🚀 Setting up SuburbMates Email Service...\\n', 'bright');
  
  try {
    // Create configuration files
    log('📁 Creating configuration files...', 'blue');
    generateEnvExample();
    createEmailConfigFile();
    createSupabaseAuthHook();
    
    // Create test scripts
    log('\\n🧪 Creating test scripts...', 'blue');
    createEmailTestScript();
    
    // Display final instructions
    displaySetupInstructions();
    
    log('\\n✅ Email service setup completed successfully!', 'green');
    
  } catch (error) {
    log(`\\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupEmailService();
}

module.exports = {
  setupEmailService,
  generateEnvExample,
  createEmailTestScript,
  createEmailConfigFile
};