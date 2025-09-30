// Comprehensive Playwright-style Diagnostics for SuburbMates Authentication
// This script provides systematic testing of signup and login functionality

console.log('🔍 Starting SuburbMates Authentication Diagnostics...');

// Test Configuration
const TEST_CONFIG = {
  testEmail: `test-${Date.now()}@suburbmates.com.au`,
  testPassword: 'TestPass123!',
  testBusiness: {
    name: 'Test Plumbing Services',
    suburb: 'Melbourne',
    serviceAreas: ['Melbourne', 'Richmond', 'Fitzroy'],
    category: 'plumbing',
    phone: '0412345678'
  }
};

// Utility Functions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

// Test Results Storage
const testResults = {
  pageLoad: null,
  formElements: null,
  validation: null,
  submission: null,
  navigation: null,
  login: null,
  overall: null
};

// Test 1: Page Load and Initial State
async function testPageLoad() {
  console.log('\n📄 Test 1: Page Load and Initial State');
  
  try {
    const results = {
      url: window.location.href,
      title: document.title,
      formPresent: !!document.querySelector('form'),
      submitButton: !!document.querySelector('button[type="submit"]'),
      emailInput: !!document.querySelector('input[type="email"]'),
      passwordInput: !!document.querySelector('input[type="password"]'),
      businessNameInput: !!document.querySelector('input[placeholder*="business" i], input[name*="business" i]'),
      categorySelect: !!document.querySelector('[data-testid*="category"], [placeholder*="category" i]'),
      suburbSelect: !!document.querySelector('[data-testid*="suburb"], [placeholder*="suburb" i]')
    };
    
    console.log('✅ Page Load Results:', results);
    testResults.pageLoad = { success: true, data: results };
    return results;
  } catch (error) {
    console.error('❌ Page Load Failed:', error);
    testResults.pageLoad = { success: false, error: error.message };
    throw error;
  }
}

