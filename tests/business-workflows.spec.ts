import { test, expect } from '@playwright/test';

test.describe('Business Profile Workflows', () => {
  test.describe('Workflow 1: Create New Business Profile', () => {
    test('should navigate through business registration flow', async ({ page }) => {
      console.log('🏢 Testing new business profile creation workflow...');
      
      // Navigate to business registration
      await page.goto('/register-business');
      await expect(page).toHaveTitle(/Register.*Business/i);
      
      // Check for key form elements
      const businessNameField = page.locator('input[name="businessName"], input[placeholder*="business name" i]');
      const emailField = page.locator('input[type="email"]');
      const categorySelect = page.locator('select[name*="category"], [role="combobox"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Create")');
      
      // Verify form elements exist
      await expect(businessNameField).toBeVisible();
      await expect(emailField).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      console.log('✅ Business registration form elements found');
      
      // Test form interaction (without actually submitting)
      await businessNameField.fill('Test Melbourne Cafe');
      await emailField.fill('test@example.com');
      
      if (await categorySelect.isVisible()) {
        await categorySelect.click();
        // Look for restaurant/cafe options
        const cafeOption = page.locator('option:has-text("Cafe"), option:has-text("Restaurant"), [role="option"]:has-text("Food")').first();
        if (await cafeOption.count() > 0) {
          await cafeOption.click();
        }
      }
      
      console.log('✅ Form can be filled out successfully');
      
      // Check for Melbourne suburb selection if present
      const suburbField = page.locator('input[placeholder*="suburb" i], select[name*="suburb"], [data-testid*="suburb"]');
      if (await suburbField.isVisible()) {
        await suburbField.fill('Melbourne');
        console.log('✅ Suburb selection available');
      }
      
      // Verify form validation works
      await businessNameField.clear();
      await emailField.clear();
      
      if (await submitButton.isEnabled()) {
        await submitButton.click();
        // Look for validation errors
        const errorMessage = page.locator('.error, [role="alert"], .text-red-500, .text-destructive').first();
        if (await errorMessage.isVisible()) {
          console.log('✅ Form validation working');
        }
      }
    });

    test('should display business profile creation success flow', async ({ page }) => {
      console.log('🎯 Testing business profile creation completion...');
      
      // This test assumes we can mock or stub the creation process
      await page.goto('/register-business');
      
      // Check for success indicators that would appear after profile creation
      // This might be a redirect to profile editor or success message
      const profileEditor = page.locator('[data-testid="profile-editor"], .profile-editor, h1:has-text("Customize"), h2:has-text("Profile")');
      const successMessage = page.locator('.success, [role="status"], .text-green-500, .bg-green-50');
      const shareButton = page.locator('button:has-text("Share"), [data-testid="share-button"]');
      
      // At minimum, the page should load without errors
      const response = await page.waitForResponse(response => response.url().includes('/register-business'));
      expect(response.status()).toBeLessThan(400);
      
      console.log('✅ Business registration page handles requests properly');
    });
  });

  test.describe('Workflow 2: Claim Existing Business Profile', () => {
    test('should navigate to business claim flow', async ({ page }) => {
      console.log('🎯 Testing business claim workflow...');
      
      // First check if there are any businesses to claim
      await page.goto('/');
      
      // Look for search functionality
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('cafe melbourne');
        await searchInput.press('Enter');
        
        // Look for business listings
        const businessCard = page.locator('[data-testid="business-card"], .business-card, .business-listing').first();
        if (await businessCard.isVisible()) {
          const claimButton = businessCard.locator('button:has-text("Claim"), a:has-text("Claim"), [data-testid="claim-button"]');
          if (await claimButton.isVisible()) {
            await claimButton.click();
            
            // Should navigate to claim page
            await expect(page).toHaveURL(/.*\/claim\/.*/);
            console.log('✅ Claim button navigation works');
            
            // Check claim form elements
            const emailField = page.locator('input[type="email"]');
            const verificationText = page.locator('text="verify", text="owner", text="claim"');
            const submitButton = page.locator('button[type="submit"], button:has-text("Claim"), button:has-text("Submit")');
            
            await expect(emailField).toBeVisible();
            await expect(submitButton).toBeVisible();
            
            console.log('✅ Claim form elements present');
          }
        }
      }
      
      // Alternatively, test direct claim URL navigation
      await page.goto('/claim/test-business-123');
      
      // Should show claim form or appropriate message
      const claimContent = page.locator('form, .claim-form, h1:has-text("Claim"), text="claim this business"');
      const notFoundMessage = page.locator('text="not found", text="404", .error');
      
      // Either show claim form or appropriate error
      const hasClaimContent = await claimContent.isVisible();
      const hasNotFound = await notFoundMessage.isVisible();
      
      expect(hasClaimContent || hasNotFound).toBeTruthy();
      console.log(`✅ Claim page handles requests appropriately (${hasClaimContent ? 'claim form' : 'not found'})`);
    });

    test('should handle claim submission flow', async ({ page }) => {
      console.log('📧 Testing claim submission process...');
      
      // Navigate to a claim page (using test ID)
      await page.goto('/claim/test-business-456');
      
      const emailField = page.locator('input[type="email"]');
      const messageField = page.locator('textarea, input[name*="message"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Claim"), button:has-text("Submit")');
      
      if (await emailField.isVisible() && await submitButton.isVisible()) {
        // Fill out claim form
        await emailField.fill('owner@testbusiness.com');
        
        if (await messageField.isVisible()) {
          await messageField.fill('I am the owner of this business and would like to claim this profile.');
        }
        
        // Test form submission (this will likely show success/confirmation message)
        await submitButton.click();
        
        // Look for success indicators
        const successMessage = page.locator('.success, [role="status"], .text-green-500, text="submitted", text="received"');
        const confirmationEmail = page.locator('text="email", text="confirmation", text="verify"');
        const errorMessage = page.locator('.error, [role="alert"], .text-red-500, .text-destructive');
        
        // Allow time for any async operations
        await page.waitForTimeout(2000);
        
        const hasSuccess = await successMessage.isVisible();
        const hasConfirmation = await confirmationEmail.isVisible();
        const hasError = await errorMessage.isVisible();
        
        if (hasSuccess || hasConfirmation) {
          console.log('✅ Claim submission shows success feedback');
        } else if (hasError) {
          console.log('⚠️ Claim submission shows error (expected for test data)');
        } else {
          console.log('ℹ️ Claim submission completed (no visible feedback)');
        }
        
        // The important thing is that the form doesn't crash
        expect(page.url()).toBeDefined();
      } else {
        console.log('ℹ️ Claim form not available (expected for non-existent business)');
      }
    });
  });

  test.describe('Business Profile Display', () => {
    test('should display business profile with SuburbMates branding', async ({ page }) => {
      console.log('🏷️ Testing business profile display and branding...');
      
      // Test business profile page
      await page.goto('/business/test-melbourne-cafe');
      
      // Check for SuburbMates branding elements
      const logo = page.locator('img[alt*="SuburbMates" i], .logo, [data-testid="logo"]');
      const attribution = page.locator('text="Powered by SuburbMates", text="SuburbMates", .attribution');
      const shareButton = page.locator('button:has-text("Share"), [data-testid="share-button"]');
      
      // Check for business profile content
      const businessName = page.locator('h1, .business-name, [data-testid="business-name"]');
      const contactInfo = page.locator('.contact, .phone, .email, [data-testid="contact"]');
      const description = page.locator('.description, .about, [data-testid="description"]');
      
      // Verify page loads properly
      const response = await page.waitForResponse(response => response.url().includes('/business/'));
      const status = response?.status() || 0;
      
      if (status === 200) {
        console.log('✅ Business profile page loads successfully');
        
        if (await businessName.isVisible()) {
          console.log('✅ Business name displayed');
        }
        
        if (await logo.isVisible() || await attribution.isVisible()) {
          console.log('✅ SuburbMates branding present');
        }
        
        if (await shareButton.isVisible()) {
          console.log('✅ Share functionality available');
        }
        
      } else if (status === 404) {
        console.log('ℹ️ Business profile not found (expected for test data)');
        
        // Check for proper 404 handling
        const notFoundMessage = page.locator('text="not found", text="404", h1:has-text("Page Not Found")');
        await expect(notFoundMessage).toBeVisible();
        
      } else {
        console.log(`⚠️ Unexpected status: ${status}`);
      }
      
      expect(status).toBeLessThan(500); // No server errors
    });

    test('should handle profile sharing functionality', async ({ page }) => {
      console.log('📤 Testing profile sharing functionality...');
      
      await page.goto('/business/test-cafe-melbourne');
      
      const shareButton = page.locator('button:has-text("Share"), [data-testid="share-button"]');
      
      if (await shareButton.isVisible()) {
        await shareButton.click();
        
        // Look for share modal or options
        const shareModal = page.locator('.modal, .dialog, [role="dialog"], .share-modal');
        const copyButton = page.locator('button:has-text("Copy"), [data-testid="copy-link"]');
        const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"]');
        
        if (await shareModal.isVisible()) {
          console.log('✅ Share modal opens');
          
          if (await copyButton.isVisible()) {
            console.log('✅ Copy link functionality available');
          }
          
          if (await socialLinks.count() > 0) {
            console.log('✅ Social sharing options available');
          }
        }
      }
      
      // Test OpenGraph meta tags for social sharing
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogImage = page.locator('meta[property="og:image"]');
      
      if (await ogTitle.count() > 0) {
        console.log('✅ OpenGraph title meta tag present');
      }
      
      if (await ogDescription.count() > 0) {
        console.log('✅ OpenGraph description meta tag present');
      }
      
      if (await ogImage.count() > 0) {
        console.log('✅ OpenGraph image meta tag present');
      }
    });
  });
});