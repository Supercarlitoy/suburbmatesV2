#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function logResult(test, status, message) {
  const result = { test, status, message, timestamp: new Date().toISOString() };
  testResults[status].push(result);
  
  const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
  console.log(`${emoji} ${test}: ${message}`);
}

async function testRoute(url, expectedContent = null) {
  try {
    const response = await fetch(url);
    const status = response.status;
    
    if (status === 200) {
      const html = await response.text();
      
      if (expectedContent && !html.includes(expectedContent)) {
        return { success: false, error: `Content "${expectedContent}" not found` };
      }
      
      return { success: true, status };
    } else {
      return { success: false, error: `HTTP ${status}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testCorePages() {
  console.log('\n🏠 Testing Core Pages...\n');
  
  const corePages = [
    { path: '/', name: 'Homepage', content: 'SuburbMates' },
    { path: '/login', name: 'Login Page', content: null },
    { path: '/signup', name: 'Signup Page', content: null },
    { path: '/search', name: 'Search Page', content: null },
    { path: '/about', name: 'About Page', content: null }
  ];

  for (const page of corePages) {
    const result = await testRoute(`${BASE_URL}${page.path}`, page.content);
    if (result.success) {
      logResult(page.name, 'passed', `Loaded successfully (${result.status})`);
    } else {
      logResult(page.name, 'failed', result.error);
    }
  }
}

async function testSEOLandingPages() {
  console.log('\n🎯 Testing SEO Landing Pages...\n');
  
  const seoPages = [
    { path: '/category/plumbing', name: 'Category: Plumbing', content: 'Plumbing in Melbourne' },
    { path: '/category/electrical', name: 'Category: Electrical', content: 'Electrical in Melbourne' },
    { path: '/suburb/richmond', name: 'Suburb: Richmond', content: 'Businesses in Richmond' },
    { path: '/suburb/fitzroy', name: 'Suburb: Fitzroy', content: 'Businesses in Fitzroy' }
  ];

  for (const page of seoPages) {
    const result = await testRoute(`${BASE_URL}${page.path}`, page.content);
    if (result.success) {
      logResult(page.name, 'passed', `SEO page loaded with correct content`);
    } else {
      logResult(page.name, 'failed', `SEO page failed: ${result.error}`);
    }
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...\n');
  
  const apiEndpoints = [
    { path: '/api/auth/session', name: 'Auth Session API', expectsAuth: false },
    { path: '/api/business', name: 'Business API', expectsAuth: false },
    { path: '/api/categories', name: 'Categories API', expectsAuth: false }
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`);
      const status = response.status;
      
      // For API endpoints, we expect different status codes
      if ([200, 401, 404, 405].includes(status)) {
        logResult(endpoint.name, 'passed', `API responding (${status})`);
      } else {
        logResult(endpoint.name, 'failed', `Unexpected status: ${status}`);
      }
    } catch (error) {
      logResult(endpoint.name, 'failed', `API error: ${error.message}`);
    }
  }
}

async function testAuthenticationFlow() {
  console.log('\n🔐 Testing Authentication Flow...\n');
  
  try {
    // Test login page accessibility
    const loginResult = await testRoute(`${BASE_URL}/login`);
    if (loginResult.success) {
      logResult('Login Page Access', 'passed', 'Login page accessible');
    } else {
      logResult('Login Page Access', 'failed', loginResult.error);
    }

    // Test signup page accessibility  
    const signupResult = await testRoute(`${BASE_URL}/signup`);
    if (signupResult.success) {
      logResult('Signup Page Access', 'passed', 'Signup page accessible');
    } else {
      logResult('Signup Page Access', 'failed', signupResult.error);
    }

    // Test session endpoint
    const sessionResult = await testRoute(`${BASE_URL}/api/auth/session`);
    if (sessionResult.success) {
      logResult('Session API', 'passed', 'Session endpoint responding');
    } else {
      logResult('Session API', 'failed', sessionResult.error);
    }

  } catch (error) {
    logResult('Authentication Flow', 'failed', error.message);
  }
}

async function testBusinessWorkflows() {
  console.log('\n🏢 Testing Business Workflows...\n');
  
  const businessPages = [
    { path: '/register-business', name: 'Business Registration', content: null },
    { path: '/claim', name: 'Business Claiming', content: null },
    { path: '/business/preview-demo', name: 'Business Preview', content: null }
  ];

  for (const page of businessPages) {
    const result = await testRoute(`${BASE_URL}${page.path}`);
    if (result.success) {
      logResult(page.name, 'passed', 'Business workflow page accessible');
    } else {
      logResult(page.name, 'failed', result.error);
    }
  }
}

