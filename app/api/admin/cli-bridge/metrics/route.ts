import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/server/auth/auth';
import { prisma } from '@/lib/database/prisma';

export const runtime = 'nodejs';

interface JobPerformanceMetrics {
  averageExecutionTime: Record<string, number>;
  successRate: Record<string, number>;
  commandFrequency: Record<string, number>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  dailyTrends: Array<{ date: string; completed: number; failed: number }>;
  resourceUsage: {
    cpu: number[];
    memory: number[];
    activeJobs: number;
  };
  queueMetrics: {
    averageWaitTime: Record<string, number>;
    throughput: Record<string, number>;
    peakHours: Array<{ hour: number; count: number }>;
  };
  userActivity: {
    mostActiveUsers: Array<{ email: string; jobCount: number }>;
    commandsByUser: Record<string, Record<string, number>>;
  };
  systemHealth: {
    failureRate: number;
    averageRecoveryTime: number;
    lastSystemError?: string;
    uptime: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || !(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d'; // 1h, 1d, 7d, 30d, all

    // Calculate date range for metrics
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'all':
        startDate = new Date('2023-01-01'); // Or your app launch date
        break;
    }

    // Fetch all CLI jobs within the time range
    const jobs = await prisma.cLIJob.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate performance metrics
    const metrics: JobPerformanceMetrics = {
      averageExecutionTime: {},
      successRate: {},
      commandFrequency: {},
      hourlyDistribution: [],
      dailyTrends: [],
      resourceUsage: {
        cpu: [],
        memory: [],
        activeJobs: 0,
      },
      queueMetrics: {
        averageWaitTime: {},
        throughput: {},
        peakHours: [],
      },
      userActivity: {
        mostActiveUsers: [],
        commandsByUser: {},
      },
      systemHealth: {
        failureRate: 0,
        averageRecoveryTime: 0,
        uptime: 100,
      },
    };

    // Command statistics
    const commandStats: Record<string, {
      total: number;
      successful: number;
      failed: number;
      totalExecutionTime: number;
      totalWaitTime: number;
    }> = {};

    // User activity tracking
    const userStats: Record<string, {
      jobCount: number;
      commands: Record<string, number>;
    }> = {};

    // Hourly and daily distribution
    const hourlyData: Record<number, number> = {};
    const dailyData: Record<string, { completed: number; failed: number; total: number }> = {};

    let totalJobs = jobs.length;
    let failedJobs = 0;
    let completedJobs = 0;
    let totalRecoveryTime = 0;
    let recoveryCount = 0;

    // Process jobs for metrics
    jobs.forEach(job => {
      const command = job.command;
      const userEmail = job.createdBy.email;
      const createdAt = new Date(job.createdAt);
      const startedAt = job.startedAt ? new Date(job.startedAt) : null;
      const completedAt = job.completedAt ? new Date(job.completedAt) : null;

      // Command statistics
      if (!commandStats[command]) {
        commandStats[command] = {
          total: 0,
          successful: 0,
          failed: 0,
          totalExecutionTime: 0,
          totalWaitTime: 0,
        };
      }

      commandStats[command].total++;

      // Calculate execution time if job is completed
      if (startedAt && completedAt) {
        const executionTime = completedAt.getTime() - startedAt.getTime();
        commandStats[command].totalExecutionTime += executionTime;
      }

      // Calculate wait time (time from created to started)
      if (startedAt) {
        const waitTime = startedAt.getTime() - createdAt.getTime();
        commandStats[command].totalWaitTime += waitTime;
      }

      // Track job outcomes
      if (job.status === 'COMPLETED') {
        commandStats[command].successful++;
        completedJobs++;
      } else if (job.status === 'FAILED') {
        commandStats[command].failed++;
        failedJobs++;
      }

      // Recovery time calculation (for failed jobs that were retried and succeeded)
      if (job.status === 'COMPLETED' && job.metadata.retryCount > 0) {
        // Estimate recovery time based on retry pattern
        const recoveryTime = completedAt ? completedAt.getTime() - createdAt.getTime() : 0;
        totalRecoveryTime += recoveryTime;
        recoveryCount++;
      }

      // User activity tracking
      if (!userStats[userEmail]) {
        userStats[userEmail] = { jobCount: 0, commands: {} };
      }
      userStats[userEmail].jobCount++;
      userStats[userEmail].commands[command] = (userStats[userEmail].commands[command] || 0) + 1;

      // Hourly distribution
      const hour = createdAt.getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;

      // Daily trends
      const dateKey = createdAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { completed: 0, failed: 0, total: 0 };
      }
      dailyData[dateKey].total++;
      if (job.status === 'COMPLETED') {
        dailyData[dateKey].completed++;
      } else if (job.status === 'FAILED') {
        dailyData[dateKey].failed++;
      }
    });

