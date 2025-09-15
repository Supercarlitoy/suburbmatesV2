/**
 * Client-side search result reranking utility
 * Provides optional front-end tweaks to boost obvious phrase hits
 * Controlled by NEXT_PUBLIC_SEARCH_AI_CLIENT_RERANK environment variable
 */

interface Business {
  id: string;
  name: string;
  bio?: string;
  category?: string;
  suburb: string;
  search_score?: number;
  [key: string]: any;
}

interface RerankOptions {
  query: string;
  phraseBoost: number;
  exactMatchBoost: number;
  categoryMatchBoost: number;
  suburbMatchBoost: number;
}

const DEFAULT_RERANK_OPTIONS: RerankOptions = {
  query: '',
  phraseBoost: 0.2,
  exactMatchBoost: 0.3,
  categoryMatchBoost: 0.15,
  suburbMatchBoost: 0.1,
};

/**
 * Check if client-side reranking is enabled
 */
export function isClientRerankEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SEARCH_AI_CLIENT_RERANK === 'true';
}

/**
 * Calculate additional relevance score for client-side reranking
 */
function calculateClientScore(business: Business, query: string, options: RerankOptions): number {
  if (!query.trim()) return 0;
  
  const normalizedQuery = query.toLowerCase().trim();
  const businessName = (business.name || '').toLowerCase();
  const businessBio = (business.bio || '').toLowerCase();
  const businessCategory = (business.category || '').toLowerCase();
  const businessSuburb = (business.suburb || '').toLowerCase();
  
  let clientScore = 0;
  
  // Exact name match gets highest boost
  if (businessName === normalizedQuery) {
    clientScore += options.exactMatchBoost;
  }
  
  // Phrase matches in name (e.g., "hot water" in "Hot Water Solutions")
  if (businessName.includes(normalizedQuery)) {
    clientScore += options.phraseBoost;
  }
  
  // Phrase matches in bio
  if (businessBio.includes(normalizedQuery)) {
    clientScore += options.phraseBoost * 0.7; // Slightly lower weight for bio
  }
  
  // Category exact match
  if (businessCategory === normalizedQuery) {
    clientScore += options.categoryMatchBoost;
  }
  
  // Suburb exact match
  if (businessSuburb === normalizedQuery) {
    clientScore += options.suburbMatchBoost;
  }
  
  // Multi-word query handling
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  if (queryWords.length > 1) {
    // Check if all words appear in business name
    const allWordsInName = queryWords.every(word => businessName.includes(word));
    if (allWordsInName) {
      clientScore += options.phraseBoost * 0.8;
    }
    
    // Check word order preservation ("plumber melbourne" vs "melbourne plumber")
    const nameWords = businessName.split(/\s+/);
    let consecutiveMatches = 0;
    for (let i = 0; i < nameWords.length - queryWords.length + 1; i++) {
      const nameSlice = nameWords.slice(i, i + queryWords.length).join(' ');
      if (nameSlice.includes(normalizedQuery)) {
        consecutiveMatches++;
      }
    }
    if (consecutiveMatches > 0) {
      clientScore += options.phraseBoost * 0.5;
    }
  }
  
  return Math.min(clientScore, 1.0); // Cap at 1.0 to prevent over-boosting
}

/**
 * Rerank search results on the client side
 * This provides optional front-end tweaks without server cost
 */
export function rerankSearchResults(
  businesses: Business[],
  query: string,
  options: Partial<RerankOptions> = {}
): Business[] {
  // Return original results if client reranking is disabled
  if (!isClientRerankEnabled()) {
    return businesses;
  }
  
  if (!query.trim() || businesses.length === 0) {
    return businesses;
  }
  
  const rerankOptions = { ...DEFAULT_RERANK_OPTIONS, ...options, query };
  
  // Calculate client scores and combine with server scores
  const businessesWithClientScores = businesses.map(business => {
    const serverScore = business.search_score || 0;
    const clientScore = calculateClientScore(business, query, rerankOptions);
    const combinedScore = serverScore + clientScore;
    
    return {
      ...business,
      client_score: clientScore,
      combined_score: combinedScore,
      original_position: businesses.indexOf(business),
    };
  });
  
  // Sort by combined score, preserving original order for ties
  return businessesWithClientScores
    .sort((a, b) => {
      if (Math.abs(a.combined_score - b.combined_score) < 0.01) {
        return a.original_position - b.original_position;
      }
      return b.combined_score - a.combined_score;
    })
    .map(({ client_score, combined_score, original_position, ...business }) => business);
}

/**
 * Get rerank statistics for debugging
 */
export function getRerankStats(
  originalResults: Business[],
  rerankedResults: Business[],
  query: string
): {
  enabled: boolean;
  query: string;
  originalCount: number;
  rerankedCount: number;
  positionChanges: Array<{ id: string; name: string; from: number; to: number; change: number }>;
  significantChanges: number;
} {
  const enabled = isClientRerankEnabled();
  const positionChanges: Array<{ id: string; name: string; from: number; to: number; change: number }> = [];
  
  if (enabled && originalResults.length === rerankedResults.length) {
    originalResults.forEach((business, originalIndex) => {
      const newIndex = rerankedResults.findIndex(b => b.id === business.id);
      if (newIndex !== -1 && newIndex !== originalIndex) {
        positionChanges.push({
          id: business.id,
          name: business.name,
          from: originalIndex,
          to: newIndex,
          change: originalIndex - newIndex, // Positive = moved up, negative = moved down
        });
      }
    });
  }
  
  return {
    enabled,
    query,
    originalCount: originalResults.length,
    rerankedCount: rerankedResults.length,
    positionChanges,
    significantChanges: positionChanges.filter(change => Math.abs(change.change) >= 2).length,
  };
}