// Authentication Middleware
// JWT token verification for protected routes

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { errorResponse, ErrorCodes } from '../utils/response';

// Extend Express Request to include user data
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'No token provided'));
    return;
  }

  try {
    const decoded = jwt.verify(token, config.security.jwtSecret) as {
      id: number;
      email: string;
      role: string;
    };

    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(errorResponse(ErrorCodes.TOKEN_EXPIRED, 'Token expired'));
      return;
    }

    res.status(403).json(errorResponse(ErrorCodes.FORBIDDEN, 'Invalid token'));
    return;
  }
};
