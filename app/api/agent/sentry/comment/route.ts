// Agent API: Sentry comment proxy
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const commentSchema = z.object({
  issueId: z.string().min(1),
  comment: z.string().min(1).max(1000)
});

export async function POST(request: NextRequest) {
  try {
    // Check agent authentication
    const agentToken = request.headers.get('x-agent-token');
    if (!agentToken || agentToken !== process.env.AGENT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { issueId, comment } = commentSchema.parse(body);

    const sentryToken = process.env.SENTRY_API_TOKEN;
    const sentryOrg = process.env.SENTRY_ORG;

    if (!sentryToken || !sentryOrg || sentryOrg === 'your-org') {
      return NextResponse.json({ 
        error: 'Sentry not configured',
        success: false,
        mock: true
      });
    }

    // Add comment to Sentry issue
    const sentryUrl = `https://sentry.io/api/0/issues/${issueId}/comments/`;
    
    const response = await fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sentryToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: comment
      })
    });

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Log to audit trail
    // TODO: Wire to AuditLog model
    console.log(`Agent: Added comment to Sentry issue ${issueId}`);

    return NextResponse.json({
      success: true,
      commentId: result.id,
      issueId
    });

  } catch (error) {
    console.error('Agent Sentry comment error:', error);
    
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