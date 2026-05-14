import { Request, Response, NextFunction } from 'express';
import { RateLimiterAbstract, RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import admin from 'firebase-admin';

const redisUrl = process.env.REDIS_URL;
let redisClient: Redis | null = null;

if (redisUrl) {
  redisClient = new Redis(redisUrl, {
    enableOfflineQueue: false,
    enableReadyCheck: true,
  });
}

const createLimiterStore = (options: {
  points: number;
  duration: number;
  blockDuration: number;
  keyPrefix: string;
}): RateLimiterAbstract => {
  if (redisClient) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: options.keyPrefix,
      points: options.points,
      duration: options.duration,
      blockDuration: options.blockDuration,
      inmemoryBlockOnConsumed: options.points,
      inmemoryBlockDuration: options.blockDuration,
    });
  }

  return new RateLimiterMemory({
    keyPrefix: options.keyPrefix,
    points: options.points,
    duration: options.duration,
    blockDuration: options.blockDuration,
  });
};

const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1].trim();
};

const getRateLimitKey = async (req: Request): Promise<string> => {
  const token = getBearerToken(req);
  if (!token) {
    return `ip:${req.ip}`;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token, true);
    if (decoded && decoded.uid) {
      return `uid:${decoded.uid}`;
    }
  } catch {
    // Invalid token should still fall back to IP-based limiting.
  }

  return `ip:${req.ip}`;
};

const sendRateLimitResponse = (res: Response, msBeforeNext: number) => {
  const retryAfterSeconds = Math.ceil(msBeforeNext / 1000);
  res.set('Retry-After', String(retryAfterSeconds));
  res.set('Content-Type', 'application/json');
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
  });
};

export const createRateLimiter = (options: {
  points: number;
  duration: number;
  blockDuration: number;
  keyPrefix: string;
}) => {
  const limiter = createLimiterStore(options);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = await getRateLimitKey(req);
      const rateLimiterRes = await limiter.consume(key);
      res.set('X-RateLimit-Limit', String(options.points));
      res.set('X-RateLimit-Remaining', String(Math.max(0, rateLimiterRes.remainingPoints)));
      next();
    } catch (err: unknown) {
      if (err instanceof Error && 'msBeforeNext' in err) {
        return sendRateLimitResponse(res, Number((err as any).msBeforeNext));
      }

      next(err);
    }
  };
};

export const loginRateLimiter = createRateLimiter({
  points: 5,
  duration: 30 * 60,
  blockDuration: 30 * 60,
  keyPrefix: 'login',
});

export const registerRateLimiter = createRateLimiter({
  points: 3,
  duration: 60 * 60,
  blockDuration: 60 * 60,
  keyPrefix: 'register',
});

export const forgotPasswordRateLimiter = createRateLimiter({
  points: 3,
  duration: 60 * 60,
  blockDuration: 60 * 60,
  keyPrefix: 'forgot-password',
});

export const paymentRateLimiter = createRateLimiter({
  points: 8,
  duration: 30 * 60,
  blockDuration: 30 * 60,
  keyPrefix: 'payment',
});

export const withdrawalRateLimiter = createRateLimiter({
  points: 5,
  duration: 30 * 60,
  blockDuration: 30 * 60,
  keyPrefix: 'withdrawal',
});

export const depositRateLimiter = createRateLimiter({
  points: 5,
  duration: 30 * 60,
  blockDuration: 30 * 60,
  keyPrefix: 'deposit',
});

export const otpRateLimiter = createRateLimiter({
  points: 5,
  duration: 30 * 60,
  blockDuration: 30 * 60,
  keyPrefix: 'otp',
});

export const contactRateLimiter = createRateLimiter({
  points: 5,
  duration: 30 * 60,
  blockDuration: 30 * 60,
  keyPrefix: 'contact',
});

export const adminRateLimiter = createRateLimiter({
  points: 10,
  duration: 60 * 60,
  blockDuration: 60 * 60,
  keyPrefix: 'admin',
});
