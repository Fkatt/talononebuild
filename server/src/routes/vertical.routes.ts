// Vertical Routes
// CRUD operations for managing industry verticals

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import {
  getAllVerticals,
  createVertical,
  deleteVertical,
} from '../services/vertical.service';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /verticals - List all verticals
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const verticals = await getAllVerticals();
    res.json(successResponse(verticals));
  } catch (error) {
    logger.error('Get verticals error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch verticals'
      )
    );
  }
});

// POST /verticals - Create new vertical
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Vertical name is required')
      );
      return;
    }

    const vertical = await createVertical(name.trim());
    res.status(201).json(successResponse(vertical));
  } catch (error: any) {
    logger.error('Create vertical error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      res.status(409).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Vertical already exists')
      );
      return;
    }

    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to create vertical'
      )
    );
  }
});

// DELETE /verticals/:id - Delete vertical
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id!, 10);

    if (isNaN(id)) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid vertical ID')
      );
      return;
    }

    await deleteVertical(id);
    res.json(successResponse({ message: 'Vertical deleted successfully' }));
  } catch (error: any) {
    logger.error('Delete vertical error:', error);

    if (error.code === 'P2025') {
      res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Vertical not found')
      );
      return;
    }

    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to delete vertical'
      )
    );
  }
});

export default router;
