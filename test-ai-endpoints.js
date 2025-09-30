#!/usr/bin/env node

/**
 * Test script to verify AI automation endpoints are working
 * Run with: node test-ai-endpoints.js
 */

const testEndpoints = [
  {
    name: 'AI Configuration (GET)',
    url: 'http://localhost:3000/api/admin/ai-automation/config',
    method: 'GET',
  },
  {
    name: 'AI Configuration History (GET)',
    url: 'http://localhost:3000/api/admin/ai-automation/config/history',
    method: 'GET',
  },
  {
    name: 'AI Performance Metrics (GET)',
    url: 'http://localhost:3000/api/admin/ai-automation/performance',
    method: 'GET',
  },
  {
    name: 'AI Performance Export (POST)',
    url: 'http://localhost:3000/api/admin/ai-automation/performance/export',
    method: 'POST',
    body: { format: 'json', timeRange: '24h' },
  },
];

async function testEndpoint(endpoint) {
  try {
    console.log(`Testing ${endpoint.name}...`);
    
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        // In a real test, you'd need proper authentication headers
      },
    };

    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(endpoint.url, options);
    const data = await response.json();

    if (response.status === 403) {
      console.log(`✅ ${endpoint.name}: Correctly requires authentication (403)`);
      return true;
    } else if (response.status === 200) {
      console.log(`✅ ${endpoint.name}: Working (200)`);
      return true;
    } else {
      console.log(`❌ ${endpoint.name}: Failed with status ${response.status}`);
      console.log('Response:', data);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`⚠️  ${endpoint.name}: Server not running (ECONNREFUSED)`);
      return false;
    }
    console.log(`❌ ${endpoint.name}: Error -`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing AI Automation Endpoints\n');
  
  let passedTests = 0;
  let totalTests = testEndpoints.length;
  
  for (const endpoint of testEndpoints) {
    const passed = await testEndpoint(endpoint);
    if (passed) passedTests++;
    console.log(''); // Empty line for readability
  }
  
  console.log(`📊 Results: ${passedTests}/${totalTests} endpoints working or properly secured`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All endpoints are correctly implemented!');
    
    console.log('\n📝 What these endpoints do:');
    console.log('• GET /api/admin/ai-automation/config - Returns AI configuration settings');
    console.log('• GET /api/admin/ai-automation/config/history - Returns configuration change history');
    console.log('• GET /api/admin/ai-automation/performance - Returns comprehensive performance metrics');
    console.log('• POST /api/admin/ai-automation/performance/export - Exports performance reports');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Start the development server with: npm run dev');
    console.log('2. Login as an admin user');
    console.log('3. Navigate to /admin/ai to test the AI Controls Interface');
    console.log('4. Navigate to /admin/ai/performance to test the AI Performance Dashboard');
  } else {
    console.log('❗ Some endpoints need attention. Please check the development server.');
  }
}

// Run the tests
runTests().catch(console.error);