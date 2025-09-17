import { test, expect } from '@playwright/test';

test.describe('Authentication System Diagnosis', () => {
  test('diagnose login page', async ({ page }) => {
    console.log('🔍 Testing login page...');
    
    try {
      const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
      const status = response?.status();
      const title = await page.title();
      
      console.log(`📊 Login page status: ${status}`);
      console.log(`📄 Login page title: ${title}`);
      
      if (status === 200) {
        console.log('✅ Login page loads successfully');
        
        // Check for form elements
        const emailInput = await page.locator('input[type="email"]').count();
        const passwordInput = await page.locator('input[type="password"]').count();
        const submitButton = await page.locator('button[type="submit"]').count();
        
        console.log(`📝 Email input found: ${emailInput > 0}`);
        console.log(`🔒 Password input found: ${passwordInput > 0}`);
        console.log(`🔘 Submit button found: ${submitButton > 0}`);
        
        // Check for NextAuth elements
        const nextAuthElements = await page.locator('[data-testid*="auth"], [class*="next-auth"]').count();
        console.log(`🔐 NextAuth elements found: ${nextAuthElements}`);
        
      } else {
        console.log(`❌ Login page failed with status: ${status}`);
        const errorText = await page.textContent('body');
        console.log(`💥 Error content: ${errorText?.substring(0, 200)}...`);
      }
      
      expect(status).toBe(200);
      
    } catch (error) {
      console.log(`💥 Login page error: ${error}`);
      throw error;
    }
  });
  
  test('diagnose signup page', async ({ page }) => {
    console.log('🔍 Testing signup page...');
    
    try {
      const response = await page.goto('/signup', { waitUntil: 'domcontentloaded' });
      const status = response?.status();
      const title = await page.title();
      
      console.log(`📊 Signup page status: ${status}`);
      console.log(`📄 Signup page title: ${title}`);
      
      if (status === 200) {
        console.log('✅ Signup page loads successfully');
        
        // Check for form elements
        const emailInput = await page.locator('input[type="email"]').count();
        const passwordInput = await page.locator('input[type="password"]').count();
        const businessNameInput = await page.locator('input[placeholder*="business"], input[name*="business"]').count();
        const submitButton = await page.locator('button[type="submit"]').count();
        
        console.log(`📝 Email input found: ${emailInput > 0}`);
        console.log(`🔒 Password input found: ${passwordInput > 0}`);
        console.log(`🏢 Business name input found: ${businessNameInput > 0}`);
        console.log(`🔘 Submit button found: ${submitButton > 0}`);
        
      } else {
        console.log(`❌ Signup page failed with status: ${status}`);
        const errorText = await page.textContent('body');
        console.log(`💥 Error content: ${errorText?.substring(0, 200)}...`);
      }
      
      expect(status).toBe(200);
      
    } catch (error) {
      console.log(`💥 Signup page error: ${error}`);
      throw error;
    }
  });
  
  test('test NextAuth API endpoints', async ({ page }) => {
    console.log('🔍 Testing NextAuth API endpoints...');
    
    // Test session endpoint
    try {
      const sessionResponse = await page.request.get('/api/auth/session');
      console.log(`📊 Session API status: ${sessionResponse.status()}`);
      
      if (sessionResponse.ok()) {
        const sessionData = await sessionResponse.json();
        console.log(`👤 Session data: ${JSON.stringify(sessionData)}`);
      }
    } catch (error) {
      console.log(`💥 Session API error: ${error}`);
    }
    
    // Test providers endpoint
    try {
      const providersResponse = await page.request.get('/api/auth/providers');
      console.log(`📊 Providers API status: ${providersResponse.status()}`);
      
      if (providersResponse.ok()) {
        const providersData = await providersResponse.json();
        console.log(`🔐 Providers: ${Object.keys(providersData).join(', ')}`);
      }
    } catch (error) {
      console.log(`💥 Providers API error: ${error}`);
    }
    
    // Test signin endpoint
    try {
      const signinResponse = await page.request.get('/api/auth/signin');
      console.log(`📊 Signin API status: ${signinResponse.status()}`);
    } catch (error) {
      console.log(`💥 Signin API error: ${error}`);
    }
  });
  
  test('test database connectivity', async ({ page }) => {
    console.log('🔍 Testing database connectivity...');
    
    try {
      // Test health endpoint if it exists
      const healthResponse = await page.request.get('/api/health');
      console.log(`📊 Health API status: ${healthResponse.status()}`);
      
      if (healthResponse.ok()) {
        const healthData = await healthResponse.json();
        console.log(`💚 Health check: ${JSON.stringify(healthData)}`);
      }
    } catch (error) {
      console.log(`💥 Health API error: ${error}`);
    }
  });
});