// Agent API: Feature flags management
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const flagSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
  audience: z.string().optional(),
  useRedis: z.boolean().optional().default(true)
});

export async function POST(request: NextRequest) {
  try {
    // Check agent authentication
    const agentToken = request.headers.get('x-agent-token');
    if (!agentToken || agentToken !== process.env.AGENT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, enabled, audience, useRedis } = flagSchema.parse(body);

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    const results = {
      database: false,
      redis: false
    };

    // Store in database (persistent storage)
    try {
      await prisma.featureFlag.upsert({
        where: { key },
        update: { 
          enabled, 
          audience,
          updatedAt: new Date()
        },
        create: { 
          key, 
          enabled, 
          audience
        }
      });
      results.database = true;
    } catch (error) {
      console.error('Database flag update error:', error);
    }

    // Store in Redis (fast access) if configured and requested
    if (useRedis && redisUrl && redisToken && !redisUrl.includes('your_') && !redisToken.includes('your_')) {
      try {
        const redisKey = `flag:${key}`;
        const redisValue = enabled ? '1' : '0';

        const response = await fetch(`${redisUrl}/SET/${encodeURIComponent(redisKey)}/${redisValue}`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        });

        if (response.ok) {
          results.redis = true;
        }
      } catch (error) {
        console.error('Redis flag update error:', error);
      }
    }

    // Log to audit trail
    // TODO: Wire to AuditLog model
    console.log(`Agent: Set feature flag "${key}" to ${enabled}, audience: ${audience || 'all'}`);

    return NextResponse.json({
      success: true,
      key,
      enabled,
      audience,
      storage: results
    });

  } catch (error) {
    console.error('Agent flags set error:', error);
    
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