// AI Routes
// AI-powered features: generate, enhance, feedback

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { generate, enhance, submitFeedback } from '../services/ai.service';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /ai/generate - Generate rule JSON
router.post('/generate', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Missing required field: prompt')
      );
      return;
    }

    const result = await generate({ prompt, context });
    res.json(successResponse(result));
  } catch (error) {
    logger.error('AI generation error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'AI generation failed'
      )
    );
  }
});

// POST /ai/enhance - Enhance user prompt
router.post('/enhance', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Missing required field: prompt')
      );
      return;
    }

    const result = await enhance({ prompt });
    res.json(successResponse(result));
  } catch (error) {
    logger.error('AI enhancement error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'AI enhancement failed'
      )
    );
  }
});

// POST /ai/feedback - Submit AI feedback
router.post('/feedback', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, response, rating, feedback } = req.body;

    if (!prompt || !response || !rating) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Missing required fields: prompt, response, rating'
        )
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Rating must be between 1 and 5')
      );
      return;
    }

    const result = await submitFeedback({ prompt, response, rating, feedback });
    res.json(successResponse(result));
  } catch (error) {
    logger.error('AI feedback error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to submit feedback'
      )
    );
  }
});

export default router;
