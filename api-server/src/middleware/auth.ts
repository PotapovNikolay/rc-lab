import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/api/health') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header',
      code: 401,
    });
  }

  const token = authHeader.substring(7);

  if (token !== config.apiToken) {
    return res.status(403).json({
      error: 'Invalid API token',
      code: 403,
    });
  }

  next();
};
