#!/usr/bin/env tsx

/**
 * SuburbMates Directory CLI Tool
 * 
 * Implements all commands from the directory admin specification:
 * - list-businesses: List businesses with filtering
 * - import-csv: Import businesses from CSV with deduplication
 * - export-csv: Export businesses to CSV with filtering
 * - approve-business: Approve a business
 * - reject-business: Reject a business
 * - stats: Show directory statistics
 * - list-suburbs: List all suburbs
 * - list-categories: List all categories
 */

import { PrismaClient, ApprovalStatus, AbnStatus, BusinessSource } from '@prisma/client'
import { writeFile, readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { program } from 'commander'

const prisma = new PrismaClient()

// Melbourne suburbs data (sample - should be comprehensive)
const MELBOURNE_SUBURBS = [
  'Melbourne', 'Richmond', 'Fitzroy', 'Collingwood', 'Carlton', 'South Yarra', 'Prahran',
  'St Kilda', 'Albert Park', 'South Melbourne', 'Port Melbourne', 'Docklands',
  'East Melbourne', 'West Melbourne', 'North Melbourne', 'Parkville', 'Kensington',
  'Flemington', 'Ascot Vale', 'Moonee Ponds', 'Essendon', 'Brunswick', 'Coburg',
  'Preston', 'Northcote', 'Thornbury', 'Heidelberg', 'Ivanhoe', 'Fairfield',
  'Alphington', 'Clifton Hill', 'Abbotsford', 'Hawthorn', 'Camberwell', 'Surrey Hills',
  'Box Hill', 'Glen Waverley', 'Mount Waverley', 'Clayton', 'Caulfield', 'Elsternwick',
  'Brighton', 'Sandringham', 'Hampton', 'Cheltenham', 'Mordialloc', 'Bentleigh',
  'Oakleigh', 'Carnegie', 'Murrumbeena', 'Malvern', 'Armadale', 'Toorak'
  // ... would include all 603 Melbourne suburbs
]

// Business categories
const BUSINESS_CATEGORIES = [
  'Accounting', 'Advertising', 'Architecture', 'Automotive', 'Beauty & Wellness',
  'Building & Construction', 'Business Services', 'Cleaning Services', 'Consulting',
  'Dental', 'Education', 'Electrical', 'Engineering', 'Financial Services',
  'Fitness & Health', 'Food & Beverage', 'Gardening & Landscaping', 'Healthcare',
  'Home Services', 'Insurance', 'IT Services', 'Legal', 'Marketing', 'Medical',
  'Photography', 'Plumbing', 'Real Estate', 'Retail', 'Security', 'Transport',
  'Travel', 'Veterinary', 'Web Design'
]

// Utility functions
function normalizePhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Australian phone number formats
  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}` // International format
  } else if (digits.startsWith('04') && digits.length === 10) {
    return `+61${digits.slice(1)}` // Mobile
  } else if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.slice(1)}` // Landline
  }
  
  return phone // Return original if can't normalize
}

