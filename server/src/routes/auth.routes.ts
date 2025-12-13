// Authentication Routes
// POST /auth/login - User login

import { Router, Request, Response } from 'express';
import { login } from '../services/auth.service';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';

const router = Router();

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Email and password are required')
      );
      return;
    }

    const result = await login({ email, password });
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json(
      errorResponse(
        ErrorCodes.AUTH_FAILED,
        error instanceof Error ? error.message : 'Authentication failed'
      )
    );
  }
});

export default router;
