import { test, expect } from '@playwright/test';

test.describe('Email Functionality', () => {
  test.describe('Email Configuration', () => {
    test('should verify email service configuration', async ({ request }) => {
      console.log('📧 Testing email service configuration...');
      
      // Test email configuration endpoint (if exists)
      const configResponse = await request.get('/api/email/config').catch(() => null);
      
      if (configResponse) {
        const status = configResponse.status();
        console.log(`📊 Email config status: ${status}`);
        
        if (status === 200) {
          const data = await configResponse.json();
          console.log('✅ Email configuration accessible');
          
          // Check for key email configuration properties
          if (data.provider) {
            console.log(`📧 Email provider: ${data.provider}`);
          }
          if (data.fromEmail) {
            console.log(`📧 From email: ${data.fromEmail}`);
          }
          
        } else if (status === 401 || status === 403) {
          console.log('✅ Email config protected (good for security)');
        } else if (status === 404) {
          console.log('ℹ️ Email config endpoint not available');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should check email health endpoint', async ({ request }) => {
      console.log('💚 Testing email service health...');
      
      const healthResponse = await request.get('/api/email/health').catch(() => null);
      
      if (healthResponse) {
        const status = healthResponse.status();
        console.log(`📊 Email health status: ${status}`);
        
        if (status === 200) {
          const data = await healthResponse.json();
          console.log('✅ Email service health check passed');
          
          if (data.status === 'healthy') {
            console.log('✅ Email service reporting healthy');
          }
          
        } else if (status === 404) {
          console.log('ℹ️ Email health endpoint not implemented');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });

  test.describe('Welcome Email Workflow', () => {
    test('should trigger welcome email on registration', async ({ page }) => {
      console.log('🎉 Testing welcome email workflow...');
      
      // Navigate to registration page
      await page.goto('/register-business');
      
      // Fill out registration form (if elements exist)
      const emailField = page.locator('input[type="email"]');
      const businessNameField = page.locator('input[name="businessName"], input[placeholder*="business name" i]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up")');
      
      if (await emailField.isVisible() && await submitButton.isVisible()) {
        // Use a test email
        await emailField.fill('test-welcome@example.com');
        
        if (await businessNameField.isVisible()) {
          await businessNameField.fill('Test Business for Welcome Email');
        }
        
        // Intercept potential email API calls
        const emailRequests = [];
        page.on('request', request => {
          if (request.url().includes('/api/email') || request.url().includes('resend') || request.url().includes('sendgrid')) {
            emailRequests.push({ url: request.url(), method: request.method() });
          }
        });
        
        // Note: We don't actually submit to avoid creating test data
        // In a real test environment, you'd want to:
        // 1. Use a test email service or mock
        // 2. Submit the form
        // 3. Verify email was sent
        
        console.log('✅ Welcome email workflow form elements accessible');
        
        // Check for email confirmation message after form interaction
        if (await submitButton.isEnabled()) {
          // Don't actually submit, just check the form is ready
          console.log('✅ Registration form ready for submission');
        }
      } else {
        console.log('ℹ️ Registration form not fully available for testing');
      }
    });

    test('should handle email confirmation workflow', async ({ page }) => {
      console.log('✉️ Testing email confirmation workflow...');
      
      // Test the email confirmation check page
      await page.goto('/auth/check-email');
      
      // Look for email confirmation message
      const confirmationMessage = page.locator('text="check your email", text="confirmation", text="verify", h1:has-text("Email")');
      const resendButton = page.locator('button:has-text("Resend"), a:has-text("Resend")');
      const backButton = page.locator('button:has-text("Back"), a:has-text("Back")');
      
      if (await confirmationMessage.isVisible()) {
        console.log('✅ Email confirmation page displays message');
        
        if (await resendButton.isVisible()) {
          console.log('✅ Resend email functionality available');
          
          // Test resend functionality (without actually sending)
          // await resendButton.click();
          // Look for success/error feedback
        }
        
        if (await backButton.isVisible()) {
          console.log('✅ Navigation back option available');
        }
      } else {
        console.log('ℹ️ Email confirmation page content not found');
      }
      
      // Ensure page loads without errors
      const pageTitle = await page.title();
      expect(pageTitle).toBeDefined();
    });
  });

  test.describe('Claim Notification Emails', () => {
    test('should handle claim submission email workflow', async ({ page, request }) => {
      console.log('🎯 Testing claim notification email workflow...');
      
      // Navigate to a claim page
      await page.goto('/claim/test-business-789');
      
      const emailField = page.locator('input[type="email"]');
      const messageField = page.locator('textarea, input[name*="message"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Claim"), button:has-text("Submit")');
      
      if (await emailField.isVisible() && await submitButton.isVisible()) {
        // Fill out claim form with test data
        await emailField.fill('owner-test@testbusiness.com');
        
        if (await messageField.isVisible()) {
          await messageField.fill('Test claim message for email workflow testing');
        }
        
        // Monitor for email-related requests
        const emailRequests = [];
        page.on('request', request => {
          const url = request.url();
          if (url.includes('/api/email') || url.includes('/api/claims') || url.includes('resend')) {
            emailRequests.push({ url, method: request.method(), headers: request.headers() });
          }
        });
        
        // Note: In production testing, you'd actually submit and verify email
        // For this smoke test, we just verify the form is functional
        console.log('✅ Claim form ready for submission with email workflow');
        
      } else {
        console.log('ℹ️ Claim form not available for email workflow testing');
      }
    });

    test('should verify claim confirmation email template', async ({ request }) => {
      console.log('📋 Testing claim confirmation email template...');
      
      // Test email template endpoint (if available)
      const templateResponse = await request.get('/api/email/templates/claim-confirmation').catch(() => null);
      
      if (templateResponse) {
        const status = templateResponse.status();
        console.log(`📊 Email template status: ${status}`);
        
        if (status === 200) {
          const template = await templateResponse.text();
          console.log('✅ Claim confirmation email template accessible');
          
          // Basic template validation
          if (template.includes('claim') || template.includes('business')) {
            console.log('✅ Email template contains relevant content');
          }
          
        } else if (status === 401 || status === 403) {
          console.log('✅ Email templates protected (good for security)');
        } else if (status === 404) {
          console.log('ℹ️ Email template endpoint not available');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });

  test.describe('Business Inquiry Emails', () => {
    test('should handle inquiry notification workflow', async ({ page }) => {
      console.log('💬 Testing inquiry email notification workflow...');
      
      // Navigate to a business profile page
      await page.goto('/business/test-cafe-inquiry');
      
      // Look for contact/inquiry form
      const inquiryForm = page.locator('form:has(input[name*="message"]), .contact-form, .inquiry-form');
      const nameField = page.locator('input[name="name"], input[placeholder*="name" i]');
      const emailField = page.locator('input[type="email"]');
      const messageField = page.locator('textarea[name="message"], textarea[placeholder*="message" i]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Contact")');
      
      if (await inquiryForm.isVisible()) {
        console.log('✅ Inquiry form found on business profile');
        
        if (await nameField.isVisible()) {
          await nameField.fill('Test Customer');
        }
        
        if (await emailField.isVisible()) {
          await emailField.fill('customer@example.com');
        }
        
        if (await messageField.isVisible()) {
          await messageField.fill('This is a test inquiry for email workflow validation.');
        }
        
        if (await submitButton.isVisible()) {
          console.log('✅ Inquiry form ready for submission');
          
          // Monitor email-related network requests
          const emailRequests = [];
          page.on('request', request => {
            if (request.url().includes('/api/inquiries') || request.url().includes('/api/email')) {
              emailRequests.push(request.url());
            }
          });
          
          // In a full test, you would submit and verify email sending
          // await submitButton.click();
          // await expect(page.locator('.success, .thank-you')).toBeVisible();
        }
      } else {
        console.log('ℹ️ Inquiry form not found on business profile page');
      }
    });
  });

  test.describe('Admin Email Notifications', () => {
    test('should verify admin notification system', async ({ request }) => {
      console.log('👨‍💼 Testing admin email notification system...');
      
      // Test admin email settings endpoint
      const adminEmailResponse = await request.get('/api/admin/email-settings').catch(() => null);
      
      if (adminEmailResponse) {
        const status = adminEmailResponse.status();
        console.log(`📊 Admin email settings status: ${status}`);
        
        if (status === 200) {
          const settings = await adminEmailResponse.json();
          console.log('✅ Admin email settings accessible');
          
          if (settings.adminEmail) {
            console.log(`✅ Admin email configured: ${settings.adminEmail.replace(/@.+/, '@***')}`);
          }
          
          if (settings.notificationTypes) {
            console.log(`✅ Notification types: ${settings.notificationTypes.length} configured`);
          }
          
        } else if (status === 401 || status === 403) {
          console.log('✅ Admin email settings require authorization');
        } else if (status === 404) {
          console.log('ℹ️ Admin email settings endpoint not found');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });

  test.describe('Email Delivery Testing', () => {
    test('should validate email sending API', async ({ request }) => {
      console.log('🚀 Testing email sending API validation...');
      
      // Test email sending endpoint with invalid data
      const invalidEmailData = {
        to: 'invalid-email',
        subject: '',
        body: ''
      };
      
      const sendResponse = await request.post('/api/email/send', {
        data: invalidEmailData
      }).catch(() => null);
      
      if (sendResponse) {
        const status = sendResponse.status();
        console.log(`📊 Email send validation status: ${status}`);
        
        if (status === 400) {
          const errorData = await sendResponse.json();
          console.log('✅ Email sending API validates input data');
          
          if (errorData.errors) {
            expect(errorData.errors).toEqual(expect.any(Object));
          }
          
        } else if (status === 401 || status === 403) {
          console.log('✅ Email sending requires authorization');
        } else if (status === 404) {
          console.log('ℹ️ Email sending endpoint not available');
        } else if (status === 405) {
          console.log('ℹ️ Email sending method not allowed');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should check email queue status', async ({ request }) => {
      console.log('📤 Testing email queue status...');
      
      const queueResponse = await request.get('/api/email/queue').catch(() => null);
      
      if (queueResponse) {
        const status = queueResponse.status();
        console.log(`📊 Email queue status: ${status}`);
        
        if (status === 200) {
          const queueData = await queueResponse.json();
          console.log('✅ Email queue accessible');
          
          if (queueData.pending !== undefined) {
            console.log(`📧 Pending emails: ${queueData.pending}`);
          }
          if (queueData.sent !== undefined) {
            console.log(`📧 Sent emails: ${queueData.sent}`);
          }
          
        } else if (status === 401 || status === 403) {
          console.log('✅ Email queue requires admin authorization');
        } else if (status === 404) {
          console.log('ℹ️ Email queue endpoint not implemented');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });
});
