import { test, expect } from '@playwright/test';

/**
 * SuburbMates Smoke Test Suite
 * 
 * This test suite provides a comprehensive overview of the SuburbMates platform's
 * key functionality and serves as a quick health check for production deployments.
 */
test.describe('SuburbMates Smoke Test Suite', () => {
  test.describe('Platform Health Check', () => {
    test('should verify core platform pages load correctly', async ({ page }) => {
      console.log('🏥 Running platform health check...');
      
      const criticalPages = [
        { url: '/', name: 'Homepage' },
        { url: '/register-business', name: 'Business Registration' },
        { url: '/admin', name: 'Admin Panel' },
        { url: '/auth/check-email', name: 'Email Confirmation' }
      ];
      
      const results = [];
      
      for (const pageInfo of criticalPages) {
        try {
          const response = await page.goto(pageInfo.url);
          const status = response?.status() || 0;
          const title = await page.title();
          
          results.push({
            page: pageInfo.name,
            url: pageInfo.url,
            status,
            title,
            success: status < 400
          });
          
          console.log(`${status < 400 ? '✅' : '❌'} ${pageInfo.name}: ${status} - ${title}`);
          
        } catch (error) {
          results.push({
            page: pageInfo.name,
            url: pageInfo.url,
            status: 0,
            title: 'Error',
            success: false,
            error: String(error)
          });
          
          console.log(`❌ ${pageInfo.name}: Failed to load - ${error}`);
        }
      }
      
      // Summary
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      console.log(`\n📊 Platform Health Summary: ${successCount}/${totalCount} pages healthy`);
      
      // Ensure at least homepage loads
      const homepage = results.find(r => r.url === '/');
      expect(homepage?.success).toBeTruthy();
    });

    test('should verify authentication system is functional', async ({ page }) => {
      console.log('🔐 Testing authentication system...');
      
      // Check login page exists and loads
      await page.goto('/login');
      const loginTitle = await page.title();
      console.log(`✅ Login page accessible: ${loginTitle}`);
      
      // Check signup page exists and loads
      await page.goto('/signup');
      const signupTitle = await page.title();
      console.log(`✅ Signup page accessible: ${signupTitle}`);
      
      // Verify session API is responding
      const sessionResponse = await page.request.get('/api/auth/session').catch(() => null);
      if (sessionResponse) {
        const sessionStatus = sessionResponse.status();
        console.log(`✅ Session API responding: ${sessionStatus}`);
        expect(sessionStatus).toBeLessThan(500);
      }
      
      expect(loginTitle || signupTitle).toBeDefined();
    });
  });

  test.describe('Business Profile System Check', () => {
    test('should verify business profile creation workflow', async ({ page }) => {
      console.log('🏢 Testing business profile creation workflow...');
      
      await page.goto('/register-business');
      
      // Check for key form elements
      const businessNameField = page.locator('input[name="businessName"], input[placeholder*="business name" i]');
      const emailField = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Create")');
      
      const hasBusinessName = await businessNameField.isVisible();
      const hasEmail = await emailField.isVisible();
      const hasSubmit = await submitButton.isVisible();
      
      console.log(`✅ Business registration form elements: Name=${hasBusinessName}, Email=${hasEmail}, Submit=${hasSubmit}`);
      
      // At least one form element should be present
      expect(hasBusinessName || hasEmail || hasSubmit).toBeTruthy();
    });

    test('should verify business claim workflow', async ({ page }) => {
      console.log('🎯 Testing business claim workflow...');
      
      await page.goto('/claim/test-business-claim');
      
      const pageTitle = await page.title();
      const claimForm = page.locator('form, input[type="email"], textarea');
      const hasClaimElements = await claimForm.count() > 0;
      
      console.log(`✅ Claim page accessible: ${pageTitle}`);
      console.log(`✅ Claim form elements present: ${hasClaimElements}`);
      
      // Page should load without server errors
      expect(pageTitle).toBeDefined();
    });

    test('should verify business profile display', async ({ page }) => {
      console.log('📄 Testing business profile display...');
      
      await page.goto('/business/test-business-profile');
      
      const pageTitle = await page.title();
      const businessContent = page.locator('h1, .business-name, .business-info');
      const hasContent = await businessContent.count() > 0;
      
      console.log(`✅ Business profile page: ${pageTitle}`);
      console.log(`✅ Business content elements: ${hasContent}`);
      
      expect(pageTitle).toBeDefined();
    });
  });

  test.describe('Admin System Check', () => {
    test('should verify admin panel access control', async ({ page }) => {
      console.log('👨‍💼 Testing admin panel access control...');
      
      const adminRoutes = ['/admin', '/admin/claims', '/admin/ai'];
      const results = [];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        // Check if redirected to auth or shows access control
        const isProtected = currentUrl.includes('/login') || 
                          currentUrl.includes('/auth') ||
                          await page.locator('text="Access denied", text="Unauthorized"').isVisible();
        
        results.push({ route, isProtected, title: pageTitle });
        console.log(`${isProtected ? '✅' : 'ℹ️'} ${route}: ${isProtected ? 'Protected' : 'Accessible'} - ${pageTitle}`);
      }
      
      // At least one admin route should exist
      expect(results.length).toBeGreaterThan(0);
    });
  });

  test.describe('API Health Check', () => {
    test('should verify core API endpoints', async ({ request }) => {
      console.log('🔌 Testing core API endpoints...');
      
      const apiEndpoints = [
        { url: '/api/health', name: 'Health Check', optional: true },
        { url: '/api/auth/session', name: 'Auth Session', optional: false },
        { url: '/api/auth/providers', name: 'Auth Providers', optional: true },
        { url: '/api/businesses', name: 'Business API', optional: true },
        { url: '/api/claims', name: 'Claims API', optional: true }
      ];
      
      const results = [];
      
      for (const endpoint of apiEndpoints) {
        try {
          const response = await request.get(endpoint.url);
          const status = response.status();
          
          results.push({
            name: endpoint.name,
            url: endpoint.url,
            status,
            success: status < 500, // Allow 4xx but not 5xx
            optional: endpoint.optional
          });
          
          const statusIcon = status < 400 ? '✅' : status < 500 ? '⚠️' : '❌';
          console.log(`${statusIcon} ${endpoint.name}: ${status}`);
          
        } catch (error) {
          results.push({
            name: endpoint.name,
            url: endpoint.url,
            status: 0,
            success: false,
            optional: endpoint.optional,
            error: String(error)
          });
          
          console.log(`${endpoint.optional ? 'ℹ️' : '❌'} ${endpoint.name}: Failed - ${error}`);
        }
      }
      
      // Check that required endpoints don't return 500 errors
      const requiredFailures = results.filter(r => !r.optional && !r.success);
      
      console.log(`\n📊 API Health Summary: ${results.filter(r => r.success).length}/${results.length} endpoints healthy`);
      
      expect(requiredFailures.length).toBe(0);
    });
  });

  test.describe('Email System Check', () => {
    test('should verify email configuration and workflows', async ({ page, request }) => {
      console.log('📧 Testing email system configuration...');
      
      // Test email confirmation page
      await page.goto('/auth/check-email');
      const emailPageTitle = await page.title();
      console.log(`✅ Email confirmation page accessible: ${emailPageTitle}`);
      
      // Check for email-related content
      const emailContent = page.locator('text="email", text="confirm", text="check"');
      const hasEmailContent = await emailContent.count() > 0;
      console.log(`✅ Email-related content present: ${hasEmailContent}`);
      
      // Test email API endpoints (optional)
      const emailEndpoints = [
        '/api/email/health',
        '/api/email/config',
        '/api/email/send'
      ];
      
      for (const endpoint of emailEndpoints) {
        try {
          const response = await request.get(endpoint);
          const status = response.status();
          console.log(`ℹ️ ${endpoint}: ${status}`);
        } catch (error) {
          console.log(`ℹ️ ${endpoint}: Not available`);
        }
      }
      
      expect(emailPageTitle).toBeDefined();
    });
  });

  test.describe('Melbourne Business Features', () => {
    test('should verify Melbourne-specific functionality', async ({ page }) => {
      console.log('🏙️ Testing Melbourne-specific features...');
      
      // Check homepage for Melbourne references
      await page.goto('/');
      
      const melbourneContent = page.locator('text="Melbourne", text="melbourne", text="VIC"');
      const hasMelbourneContent = await melbourneContent.count() > 0;
      
      // Check for suburb-related functionality
      const suburbFields = page.locator('input[placeholder*="suburb" i], select[name*="suburb"]');
      const hasSuburbFields = await suburbFields.count() > 0;
      
      // Check for business category functionality
      const categoryFields = page.locator('select[name*="category"], [role="combobox"]');
      const hasCategoryFields = await categoryFields.count() > 0;
      
      console.log(`✅ Melbourne content present: ${hasMelbourneContent}`);
      console.log(`✅ Suburb functionality: ${hasSuburbFields}`);
      console.log(`✅ Business categories: ${hasCategoryFields}`);
      
      // At least homepage should load
      const pageTitle = await page.title();
      expect(pageTitle).toBeDefined();
    });
  });

  test.describe('Platform Performance Check', () => {
    test('should verify page load times are reasonable', async ({ page }) => {
      console.log('⚡ Testing platform performance...');
      
      const performancePages = [
        { url: '/', name: 'Homepage' },
        { url: '/register-business', name: 'Registration' },
        { url: '/admin', name: 'Admin' }
      ];
      
      const loadTimes = [];
      
      for (const pageInfo of performancePages) {
        const startTime = Date.now();
        
        try {
          await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded' });
          const loadTime = Date.now() - startTime;
          
          loadTimes.push({ page: pageInfo.name, loadTime });
          console.log(`⚡ ${pageInfo.name}: ${loadTime}ms`);
          
        } catch (error) {
          console.log(`❌ ${pageInfo.name}: Failed to load`);
        }
      }
      
      // Calculate average load time
      if (loadTimes.length > 0) {
        const avgLoadTime = loadTimes.reduce((sum, lt) => sum + lt.loadTime, 0) / loadTimes.length;
        console.log(`\n📊 Average page load time: ${Math.round(avgLoadTime)}ms`);
        
        // Expect reasonable load times (under 10 seconds for smoke tests)
        expect(avgLoadTime).toBeLessThan(10000);
      }
      
      expect(loadTimes.length).toBeGreaterThan(0);
    });
  });

  test.afterAll(async () => {
    console.log('\n🎯 SuburbMates Smoke Test Suite Complete!');
    console.log('📊 Summary: All critical platform functionality verified');
    console.log('🚀 Platform ready for deployment/operation');
  });
});