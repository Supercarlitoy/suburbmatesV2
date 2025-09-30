/**
 * Business Duplicate Detection System
 * 
 * Implements strict and loose duplicate detection algorithms
 * from Canvas Export project
 */

interface BusinessInput {
  name: string;
  phone?: string;
  website?: string;
  suburb?: string;
  email?: string;
}

/**
 * Normalize phone number to Australian format
 */
function normalizePhone(phone?: string): string | null {
  if (!phone) return null;
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Australian phone number formats
  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}`; // International format
  } else if (digits.startsWith('04') && digits.length === 10) {
    return `+61${digits.slice(1)}`; // Mobile
  } else if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.slice(1)}`; // Landline
  }
  
  return null; // Invalid format
}

/**
 * Normalize website URL to domain
 */
function normalizeWebsite(website?: string): string | null {
  if (!website) return null;
  
  try {
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Normalize text for comparison
 */
function normalizeText(text?: string): string {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Check if two businesses are strict duplicates
 * Criteria: Same normalized phone OR website domain OR {name + suburb}
 */
export function isStrictDuplicate(business1: BusinessInput, business2: BusinessInput): boolean {
  // Phone number match
  if (business1.phone && business2.phone) {
    const phone1 = normalizePhone(business1.phone);
    const phone2 = normalizePhone(business2.phone);
    if (phone1 && phone2 && phone1 === phone2) {
      return true;
    }
  }
  
  // Website domain match
  if (business1.website && business2.website) {
    const domain1 = normalizeWebsite(business1.website);
    const domain2 = normalizeWebsite(business2.website);
    if (domain1 && domain2 && domain1 === domain2) {
      return true;
    }
  }
  
  // Name + suburb match
  if (business1.name && business2.name && business1.suburb && business2.suburb) {
    const name1 = normalizeText(business1.name);
    const name2 = normalizeText(business2.name);
    const suburb1 = normalizeText(business1.suburb);
    const suburb2 = normalizeText(business2.suburb);
    
    if (name1 === name2 && suburb1 === suburb2) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if two businesses are loose duplicates
 * Criteria: >80% name similarity within same suburb
 */
export function isLooseDuplicate(business1: BusinessInput, business2: BusinessInput): boolean {
  if (!business1.name || !business2.name || !business1.suburb || !business2.suburb) {
    return false;
  }
  
  const suburb1 = normalizeText(business1.suburb);
  const suburb2 = normalizeText(business2.suburb);
  
  // Must be in same suburb
  if (suburb1 !== suburb2) {
    return false;
  }
  
  const name1 = normalizeText(business1.name);
  const name2 = normalizeText(business2.name);
  
  if (name1.length === 0 || name2.length === 0) {
    return false;
  }
  
  const distance = levenshteinDistance(name1, name2);
  const maxLength = Math.max(name1.length, name2.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity > 0.8; // 80% similarity threshold
}

/**
 * Find duplicates for a business in the database
 */
export async function findDuplicates(
  businessData: BusinessInput, 
  prisma: any,
  mode: 'strict' | 'loose' = 'strict',
  excludeId?: string
): Promise<any[]> {
  // Get all businesses to check against
  const allBusinesses = await prisma.business.findMany({
    where: excludeId ? { 
      id: { not: excludeId } 
    } : undefined,
    select: {
      id: true,
      name: true,
      phone: true,
      website: true,
      suburb: true,
      email: true,
    }
  });
  
  const duplicates = [];
  
  for (const existing of allBusinesses) {
    let isDuplicate = false;
    
    if (mode === 'strict') {
      isDuplicate = isStrictDuplicate(businessData, existing);
    } else {
      isDuplicate = isStrictDuplicate(businessData, existing) || isLooseDuplicate(businessData, existing);
    }
    
    if (isDuplicate) {
      duplicates.push(existing);
    }
  }
  
  return duplicates;
}

/**
 * Mark a business as duplicate of another
 */
export async function markAsDuplicate(
  duplicateBusinessId: string,
  canonicalBusinessId: string,
  prisma: any
): Promise<void> {
  await prisma.business.update({
    where: { id: duplicateBusinessId },
    data: {
      duplicateOfId: canonicalBusinessId,
      approvalStatus: 'REJECTED' // Hide from public view
    }
  });
}

/**
 * Find and process all duplicates in the database
 */
export async function processDuplicates(
  prisma: any,
  mode: 'strict' | 'loose' = 'strict',
  autoMark = false
): Promise<{ duplicateGroups: any[], processedCount: number }> {
  const businesses = await prisma.business.findMany({
    where: { duplicateOfId: null }, // Only check non-duplicate businesses
    select: {
      id: true,
      name: true,
      phone: true,
      website: true,
      suburb: true,
      email: true,
    }
  });
  
  const duplicateGroups = [];
  const processedIds = new Set();
  let processedCount = 0;
  
  for (const business of businesses) {
    if (processedIds.has(business.id)) continue;
    
    const duplicates = await findDuplicates(business, prisma, mode, business.id);
    
    if (duplicates.length > 0) {
      const group = {
        canonical: business,
        duplicates: duplicates,
        confidence: mode === 'strict' ? 'high' : 'medium'
      };
      
      duplicateGroups.push(group);
      
      // Mark all duplicates in this group as processed
      processedIds.add(business.id);
      duplicates.forEach(dup => processedIds.add(dup.id));
      
      // Auto-mark duplicates if requested
      if (autoMark) {
        for (const duplicate of duplicates) {
          await markAsDuplicate(duplicate.id, business.id, prisma);
        }
      }
      
      processedCount += duplicates.length;
    }
  }
  
  return { duplicateGroups, processedCount };
}