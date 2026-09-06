import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * JWT Authentication Middleware
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Optional Auth Middleware
 * Doesn't fail if no token, just sets userId if present
 */
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = AuthService.verifyToken(token);

      if (decoded) {
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even on error
  }
};

export default authMiddleware;
