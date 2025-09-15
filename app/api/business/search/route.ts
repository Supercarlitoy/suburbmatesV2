import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().optional(),
  suburb: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  clientRerank: z.boolean().optional().default(false),
});

interface SearchSuggestion {
  type: 'suburb' | 'category';
  original: string;
  suggestion: string;
  similarity: number;
}

// Generate "did you mean" suggestions using trigram similarity
async function generateSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = [];
  
  try {
    // Get suburb suggestions
    const suburbSuggestions = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT suburb, similarity(unaccent(suburb), unaccent($1)) as sim
      FROM "businesses" 
      WHERE similarity(unaccent(suburb), unaccent($2)) > 0.3
      ORDER BY sim DESC
      LIMIT 3
    `, query, query) as any[];
    
    suburbSuggestions.forEach(row => {
      suggestions.push({
        type: 'suburb',
        original: query,
        suggestion: row.suburb,
        similarity: parseFloat(row.sim)
      });
    });
    
    // Get category suggestions
    const categorySuggestions = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT category, similarity(unaccent(category), unaccent($1)) as sim
      FROM "businesses" 
      WHERE category IS NOT NULL 
        AND similarity(unaccent(category), unaccent($2)) > 0.3
      ORDER BY sim DESC
      LIMIT 3
    `, query, query) as any[];
    
    categorySuggestions.forEach(row => {
      suggestions.push({
        type: 'category',
        original: query,
        suggestion: row.category,
        similarity: parseFloat(row.sim)
      });
    });
    
  } catch (error: unknown) {
    console.error('Error generating suggestions:', error);
  }
  
  return suggestions.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      query: searchParams.get('query') || undefined,
      suburb: searchParams.get('suburb') || undefined,
      category: searchParams.get('category') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      clientRerank: searchParams.get('clientRerank') === 'true',
    };

    const validatedParams = searchSchema.parse(params);

    let businesses: any[] = [];
    let totalCount = 0;
    let suggestions: SearchSuggestion[] = [];

    if (validatedParams.query) {
      // Advanced search with FTS + trigram similarity
      const searchQuery = validatedParams.query.trim();
      
      const searchSql = `
        SELECT 
          b.*,
          (
            -- FTS ranking (semantic relevance)
            COALESCE(ts_rank(b."searchVector", websearch_to_tsquery('english', $1)), 0) * 0.6 +
            -- Trigram similarity for name (typo tolerance)
            GREATEST(
              similarity(unaccent(b.name), unaccent($2)),
              similarity(unaccent(b.name), unaccent($3))
            ) * 0.3 +
            -- Trigram similarity for category
            similarity(unaccent(COALESCE(b.category, '')), unaccent($4)) * 0.1
          ) as search_score
        FROM "businesses" b
        WHERE 
          b.status = 'APPROVED'
          AND (
            -- Full-text search match
            b."searchVector" @@ websearch_to_tsquery('english', $5)
            OR
            -- Trigram similarity fallback (typo tolerance)
            similarity(unaccent(b.name), unaccent($6)) > 0.2
            OR
            similarity(unaccent(COALESCE(b.category, '')), unaccent($7)) > 0.3
            OR
            similarity(unaccent(b.suburb), unaccent($8)) > 0.4
          )
          ${validatedParams.suburb ? 'AND (b.suburb ILIKE $9 OR b."serviceAreas" ILIKE $10)' : ''}
          ${validatedParams.category ? `AND similarity(unaccent(COALESCE(b.category, '')), unaccent($${validatedParams.suburb ? '11' : '9'})) > 0.3` : ''}
        ORDER BY search_score DESC, b."createdAt" DESC
        LIMIT $${validatedParams.suburb && validatedParams.category ? '12' : validatedParams.suburb || validatedParams.category ? '10' : '9'}
        OFFSET $${validatedParams.suburb && validatedParams.category ? '13' : validatedParams.suburb || validatedParams.category ? '11' : '10'}
      `;

      const queryParams = [
        searchQuery, // $1 - for ts_rank
        searchQuery, // $2 - for name similarity
        searchQuery, // $3 - for name similarity (duplicate for GREATEST)
        searchQuery, // $4 - for category similarity
        searchQuery, // $5 - for websearch_to_tsquery
        searchQuery, // $6 - for name trigram
        searchQuery, // $7 - for category trigram
        searchQuery, // $8 - for suburb trigram
      ];

      if (validatedParams.suburb) {
        queryParams.push(`%${validatedParams.suburb}%`, `%${validatedParams.suburb}%`);
      }
      if (validatedParams.category) {
        queryParams.push(validatedParams.category);
      }
      queryParams.push(validatedParams.limit.toString(), validatedParams.offset.toString());

      businesses = await prisma.$queryRawUnsafe(searchSql, ...queryParams);

      // Get total count for pagination
      const countSql = `
        SELECT COUNT(*) as count
        FROM "businesses" b
        WHERE 
          b.status = 'APPROVED'
          AND (
            b."searchVector" @@ websearch_to_tsquery('english', $1)
            OR
            similarity(unaccent(b.name), unaccent($2)) > 0.2
            OR
            similarity(unaccent(COALESCE(b.category, '')), unaccent($3)) > 0.3
            OR
            similarity(unaccent(b.suburb), unaccent($4)) > 0.4
          )
          ${validatedParams.suburb ? 'AND (b.suburb ILIKE $5 OR b."serviceAreas" ILIKE $6)' : ''}
          ${validatedParams.category ? `AND similarity(unaccent(COALESCE(b.category, '')), unaccent($${validatedParams.suburb ? '7' : '5'})) > 0.3` : ''}
      `;

      const countParams = [searchQuery, searchQuery, searchQuery, searchQuery];
      if (validatedParams.suburb) {
        countParams.push(`%${validatedParams.suburb}%`, `%${validatedParams.suburb}%`);
      }
      if (validatedParams.category) {
        countParams.push(validatedParams.category);
      }

      const countResult = await prisma.$queryRawUnsafe(countSql, ...countParams) as any[];
      totalCount = parseInt(countResult[0]?.count || '0');

      // Generate "did you mean" suggestions if results are thin
      if (businesses.length < 3) {
        suggestions = await generateSearchSuggestions(searchQuery);
      }
    } else {
      // Fallback to basic filtering when no search query
      const whereClause: any = {
        status: 'APPROVED',
      };

      if (validatedParams.suburb) {
        whereClause.OR = [
          { suburb: { equals: validatedParams.suburb, mode: 'insensitive' } },
          { serviceAreas: { contains: validatedParams.suburb, mode: 'insensitive' } },
        ];
      }

      if (validatedParams.category) {
        whereClause.category = { equals: validatedParams.category, mode: 'insensitive' };
      }

      [businesses, totalCount] = await Promise.all([
        prisma.business.findMany({
          where: whereClause,
          select: {
            id: true,
            slug: true,
            name: true,
            bio: true,
            suburb: true,
            category: true,
            phone: true,
            email: true,
            website: true,
            logo: true,
            serviceAreas: true,
            status: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
          take: validatedParams.limit,
          skip: validatedParams.offset,
        }),
        prisma.business.count({ where: whereClause }),
      ]);
    }

    // Parse serviceAreas JSON for all businesses
    const processedBusinesses = businesses.map((business: any) => ({
      ...business,
      serviceAreas: business.serviceAreas ? 
        (typeof business.serviceAreas === 'string' ? 
          JSON.parse(business.serviceAreas) : business.serviceAreas) : [],
      search_score: business.search_score || 0,
    }));

    return NextResponse.json({
      businesses: processedBusinesses,
      pagination: {
        total: totalCount,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasMore: validatedParams.offset + validatedParams.limit < totalCount,
      },
      suggestions,
      filters: {
        query: validatedParams.query,
        suburb: validatedParams.suburb,
        category: validatedParams.category,
      },
      clientRerank: validatedParams.clientRerank,
    });
  } catch (error: unknown) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint for advanced search with complex filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedParams = searchSchema.parse(body);

    // Use the same logic as GET but with more complex filtering options
    const searchParams = new URLSearchParams();
    if (validatedParams.query) searchParams.set('query', validatedParams.query);
    if (validatedParams.suburb) searchParams.set('suburb', validatedParams.suburb);
    if (validatedParams.category) searchParams.set('category', validatedParams.category);
    searchParams.set('limit', validatedParams.limit.toString());
    searchParams.set('offset', validatedParams.offset.toString());
    if (validatedParams.clientRerank) searchParams.set('clientRerank', 'true');

    // Create a mock request to reuse GET logic
    const mockRequest = new NextRequest(`${request.url}?${searchParams.toString()}`);
    return await GET(mockRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST search error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}