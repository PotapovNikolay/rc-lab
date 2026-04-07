import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ERROR]', err);

  // CORS errors
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({
      error: 'CORS policy: Origin not allowed',
      code: 403,
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    code: statusCode,
  });
};
