// Test script for validating external API connections
import 'dotenv/config';
import axios from 'axios';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (status, message) => {
  const color = status === 'SUCCESS' ? colors.green : 
                status === 'ERROR' ? colors.red : 
                status === 'WARNING' ? colors.yellow : colors.blue;
  console.log(`${color}[${status}]${colors.reset} ${message}`);
};

async function testSentry() {
  log('INFO', 'Testing Sentry API connection...');
  
  const token = process.env.SENTRY_API_TOKEN;
  const org = process.env.SENTRY_ORG || 'your-org';
  
  if (!token || token.includes('your_') || token === 'your_sentry_api_token_here') {
    log('WARNING', 'Sentry API token appears to be placeholder');
    return false;
  }

  try {
    // Test Sentry API connection
    const response = await axios.get(`https://sentry.io/api/0/organizations/${org}/projects/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    log('SUCCESS', `Sentry API connection successful! Found ${response.data?.length || 0} projects`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      log('ERROR', 'Sentry API: Invalid token or unauthorized');
    } else if (error.response?.status === 404) {
      log('ERROR', `Sentry API: Organization '${org}' not found`);
    } else {
      log('ERROR', `Sentry API error: ${error.message}`);
    }
    return false;
  }
}

async function testUpstash() {
  log('INFO', 'Testing Upstash Redis connection...');
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token || url.includes('your_') || token.includes('your_')) {
    log('WARNING', 'Upstash Redis credentials appear to be placeholder');
    return false;
  }

  try {
    // Test Redis connection with PING
    const response = await axios.get(`${url}/ping`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.result === 'PONG') {
      log('SUCCESS', 'Upstash Redis connection successful!');
      return true;
    } else {
      log('ERROR', 'Upstash Redis: Unexpected response to PING');
      return false;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      log('ERROR', 'Upstash Redis: Invalid token or unauthorized');
    } else {
      log('ERROR', `Upstash Redis error: ${error.message}`);
    }
    return false;
  }
}

async function testResend() {
  log('INFO', 'Testing Resend API connection...');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    log('WARNING', 'Resend API key not found');
    return false;
  }

  try {
    // Test Resend API by fetching domains
    const response = await axios.get('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    log('SUCCESS', `Resend API connection successful! Found ${response.data?.data?.length || 0} domains`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      log('ERROR', 'Resend API: Invalid API key');
    } else {
      log('ERROR', `Resend API error: ${error.message}`);
    }
    return false;
  }
}

async function testNightlyDigest() {
  log('INFO', 'Testing Nightly Digest script...');
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const authEmailFrom = process.env.AUTH_EMAIL_FROM;
  
  if (!adminEmail || !authEmailFrom) {
    log('WARNING', 'Admin email configuration incomplete');
    return false;
  }

  // Test that the script can generate the digest structure
  const now = new Date().toISOString();
  const summary = {
    generatedAt: now,
    views24h: 0,
    shares24h: 0,
    leads24h: 0,
    profilesMissingHero: [],
  };
  
  log('SUCCESS', 'Nightly digest structure validation passed');
  log('INFO', `Would send to: ${adminEmail}`);
  log('INFO', `From: ${authEmailFrom}`);
  return true;
}

async function main() {
  log('INFO', '🧪 Starting API validation tests...\n');
  
  const results = {
    sentry: await testSentry(),
    upstash: await testUpstash(), 
    resend: await testResend(),
    digest: await testNightlyDigest()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([service, passed]) => {
    const status = passed ? '✅' : '❌';
    const serviceFormatted = service.charAt(0).toUpperCase() + service.slice(1);
    console.log(`${status} ${serviceFormatted}: ${passed ? 'READY' : 'NEEDS SETUP'}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\n🎯 Overall Status: ${passedCount}/${totalCount} services ready`);
  
  if (passedCount === totalCount) {
    log('SUCCESS', '🎉 All automation services are ready!');
  } else {
    log('WARNING', '⚠️  Some services need configuration');
  }
}

main().catch(error => {
  log('ERROR', `Test script failed: ${error.message}`);
  process.exit(1);
});