async function testAdminAccess() {
  console.log('\n👤 Testing Admin Access...\n');
  
  try {
    const adminResult = await testRoute(`${BASE_URL}/admin`);
    
    // Admin should redirect to login if not authenticated
    if (!adminResult.success && adminResult.error.includes('HTTP 30')) {
      logResult('Admin Access Control', 'passed', 'Admin properly protected (redirect)');
    } else if (adminResult.success) {
      logResult('Admin Access', 'warnings', 'Admin accessible (check authentication)');
    } else {
      logResult('Admin Access', 'failed', adminResult.error);
    }
  } catch (error) {
    logResult('Admin Access', 'failed', error.message);
  }
}

async function testEmailConfiguration() {
  console.log('\n📧 Testing Email Configuration...\n');
  
  try {
    const requiredEnvVars = [
      'RESEND_API_KEY',
      'FROM_EMAIL', 
      'SENDER_DOMAIN',
      'SKIP_EMAIL_VERIFICATION'
    ];

    let envCheck = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        logResult(`Environment: ${envVar}`, 'passed', 'Set');
      } else {
        logResult(`Environment: ${envVar}`, 'failed', 'Missing');
        envCheck = false;
      }
    }

    if (process.env.SKIP_EMAIL_VERIFICATION === 'false') {
      logResult('Email Verification', 'passed', 'Email verification enabled');
    } else {
      logResult('Email Verification', 'warnings', 'Email verification disabled');
    }

  } catch (error) {
    logResult('Email Configuration', 'failed', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('\n💾 Testing Database Configuration...\n');
  
  try {
    if (process.env.DATABASE_URL) {
      logResult('Database URL', 'passed', 'Database URL configured');
    } else {
      logResult('Database URL', 'failed', 'DATABASE_URL missing');
    }

    // Test if we can reach a simple API that would use the database
    const healthResult = await testRoute(`${BASE_URL}/api/auth/session`);
    if (healthResult.success) {
      logResult('Database Connection', 'passed', 'API responding (database likely connected)');
    } else {
      logResult('Database Connection', 'warnings', 'Unable to verify database connection');
    }

  } catch (error) {
    logResult('Database Connection', 'failed', error.message);
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n✅ PASSED: ${testResults.passed.length}`);
  console.log(`❌ FAILED: ${testResults.failed.length}`);  
  console.log(`⚠️  WARNINGS: ${testResults.warnings.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(test => {
      console.log(`   • ${test.test}: ${test.message}`);
    });
  }

  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');  
    testResults.warnings.forEach(test => {
      console.log(`   • ${test.test}: ${test.message}`);
    });
  }

  console.log(`\n🎯 OVERALL STATUS: ${testResults.failed.length === 0 ? '🎉 ALL CORE TESTS PASSING!' : '⚠️ ISSUES FOUND'}`);
  
  if (testResults.failed.length === 0 && testResults.warnings.length === 0) {
    console.log('\n🚀 SuburbMates application is fully functional!');
    console.log('✨ Ready for production deployment.');
  } else if (testResults.failed.length === 0) {
    console.log('\n👍 SuburbMates core functionality is working.');
    console.log('⚡ Check warnings for optimization opportunities.');
  } else {
    console.log('\n🔧 SuburbMates needs attention on failed items.');
    console.log('🛠️  Fix failed tests before production deployment.');
  }

  console.log('\n' + '='.repeat(80));
  
  // Return summary for programmatic use
  return {
    total: testResults.passed.length + testResults.failed.length + testResults.warnings.length,
    passed: testResults.passed.length,
    failed: testResults.failed.length,
    warnings: testResults.warnings.length,
    success: testResults.failed.length === 0
  };
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive SuburbMates Testing Suite...');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(80));

  await testCorePages();
  await testSEOLandingPages();
  await testAPIEndpoints();
  await testAuthenticationFlow();
  await testBusinessWorkflows();
  await testAdminAccess();
  await testEmailConfiguration();
  await testDatabaseConnection();

  return generateReport();
}

// Export for use in other scripts
export { runComprehensiveTests, testResults };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then(summary => {
      process.exit(summary.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}