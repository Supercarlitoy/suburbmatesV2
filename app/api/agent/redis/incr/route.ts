// Agent API: Redis increment proxy
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const incrSchema = z.object({
  key: z.string().min(1),
  amount: z.number().optional().default(1),
  ttl: z.number().optional() // TTL in seconds
});

export async function POST(request: NextRequest) {
  try {
    // Check agent authentication
    const agentToken = request.headers.get('x-agent-token');
    if (!agentToken || agentToken !== process.env.AGENT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, amount, ttl } = incrSchema.parse(body);

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken || redisUrl.includes('your_') || redisToken.includes('your_')) {
      // Mock response for development
      return NextResponse.json({ 
        success: true,
        key,
        newValue: Math.floor(Math.random() * 100) + amount,
        mock: true
      });
    }

    // Prepare Redis pipeline commands
    const commands = [];
    
    if (amount === 1) {
      commands.push(['INCR', key]);
    } else {
      commands.push(['INCRBY', key, amount]);
    }
    
    // Set TTL if specified
    if (ttl) {
      commands.push(['EXPIRE', key, ttl]);
    }

    // Execute Redis pipeline
    const response = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redisToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands)
    });

    if (!response.ok) {
      throw new Error(`Redis API error: ${response.statusText}`);
    }

    const results = await response.json();
    const newValue = results[0]?.result;

    // Log to audit trail
    // TODO: Wire to AuditLog model
    console.log(`Agent: Incremented Redis key "${key}" by ${amount}, new value: ${newValue}`);

    return NextResponse.json({
      success: true,
      key,
      newValue,
      ttlSet: !!ttl
    });

  } catch (error) {
    console.error('Agent Redis incr error:', error);
    
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