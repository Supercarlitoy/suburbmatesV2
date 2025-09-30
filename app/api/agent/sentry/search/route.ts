// Agent API: Sentry search proxy
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1),
  project: z.string().optional(),
  limit: z.number().optional().default(25)
});

export async function POST(request: NextRequest) {
  try {
    // Check agent authentication
    const agentToken = request.headers.get('x-agent-token');
    if (!agentToken || agentToken !== process.env.AGENT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, project, limit } = searchSchema.parse(body);

    const sentryToken = process.env.SENTRY_API_TOKEN;
    const sentryOrg = process.env.SENTRY_ORG;

    if (!sentryToken || !sentryOrg || sentryOrg === 'your-org') {
      return NextResponse.json({ 
        error: 'Sentry not configured',
        issues: [],
        mock: true
      });
    }

    // Search Sentry issues
    const sentryUrl = `https://sentry.io/api/0/organizations/${sentryOrg}/issues/`;
    const searchParams = new URLSearchParams({
      query: query,
      limit: limit.toString(),
      ...(project && { project: project })
    });

    const response = await fetch(`${sentryUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${sentryToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.statusText}`);
    }

    const issues = await response.json();

    // Log to audit trail
    // TODO: Wire to AuditLog model
    console.log(`Agent: Searched Sentry for "${query}", found ${issues.length} issues`);

    return NextResponse.json({
      issues,
      query,
      total: issues.length
    });

  } catch (error) {
    console.error('Agent Sentry search error:', error);
    
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