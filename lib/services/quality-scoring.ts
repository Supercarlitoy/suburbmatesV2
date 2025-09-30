/**
 * Business Quality Scoring System
 * 
 * Implements the quality scoring algorithm from Canvas Export
 * Score range: 0-100 based on completeness, recency, verification, and reviews
 */

interface BusinessData {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  abn?: string;
  abnStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
  images?: any[];
  reviews?: any[];
  businessHours?: any[];
}

/**
 * Calculate quality score for a business (0-100)
 */
export function calculateQualityScore(business: BusinessData): number {
  let score = 0;

  // 1. Completeness Score (60 points max)
  const completenessFactors = [
    { field: business.name, points: 10, name: 'Name' },
    { field: business.description, points: 15, name: 'Description' },
    { field: business.phone, points: 10, name: 'Phone' },
    { field: business.email, points: 10, name: 'Email' },
    { field: business.website, points: 10, name: 'Website' },
    { field: business.address, points: 5, name: 'Address' }
  ];

  completenessFactors.forEach(factor => {
    if (factor.field && factor.field.toString().trim().length > 0) {
      score += factor.points;
    }
  });

  // 2. Verification Bonus (20 points max)
  if (business.abnStatus === 'VERIFIED') {
    score += 15; // ABN verified
  }
  
  if (business.latitude && business.longitude) {
    score += 5; // Location verified
  }

  // 3. Recency Score (10 points max)
  if (business.updatedAt) {
    const daysSinceUpdate = Math.floor((Date.now() - business.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate < 30) {
      score += 10; // Updated within 30 days
    } else if (daysSinceUpdate < 90) {
      score += 5; // Updated within 90 days
    }
  }

  // 4. Content Richness (10 points max)
  if (business.images && business.images.length > 0) {
    score += 5; // Has images
  }
  
  if (business.businessHours && business.businessHours.length > 0) {
    score += 3; // Has business hours
  }
  
  if (business.reviews && business.reviews.length > 0) {
    score += 2; // Has reviews
  }

  // Ensure score doesn't exceed 100
  return Math.min(score, 100);
}

/**
 * Update quality score for a business
 */
export async function updateBusinessQualityScore(businessId: string, prisma: any): Promise<number> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      images: true,
      reviews: true,
      businessHours: true
    }
  });

  if (!business) {
    throw new Error(`Business not found: ${businessId}`);
  }

  const qualityScore = calculateQualityScore(business);

  await prisma.business.update({
    where: { id: businessId },
    data: { qualityScore }
  });

  return qualityScore;
}

/**
 * Batch update quality scores for all businesses
 */
export async function batchUpdateQualityScores(prisma: any, limit = 100): Promise<number> {
  const businesses = await prisma.business.findMany({
    take: limit,
    include: {
      images: true,
      reviews: true,
      businessHours: true
    }
  });

  let updatedCount = 0;

  for (const business of businesses) {
    const qualityScore = calculateQualityScore(business);
    
    await prisma.business.update({
      where: { id: business.id },
      data: { qualityScore }
    });

    updatedCount++;
  }

  return updatedCount;
}