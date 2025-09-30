/**
 * Global Playwright Test Setup
 * 
 * Seeds test database and sets up test environment
 * before running any tests.
 */

import { PrismaClient } from '@prisma/client'
import { chromium, FullConfig } from '@playwright/test'

const prisma = new PrismaClient()

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up test environment...')
  
  // Only run in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests should only run in test environment')
  }
  
  try {
    // Create admin user for tests (must exist before seeding FKs)
    await createTestUsers()

    // Clean and seed test database
    await seedTestDatabase()
    
    // Start server if needed
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      console.log('🚀 Starting test server...')
      // Server startup handled by webServer in config
    }
    
    console.log('✅ Test environment ready')
    
  } catch (error) {
    console.error('❌ Test setup failed:', error)
    throw error
  }
}

async function seedTestDatabase() {
  console.log('🌱 Seeding test database...')
  
  // Clear existing test data
  await prisma.auditLog.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.ownershipClaim.deleteMany()
  await prisma.businessProfileCustomization.deleteMany()
  await prisma.business.deleteMany()
  // Note: Do not delete users here; test users are created prior to seeding
  
  // Create test businesses with different statuses
  const testBusinesses = [
    {
      id: 'test-approved-business',
      slug: 'melbourne-test-cafe',
      name: 'Melbourne Test Cafe',
      suburb: 'Melbourne',
      category: 'Food & Beverage',
      email: 'test@melbournecafe.com.au',
      phone: '+61412345678',
      website: 'https://melbournecafe.com.au',
      approvalStatus: 'APPROVED',
      abnStatus: 'VERIFIED',
      source: 'MANUAL',
      qualityScore: 85,
      verified: true,
    },
    {
      id: 'test-pending-business',
      slug: 'richmond-plumbing-services',
      name: 'Richmond Plumbing Services',
      suburb: 'Richmond',
      category: 'Plumbing',
      email: 'info@richmondplumbing.com.au',
      phone: '+61487654321',
      approvalStatus: 'PENDING',
      abnStatus: 'NOT_PROVIDED',
      source: 'CSV',
      qualityScore: 45,
      verified: false,
    },
    {
      id: 'test-claimed-business',
      slug: 'fitzroy-dental-clinic',
      name: 'Fitzroy Dental Clinic',
      suburb: 'Fitzroy',
      category: 'Dental',
      email: 'reception@fitzroydental.com.au',
      phone: '+61398765432',
      approvalStatus: 'APPROVED',
      abnStatus: 'VERIFIED',
      source: 'CLAIMED',
      qualityScore: 92,
      verified: true,
    },
    {
      id: 'test-duplicate-business-1',
      slug: 'collingwood-bakery',
      name: 'Collingwood Artisan Bakery',
      suburb: 'Collingwood',
      category: 'Food & Beverage',
      email: 'hello@collingwoodbakery.com',
      phone: '+61412111222',
      approvalStatus: 'APPROVED',
      abnStatus: 'NOT_PROVIDED',
      source: 'MANUAL',
      qualityScore: 70,
      verified: false,
    },
    {
      id: 'test-duplicate-business-2',
      slug: 'collingwood-bakery-duplicate',
      name: 'Collingwood Artisan Bakery',  // Same name - should be detected as duplicate
      suburb: 'Collingwood',
      category: 'Food & Beverage',
      email: 'info@collingwoodbakery.com',
      phone: '+61412111222', // Same phone - strict duplicate
      approvalStatus: 'PENDING',
      abnStatus: 'NOT_PROVIDED',
      source: 'CSV',
      qualityScore: 30,
      verified: false,
      duplicateOfId: 'test-duplicate-business-1',
    }
  ] as const
  
  for (const business of testBusinesses) {
    await prisma.business.create({
      data: business
    })
  }
  
  // Create test inquiries
  await prisma.inquiry.createMany({
    data: [
      {
        businessId: 'test-approved-business',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+61401234567',
        message: 'I need a quote for coffee catering for my event',
        utm: { source: 'google', medium: 'organic' }
      },
      {
        businessId: 'test-claimed-business',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        message: 'Do you accept new patients?',
        utm: { source: 'suburbmates', medium: 'profile' }
      }
    ]
  })
  
  // Create test ownership claims
  const baseClaim = {
    id: 'test-pending-claim',
    businessId: 'test-pending-business',
    method: 'EMAIL_DOMAIN',
    status: 'PENDING',
    evidence: { 
      email: 'owner@richmondplumbing.com.au',
      domain_match: true 
    }
  } as const

  try {
    await prisma.ownershipClaim.createMany({
      data: [
        {
          ...baseClaim,
          // New schema
          ownerId: 'test-business-owner',
        } as any
      ]
    })
  } catch (err) {
    console.warn('OwnershipClaim createMany failed with ownerId; retrying with userId fallback')
    await prisma.ownershipClaim.createMany({
      data: [
        {
          ...baseClaim,
          // Legacy schema fallback
          userId: 'test-business-owner',
        } as any
      ]
    })
  }
  
  console.log('✅ Test database seeded')
}

async function createTestUsers() {
  console.log('👥 Creating test users...')
  
  // Create test admin user
  await prisma.user.upsert({
    where: { id: 'test-admin-user' },
    update: { email: 'admin@suburbmates.test', role: 'ADMIN' },
    create: { id: 'test-admin-user', email: 'admin@suburbmates.test', role: 'ADMIN' }
  })
  
  // Create test business owner
  await prisma.user.upsert({
    where: { id: 'test-business-owner' },
    update: { email: 'owner@richmondplumbing.com.au', role: 'USER' },
    create: { id: 'test-business-owner', email: 'owner@richmondplumbing.com.au', role: 'USER' }
  })
  
  console.log('✅ Test users created')
}

async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...')
  
  try {
    // Clean up test data
    await prisma.auditLog.deleteMany()
    await prisma.inquiry.deleteMany() 
    await prisma.ownershipClaim.deleteMany()
    await prisma.business.deleteMany()
    await prisma.user.deleteMany()
    
    await prisma.$disconnect()
    
    console.log('✅ Test cleanup complete')
  } catch (error) {
    console.error('❌ Cleanup error:', error)
  }
}

export default globalSetup
export { globalTeardown }