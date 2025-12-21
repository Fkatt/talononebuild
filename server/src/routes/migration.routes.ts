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
    const { sourceId, destId, assets, newName, appNames, copySchema } = req.body;

    console.log('=== MIGRATION REQUEST RECEIVED ===');
    console.log('userId:', userId);
    console.log('sourceId:', sourceId, 'destId:', destId);
    console.log('assets:', JSON.stringify(assets));
    console.log('newName:', newName);
    console.log('appNames:', JSON.stringify(appNames));
    console.log('copySchema:', copySchema);

    logger.info('Migration request received:', {
      userId,
      sourceId,
      destId,
      assetsCount: assets?.length,
      newName,
      appNames,
      copySchema,
      sameInstance: sourceId === destId
    });

    // Validation
    if (!sourceId || !destId || !assets || !Array.isArray(assets)) {
      logger.warn('Validation failed: missing required fields');
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Missing required fields: sourceId, destId, assets (array)'
        )
      );
      return;
    }

    // If cloning to same instance, require names (either newName or appNames)
    if (sourceId === destId && !newName && !appNames) {
      logger.warn('Validation failed: same instance but no names provided', {
        newName,
        appNames,
        hasNewName: !!newName,
        hasAppNames: !!appNames,
        appNamesKeys: appNames ? Object.keys(appNames) : null
      });
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          `DEBUG: newName=${newName}, appNames=${JSON.stringify(appNames)}, hasAppNames=${!!appNames}, type=${typeof appNames}, keys=${appNames ? Object.keys(appNames).length : 0}`
        )
      );
      return;
    }

    logger.info('Validation passed, calling migrate service');

    const result = await migrate({
      sourceId,
      destId,
      assets,
      userId,
      newName,
      appNames,
      copySchema,
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
