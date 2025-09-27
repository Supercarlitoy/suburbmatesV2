/**
 * Rules-based Search Reranker
 * Applies weighted scoring to improve business search results
 */

import { isFlagOn } from '@/lib/flags';

interface Business {
  id: string;
  name: string;
  suburb: string;
  category?: string;
  bio?: string;
  logo?: string;
  website?: string;
  phone?: string;
  email: string;
  status: string;
  updatedAt: Date;
  createdAt: Date;
  // Optional fields for scoring
  rating?: number;
  reviewCount?: number;
  completionScore?: number;
}

interface SearchContext {
  query?: string;
  suburb?: string;
  category?: string;
  location?: {
    suburb: string;
  };
}

interface ScoredBusiness extends Business {
  rerankScore: number;
  scoreBreakdown: {
    localityBoost: number;
    completionBoost: number;
    ratingBoost: number;
    recencyBoost: number;
    queryRelevanceBoost: number;
  };
}

/**
 * Calculate profile completion score based on filled fields
 */
function calculateCompletionScore(business: Business): number {
  const fields = [
    business.bio,
    business.logo,
    business.website,
    business.phone,
    business.category,
  ];
  
  const filledFields = fields.filter(field => field && field.length > 0).length;
  return filledFields / fields.length; // 0-1 score
}

/**
 * Calculate locality boost based on suburb matching
 */
function calculateLocalityBoost(business: Business, context: SearchContext): number {
  const targetSuburb = context.suburb || context.location?.suburb;
  
  if (!targetSuburb) return 0;
  
  // Exact suburb match
  if (business.suburb.toLowerCase() === targetSuburb.toLowerCase()) {
    return 30;
  }
  
  // Partial suburb match (for compound suburb names)
  if (business.suburb.toLowerCase().includes(targetSuburb.toLowerCase()) ||
      targetSuburb.toLowerCase().includes(business.suburb.toLowerCase())) {
    return 15;
  }
  
  return 0;
}

/**
 * Calculate completion boost based on profile completeness
 */
function calculateCompletionBoost(business: Business): number {
  const completionScore = business.completionScore ?? calculateCompletionScore(business);
  return completionScore * 20; // 0-20 boost
}

/**
 * Calculate rating boost based on average rating and review count
 */
function calculateRatingBoost(business: Business): number {
  const rating = business.rating ?? 0;
  const reviewCount = business.reviewCount ?? 0;
  
  if (rating === 0) return 0;
  
  // Base rating score (0-15)
  const ratingScore = (rating / 5) * 15;
  
  // Review count multiplier (more reviews = more reliable)
  const reviewMultiplier = Math.min(reviewCount / 10, 1.5); // Cap at 1.5x boost
  
  return Math.min(ratingScore * reviewMultiplier, 20);
}

/**
 * Calculate recency boost for recently updated businesses
 */
function calculateRecencyBoost(business: Business): number {
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - business.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate <= 7) return 10;   // Updated this week
  if (daysSinceUpdate <= 30) return 5;   // Updated this month
  if (daysSinceUpdate <= 90) return 2;   // Updated this quarter
  
  return 0;
}

/**
 * Calculate query relevance boost based on text matching
 */
function calculateQueryRelevanceBoost(business: Business, context: SearchContext): number {
  if (!context.query) return 0;
  
  const query = context.query.toLowerCase();
  const businessName = business.name.toLowerCase();
  const businessBio = (business.bio || '').toLowerCase();
  const businessCategory = (business.category || '').toLowerCase();
  
  let boost = 0;
  
  // Exact name match
  if (businessName === query) boost += 25;
  // Name starts with query
  else if (businessName.startsWith(query)) boost += 15;
  // Name contains query
  else if (businessName.includes(query)) boost += 10;
  
  // Category match
  if (businessCategory.includes(query)) boost += 8;
  
  // Bio/description match
  if (businessBio.includes(query)) boost += 5;
  
  // Acronym match (e.g., "ABC" matches "ABC Plumbing")
  const words = businessName.split(' ');
  const acronym = words.map(w => w[0]).join('').toLowerCase();
  if (acronym === query) boost += 12;
  
  return Math.min(boost, 25); // Cap at 25 points
}

/**
 * Apply reranking algorithm to search results
 * @param businesses Array of businesses to rerank
 * @param context Search context with query, location, etc.
 * @returns Reranked array of businesses with scoring details
 */
export async function rerank(
  businesses: Business[], 
  context: SearchContext = {}
): Promise<ScoredBusiness[]> {
  // Check if reranking is enabled via feature flag
  const isEnabled = await isFlagOn('search_reranker');
  
  if (!isEnabled) {
    // Return original order with zero scores if flag is off
    return businesses.map(business => ({
      ...business,
      rerankScore: 0,
      scoreBreakdown: {
        localityBoost: 0,
        completionBoost: 0,
        ratingBoost: 0,
        recencyBoost: 0,
        queryRelevanceBoost: 0,
      }
    }));
  }
  
  // Calculate scores for each business
  const scoredBusinesses: ScoredBusiness[] = businesses.map(business => {
    const scoreBreakdown = {
      localityBoost: calculateLocalityBoost(business, context),
      completionBoost: calculateCompletionBoost(business),
      ratingBoost: calculateRatingBoost(business),
      recencyBoost: calculateRecencyBoost(business),
      queryRelevanceBoost: calculateQueryRelevanceBoost(business, context),
    };
    
    const rerankScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);
    
    return {
      ...business,
      rerankScore,
      scoreBreakdown,
    };
  });
  
  // Sort by rerank score (highest first), then by original relevance
  return scoredBusinesses.sort((a, b) => {
    if (b.rerankScore !== a.rerankScore) {
      return b.rerankScore - a.rerankScore;
    }
    
    // Fallback to creation date (newer first) if scores are equal
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/**
 * Simple rerank function that just returns scored businesses without reordering
 * Useful for debugging and analysis
 */
export async function scoreBusinesses(
  businesses: Business[],
  context: SearchContext = {}
): Promise<ScoredBusiness[]> {
  const isEnabled = await isFlagOn('search_reranker');
  
  if (!isEnabled) {
    return businesses.map(business => ({
      ...business,
      rerankScore: 0,
      scoreBreakdown: {
        localityBoost: 0,
        completionBoost: 0,
        ratingBoost: 0,
        recencyBoost: 0,
        queryRelevanceBoost: 0,
      }
    }));
  }
  
  return businesses.map(business => {
    const scoreBreakdown = {
      localityBoost: calculateLocalityBoost(business, context),
      completionBoost: calculateCompletionBoost(business),
      ratingBoost: calculateRatingBoost(business),
      recencyBoost: calculateRecencyBoost(business),
      queryRelevanceBoost: calculateQueryRelevanceBoost(business, context),
    };
    
    const rerankScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);
    
    return {
      ...business,
      rerankScore,
      scoreBreakdown,
    };
  });
}