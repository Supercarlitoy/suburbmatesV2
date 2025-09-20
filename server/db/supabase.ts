import { createClient } from "@supabase/supabase-js";

// Create Supabase client for server-side operations
// This is different from the auth client - used for direct database operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database configuration and utilities
export const DB_CONFIG = {
  // Connection settings
  maxConnections: 20,
  connectionTimeout: 30000, // 30 seconds
  
  // Query settings
  queryTimeout: 10000, // 10 seconds
  
  // Pagination defaults
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

/**
 * Database health check
 * Tests connection to Supabase
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Get database statistics
 * Returns basic stats about the database
 */
export async function getDatabaseStats() {
  try {
    const [usersResult, businessesResult, contentResult, leadsResult] = await Promise.all([
      supabase.from("users").select("count", { count: "exact", head: true }),
      supabase.from("businesses").select("count", { count: "exact", head: true }),
      supabase.from("content").select("count", { count: "exact", head: true }),
      supabase.from("leads").select("count", { count: "exact", head: true }),
    ]);

    return {
      users: usersResult.count || 0,
      businesses: businessesResult.count || 0,
      content: contentResult.count || 0,
      leads: leadsResult.count || 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to get database stats:", error);
    return {
      users: 0,
      businesses: 0,
      content: 0,
      leads: 0,
      lastUpdated: new Date().toISOString(),
      error: "Failed to fetch stats",
    };
  }
}

/**
 * Pagination helper
 * Calculates offset and validates page parameters
 */
export function getPaginationParams(page: number = 1, limit: number = DB_CONFIG.defaultPageSize) {
  // Validate and constrain parameters
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.min(Math.max(1, Math.floor(limit)), DB_CONFIG.maxPageSize);
  const offset = (validPage - 1) * validLimit;
  
  return {
    page: validPage,
    limit: validLimit,
    offset,
  };
}

/**
 * Search helper for text fields
 * Creates case-insensitive search conditions
 */
export function createSearchFilter(query: string, fields: string[]) {
  if (!query.trim()) {
    return null;
  }
  
  const searchTerm = `%${query.trim().toLowerCase()}%`;
  
  // Create OR conditions for multiple fields
  return fields.map(field => `${field}.ilike.${searchTerm}`).join(",");
}

/**
 * Date range filter helper
 * Creates date range conditions for queries
 */
export function createDateRangeFilter(startDate?: string, endDate?: string) {
  const filters: string[] = [];
  
  if (startDate) {
    filters.push(`createdAt.gte.${startDate}`);
  }
  
  if (endDate) {
    filters.push(`createdAt.lte.${endDate}`);
  }
  
  return filters.length > 0 ? filters.join(",") : null;
}