function normalizeUrl(url: string): string {
  if (!url) return url
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Deduplication functions
function isStrictDuplicate(business1: any, business2: any): boolean {
  // Same normalized phone OR website domain OR {name + suburb}
  if (business1.phone && business2.phone) {
    const phone1 = normalizePhone(business1.phone)
    const phone2 = normalizePhone(business2.phone)
    if (phone1 === phone2) return true
  }
  
  if (business1.website && business2.website) {
    const domain1 = new URL(normalizeUrl(business1.website)).hostname
    const domain2 = new URL(normalizeUrl(business2.website)).hostname
    if (domain1 === domain2) return true
  }
  
  if (business1.name && business2.name && business1.suburb && business2.suburb) {
    const name1 = business1.name.toLowerCase().trim()
    const name2 = business2.name.toLowerCase().trim()
    const suburb1 = business1.suburb.toLowerCase().trim()
    const suburb2 = business2.suburb.toLowerCase().trim()
    if (name1 === name2 && suburb1 === suburb2) return true
  }
  
  return false
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

function isLooseDuplicate(business1: any, business2: any): boolean {
  // Levenshtein name match within same suburb
  if (business1.suburb && business2.suburb) {
    const suburb1 = business1.suburb.toLowerCase().trim()
    const suburb2 = business2.suburb.toLowerCase().trim()
    
    if (suburb1 === suburb2 && business1.name && business2.name) {
      const name1 = business1.name.toLowerCase().trim()
      const name2 = business2.name.toLowerCase().trim()
      
      const distance = levenshteinDistance(name1, name2)
      const maxLength = Math.max(name1.length, name2.length)
      const similarity = 1 - (distance / maxLength)
      
      return similarity > 0.8 // 80% similarity threshold
    }
  }
  
  return false
}

import { logAuditEvent } from '../lib/utils/audit'

async function logAuditAction(action: string, target?: string, meta?: any): Promise<void> {
  await logAuditEvent({
    action,
    target,
    meta: {
      ...meta,
      actorId: 'CLI_SYSTEM'
    },
    ipAddress: 'cli',
    userAgent: 'directory-cli'
  })
}

// Command implementations

async function listBusinesses(options: {
  status?: ApprovalStatus
  abn?: AbnStatus
  suburb?: string
  category?: string
  limit?: number
}) {
  const where: any = {}
  
  if (options.status) {
    where.approvalStatus = options.status
  }
  
  if (options.abn) {
    where.abnStatus = options.abn
  }
  
  if (options.suburb) {
    where.suburb = { contains: options.suburb, mode: 'insensitive' }
  }
  
  if (options.category) {
    where.category = { contains: options.category, mode: 'insensitive' }
  }
  
  const businesses = await prisma.business.findMany({
    where,
    take: options.limit || 100,
    select: {
      id: true,
      name: true,
      suburb: true,
      category: true,
      approvalStatus: true,
      abnStatus: true,
      source: true,
      qualityScore: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.table(businesses)
  console.log(`\nFound ${businesses.length} businesses`)
  
  await logAuditAction('LIST_BUSINESSES', undefined, { filters: options, count: businesses.length })
}

async function importCsv(filePath: string, options: { dryRun?: boolean, dedupe?: 'loose' | 'strict' }) {
  console.log(`Importing businesses from ${filePath}`)
  
  try {
const csvContent = await readFile(filePath, 'utf-8')
    type CsvRecord = { name?: string; suburb?: string; category?: string; phone?: string; email?: string; website?: string }
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as CsvRecord[]
    
    console.log(`Found ${records.length} records in CSV`)
    
    // Get existing businesses for deduplication
    const existingBusinesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        suburb: true,
        phone: true,
        website: true,
      }
    })
    
    const toImport: any[] = []
    const duplicates: any[] = []
    
    for (const record of records) {
      // Validate required fields
      if (!record.name || !record.suburb) {
        console.warn(`Skipping record: missing name or suburb`, record)
        continue
      }
      
      // Normalize data
      const normalized = {
        name: record.name.trim(),
        suburb: record.suburb.trim(),
        category: record.category?.trim() || 'General',
        phone: record.phone ? normalizePhone(record.phone) : undefined,
        email: record.email ? normalizeEmail(record.email) : undefined,
        website: record.website ? normalizeUrl(record.website) : undefined,
        source: BusinessSource.CSV,
        approvalStatus: ApprovalStatus.PENDING,
        abnStatus: AbnStatus.NOT_PROVIDED,
        qualityScore: 0,
      }
      
      // Check for duplicates
      let isDuplicate = false
      
      for (const existing of existingBusinesses) {
        const isStrict = isStrictDuplicate(normalized, existing)
        const isLoose = options.dedupe === 'loose' ? isLooseDuplicate(normalized, existing) : false
        
        if (isStrict || isLoose) {
          isDuplicate = true
          duplicates.push({ new: normalized, existing })
          break
        }
      }
      
      if (!isDuplicate) {
        toImport.push(normalized)
      }
    }
    
    console.log(`\nImport Summary:`)
    console.log(`- Total records: ${records.length}`)
    console.log(`- To import: ${toImport.length}`)
    console.log(`- Duplicates found: ${duplicates.length}`)
    
    if (duplicates.length > 0) {
      console.log(`\nDuplicates:`)
      duplicates.forEach((dup, i) => {
        console.log(`${i + 1}. "${dup.new.name}" in ${dup.new.suburb} (matches existing: ${dup.existing.name})`)
      })
    }
    
    if (options.dryRun) {
      console.log('\n✅ Dry run complete - no changes made to database')
      return
    }
    
    if (toImport.length === 0) {
      console.log('\n❌ No businesses to import')
      return
    }
    
    // Import businesses
    const created = await prisma.business.createMany({
      data: toImport.map(business => ({
        ...business,
        slug: `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${business.suburb.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      }))
    })
    
    console.log(`\n✅ Successfully imported ${created.count} businesses`)
    
    await logAuditAction('IMPORT_CSV', undefined, {
      filePath,
      totalRecords: records.length,
      imported: created.count,
      duplicates: duplicates.length,
      dedupeMode: options.dedupe
    })
    
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  }
}

async function exportCsv(outputPath: string, options: { status?: ApprovalStatus }) {
  const where: any = {}
  
  if (options.status) {
    where.approvalStatus = options.status
  }
  
  const businesses = await prisma.business.findMany({
    where,
    select: {
      id: true,
      name: true,
      suburb: true,
      category: true,
      phone: true,
      email: true,
      website: true,
      approvalStatus: true,
      abnStatus: true,
      source: true,
      qualityScore: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' }
  })
  
  const csvData = stringify(businesses, {
    header: true,
    columns: {
      id: 'ID',
      name: 'Name',
      suburb: 'Suburb',
      category: 'Category',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      approvalStatus: 'Approval Status',
      abnStatus: 'ABN Status',
      source: 'Source',
      qualityScore: 'Quality Score',
      createdAt: 'Created At'
    }
  })
  
  await writeFile(outputPath, csvData)
  
  console.log(`✅ Exported ${businesses.length} businesses to ${outputPath}`)
  
  await logAuditAction('EXPORT_CSV', undefined, {
    outputPath,
    count: businesses.length,
    filters: options
  })
}

async function approveBusiness(businessId: string, reason?: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, approvalStatus: true }
  })
  
  if (!business) {
    console.error(`❌ Business not found: ${businessId}`)
    return
  }
  
  if (business.approvalStatus === ApprovalStatus.APPROVED) {
    console.log(`✅ Business "${business.name}" is already approved`)
    return
  }
  
  const updated = await prisma.business.update({
    where: { id: businessId },
    data: { 
      approvalStatus: ApprovalStatus.APPROVED,
      // Set verified flag if ABN is verified
      verified: await prisma.business.findUnique({
        where: { id: businessId },
        select: { abnStatus: true }
      }).then(b => b?.abnStatus === AbnStatus.VERIFIED)
    }
  })
  
  console.log(`✅ Approved business: "${business.name}"`)
  if (reason) {
    console.log(`   Reason: ${reason}`)
  }
  
  await logAuditAction('APPROVE_BUSINESS', businessId, { reason, businessName: business.name })
}

async function rejectBusiness(businessId: string, reason?: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, approvalStatus: true }
  })
  
  if (!business) {
    console.error(`❌ Business not found: ${businessId}`)
    return
  }
  
  if (business.approvalStatus === ApprovalStatus.REJECTED) {
    console.log(`❌ Business "${business.name}" is already rejected`)
    return
  }
  
  await prisma.business.update({
    where: { id: businessId },
    data: { 
      approvalStatus: ApprovalStatus.REJECTED,
      verified: false
    }
  })
  
  console.log(`❌ Rejected business: "${business.name}"`)
  if (reason) {
    console.log(`   Reason: ${reason}`)
  }
  
  await logAuditAction('REJECT_BUSINESS', businessId, { reason, businessName: business.name })
}

async function showStats() {
  const [
    totalBusinesses,
    approvedBusinesses,
    pendingBusinesses,
    rejectedBusinesses,
    abnVerifiedBusinesses,
    totalInquiries,
    totalClaims,
    totalAuditLogs
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
    prisma.business.count({ where: { approvalStatus: ApprovalStatus.PENDING } }),
    prisma.business.count({ where: { approvalStatus: ApprovalStatus.REJECTED } }),
    prisma.business.count({ where: { abnStatus: AbnStatus.VERIFIED } }),
    prisma.inquiry.count(),
    prisma.ownershipClaim.count(),
    prisma.auditLog.count()
  ])
  
  // Category breakdown
  const categoryStats = await prisma.business.groupBy({
    by: ['category'],
    where: { approvalStatus: ApprovalStatus.APPROVED },
    _count: true,
    orderBy: { _count: { category: 'desc' } },
    take: 10
  })
  
  // Suburb breakdown
  const suburbStats = await prisma.business.groupBy({
    by: ['suburb'],
    where: { approvalStatus: ApprovalStatus.APPROVED },
    _count: true,
    orderBy: { _count: { suburb: 'desc' } },
    take: 10
  })
  
  console.log('\n📊 SuburbMates Directory Statistics')
  console.log('=====================================')
  
  console.log('\n🏢 Business Overview:')
  console.log(`   Total: ${totalBusinesses}`)
  console.log(`   Approved: ${approvedBusinesses}`)
  console.log(`   Pending: ${pendingBusinesses}`)
  console.log(`   Rejected: ${rejectedBusinesses}`)
  console.log(`   ABN Verified: ${abnVerifiedBusinesses}`)
  
  console.log('\n📞 Activity:')
  console.log(`   Total Inquiries: ${totalInquiries}`)
  console.log(`   Ownership Claims: ${totalClaims}`)
  console.log(`   Audit Log Entries: ${totalAuditLogs}`)
  
  console.log('\n🏷️ Top Categories:')
  categoryStats.forEach((cat, i) => {
    console.log(`   ${i + 1}. ${cat.category || 'Uncategorized'}: ${cat._count}`)
  })
  
  console.log('\n🏘️ Top Suburbs:')
  suburbStats.forEach((sub, i) => {
    console.log(`   ${i + 1}. ${sub.suburb}: ${sub._count}`)
  })
  
  await logAuditAction('VIEW_STATS', undefined, {
    totalBusinesses,
    approvedBusinesses,
    pendingBusinesses,
    rejectedBusinesses
  })
}

// Command line setup
program
  .name('directory-cli')
  .description('SuburbMates Directory Management CLI')
  .version('1.0.0')

program
  .command('list-businesses')
  .description('List businesses with filtering')
  .option('--status <status>', 'Filter by approval status (PENDING, APPROVED, REJECTED)')
  .option('--abn <status>', 'Filter by ABN status (NOT_PROVIDED, PENDING, VERIFIED, INVALID, EXPIRED)')
  .option('--suburb <suburb>', 'Filter by suburb')
  .option('--category <category>', 'Filter by category')
  .option('--limit <number>', 'Maximum number of results', '100')
  .action(async (options) => {
    try {
      await listBusinesses({
        status: options.status as ApprovalStatus,
        abn: options.abn as AbnStatus,
        suburb: options.suburb,
        category: options.category,
        limit: parseInt(options.limit)
      })
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

program
  .command('import-csv')
  .description('Import businesses from CSV with deduplication')
  .requiredOption('--file <path>', 'Path to CSV file')
  .option('--dry-run', 'Print changes without executing')
  .option('--dedupe <mode>', 'Deduplication mode (loose|strict)', 'strict')
  .action(async (options) => {
    try {
      await importCsv(options.file, {
        dryRun: options.dryRun,
        dedupe: options.dedupe as 'loose' | 'strict'
      })
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

program
  .command('export-csv')
  .description('Export businesses to CSV with filtering')
  .requiredOption('--output <path>', 'Output CSV file path')
  .option('--status <status>', 'Filter by approval status (PENDING, APPROVED, REJECTED)')
  .action(async (options) => {
    try {
      await exportCsv(options.output, {
        status: options.status as ApprovalStatus
      })
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

program
  .command('approve-business')
  .description('Approve a business')
  .requiredOption('--id <businessId>', 'Business ID')
  .option('--reason <reason>', 'Reason for approval')
  .action(async (options) => {
    try {
      await approveBusiness(options.id, options.reason)
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

program
  .command('reject-business')
  .description('Reject a business')
  .requiredOption('--id <businessId>', 'Business ID')
  .option('--reason <reason>', 'Reason for rejection')
  .action(async (options) => {
    try {
      await rejectBusiness(options.id, options.reason)
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

program
  .command('stats')
  .description('Show directory statistics')
  .action(async () => {
    try {
      await showStats()
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

program
  .command('list-suburbs')
  .description('List all Melbourne suburbs')
  .action(async () => {
    try {
      console.log('\n🏘️ Melbourne Suburbs (603 total):')
      console.log('==================================')
      MELBOURNE_SUBURBS.forEach((suburb, i) => {
        console.log(`${(i + 1).toString().padStart(3)}. ${suburb}`)
      })
      console.log(`\nTotal: ${MELBOURNE_SUBURBS.length} suburbs`)
      
      await logAuditAction('LIST_SUBURBS')
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

program
  .command('list-categories')
  .description('List all business categories')
  .action(async () => {
    try {
      console.log('\n🏷️ Business Categories:')
      console.log('=======================')
      BUSINESS_CATEGORIES.forEach((category, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${category}`)
      })
      console.log(`\nTotal: ${BUSINESS_CATEGORIES.length} categories`)
      
      await logAuditAction('LIST_CATEGORIES')
    } catch (error) {
      console.error('Command failed:', error)
      process.exit(1)
    }
  })

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down CLI...')
  await prisma.$disconnect()
  process.exit(0)
})

// Run the CLI
program.parse()
