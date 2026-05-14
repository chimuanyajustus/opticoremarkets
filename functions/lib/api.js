"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const rateLimiter_1 = require("./rateLimiter");
const app = (0, express_1.default)();
app.set('trust proxy', true);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ALLOW_ORIGINS?.split(',').map((origin) => origin.trim()) || true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
}));
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: false, limit: '10kb' }));
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'];
    if (!userAgent || typeof userAgent !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Bad request.',
        });
    }
    next();
});
app.get('/healthz', (_req, res) => {
    return res.status(200).json({ success: true, message: 'API healthy' });
});
app.post('/auth/login', rateLimiter_1.loginRateLimiter, (req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Login endpoint is not implemented in this deployment.',
    });
});
app.post('/auth/register', rateLimiter_1.registerRateLimiter, (req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Register endpoint is not implemented in this deployment.',
    });
});
app.post('/auth/forgot-password', rateLimiter_1.forgotPasswordRateLimiter, (_req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Forgot password endpoint is not implemented in this deployment.',
    });
});
app.use('/admin', rateLimiter_1.adminRateLimiter);
app.use('/admin', (_req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Admin endpoint placeholder. Apply your admin handlers here.',
    });
});
app.use('/payments', rateLimiter_1.paymentRateLimiter);
app.use('/payments', (_req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Payment endpoint placeholder. Apply your payment handlers here.',
    });
});
app.post('/withdrawals', rateLimiter_1.withdrawalRateLimiter, (_req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Withdrawal endpoint is not implemented in this deployment.',
    });
});
app.post('/deposits', rateLimiter_1.depositRateLimiter, (_req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Deposit endpoint is not implemented in this deployment.',
    });
});
app.use('/otp', rateLimiter_1.otpRateLimiter);
app.use('/otp', (_req, res) => {
    return res.status(501).json({
        success: false,
        message: 'OTP endpoint placeholder. Apply your OTP handlers here.',
    });
});
app.post('/contact', rateLimiter_1.contactRateLimiter, (_req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Contact form endpoint is not implemented in this deployment.',
    });
});
app.use((_req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Endpoint not found.',
    });
});
app.use((err, _req, res, _next) => {
    console.error('Secure API error:', err);
    return res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});
exports.default = app;
