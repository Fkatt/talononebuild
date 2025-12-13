// Instance Routes
// CRUD operations and connection testing for instances

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import {
  getUserInstances,
  getInstance,
  createInstance,
  updateInstance,
  deleteInstance,
  testConnection,
  updateInstanceBundle,
} from '../services/instance.service';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /instances - List all instances for the authenticated user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const instances = await getUserInstances(userId);
    res.json(successResponse(instances));
  } catch (error) {
    logger.error('Get instances error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch instances'
      )
    );
  }
});

// GET /instances/:id - Get single instance
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    const instance = await getInstance(instanceId, userId);
    res.json(successResponse(instance));
  } catch (error) {
    logger.error('Get instance error:', error);
    res.status(404).json(
      errorResponse(
        ErrorCodes.NOT_FOUND,
        error instanceof Error ? error.message : 'Instance not found'
      )
    );
  }
});

// POST /instances - Create new instance
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, type, region, url, credentials, bundleId } = req.body;

    // Validation
    if (!name || !type || !region || !url || !credentials) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Missing required fields: name, type, region, url, credentials'
        )
      );
      return;
    }

    if (type !== 'talon' && type !== 'contentful') {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Type must be "talon" or "contentful"')
      );
      return;
    }

    // Test connection before creating
    const connectionTest = await testConnection({ type, url, credentials });

    if (!connectionTest.success) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.CONNECTION_TEST_FAILED,
          connectionTest.error || 'Connection test failed'
        )
      );
      return;
    }

    const instance = await createInstance({
      name,
      type,
      region,
      url,
      credentials,
      bundleId,
      userId,
    });

    res.status(201).json(successResponse(instance));
  } catch (error) {
    logger.error('Create instance error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to create instance'
      )
    );
  }
});

// PUT /instances/:id - Update instance
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;
    const { name, region, url, credentials, bundleId } = req.body;

    const instance = await updateInstance(instanceId, userId, {
      name,
      region,
      url,
      credentials,
      bundleId,
    });

    res.json(successResponse(instance));
  } catch (error) {
    logger.error('Update instance error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to update instance'
      )
    );
  }
});

// DELETE /instances/:id - Delete instance
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    await deleteInstance(instanceId, userId);
    res.json(successResponse({ message: 'Instance deleted successfully' }));
  } catch (error) {
    logger.error('Delete instance error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to delete instance'
      )
    );
  }
});

// POST /instances/test - Test connection to instance
router.post('/test', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, url, credentials } = req.body;

    if (!type || !url || !credentials) {
      res.status(400).json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Missing required fields: type, url, credentials'
        )
      );
      return;
    }

    const result = await testConnection({ type, url, credentials });
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Test connection error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Connection test failed'
      )
    );
  }
});

// PUT /instances/:id/bundle - Update instance bundle
router.put('/:id/bundle', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;
    const { bundleId } = req.body;

    const result = await updateInstanceBundle(instanceId, userId, bundleId || null);
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Update instance bundle error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to update bundle'
      )
    );
  }
});

export default router;
