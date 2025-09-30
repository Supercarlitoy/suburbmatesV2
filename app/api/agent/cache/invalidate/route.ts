// Agent API: Cache invalidation
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidateTag, revalidatePath } from 'next/cache';

const invalidateSchema = z.object({
  type: z.enum(['tag', 'path', 'redis-key']),
  value: z.string().min(1),
  pattern: z.boolean().optional().default(false) // For Redis key patterns
});

export async function POST(request: NextRequest) {
  try {
    // Check agent authentication
    const agentToken = request.headers.get('x-agent-token');
    if (!agentToken || agentToken !== process.env.AGENT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, value, pattern } = invalidateSchema.parse(body);

    const results = {
      nextjs: false,
      redis: false
    };

    // Next.js cache invalidation
    if (type === 'tag') {
      try {
        revalidateTag(value);
        results.nextjs = true;
        console.log(`Agent: Invalidated Next.js cache tag: ${value}`);
      } catch (error) {
        console.error('Next.js tag revalidation error:', error);
      }
    } else if (type === 'path') {
      try {
        revalidatePath(value);
        results.nextjs = true;
        console.log(`Agent: Invalidated Next.js cache path: ${value}`);
      } catch (error) {
        console.error('Next.js path revalidation error:', error);
      }
    }

    // Redis cache invalidation
    if (type === 'redis-key') {
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (redisUrl && redisToken && !redisUrl.includes('your_') && !redisToken.includes('your_')) {
        try {
          
          if (pattern) {
            // Use KEYS to find matching patterns, then delete
            const keysResponse = await fetch(`${redisUrl}/KEYS/${encodeURIComponent(value)}`, {
              headers: {
                'Authorization': `Bearer ${redisToken}`
              }
            });
            
            if (keysResponse.ok) {
              const keysData = await keysResponse.json();
const keys = (keysData.result as string[]) || [];
              
              if (keys.length > 0) {
                // Delete multiple keys
const deleteResponse = await fetch(`${redisUrl}/DEL/${(keys as string[]).map((k: string) => encodeURIComponent(k)).join('/')}`, {
                  headers: {
                    'Authorization': `Bearer ${redisToken}`
                  }
                });
                
                if (deleteResponse.ok) {
                  results.redis = true;
                  console.log(`Agent: Deleted ${keys.length} Redis keys matching pattern: ${value}`);
                }
              }
            }
          } else {
            // Delete single key
            const response = await fetch(`${redisUrl}/DEL/${encodeURIComponent(value)}`, {
              headers: {
                'Authorization': `Bearer ${redisToken}`
              }
            });
            
            if (response.ok) {
              results.redis = true;
              console.log(`Agent: Deleted Redis key: ${value}`);
            }
          }
        } catch (error) {
          console.error('Redis cache invalidation error:', error);
        }
      } else {
        console.log(`Agent: Redis not configured, skipping cache invalidation for: ${value}`);
      }
    }

    // Log to audit trail
    // TODO: Wire to AuditLog model
    console.log(`Agent: Cache invalidation requested - type: ${type}, value: ${value}, pattern: ${pattern}`);

    return NextResponse.json({
      success: true,
      type,
      value,
      pattern,
      invalidated: results
    });

  } catch (error) {
    console.error('Agent cache invalidate error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}