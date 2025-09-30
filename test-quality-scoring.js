#!/usr/bin/env node

/**
 * Quality Scoring Admin API Test Script
 * 
 * This script tests all the quality scoring admin endpoints:
 * - GET /api/admin/quality-scoring - List businesses with scores
 * - POST /api/admin/quality-scoring - Bulk recalculate scores  
 * - GET /api/admin/quality-scoring/[businessId] - Detailed analysis
 * - GET /api/admin/quality-scoring/config - Get configuration
 * - PUT /api/admin/quality-scoring/config - Update configuration
 * - POST /api/admin/quality-scoring/boost - Apply manual boosts
 * - GET /api/admin/quality-scoring/boost - Get boost history
 * - DELETE /api/admin/quality-scoring/boost - Remove boosts
 */

const BASE_URL = 'http://localhost:3005';

// Test user credentials (replace with actual admin credentials)
const TEST_ADMIN_EMAIL = 'admin@suburbmates.com.au';
const TEST_ADMIN_PASSWORD = 'admin123';

let authToken = null;
let testBusinessId = null;
let testBoostId = null;

async function makeRequest(method, endpoint, data = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🔄 ${method} ${endpoint}`);
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(result, null, 2).substring(0, 300)}...`);
    
    return { status: response.status, data: result, ok: response.ok };
  } catch (error) {
    console.error(`   Error: ${error.message}`);
    return { status: 500, data: { error: error.message }, ok: false };
  }
}

async function authenticateAdmin() {
  console.log('\n=== 🔐 Admin Authentication ===');
  
  // Note: This assumes you have Supabase auth set up
  // You may need to adjust this based on your actual auth system
  const response = await makeRequest('POST', '/auth/v1/token?grant_type=password', {
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
  });
  
  if (response.ok && response.data.access_token) {
    authToken = response.data.access_token;
    console.log('✅ Admin authentication successful');
    return true;
  } else {
    console.log('❌ Admin authentication failed');
    console.log('   Please ensure admin credentials are correct');
    console.log('   Or manually set authToken variable');
    return false;
  }
}

async function testListBusinessesWithScores() {
  console.log('\n=== 📊 Test: List Businesses with Quality Scores ===');
  
  // Test basic listing
  let response = await makeRequest('GET', '/api/admin/quality-scoring');
  if (!response.ok) {
    console.log('❌ Basic listing failed');
    return false;
  }
  
  // Test with filters
  response = await makeRequest('GET', '/api/admin/quality-scoring?minScore=50&maxScore=80&suburb=Richmond&category=Plumbing&sortBy=qualityScore&sortOrder=desc&page=1&limit=5');
  if (!response.ok) {
    console.log('❌ Filtered listing failed');
    return false;
  }
  
  // Extract a test business ID for later tests
  if (response.data.businesses && response.data.businesses.length > 0) {
    testBusinessId = response.data.businesses[0].id;
    console.log(`   Using business ID for tests: ${testBusinessId}`);
  }
  
  console.log('✅ Business listing tests passed');
  return true;
}

async function testBulkRecalculation() {
  console.log('\n=== ♻️ Test: Bulk Score Recalculation ===');
  
  if (!testBusinessId) {
    console.log('❌ No test business ID available');
    return false;
  }
  
  // Test recalculation for specific business
  const response = await makeRequest('POST', '/api/admin/quality-scoring', {
    businessIds: [testBusinessId],
  });
  
  if (!response.ok) {
    console.log('❌ Bulk recalculation failed');
    return false;
  }
  
  console.log('✅ Bulk recalculation test passed');
  return true;
}

async function testDetailedAnalysis() {
  console.log('\n=== 🔍 Test: Detailed Quality Analysis ===');
  
  if (!testBusinessId) {
    console.log('❌ No test business ID available');
    return false;
  }
  
  const response = await makeRequest('GET', `/api/admin/quality-scoring/${testBusinessId}`);
  
  if (!response.ok) {
    console.log('❌ Detailed analysis failed');
    return false;
  }
  
  // Verify analysis structure
  const analysis = response.data.analysis;
  if (!analysis || !analysis.factors || !analysis.improvementPlan || !analysis.competitorComparison) {
    console.log('❌ Analysis structure incomplete');
    return false;
  }
  
  console.log(`   Quality Level: ${analysis.level}`);
  console.log(`   Current Score: ${analysis.currentScore}`);
  console.log(`   Quick Wins: ${analysis.improvementPlan.quickWins.length}`);
  console.log('✅ Detailed analysis test passed');
  return true;
}