// Test 2: Form Elements Interaction
async function testFormElements() {
  console.log('\n🎯 Test 2: Form Elements Interaction');
  
  try {
    const form = document.querySelector('form');
    if (!form) throw new Error('No form found');
    
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const businessNameInput = document.querySelector('input[placeholder*="business" i], input[name*="business" i]');
    
    // Test input interactions
    if (emailInput) {
      emailInput.focus();
      emailInput.value = TEST_CONFIG.testEmail;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (passwordInput) {
      passwordInput.focus();
      passwordInput.value = TEST_CONFIG.testPassword;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (businessNameInput) {
      businessNameInput.focus();
      businessNameInput.value = TEST_CONFIG.testBusiness.name;
      businessNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      businessNameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    await wait(500); // Allow for any async validation
    
    const results = {
      emailFilled: emailInput?.value === TEST_CONFIG.testEmail,
      passwordFilled: passwordInput?.value === TEST_CONFIG.testPassword,
      businessNameFilled: businessNameInput?.value === TEST_CONFIG.testBusiness.name,
      validationErrors: document.querySelectorAll('[role="alert"], .text-destructive, .error').length,
      submitButtonEnabled: !document.querySelector('button[type="submit"]')?.disabled
    };
    
    console.log('✅ Form Elements Results:', results);
    testResults.formElements = { success: true, data: results };
    return results;
  } catch (error) {
    console.error('❌ Form Elements Test Failed:', error);
    testResults.formElements = { success: false, error: error.message };
    throw error;
  }
}

// Test 3: Form Validation
async function testFormValidation() {
  console.log('\n🔍 Test 3: Form Validation');
  
  try {
    const form = document.querySelector('form');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Test empty form submission
    console.log('Testing empty form validation...');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    
    // Clear inputs
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    // Try to submit
    if (submitButton) {
      submitButton.click();
      await wait(1000);
    }
    
    const emptyFormErrors = document.querySelectorAll('[role="alert"], .text-destructive, .error').length;
    
    // Test invalid email
    console.log('Testing invalid email validation...');
    if (emailInput) {
      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(500);
    }
    
    const invalidEmailErrors = document.querySelectorAll('[role="alert"], .text-destructive, .error').length;
    
    // Test weak password
    console.log('Testing weak password validation...');
    if (passwordInput) {
      passwordInput.value = 'weak';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(500);
    }
    
    const weakPasswordErrors = document.querySelectorAll('[role="alert"], .text-destructive, .error').length;
    
    const results = {
      emptyFormValidation: emptyFormErrors > 0,
      invalidEmailValidation: invalidEmailErrors > 0,
      weakPasswordValidation: weakPasswordErrors > 0,
      totalValidationChecks: 3,
      passedValidationChecks: [emptyFormErrors > 0, invalidEmailErrors > 0, weakPasswordErrors > 0].filter(Boolean).length
    };
    
    console.log('✅ Form Validation Results:', results);
    testResults.validation = { success: true, data: results };
    return results;
  } catch (error) {
    console.error('❌ Form Validation Test Failed:', error);
    testResults.validation = { success: false, error: error.message };
    throw error;
  }
}

// Test 4: Form Submission
async function testFormSubmission() {
  console.log('\n📤 Test 4: Form Submission');
  
  try {
    // Fill form with valid data
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const businessNameInput = document.querySelector('input[placeholder*="business" i], input[name*="business" i]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (emailInput) emailInput.value = TEST_CONFIG.testEmail;
    if (passwordInput) passwordInput.value = TEST_CONFIG.testPassword;
    if (businessNameInput) businessNameInput.value = TEST_CONFIG.testBusiness.name;
    
    // Monitor network requests
    const originalFetch = window.fetch;
    let apiCalls = [];
    
    window.fetch = function(...args) {
      apiCalls.push({
        url: args[0],
        options: args[1],
        timestamp: Date.now()
      });
      return originalFetch.apply(this, args);
    };
    
    // Monitor console for errors
    const originalConsoleError = console.error;
    let consoleErrors = [];
    
    console.error = function(...args) {
      consoleErrors.push(args.join(' '));
      return originalConsoleError.apply(this, args);
    };
    
    // Submit form
    console.log('Submitting form with test data...');
    if (submitButton) {
      submitButton.click();
      await wait(3000); // Wait for submission
    }
    
    // Restore original functions
    window.fetch = originalFetch;
    console.error = originalConsoleError;
    
    const results = {
      apiCallsMade: apiCalls.length,
      apiCalls: apiCalls,
      consoleErrors: consoleErrors,
      currentUrl: window.location.href,
      toastMessages: document.querySelectorAll('[data-sonner-toast], .toast, [role="status"]').length,
      loadingState: !!document.querySelector('.animate-spin, [data-loading="true"]')
    };
    
    console.log('✅ Form Submission Results:', results);
    testResults.submission = { success: true, data: results };
    return results;
  } catch (error) {
    console.error('❌ Form Submission Test Failed:', error);
    testResults.submission = { success: false, error: error.message };
    throw error;
  }
}

// Test 5: Navigation and Login Flow
async function testLoginFlow() {
  console.log('\n🔐 Test 5: Login Flow');
  
  try {
    // Navigate to login page
    console.log('Navigating to login page...');
    window.location.href = '/login';
    await wait(2000);
    
    // Wait for login form
    await waitForElement('input[type="email"]');
    
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = document.querySelector('button[type="submit"]');
    
    if (emailInput) emailInput.value = TEST_CONFIG.testEmail;
    if (passwordInput) passwordInput.value = TEST_CONFIG.testPassword;
    
    // Monitor for login attempt
    let loginAttempted = false;
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      if (args[0]?.includes('auth') || args[1]?.method === 'POST') {
        loginAttempted = true;
      }
      return originalFetch.apply(this, args);
    };
    
    if (loginButton) {
      loginButton.click();
      await wait(3000);
    }
    
    window.fetch = originalFetch;
    
    const results = {
      loginPageLoaded: window.location.pathname === '/login',
      loginFormPresent: !!emailInput && !!passwordInput,
      loginAttempted: loginAttempted,
      currentUrl: window.location.href,
      errorMessages: document.querySelectorAll('[role="alert"], .text-destructive').length
    };
    
    console.log('✅ Login Flow Results:', results);
    testResults.login = { success: true, data: results };
    return results;
  } catch (error) {
    console.error('❌ Login Flow Test Failed:', error);
    testResults.login = { success: false, error: error.message };
    throw error;
  }
}

// Main Test Runner
async function runDiagnostics() {
  console.log('🚀 Starting Comprehensive Authentication Diagnostics');
  console.log('Test Configuration:', TEST_CONFIG);
  
  try {
    // Ensure we're on the signup page
    if (!window.location.pathname.includes('signup')) {
      console.log('Navigating to signup page...');
      window.location.href = '/signup';
      await wait(2000);
    }
    
    // Run all tests
    await testPageLoad();
    await testFormElements();
    await testFormValidation();
    await testFormSubmission();
    await testLoginFlow();
    
    // Calculate overall results
    const successfulTests = Object.values(testResults).filter(result => result?.success).length;
    const totalTests = Object.keys(testResults).length;
    
    testResults.overall = {
      success: successfulTests === totalTests,
      score: `${successfulTests}/${totalTests}`,
      percentage: Math.round((successfulTests / totalTests) * 100)
    };
    
    console.log('\n📊 DIAGNOSTIC SUMMARY');
    console.log('=====================');
    console.log(`Overall Score: ${testResults.overall.score} (${testResults.overall.percentage}%)`);
    console.log('\nDetailed Results:');
    
    Object.entries(testResults).forEach(([testName, result]) => {
      if (testName !== 'overall') {
        const status = result?.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${testName}:`, result?.success ? 'OK' : result?.error);
      }
    });
    
    console.log('\n🔍 Issues Found:');
    const issues = Object.entries(testResults)
      .filter(([name, result]) => name !== 'overall' && !result?.success)
      .map(([name, result]) => `${name}: ${result?.error}`);
    
    if (issues.length === 0) {
      console.log('🎉 No issues found! Authentication system appears to be working correctly.');
    } else {
      issues.forEach(issue => console.log(`⚠️ ${issue}`));
    }
    
    console.log('\n💡 Recommendations:');
    if (testResults.pageLoad?.success === false) {
      console.log('- Check if all required form elements are present');
    }
    if (testResults.formElements?.success === false) {
      console.log('- Verify form input interactions and event handlers');
    }
    if (testResults.validation?.success === false) {
      console.log('- Review form validation logic and error display');
    }
    if (testResults.submission?.success === false) {
      console.log('- Check API endpoints and network connectivity');
      console.log('- Review server logs for backend errors');
    }
    if (testResults.login?.success === false) {
      console.log('- Verify login page functionality and authentication flow');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Diagnostic Suite Failed:', error);
    return { error: error.message, results: testResults };
  }
}

// Auto-run diagnostics
if (typeof window !== 'undefined') {
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostics);
  } else {
    setTimeout(runDiagnostics, 1000);
  }
}

// Export for manual execution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runDiagnostics, testResults, TEST_CONFIG };
}

console.log('\n💡 Manual Execution:');
console.log('To run diagnostics manually: runDiagnostics()');
console.log('To view results: testResults');
console.log('To modify test config: TEST_CONFIG');