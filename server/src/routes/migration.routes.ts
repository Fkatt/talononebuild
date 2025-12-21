// Migration Routes
// POST /migrate - Trigger migration between instances

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { migrate } from '../services/migration.service';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /migrate - Trigger migration
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { sourceId, destId, assets, newName } = req.body;

    // Validation
    if (!sourceId || !destId || !assets || !Array.isArray(assets)) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Missing required fields: sourceId, destId, assets (array)'
        )
      );
      return;
    }

    // If cloning to same instance, require a new name
    if (sourceId === destId && !newName) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'When cloning to the same instance, a new name must be provided'
        )
      );
      return;
    }

    const result = await migrate({
      sourceId,
      destId,
      assets,
      userId,
      newName,
    });

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Migration error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.MIGRATION_ERROR,
        error instanceof Error ? error.message : 'Migration failed'
      )
    );
  }
});

export default router;
