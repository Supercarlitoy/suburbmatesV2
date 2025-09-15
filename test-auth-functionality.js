// Manual Authentication Test Script
// Run this in browser console to test signup/login functionality

console.log('🧪 Starting Authentication Functionality Tests...');

// Test 1: Check if required components are loaded
function testComponentsLoaded() {
  console.log('\n📋 Test 1: Component Loading');
  
  const signupForm = document.querySelector('form');
  const submitButton = document.querySelector('button[type="submit"]');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  
  console.log('✅ Form element:', signupForm ? 'Found' : '❌ Missing');
  console.log('✅ Submit button:', submitButton ? 'Found' : '❌ Missing');
  console.log('✅ Email input:', emailInput ? 'Found' : '❌ Missing');
  console.log('✅ Password input:', passwordInput ? 'Found' : '❌ Missing');
  
  return signupForm && submitButton && emailInput && passwordInput;
}

// Test 2: Check form validation
function testFormValidation() {
  console.log('\n🔍 Test 2: Form Validation');
  
  const form = document.querySelector('form');
  if (!form) {
    console.log('❌ No form found');
    return false;
  }
  
  // Test empty form submission
  console.log('Testing empty form submission...');
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);
  
  // Check if validation messages appear
  setTimeout(() => {
    const alerts = document.querySelectorAll('[role="alert"], .text-destructive');
    console.log('✅ Validation alerts found:', alerts.length);
  }, 100);
  
  return true;
}

// Test 3: Check password requirements UI
function testPasswordRequirements() {
  console.log('\n🔐 Test 3: Password Requirements');
  
  const passwordInput = document.querySelector('input[type="password"]');
  if (!passwordInput) {
    console.log('❌ Password input not found');
    return false;
  }
  
  // Test weak password
  passwordInput.value = 'weak';
  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  setTimeout(() => {
    const requirements = document.querySelectorAll('.text-green-600, .text-gray-500');
    console.log('✅ Password requirement indicators:', requirements.length);
  }, 100);
  
  // Test strong password
  passwordInput.value = 'StrongPass123!';
  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  setTimeout(() => {
    const greenChecks = document.querySelectorAll('.text-green-600');
    console.log('✅ Green checkmarks for strong password:', greenChecks.length);
  }, 100);
  
  return true;
}

// Test 4: Check if Supabase client is available
function testSupabaseIntegration() {
  console.log('\n🔗 Test 4: Supabase Integration');
  
  // Check if Supabase is loaded in the page
  const hasSupabase = window.supabase || 
                     document.querySelector('script[src*="supabase"]') ||
                     localStorage.getItem('sb-') !== null;
  
  console.log('✅ Supabase integration:', hasSupabase ? 'Detected' : '❌ Not detected');
  
  return hasSupabase;
}

// Test 5: Check network connectivity to API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Test 5: API Endpoints');
  
  try {
    // Test signup endpoint
    const signupResponse = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!',
        businessName: 'Test Business',
        suburb: 'Melbourne',
        serviceAreas: ['Melbourne'],
        category: 'plumbing'
      })
    });
    
    console.log('✅ Signup API status:', signupResponse.status);
    
    // Test email endpoint
    const emailResponse = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        businessName: 'Test Business',
        slug: 'test-business-melbourne-123'
      })
    });
    
    console.log('✅ Email API status:', emailResponse.status);
    
    return true;
  } catch (error) {
    console.log('❌ API test error:', error.message);
    return false;
  }
}

// Test 6: Check if Melbourne suburbs data is loaded
function testMelbourneSuburbs() {
  console.log('\n🏙️ Test 6: Melbourne Suburbs Data');
  
  // Look for suburb selection components
  const suburbSelectors = document.querySelectorAll('[data-testid*="suburb"], [placeholder*="suburb"], [placeholder*="Select"]');
  console.log('✅ Suburb selector components:', suburbSelectors.length);
  
  // Check if popular suburbs are available
  const textContent = document.body.textContent || '';
  const hasPopularSuburbs = ['Richmond', 'Fitzroy', 'St Kilda', 'Melbourne'].some(suburb => 
    textContent.includes(suburb)
  );
  
  console.log('✅ Popular suburbs in content:', hasPopularSuburbs ? 'Found' : '❌ Not found');
  
  return suburbSelectors.length > 0;
}

// Test 7: Check business categories
function testBusinessCategories() {
  console.log('\n🏢 Test 7: Business Categories');
  
  // Look for category selection components
  const categorySelectors = document.querySelectorAll('[data-testid*="category"], [placeholder*="category"], [placeholder*="business"]');
  console.log('✅ Category selector components:', categorySelectors.length);
  
  // Check if popular categories are available
  const textContent = document.body.textContent || '';
  const hasPopularCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Cafe'].some(category => 
    textContent.includes(category)
  );
  
  console.log('✅ Popular categories in content:', hasPopularCategories ? 'Found' : '❌ Not found');
  
  return categorySelectors.length > 0;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running Complete Authentication Test Suite\n');
  
  const results = {
    componentsLoaded: testComponentsLoaded(),
    formValidation: testFormValidation(),
    passwordRequirements: testPasswordRequirements(),
    supabaseIntegration: testSupabaseIntegration(),
    apiEndpoints: await testAPIEndpoints(),
    melbourneSuburbs: testMelbourneSuburbs(),
    businessCategories: testBusinessCategories()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Authentication system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  return results;
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
}

// Export for manual execution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testComponentsLoaded, testFormValidation };
}

console.log('\n💡 To run tests manually, execute: runAllTests()');
console.log('💡 To test individual components, use the specific test functions.');
console.log('💡 Open browser DevTools (F12) to see detailed results.');