import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

/**
 * GET /api/admin/cli-bridge/jobs/[jobId]/stream
 * Server-Sent Events endpoint for real-time job progress updates
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { jobId } = await params;

  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true }
    });

    if (!userRecord || userRecord.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Verify job exists and user has access
    const job = await prisma.cLIJob.findUnique({
      where: { id: jobId },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check job access permissions
    if (userRecord.role !== 'ADMIN' && job.createdBy !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create Server-Sent Events stream
    const encoder = new TextEncoder();
    let isStreamClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        // Send initial job state
        const sendUpdate = (data: any, eventType = 'update') => {
          if (isStreamClosed) return;
          
          const sseData = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        };

        // Send initial job data
        sendUpdate({
          id: job.id,
          command: job.command,
          status: job.status,
          progress: job.progress,
          result: job.result,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          createdBy: {
            id: job.creator.id,
            email: job.creator.email
          },
          metadata: job.metadata
        }, 'initial');

        // Set up polling for job updates
        const pollInterval = setInterval(async () => {
          try {
            if (isStreamClosed) {
              clearInterval(pollInterval);
              return;
            }

            const updatedJob = await prisma.cLIJob.findUnique({
              where: { id: jobId },
              include: {
                creator: {
                  select: { id: true, email: true }
                }
              }
            });

            if (!updatedJob) {
              sendUpdate({ error: 'Job not found' }, 'error');
              clearInterval(pollInterval);
              controller.close();
              return;
            }

            // Send job update
            sendUpdate({
              id: updatedJob.id,
              command: updatedJob.command,
              status: updatedJob.status,
              progress: updatedJob.progress,
              result: updatedJob.result,
              createdAt: updatedJob.createdAt,
              startedAt: updatedJob.startedAt,
              completedAt: updatedJob.completedAt,
              createdBy: {
                id: updatedJob.creator.id,
                email: updatedJob.creator.email
              },
              metadata: updatedJob.metadata
            });

            // Close stream if job is complete
            if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(updatedJob.status)) {
              sendUpdate({ message: 'Job finished', status: updatedJob.status }, 'complete');
              clearInterval(pollInterval);
              controller.close();
            }

          } catch (error) {
            console.error('Error polling job updates:', error);
            sendUpdate({ error: 'Failed to fetch job updates' }, 'error');
            clearInterval(pollInterval);
            controller.close();
          }
        }, 1000); // Poll every 1 second for real-time updates

        // Handle stream cleanup
        request.signal?.addEventListener('abort', () => {
          isStreamClosed = true;
          clearInterval(pollInterval);
          controller.close();
        });

        // Send keep-alive ping every 30 seconds
        const keepAliveInterval = setInterval(() => {
          if (isStreamClosed) {
            clearInterval(keepAliveInterval);
            return;
          }
          
          const pingData = `event: ping\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(pingData));
        }, 30000);

        // Cleanup on stream close
        const cleanup = () => {
          isStreamClosed = true;
          clearInterval(pollInterval);
          clearInterval(keepAliveInterval);
        };

        // Handle cleanup on various events
        request.signal?.addEventListener('abort', cleanup);
        
        // Store cleanup function for later use
        (controller as any).cleanup = cleanup;
      },

      cancel() {
        isStreamClosed = true;
        if ((this as any).cleanup) {
          (this as any).cleanup();
        }
      }
    });

    // Return SSE response with proper headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });

  } catch (error) {
    console.error('SSE stream error:', error);
    return NextResponse.json({ 
      error: 'Failed to create progress stream' 
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/admin/cli-bridge/jobs/[jobId]/stream
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}