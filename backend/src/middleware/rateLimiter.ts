// rateLimiter.ts - Limits login attempts to prevent brute force attacks
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  // 15 minutes
  windowMs: 15 * 60 * 1000,
  // Max 5 attempts per IP
  max: 5,
  // Send this message when limit is exceeded
  message: { message: 'Too many attempts, please try again in 15 minutes' },
  //   Use standard headers to inform the client about the limit
  standardHeaders: true,
  legacyHeaders: true,
});
