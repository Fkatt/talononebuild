// Backup Routes
// Backup creation, restoration, and management

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import {
  createBackup,
  restoreBackup,
  listBackups,
  getBackup,
  deleteBackup,
} from '../services/backup.service';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /backups - List all backups
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const backups = await listBackups(userId);
    res.json(successResponse(backups));
  } catch (error) {
    logger.error('List backups error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to list backups'
      )
    );
  }
});

// GET /backups/:id - Get single backup
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const backupId = parseInt(req.params.id!, 10);
    const backup = await getBackup(backupId);
    res.json(successResponse(backup));
  } catch (error) {
    logger.error('Get backup error:', error);
    res.status(404).json(
      errorResponse(
        ErrorCodes.NOT_FOUND,
        error instanceof Error ? error.message : 'Backup not found'
      )
    );
  }
});

// POST /backups/create - Create backup
router.post('/create', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { instanceId, name } = req.body;

    if (!instanceId || !name) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Missing required fields: instanceId, name')
      );
      return;
    }

    const backup = await createBackup({
      instanceId,
      name,
      userId,
    });

    res.status(201).json(successResponse(backup));
  } catch (error) {
    logger.error('Create backup error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to create backup'
      )
    );
  }
});

// POST /backups/restore - Restore from backup
router.post('/restore', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { backupId, targetInstanceId } = req.body;

    if (!backupId || !targetInstanceId) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Missing required fields: backupId, targetInstanceId'
        )
      );
      return;
    }

    const result = await restoreBackup({
      backupId,
      targetInstanceId,
      userId,
    });

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Restore backup error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to restore backup'
      )
    );
  }
});

// DELETE /backups/:id - Delete backup
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const backupId = parseInt(req.params.id!, 10);
    await deleteBackup(backupId);
    res.json(successResponse({ message: 'Backup deleted successfully' }));
  } catch (error) {
    logger.error('Delete backup error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to delete backup'
      )
    );
  }
});

export default router;
