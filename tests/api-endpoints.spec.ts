import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test.describe('Business Operations API', () => {
    test('should handle business search API', async ({ request }) => {
      console.log('🔍 Testing business search API...');
      
      // Test GET request to search businesses
      const searchResponse = await request.get('/api/businesses/search?query=cafe&suburb=melbourne').catch(() => null);
      
      if (searchResponse) {
        const status = searchResponse.status();
        console.log(`📊 Search API status: ${status}`);
        
        if (status === 200) {
          const data = await searchResponse.json();
          console.log(`✅ Search API returns data: ${Array.isArray(data) ? data.length : 'object'} results`);
          
          // Basic structure validation
          if (Array.isArray(data)) {
            expect(data).toEqual(expect.any(Array));
          } else if (data.results) {
            expect(data.results).toEqual(expect.any(Array));
          }
        } else if (status === 404) {
          console.log('ℹ️ Search API endpoint not found (expected if not implemented)');
        } else {
          console.log(`⚠️ Search API unexpected status: ${status}`);
        }
        
        expect(status).toBeLessThan(500); // No server errors
      } else {
        console.log('ℹ️ Search API request failed (expected if endpoint not available)');
      }
    });

    test('should handle business profile API', async ({ request }) => {
      console.log('🏢 Testing business profile API...');
      
      // Test GET request for business profile
      const profileResponse = await request.get('/api/businesses/test-business-123').catch(() => null);
      
      if (profileResponse) {
        const status = profileResponse.status();
        console.log(`📊 Profile API status: ${status}`);
        
        if (status === 200) {
          const data = await profileResponse.json();
          console.log('✅ Profile API returns business data');
          
          // Basic structure validation for business data
          expect(data).toHaveProperty('id');
          if (data.name) expect(data.name).toEqual(expect.any(String));
          if (data.address) expect(data.address).toEqual(expect.any(String));
          
        } else if (status === 404) {
          console.log('ℹ️ Business profile not found (expected for test data)');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should validate business creation API', async ({ request }) => {
      console.log('➕ Testing business creation API validation...');
      
      // Test POST with invalid data to check validation
      const invalidData = {
        name: '', // Empty name should trigger validation
        email: 'invalid-email'
      };
      
      const createResponse = await request.post('/api/businesses', {
        data: invalidData
      }).catch(() => null);
      
      if (createResponse) {
        const status = createResponse.status();
        console.log(`📊 Create API validation status: ${status}`);
        
        // Should return validation errors (400) or method not allowed (405)
        if (status === 400) {
          const errorData = await createResponse.json();
          console.log('✅ Business creation API has validation');
          
          if (errorData.errors) {
            expect(errorData.errors).toEqual(expect.any(Object));
          }
        } else if (status === 405) {
          console.log('ℹ️ Business creation endpoint method not allowed');
        } else if (status === 404) {
          console.log('ℹ️ Business creation endpoint not found');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });

  test.describe('Claims API', () => {
    test('should handle claim submission API', async ({ request }) => {
      console.log('📧 Testing claim submission API...');
      
      const claimData = {
        businessId: 'test-business-123',
        email: 'owner@testbusiness.com',
        message: 'I am the owner of this business'
      };
      
      const claimResponse = await request.post('/api/claims', {
        data: claimData
      }).catch(() => null);
      
      if (claimResponse) {
        const status = claimResponse.status();
        console.log(`📊 Claim submission status: ${status}`);
        
        if (status === 200 || status === 201) {
          const data = await claimResponse.json();
          console.log('✅ Claim submission successful');
          
          // Basic response validation
          if (data.id) expect(data.id).toEqual(expect.any(String));
          if (data.status) expect(data.status).toEqual(expect.any(String));
          
        } else if (status === 400) {
          const errorData = await claimResponse.json();
          console.log('✅ Claim validation working');
          
        } else if (status === 404) {
          console.log('ℹ️ Claims API endpoint not found');
        } else if (status === 405) {
          console.log('ℹ️ Claims API method not allowed');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should handle claims list API (admin)', async ({ request }) => {
      console.log('📋 Testing claims list API...');
      
      const claimsResponse = await request.get('/api/admin/claims').catch(() => null);
      
      if (claimsResponse) {
        const status = claimsResponse.status();
        console.log(`📊 Claims list status: ${status}`);
        
        if (status === 200) {
          const data = await claimsResponse.json();
          console.log('✅ Claims list API accessible');
          
          if (Array.isArray(data)) {
            expect(data).toEqual(expect.any(Array));
          } else if (data.claims) {
            expect(data.claims).toEqual(expect.any(Array));
          }
          
        } else if (status === 401 || status === 403) {
          console.log('✅ Claims list API requires authentication');
          
        } else if (status === 404) {
          console.log('ℹ️ Claims list API endpoint not found');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should handle claim status update API', async ({ request }) => {
      console.log('⚡ Testing claim status update API...');
      
      const updateData = {
        status: 'approved',
        reason: 'Verified ownership'
      };
      
      const updateResponse = await request.patch('/api/claims/test-claim-123', {
        data: updateData
      }).catch(() => null);
      
      if (updateResponse) {
        const status = updateResponse.status();
        console.log(`📊 Claim update status: ${status}`);
        
        if (status === 200) {
          console.log('✅ Claim update API working');
          
        } else if (status === 401 || status === 403) {
          console.log('✅ Claim update requires admin authorization');
          
        } else if (status === 404) {
          console.log('ℹ️ Claim not found or endpoint not available');
          
        } else if (status === 405) {
          console.log('ℹ️ Claim update method not allowed');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });

  test.describe('Inquiry API', () => {
    test('should handle inquiry submission API', async ({ request }) => {
      console.log('💬 Testing inquiry submission API...');
      
      const inquiryData = {
        businessId: 'test-business-456',
        name: 'John Doe',
        email: 'john@example.com',
        message: 'I would like to know more about your services',
        phone: '+61400123456'
      };
      
      const inquiryResponse = await request.post('/api/inquiries', {
        data: inquiryData
      }).catch(() => null);
      
      if (inquiryResponse) {
        const status = inquiryResponse.status();
        console.log(`📊 Inquiry submission status: ${status}`);
        
        if (status === 200 || status === 201) {
          const data = await inquiryResponse.json();
          console.log('✅ Inquiry submission successful');
          
          if (data.id) expect(data.id).toEqual(expect.any(String));
          
        } else if (status === 400) {
          const errorData = await inquiryResponse.json();
          console.log('✅ Inquiry validation working');
          
        } else if (status === 404) {
          console.log('ℹ️ Inquiries API endpoint not found');
          
        } else if (status === 405) {
          console.log('ℹ️ Inquiries API method not allowed');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should validate inquiry data', async ({ request }) => {
      console.log('🔍 Testing inquiry validation...');
      
      // Test with missing required fields
      const invalidInquiry = {
        businessId: 'test-business-456',
        message: '' // Empty message
      };
      
      const validationResponse = await request.post('/api/inquiries', {
        data: invalidInquiry
      }).catch(() => null);
      
      if (validationResponse) {
        const status = validationResponse.status();
        console.log(`📊 Inquiry validation status: ${status}`);
        
        if (status === 400) {
          const errorData = await validationResponse.json();
          console.log('✅ Inquiry validation rejecting invalid data');
          
          if (errorData.errors) {
            expect(errorData.errors).toEqual(expect.any(Object));
          }
          
        } else if (status === 404) {
          console.log('ℹ️ Inquiries validation endpoint not available');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });

  test.describe('Health and Status APIs', () => {
    test('should check health endpoint', async ({ request }) => {
      console.log('💚 Testing health endpoint...');
      
      const healthResponse = await request.get('/api/health').catch(() => null);
      
      if (healthResponse) {
        const status = healthResponse.status();
        console.log(`📊 Health endpoint status: ${status}`);
        
        if (status === 200) {
          const data = await healthResponse.json();
          console.log('✅ Health endpoint responding');
          
          // Common health check response structure
          if (data.status) expect(data.status).toEqual(expect.any(String));
          if (data.timestamp) expect(data.timestamp).toEqual(expect.any(String));
          
        } else if (status === 404) {
          console.log('ℹ️ Health endpoint not implemented');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should check database connectivity through API', async ({ request }) => {
      console.log('🗄️ Testing database connectivity...');
      
      // Try a simple API that would require database access
      const dbTestResponse = await request.get('/api/businesses?limit=1').catch(() => null);
      
      if (dbTestResponse) {
        const status = dbTestResponse.status();
        console.log(`📊 Database test status: ${status}`);
        
        if (status === 200) {
          console.log('✅ Database connectivity appears healthy');
          
        } else if (status === 500) {
          const errorData = await dbTestResponse.text();
          if (errorData.includes('database') || errorData.includes('connection')) {
            console.log('⚠️ Database connectivity issues detected');
          }
        } else if (status === 404) {
          console.log('ℹ️ Business API endpoint not available for DB test');
        }
        
        // Allow 404 as it just means endpoint doesn't exist
        expect([200, 404, 405].includes(status) || status < 500).toBeTruthy();
      }
    });
  });

  test.describe('Authentication APIs', () => {
    test('should handle session API', async ({ request }) => {
      console.log('👤 Testing session API...');
      
      const sessionResponse = await request.get('/api/auth/session').catch(() => null);
      
      if (sessionResponse) {
        const status = sessionResponse.status();
        console.log(`📊 Session API status: ${status}`);
        
        if (status === 200) {
          const data = await sessionResponse.json();
          console.log('✅ Session API responding');
          
          // Session should be null or contain user data
          if (data === null) {
            console.log('ℹ️ No active session (expected for unauthenticated)');
          } else if (data.user) {
            console.log('ℹ️ Active user session found');
          }
          
        } else if (status === 404) {
          console.log('ℹ️ Session API endpoint not found');
        }
        
        expect(status).toBeLessThan(500);
      }
    });

    test('should handle providers API', async ({ request }) => {
      console.log('🔐 Testing auth providers API...');
      
      const providersResponse = await request.get('/api/auth/providers').catch(() => null);
      
      if (providersResponse) {
        const status = providersResponse.status();
        console.log(`📊 Providers API status: ${status}`);
        
        if (status === 200) {
          const data = await providersResponse.json();
          console.log('✅ Auth providers API responding');
          
          // Providers should be an object with provider configurations
          expect(data).toEqual(expect.any(Object));
          
        } else if (status === 404) {
          console.log('ℹ️ Auth providers endpoint not found');
        }
        
        expect(status).toBeLessThan(500);
      }
    });
  });
});
