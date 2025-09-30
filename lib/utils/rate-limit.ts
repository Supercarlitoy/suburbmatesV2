/**
 * Rate Limiting Utility using Upstash Redis
 * 
 * Implements sliding window rate limiting for different types of requests
 * with configurable limits and time windows.
 */

// Redis configuration (using Upstash REST API)
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export interface RateLimitConfig {
  requests: number;      // Number of requests allowed
  window: number;        // Time window in seconds
  identifier: string;    // Unique identifier for the rate limit (IP, user ID, etc.)
}

export interface RateLimitResult {
  success: boolean;      // Whether request is within limit
  remaining: number;     // Requests remaining in current window
  resetTime: number;     // When the rate limit resets (timestamp)
  retryAfter?: number;   // Seconds to wait before retrying
}

/**
 * Redis client wrapper for Upstash REST API
 */
class UpstashRedis {
  private baseUrl: string;
  private token: string;

  constructor() {
    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Upstash Redis configuration missing');
    }
    this.baseUrl = UPSTASH_REDIS_REST_URL;
    this.token = UPSTASH_REDIS_REST_TOKEN;
  }

  async execute(command: string[]): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Redis error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async incr(key: string): Promise<number> {
    return this.execute(['INCR', key]);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.execute(['EXPIRE', key, seconds.toString()]);
  }

  async ttl(key: string): Promise<number> {
    return this.execute(['TTL', key]);
  }

  async get(key: string): Promise<string | null> {
    return this.execute(['GET', key]);
  }

  async del(key: string): Promise<number> {
    return this.execute(['DEL', key]);
  }
}

// Initialize Redis client
let redis: UpstashRedis | null = null;
try {
  redis = new UpstashRedis();
} catch (error) {
  console.warn('Rate limiting disabled: Redis not configured');
}

/**
 * Sliding window rate limiter
 */
export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  // If Redis is not configured, allow all requests (development mode)
  if (!redis) {
    return {
      success: true,
      remaining: config.requests - 1,
      resetTime: Date.now() + (config.window * 1000),
    };
  }

  const key = `rate_limit:${config.identifier}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    // Get current count and TTL
    const [count, ttl] = await Promise.all([
      redis.get(key),
      redis.ttl(key),
    ]);

    const currentCount = count ? parseInt(count) : 0;
    const resetTime = ttl > 0 ? now + ttl : now + config.window;

    // Check if limit is exceeded
    if (currentCount >= config.requests) {
      return {
        success: false,
        remaining: 0,
        resetTime: resetTime * 1000,
        retryAfter: ttl > 0 ? ttl : config.window,
      };
    }

    // Increment counter
    const newCount = await redis.incr(key);

    // Set expiration if this is the first request in the window
    if (newCount === 1) {
      await redis.expire(key, config.window);
    }

    return {
      success: true,
      remaining: Math.max(0, config.requests - newCount),
      resetTime: (now + config.window) * 1000,
    };

  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request (fail open)
    return {
      success: true,
      remaining: config.requests - 1,
      resetTime: Date.now() + (config.window * 1000),
    };
  }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Lead forms: 3 submissions per IP per hour
  LEAD_FORM: {
    requests: 3,
    window: 3600, // 1 hour
  },

  // Support tickets: 5 per IP per day
  SUPPORT_FORM: {
    requests: 5,
    window: 86400, // 24 hours
  },

  // Business registrations: 2 per IP per day
  BUSINESS_REGISTRATION: {
    requests: 2,
    window: 86400, // 24 hours
  },

  // API endpoints: 100 requests per IP per minute
  API_GENERAL: {
    requests: 100,
    window: 60, // 1 minute
  },

  // Search API: 30 requests per IP per minute
  SEARCH_API: {
    requests: 30,
    window: 60, // 1 minute
  },

  // Authentication: 5 attempts per IP per 15 minutes
  AUTH_ATTEMPTS: {
    requests: 5,
    window: 900, // 15 minutes
  },

  // Email sending: 10 emails per user per hour
  EMAIL_SENDING: {
    requests: 10,
    window: 3600, // 1 hour
  },

  // CSV import: 3 imports per user per day
  CSV_IMPORT: {
    requests: 3,
    window: 86400, // 24 hours
  },
};

/**
 * Helper function to get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  // Check various headers that might contain the real IP
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim();
    }
  }

  // Fallback
  return '127.0.0.1';
}

/**
 * Middleware helper for Next.js API routes
 */
export function withRateLimit(config: Omit<RateLimitConfig, 'identifier'>) {
  return async function rateLimitMiddleware(
    req: Request,
    identifier?: string
  ): Promise<RateLimitResult> {
    // Use provided identifier or fall back to IP
    const id = identifier || getClientIP(new Headers(req.headers as any));
    
    return rateLimit({
      ...config,
      identifier: id,
    });
  };
}

/**
 * Rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString(),
    }),
  };
}

/**
 * Clear rate limit for testing or administrative purposes
 */
export async function clearRateLimit(identifier: string): Promise<boolean> {
  if (!redis) return true;

  try {
    const key = `rate_limit:${identifier}`;
    const deleted = await redis.del(key);
    return deleted > 0;
  } catch (error) {
    console.error('Error clearing rate limit:', error);
    return false;
  }
}

export default rateLimit;