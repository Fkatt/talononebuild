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
  getBackupCountsByVertical,
} from '../services/backup.service';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';
import prisma from '../models/prisma';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /backups - List all backups (optional vertical filter)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const vertical = req.query.vertical as string | undefined;
    const backups = await listBackups(userId, vertical);
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

// GET /backups/stats/counts - Get backup counts by vertical
router.get('/stats/counts', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const counts = await getBackupCountsByVertical();
    res.json(successResponse(counts));
  } catch (error) {
    logger.error('Get backup counts error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to get backup counts'
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
    const { backupId, targetInstanceId, newName } = req.body;

    if (!backupId || !targetInstanceId || !newName) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Missing required fields: backupId, targetInstanceId, newName'
        )
      );
      return;
    }

    const result = await restoreBackup({
      backupId,
      targetInstanceId,
      userId,
      newName,
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

// GET /backups/:id/download - Download backup as JSON file
router.get('/:id/download', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const backupId = parseInt(req.params.id!, 10);
    const backup = await getBackup(backupId);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${backup.name.replace(/[^a-z0-9]/gi, '_')}-${backup.id}.json"`);

    // Send the backup data as JSON
    res.send(JSON.stringify(backup.data, null, 2));
  } catch (error) {
    logger.error('Download backup error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to download backup'
      )
    );
  }
});

// POST /backups/upload - Upload backup from JSON file
router.post('/upload', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, data, instanceId, vertical } = req.body;

    if (!name || !data) {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Missing required fields: name, data')
      );
      return;
    }

    // Calculate size of backup data
    const backupSize = JSON.stringify(data).length;

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        name,
        instanceId: instanceId ? parseInt(instanceId.toString(), 10) : undefined,
        data,
        size: backupSize,
        vertical: vertical || 'Uploaded',
      },
    });

    logger.info(`Uploaded backup: ${backup.name} (${backupSize} bytes) for vertical: ${backup.vertical}`);

    res.status(201).json(
      successResponse({
        id: backup.id,
        name: backup.name,
        instanceId: backup.instanceId,
        createdAt: backup.createdAt,
        size: backup.size,
        vertical: backup.vertical,
      })
    );
  } catch (error) {
    logger.error('Upload backup error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to upload backup'
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