async function testConfiguration() {
  console.log('\n=== ⚙️ Test: Quality Scoring Configuration ===');
  
  // Test getting configuration
  let response = await makeRequest('GET', '/api/admin/quality-scoring/config');
  if (!response.ok) {
    console.log('❌ Get configuration failed');
    return false;
  }
  
  const originalConfig = response.data.config;
  console.log(`   Current max manual boost: ${originalConfig.features?.maxManualBoost || 'default'}`);
  
  // Test updating configuration
  response = await makeRequest('PUT', '/api/admin/quality-scoring/config', {
    features: {
      maxManualBoost: 25, // Increase from default 20
    },
  });
  
  if (!response.ok) {
    console.log('❌ Update configuration failed');
    return false;
  }
  
  // Verify the update
  response = await makeRequest('GET', '/api/admin/quality-scoring/config');
  if (!response.ok || response.data.config.features.maxManualBoost !== 25) {
    console.log('❌ Configuration update verification failed');
    return false;
  }
  
  console.log('✅ Configuration tests passed');
  return true;
}

async function testManualBoosts() {
  console.log('\n=== 🚀 Test: Manual Quality Score Boosts ===');
  
  if (!testBusinessId) {
    console.log('❌ No test business ID available');
    return false;
  }
  
  // Test applying a boost
  let response = await makeRequest('POST', '/api/admin/quality-scoring/boost', {
    businessIds: [testBusinessId],
    boostAmount: 15,
    reason: 'Test boost for premium partnership program',
    duration: '90days',
    category: 'partnership',
  });
  
  if (!response.ok) {
    console.log('❌ Apply boost failed');
    return false;
  }
  
  if (response.data.results && response.data.results.length > 0) {
    testBoostId = response.data.results[0].boostRecordId;
    console.log(`   Created boost ID: ${testBoostId}`);
  }
  
  // Test getting boost history
  response = await makeRequest('GET', '/api/admin/quality-scoring/boost?businessId=' + testBusinessId);
  if (!response.ok) {
    console.log('❌ Get boost history failed');
    return false;
  }
  
  console.log(`   Active boosts: ${response.data.statistics.activeBoosts}`);
  console.log(`   Total boost amount: ${response.data.statistics.totalBoostAmount}`);
  
  console.log('✅ Manual boost tests passed');
  return true;
}

async function testBoostRemoval() {
  console.log('\n=== 🗑️ Test: Boost Removal ===');
  
  if (!testBoostId) {
    console.log('❌ No test boost ID available');
    return false;
  }
  
  // Test expiring a boost
  const response = await makeRequest('DELETE', '/api/admin/quality-scoring/boost', {
    boostIds: [testBoostId],
    reason: 'Test cleanup - expiring test boost',
    action: 'expire',
  });
  
  if (!response.ok) {
    console.log('❌ Boost removal failed');
    return false;
  }
  
  console.log('✅ Boost removal test passed');
  return true;
}

async function runIntegrationTests() {
  console.log('🧪 Quality Scoring Admin API Integration Tests');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Step 1: Authenticate (optional - may need manual token)
  // const authSuccess = await authenticateAdmin();
  // if (!authSuccess) {
  //   console.log('\n⚠️ Skipping auth - please set authToken manually if needed');
  // }
  
  // Step 2: Test all endpoints
  results.push(['List Businesses', await testListBusinessesWithScores()]);
  results.push(['Bulk Recalculation', await testBulkRecalculation()]);
  results.push(['Detailed Analysis', await testDetailedAnalysis()]);
  results.push(['Configuration', await testConfiguration()]);
  results.push(['Manual Boosts', await testManualBoosts()]);
  results.push(['Boost Removal', await testBoostRemoval()]);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  
  const passed = results.filter(([_, success]) => success).length;
  const total = results.length;
  
  results.forEach(([name, success]) => {
    console.log(`   ${success ? '✅' : '❌'} ${name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All quality scoring endpoints are working correctly!');
  } else {
    console.log('⚠️ Some tests failed - check the logs above for details');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Create admin UI components to interact with these APIs');
  console.log('   2. Add these endpoints to your admin dashboard');
  console.log('   3. Set up automated quality score recalculation jobs');
  console.log('   4. Configure alerts for low-quality business profiles');
}

// Handle command line execution
if (require.main === module) {
  // Check if fetch is available (Node 18+)
  if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ for fetch API');
    console.log('   Run: node --version');
    console.log('   Or install node-fetch: npm install node-fetch');
    process.exit(1);
  }
  
  runIntegrationTests().catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runIntegrationTests,
  makeRequest,
};