    // Calculate average execution times
    Object.entries(commandStats).forEach(([command, stats]) => {
      metrics.averageExecutionTime[command] = stats.successful > 0 
        ? stats.totalExecutionTime / stats.successful 
        : 0;
      
      metrics.successRate[command] = stats.total > 0 
        ? (stats.successful / stats.total) * 100 
        : 0;
      
      metrics.commandFrequency[command] = stats.total;
      
      // Queue metrics
      metrics.queueMetrics.averageWaitTime[command] = stats.total > 0 
        ? stats.totalWaitTime / stats.total 
        : 0;
      
      // Calculate throughput (jobs per hour)
      const timeRangeHours = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      metrics.queueMetrics.throughput[command] = stats.total / timeRangeHours;
    });

    // Hourly distribution
    metrics.hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyData[hour] || 0,
    }));

    // Daily trends (last 30 days or time range, whichever is smaller)
    const sortedDates = Object.keys(dailyData).sort();
    metrics.dailyTrends = sortedDates.slice(-30).map(date => ({
      date,
      completed: dailyData[date].completed,
      failed: dailyData[date].failed,
    }));

    // Peak hours (top 5)
    const peakHours = Object.entries(hourlyData)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    metrics.queueMetrics.peakHours = peakHours;

    // User activity (most active users)
    metrics.userActivity.mostActiveUsers = Object.entries(userStats)
      .map(([email, stats]) => ({ email, jobCount: stats.jobCount }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 10);

    // Commands by user
    Object.entries(userStats).forEach(([email, stats]) => {
      metrics.userActivity.commandsByUser[email] = stats.commands;
    });

    // System health metrics
    metrics.systemHealth.failureRate = totalJobs > 0 ? (failedJobs / totalJobs) * 100 : 0;
    metrics.systemHealth.averageRecoveryTime = recoveryCount > 0 ? totalRecoveryTime / recoveryCount : 0;
    metrics.systemHealth.uptime = Math.max(0, 100 - metrics.systemHealth.failureRate);

    // Mock resource usage (in production, this would come from system monitoring)
    const activeJobs = await prisma.cLIJob.count({
      where: { status: 'RUNNING' }
    });

    metrics.resourceUsage = {
      cpu: Array.from({ length: 24 }, (_, i) => {
        // Simulate CPU usage pattern
        const baseUsage = 20 + (i % 12) * 3; // Base pattern
        const noise = (Math.random() - 0.5) * 10; // Random variation
        return Math.max(0, Math.min(100, baseUsage + noise));
      }),
      memory: Array.from({ length: 24 }, (_, i) => {
        // Simulate memory usage pattern
        const baseUsage = 30 + (i % 8) * 4;
        const noise = (Math.random() - 0.5) * 8;
        return Math.max(0, Math.min(100, baseUsage + noise));
      }),
      activeJobs,
    };

    // Get recent system errors
    const recentFailedJob = await prisma.cLIJob.findFirst({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentFailedJob && recentFailedJob.result) {
      const result = recentFailedJob.result as any;
      metrics.systemHealth.lastSystemError = result.error || 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      metrics,
      metadata: {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalJobs,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching CLI job metrics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export configuration for edge compatibility
export const dynamic = 'force-dynamic';
export const revalidate = 0;