import rateLimit from 'express-rate-limit';

// General rate limiter - 100 requests per minute
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Too many requests, please try again later',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generation rate limiter - 5 requests per minute (more strict)
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: 'Too many generation requests, please try again later',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
