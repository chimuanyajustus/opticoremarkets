import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import admin from 'firebase-admin';
import {
  adminRateLimiter,
  contactRateLimiter,
  depositRateLimiter,
  forgotPasswordRateLimiter,
  loginRateLimiter,
  otpRateLimiter,
  paymentRateLimiter,
  registerRateLimiter,
  withdrawalRateLimiter,
} from './rateLimiter';

const app = express();

app.set('trust proxy', true);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ALLOW_ORIGINS?.split(',').map((origin) => origin.trim()) || true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'];
  if (!userAgent || typeof userAgent !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Bad request.',
    });
  }

  next();
});

app.get('/healthz', (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: 'API healthy' });
});

app.post('/auth/login', loginRateLimiter, (req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Login endpoint is not implemented in this deployment.',
  });
});

app.post('/auth/register', registerRateLimiter, (req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Register endpoint is not implemented in this deployment.',
  });
});

app.post('/auth/forgot-password', forgotPasswordRateLimiter, (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Forgot password endpoint is not implemented in this deployment.',
  });
});

app.use('/admin', adminRateLimiter);
app.use('/admin', (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Admin endpoint placeholder. Apply your admin handlers here.',
  });
});

app.use('/payments', paymentRateLimiter);
app.use('/payments', (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Payment endpoint placeholder. Apply your payment handlers here.',
  });
});

app.post('/withdrawals', withdrawalRateLimiter, (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Withdrawal endpoint is not implemented in this deployment.',
  });
});

app.post('/deposits', depositRateLimiter, (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Deposit endpoint is not implemented in this deployment.',
  });
});

app.use('/otp', otpRateLimiter);
app.use('/otp', (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'OTP endpoint placeholder. Apply your OTP handlers here.',
  });
});

app.post('/contact', contactRateLimiter, (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    message: 'Contact form endpoint is not implemented in this deployment.',
  });
});

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint not found.',
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Secure API error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});

export default app;
