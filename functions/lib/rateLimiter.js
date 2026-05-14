"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRateLimiter = exports.contactRateLimiter = exports.otpRateLimiter = exports.depositRateLimiter = exports.withdrawalRateLimiter = exports.paymentRateLimiter = exports.forgotPasswordRateLimiter = exports.registerRateLimiter = exports.loginRateLimiter = exports.createRateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const ioredis_1 = __importDefault(require("ioredis"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const redisUrl = process.env.REDIS_URL;
let redisClient = null;
if (redisUrl) {
    redisClient = new ioredis_1.default(redisUrl, {
        enableOfflineQueue: false,
        enableReadyCheck: true,
    });
}
const createLimiterStore = (options) => {
    if (redisClient) {
        return new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: options.keyPrefix,
            points: options.points,
            duration: options.duration,
            blockDuration: options.blockDuration,
            inmemoryBlockOnConsumed: options.points,
            inmemoryBlockDuration: options.blockDuration,
        });
    }
    return new rate_limiter_flexible_1.RateLimiterMemory({
        keyPrefix: options.keyPrefix,
        points: options.points,
        duration: options.duration,
        blockDuration: options.blockDuration,
    });
};
const getBearerToken = (req) => {
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
const getRateLimitKey = async (req) => {
    const token = getBearerToken(req);
    if (!token) {
        return `ip:${req.ip}`;
    }
    try {
        const decoded = await firebase_admin_1.default.auth().verifyIdToken(token, true);
        if (decoded && decoded.uid) {
            return `uid:${decoded.uid}`;
        }
    }
    catch {
        // Invalid token should still fall back to IP-based limiting.
    }
    return `ip:${req.ip}`;
};
const sendRateLimitResponse = (res, msBeforeNext) => {
    const retryAfterSeconds = Math.ceil(msBeforeNext / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    res.set('Content-Type', 'application/json');
    res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
    });
};
const createRateLimiter = (options) => {
    const limiter = createLimiterStore(options);
    return async (req, res, next) => {
        try {
            const key = await getRateLimitKey(req);
            const rateLimiterRes = await limiter.consume(key);
            res.set('X-RateLimit-Limit', String(options.points));
            res.set('X-RateLimit-Remaining', String(Math.max(0, rateLimiterRes.remainingPoints)));
            next();
        }
        catch (err) {
            if (err instanceof Error && 'msBeforeNext' in err) {
                return sendRateLimitResponse(res, Number(err.msBeforeNext));
            }
            next(err);
        }
    };
};
exports.createRateLimiter = createRateLimiter;
exports.loginRateLimiter = (0, exports.createRateLimiter)({
    points: 5,
    duration: 30 * 60,
    blockDuration: 30 * 60,
    keyPrefix: 'login',
});
exports.registerRateLimiter = (0, exports.createRateLimiter)({
    points: 3,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    keyPrefix: 'register',
});
exports.forgotPasswordRateLimiter = (0, exports.createRateLimiter)({
    points: 3,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    keyPrefix: 'forgot-password',
});
exports.paymentRateLimiter = (0, exports.createRateLimiter)({
    points: 8,
    duration: 30 * 60,
    blockDuration: 30 * 60,
    keyPrefix: 'payment',
});
exports.withdrawalRateLimiter = (0, exports.createRateLimiter)({
    points: 5,
    duration: 30 * 60,
    blockDuration: 30 * 60,
    keyPrefix: 'withdrawal',
});
exports.depositRateLimiter = (0, exports.createRateLimiter)({
    points: 5,
    duration: 30 * 60,
    blockDuration: 30 * 60,
    keyPrefix: 'deposit',
});
exports.otpRateLimiter = (0, exports.createRateLimiter)({
    points: 5,
    duration: 30 * 60,
    blockDuration: 30 * 60,
    keyPrefix: 'otp',
});
exports.contactRateLimiter = (0, exports.createRateLimiter)({
    points: 5,
    duration: 30 * 60,
    blockDuration: 30 * 60,
    keyPrefix: 'contact',
});
exports.adminRateLimiter = (0, exports.createRateLimiter)({
    points: 10,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    keyPrefix: 'admin',
});
