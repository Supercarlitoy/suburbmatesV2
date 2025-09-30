// Signup Form Debug Script
// Copy and paste this into browser console on the signup page

console.log('🔍 Starting Signup Form Debug...');

// Test 1: Check if form elements exist
function checkFormElements() {
    console.log('\n📋 Checking Form Elements:');
    
    const form = document.querySelector('form');
    const submitButton = document.querySelector('button[type="submit"]');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const businessNameInput = document.querySelector('input[placeholder*="business" i]');
    
    console.log('Form:', form ? '✅ Found' : '❌ Missing');
    console.log('Submit Button:', submitButton ? '✅ Found' : '❌ Missing');
    console.log('Email Input:', emailInput ? '✅ Found' : '❌ Missing');
    console.log('Password Input:', passwordInput ? '✅ Found' : '❌ Missing');
    console.log('Business Name Input:', businessNameInput ? '✅ Found' : '❌ Missing');
    
    if (submitButton) {
        console.log('Button disabled:', submitButton.disabled);
        console.log('Button text:', submitButton.textContent);
    }
    
    return { form, submitButton, emailInput, passwordInput, businessNameInput };
}

// Test 2: Fill form with test data
function fillTestData() {
    console.log('\n📝 Filling Test Data:');
    
    const elements = checkFormElements();
    
    if (elements.emailInput) {
        elements.emailInput.value = 'test@gmail.com';
        elements.emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        elements.emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Email filled:', elements.emailInput.value);
    }
    
    if (elements.passwordInput) {
        elements.passwordInput.value = 'TestPass123!';
        elements.passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        elements.passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Password filled:', elements.passwordInput.value);
    }
    
    if (elements.businessNameInput) {
        elements.businessNameInput.value = 'Test Business';
        elements.businessNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        elements.businessNameInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Business name filled:', elements.businessNameInput.value);
    }
    
    // Try to select service areas and category
    setTimeout(() => {
        const serviceAreaButtons = document.querySelectorAll('[role="combobox"]');
        console.log('Service area selectors found:', serviceAreaButtons.length);
        
        // You'll need to manually select service areas and category
        console.log('⚠️ Please manually select:');
        console.log('1. Service Areas (at least one suburb)');
        console.log('2. Business Category');
        console.log('3. Then run testSubmission()');
    }, 1000);
}

// Test 3: Monitor form submission
function testSubmission() {
    console.log('\n🚀 Testing Form Submission:');
    
    const elements = checkFormElements();
    
    if (!elements.form) {
        console.error('❌ No form found!');
        return;
    }
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    let apiCalls = [];
    
    window.fetch = function(...args) {
        console.log('🌐 API Call detected:', args[0], args[1]);
        apiCalls.push({ url: args[0], options: args[1], timestamp: Date.now() });
        return originalFetch.apply(this, args).then(response => {
            console.log('📡 API Response:', response.status, response.statusText);
            return response;
        });
    };
    
    // Monitor form events
    elements.form.addEventListener('submit', (e) => {
        console.log('📤 Form submit event triggered!');
        console.log('Event:', e);
        console.log('Default prevented:', e.defaultPrevented);
    });
    
    // Monitor button clicks
    if (elements.submitButton) {
        elements.submitButton.addEventListener('click', (e) => {
            console.log('🖱️ Button click detected!');
            console.log('Button disabled:', elements.submitButton.disabled);
            console.log('Event:', e);
        });
    }
    
    // Try clicking the button
    if (elements.submitButton && !elements.submitButton.disabled) {
        console.log('🎯 Clicking submit button...');
        elements.submitButton.click();
        
        // Check for API calls after a delay
        setTimeout(() => {
            console.log('\n📊 Results after 3 seconds:');
            console.log('API calls made:', apiCalls.length);
            apiCalls.forEach((call, index) => {
                console.log(`Call ${index + 1}:`, call);
            });
            
            if (apiCalls.length === 0) {
                console.error('❌ No API calls detected! Form submission failed.');
                console.log('\n🔍 Debugging suggestions:');
                console.log('1. Check if all required fields are filled');
                console.log('2. Check browser console for JavaScript errors');
                console.log('3. Check if form validation is preventing submission');
                console.log('4. Verify button is not disabled');
            } else {
                console.log('✅ Form submission detected!');
            }
            
            // Restore original fetch
            window.fetch = originalFetch;
        }, 3000);
    } else {
        console.error('❌ Submit button is disabled or not found!');
        if (elements.submitButton) {
            console.log('Button disabled reason: Check form validation');
        }
    }
}

// Test 4: Check validation state
function checkValidation() {
    console.log('\n🔍 Checking Validation State:');
    
    const elements = checkFormElements();
    
    // Check for validation errors
    const errorElements = document.querySelectorAll('[role="alert"], .text-destructive, .error');
    console.log('Validation errors found:', errorElements.length);
    errorElements.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error.textContent);
    });
    
    // Check required fields
    const requiredFields = document.querySelectorAll('input[required]');
    console.log('Required fields:', requiredFields.length);
    requiredFields.forEach((field, index) => {
        console.log(`Required field ${index + 1}:`, field.name || field.id, 'Value:', field.value, 'Valid:', field.checkValidity());
    });
    
    // Check form validity
    if (elements.form) {
        console.log('Form valid:', elements.form.checkValidity());
    }
}

// Run all tests
function runAllTests() {
    checkFormElements();
    setTimeout(() => {
        fillTestData();
        setTimeout(() => {
            checkValidation();
            console.log('\n⚠️ After filling data and checking validation, manually select service areas and category, then run testSubmission()');
        }, 2000);
    }, 1000);
}

// Export functions to global scope
window.checkFormElements = checkFormElements;
window.fillTestData = fillTestData;
window.testSubmission = testSubmission;
window.checkValidation = checkValidation;
window.runAllTests = runAllTests;

console.log('\n🎯 Debug functions available:');
console.log('- checkFormElements() - Check if form elements exist');
console.log('- fillTestData() - Fill form with test data');
console.log('- checkValidation() - Check form validation state');
console.log('- testSubmission() - Test form submission');
console.log('- runAllTests() - Run all tests in sequence');
console.log('\n💡 Start with: runAllTests()');