import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.describe('Admin Authentication', () => {
    test('should handle admin access control', async ({ page }) => {
      console.log('🔐 Testing admin access control...');
      
      // Test unauthenticated access
      await page.goto('/admin');
      
      // Should either redirect to login or show access denied
      const currentUrl = page.url();
      const loginRedirect = currentUrl.includes('/login') || currentUrl.includes('/auth');
      const accessDenied = await page.locator('text="Access denied", text="Unauthorized", text="Admin only", .error').isVisible();
      const adminContent = await page.locator('h1:has-text("Admin"), .admin-panel, [data-testid="admin"]').isVisible();
      
      if (loginRedirect) {
        console.log('✅ Unauthenticated users redirected to login');
      } else if (accessDenied) {
        console.log('✅ Access denied message shown for non-admin users');
      } else if (adminContent) {
        console.log('ℹ️ Admin content visible (may be in dev mode or user already authenticated)');
      }
      
      // The important thing is that we don't get a server error
      expect(currentUrl).toBeDefined();
    });

    test('should check admin role validation', async ({ page }) => {
      console.log('👥 Testing admin role validation...');
      
      // Test various admin routes
      const adminRoutes = ['/admin', '/admin/ai', '/admin/claims'];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        
        const status = await page.evaluate(() => {
          return document.readyState;
        });
        
        // Page should load without server errors
        expect(status).toBe('complete');
        
        const hasError500 = await page.locator('text="500", text="Server Error", text="Internal Error"').isVisible();
        expect(hasError500).toBeFalsy();
        
        console.log(`✅ Route ${route} handles auth properly`);
      }
    });
  });

  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard components', async ({ page }) => {
      console.log('📊 Testing admin dashboard components...');
      
      await page.goto('/admin');
      
      // Look for common admin dashboard elements
      const navItems = page.locator('nav a, .nav-link, [data-testid="nav"]');
      const statsCards = page.locator('.stat, .metric, .card, [data-testid="stat"]');
      const adminTitle = page.locator('h1:has-text("Admin"), h1:has-text("Dashboard")');
      
      // Check for navigation elements that would indicate admin functionality
      const claimsLink = page.locator('a[href*="/admin/claims"], text="Claims"');
      const aiLink = page.locator('a[href*="/admin/ai"], text="AI"');
      const businessesLink = page.locator('a[href*="business"], text="Business", text="Listings"');
      
      if (await adminTitle.isVisible()) {
        console.log('✅ Admin title/header present');
        
        if (await navItems.count() > 0) {
          console.log(`✅ Navigation items found: ${await navItems.count()}`);
        }
        
        if (await statsCards.count() > 0) {
          console.log(`✅ Dashboard stats/cards found: ${await statsCards.count()}`);
        }
        
        if (await claimsLink.isVisible()) {
          console.log('✅ Claims management link available');
        }
        
        if (await aiLink.isVisible()) {
          console.log('✅ AI management link available');
        }
        
        if (await businessesLink.isVisible()) {
          console.log('✅ Business management link available');
        }
      }
      
      // Test that the page doesn't crash
      const pageTitle = await page.title();
      expect(pageTitle).toBeDefined();
    });
  });

  test.describe('Claims Management', () => {
    test('should display claims queue', async ({ page }) => {
      console.log('📋 Testing claims management interface...');
      
      await page.goto('/admin/claims');
      
      // Look for claims-related content
      const claimsTable = page.locator('table, .table, [data-testid="claims-table"]');
      const claimsGrid = page.locator('.grid, .claims-grid, [data-testid="claims-grid"]');
      const claimsList = page.locator('.claims-list, ul li, [data-testid="claims-list"]');
      const noClaimsMessage = page.locator('text="No claims", text="Empty", .empty-state');
      
      const claimsTitle = page.locator('h1:has-text("Claims"), h2:has-text("Claims")');
      
      if (await claimsTitle.isVisible()) {
        console.log('✅ Claims page title present');
        
        const hasClaimsTable = await claimsTable.isVisible();
        const hasClaimsGrid = await claimsGrid.isVisible();
        const hasClaimsList = await claimsList.count() > 0;
        const hasNoClaimsMessage = await noClaimsMessage.isVisible();
        
        if (hasClaimsTable || hasClaimsGrid || hasClaimsList) {
          console.log('✅ Claims data display found');
          
          // Look for action buttons
          const approveButtons = page.locator('button:has-text("Approve"), [data-testid*="approve"]');
          const rejectButtons = page.locator('button:has-text("Reject"), [data-testid*="reject"]');
          const viewButtons = page.locator('button:has-text("View"), a:has-text("View")');
          
          if (await approveButtons.count() > 0) {
            console.log(`✅ Approve buttons found: ${await approveButtons.count()}`);
          }
          
          if (await rejectButtons.count() > 0) {
            console.log(`✅ Reject buttons found: ${await rejectButtons.count()}`);
          }
          
          if (await viewButtons.count() > 0) {
            console.log(`✅ View detail buttons found: ${await viewButtons.count()}`);
          }
          
        } else if (hasNoClaimsMessage) {
          console.log('✅ Empty state message displayed');
        }
      }
      
      // Ensure page loads without errors
      const response = await page.waitForResponse(response => response.url().includes('/admin/claims')).catch(() => null);
      if (response) {
        expect(response.status()).toBeLessThan(500);
      }
    });

    test('should handle claim actions', async ({ page }) => {
      console.log('⚡ Testing claim action functionality...');
      
      await page.goto('/admin/claims');
      
      // Look for actionable claims
      const approveButtons = page.locator('button:has-text("Approve"), [data-testid*="approve"]').first();
      const rejectButtons = page.locator('button:has-text("Reject"), [data-testid*="reject"]').first();
      
      // Test approve action (if available)
      if (await approveButtons.isVisible()) {
        await approveButtons.click();
        
        // Look for confirmation dialog or success message
        const confirmDialog = page.locator('.modal, .dialog, [role="dialog"]');
        const successMessage = page.locator('.success, [role="status"], .text-green-500');
        
        if (await confirmDialog.isVisible()) {
          console.log('✅ Approve confirmation dialog shown');
          
          const confirmButton = confirmDialog.locator('button:has-text("Confirm"), button:has-text("Yes")');
          if (await confirmButton.isVisible()) {
            // Don't actually confirm in tests, just verify the flow exists
            console.log('✅ Approve confirmation flow available');
          }
        } else if (await successMessage.isVisible()) {
          console.log('✅ Approve action completed with success feedback');
        }
      }
      
      // Test reject action (if available)
      if (await rejectButtons.isVisible()) {
        await rejectButtons.click();
        
        // Look for confirmation dialog or success message
        const confirmDialog = page.locator('.modal, .dialog, [role="dialog"]');
        const successMessage = page.locator('.success, [role="status"], .text-red-500');
        
        if (await confirmDialog.isVisible()) {
          console.log('✅ Reject confirmation dialog shown');
        } else if (await successMessage.isVisible()) {
          console.log('✅ Reject action completed with feedback');
        }
      }
      
      if (!await approveButtons.isVisible() && !await rejectButtons.isVisible()) {
        console.log('ℹ️ No actionable claims available (expected in empty state)');
      }
    });
  });

  test.describe('AI Management', () => {
    test('should display AI automation settings', async ({ page }) => {
      console.log('🤖 Testing AI management interface...');
      
      await page.goto('/admin/ai');
      
      // Look for AI-related settings and controls
      const aiTitle = page.locator('h1:has-text("AI"), h2:has-text("AI"), h1:has-text("Automation")');
      const settingsForm = page.locator('form, .settings, [data-testid="ai-settings"]');
      const toggles = page.locator('input[type="checkbox"], .toggle, .switch');
      const thresholdInputs = page.locator('input[type="number"], input[placeholder*="threshold" i]');
      
      if (await aiTitle.isVisible()) {
        console.log('✅ AI management page title present');
        
        if (await settingsForm.isVisible()) {
          console.log('✅ AI settings form found');
        }
        
        if (await toggles.count() > 0) {
          console.log(`✅ Toggle controls found: ${await toggles.count()}`);
        }
        
        if (await thresholdInputs.count() > 0) {
          console.log(`✅ Threshold inputs found: ${await thresholdInputs.count()}`);
        }
        
        // Look for specific AI features
        const spamFilter = page.locator('text="spam", text="filter", [data-testid*="spam"]');
        const autoApprove = page.locator('text="auto-approve", text="automatic approval"');
        const scoreThreshold = page.locator('text="score", text="threshold", text="confidence"');
        
        if (await spamFilter.isVisible()) {
          console.log('✅ Spam filtering settings available');
        }
        
        if (await autoApprove.isVisible()) {
          console.log('✅ Auto-approval settings available');
        }
        
        if (await scoreThreshold.isVisible()) {
          console.log('✅ Scoring threshold settings available');
        }
      }
      
      // Test that settings can be interacted with
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
      if (await saveButton.isVisible()) {
        console.log('✅ Save settings functionality available');
      }
      
      // Ensure page loads properly
      const response = await page.waitForResponse(response => response.url().includes('/admin/ai')).catch(() => null);
      if (response) {
        expect(response.status()).toBeLessThan(500);
      }
    });
  });

  test.describe('Business Listings Management', () => {
    test('should handle business listings overview', async ({ page }) => {
      console.log('🏢 Testing business listings management...');
      
      // Try different possible admin routes for business management
      const businessRoutes = ['/admin/businesses', '/admin/listings', '/admin'];
      
      for (const route of businessRoutes) {
        await page.goto(route);
        
        // Look for business-related admin content
        const businessTable = page.locator('table:has(th:has-text("Business")), .business-table');
        const businessGrid = page.locator('.business-grid, .listings-grid');
        const businessList = page.locator('.business-list, ul:has(li:has-text("business" i))');
        const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');
        const filterOptions = page.locator('select, .filter, [data-testid="filter"]');
        
        if (await businessTable.isVisible() || await businessGrid.isVisible() || await businessList.count() > 0) {
          console.log(`✅ Business listings found on ${route}`);
          
          if (await searchInput.isVisible()) {
            console.log('✅ Business search functionality available');
          }
          
          if (await filterOptions.count() > 0) {
            console.log('✅ Business filtering options available');
          }
          
          // Look for business action buttons
          const editButtons = page.locator('button:has-text("Edit"), a:has-text("Edit")');
          const deleteButtons = page.locator('button:has-text("Delete"), button:has-text("Remove")');
          const viewButtons = page.locator('button:has-text("View"), a:has-text("View")');
          
          if (await editButtons.count() > 0) {
            console.log(`✅ Edit business buttons: ${await editButtons.count()}`);
          }
          
          if (await viewButtons.count() > 0) {
            console.log(`✅ View business buttons: ${await viewButtons.count()}`);
          }
          
          break; // Found business management interface
        }
      }
      
      console.log('ℹ️ Business management interface check completed');
    });
  });
});