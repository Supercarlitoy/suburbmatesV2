// Test script for agent API routes
import 'dotenv/config';
import axios from 'axios';

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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const AGENT_TOKEN = process.env.AGENT_TOKEN;

// Test helper function
async function testAgentAPI(endpoint, method = 'POST', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}/api/agent${endpoint}`,
      headers: {
        'x-agent-token': AGENT_TOKEN,
        'Content-Type': 'application/json'
      }
    };

    if (data && method === 'POST') {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
}

async function testSentrySearch() {
  log('INFO', 'Testing Sentry search API...');
  
  const result = await testAgentAPI('/sentry/search', 'POST', {
    query: 'error',
    limit: 10
  });

  if (result.success) {
    log('SUCCESS', `Sentry search API working! Mock: ${result.data.mock || false}`);
    return true;
  } else {
    log('ERROR', `Sentry search failed: ${result.error}`);
    return false;
  }
}

async function testSentryComment() {
  log('INFO', 'Testing Sentry comment API...');
  
  const result = await testAgentAPI('/sentry/comment', 'POST', {
    issueId: 'test-issue-123',
    comment: 'Test comment from agent API'
  });

  if (result.success) {
    log('SUCCESS', `Sentry comment API working! Mock: ${result.data.mock || false}`);
    return true;
  } else {
    log('ERROR', `Sentry comment failed: ${result.error}`);
    return false;
  }
}

async function testRedisIncr() {
  log('INFO', 'Testing Redis increment API...');
  
  const result = await testAgentAPI('/redis/incr', 'POST', {
    key: 'test:counter',
    amount: 5,
    ttl: 300
  });

  if (result.success) {
    log('SUCCESS', `Redis increment API working! New value: ${result.data.newValue}, Mock: ${result.data.mock || false}`);
    return true;
  } else {
    log('ERROR', `Redis increment failed: ${result.error}`);
    return false;
  }
}

async function testFeatureFlags() {
  log('INFO', 'Testing feature flags API...');
  
  const result = await testAgentAPI('/flags/set', 'POST', {
    key: 'test-feature',
    enabled: true,
    audience: 'beta-users'
  });

  if (result.success) {
    log('SUCCESS', `Feature flags API working! Database: ${result.data.storage.database}, Redis: ${result.data.storage.redis}`);
    return true;
  } else {
    log('ERROR', `Feature flags failed: ${result.error}`);
    return false;
  }
}

async function testCacheInvalidation() {
  log('INFO', 'Testing cache invalidation API...');
  
  const tests = [
    { type: 'tag', value: 'business-profiles' },
    { type: 'path', value: '/business' },
    { type: 'redis-key', value: 'cache:test' }
  ];

  let allPassed = true;

  for (const test of tests) {
    const result = await testAgentAPI('/cache/invalidate', 'POST', test);
    
    if (result.success) {
      log('SUCCESS', `Cache invalidation (${test.type}): ${JSON.stringify(result.data.invalidated)}`);
    } else {
      log('ERROR', `Cache invalidation (${test.type}) failed: ${result.error}`);
      allPassed = false;
    }
  }

  return allPassed;
}

async function testOGImageGeneration() {
  log('INFO', 'Testing OG image generation API...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/og?slug=test-business&theme=default`, {
      responseType: 'arraybuffer'
    });

    if (response.status === 200) {
      log('SUCCESS', `OG image generation working! Content-Type: ${response.headers['content-type']}`);
      return true;
    } else {
      log('ERROR', `OG image generation failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      log('WARNING', 'OG image generation: test business not found (expected)');
      return true; // This is expected for test data
    }
    log('ERROR', `OG image generation failed: ${error.message}`);
    return false;
  }
}

async function testUnauthorizedAccess() {
  log('INFO', 'Testing unauthorized access protection...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/agent/sentry/search`, {
      query: 'test'
    }, {
      headers: {
        'x-agent-token': 'invalid-token',
        'Content-Type': 'application/json'
      }
    });
    
    log('ERROR', 'Security test failed: unauthorized request succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log('SUCCESS', 'Security: Unauthorized access properly blocked');
      return true;
    } else {
      log('ERROR', `Security test failed with unexpected status: ${error.response?.status}`);
      return false;
    }
  }
}

async function main() {
  log('INFO', '🧪 Testing Agent API Routes');
  log('INFO', '===========================\n');

  if (!AGENT_TOKEN) {
    log('ERROR', 'AGENT_TOKEN not found in environment');
    return;
  }

  log('INFO', `Base URL: ${BASE_URL}`);
  log('INFO', `Agent Token: ${AGENT_TOKEN.substring(0, 10)}...\n`);

  const tests = [
    { name: 'Sentry Search', fn: testSentrySearch },
    { name: 'Sentry Comment', fn: testSentryComment },
    { name: 'Redis Increment', fn: testRedisIncr },
    { name: 'Feature Flags', fn: testFeatureFlags },
    { name: 'Cache Invalidation', fn: testCacheInvalidation },
    { name: 'OG Image Generation', fn: testOGImageGeneration },
    { name: 'Security (Unauthorized)', fn: testUnauthorizedAccess }
  ];

  const results = {};

  for (const test of tests) {
    try {
      results[test.name] = await test.fn();
    } catch (error) {
      log('ERROR', `Test "${test.name}" threw error: ${error.message}`);
      results[test.name] = false;
    }
    console.log(''); // Add spacing
  }

  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([testName, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.values(results).length;

  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);

  if (passedCount === totalCount) {
    log('SUCCESS', '🎉 All agent API routes are working!');
  } else {
    log('WARNING', '⚠️ Some API routes need attention');
  }
}

main().catch(error => {
  log('ERROR', `Test script failed: ${error.message}`);
  process.exit(1);
});