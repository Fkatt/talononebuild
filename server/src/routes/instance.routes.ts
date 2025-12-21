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
    const { name, type, region, url, credentials, bundleId, vertical } = req.body;

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
      vertical,
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

// GET /instances/:id/applications - Get applications from Talon.One instance
router.get('/:id/applications', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    logger.info(`Fetching applications for instance ${instanceId}, user ${userId}`);

    // Get instance with credentials
    const instance = await getInstance(instanceId, userId);
    logger.info(`Instance found: ${instance.name} (${instance.type}) at ${instance.url}`);

    if (instance.type !== 'talon') {
      logger.warn(`Invalid instance type: ${instance.type}, expected 'talon'`);
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint')
      );
      return;
    }

    // Fetch applications from Talon.One
    const axios = require('axios');
    const apiUrl = `${instance.url}/v1/applications`;
    logger.info(`Calling Talon.One API: ${apiUrl}`);

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
      },
      timeout: 10000,
    });

    logger.info(`Talon.One API response status: ${response.status}`);
    logger.info(`Talon.One API response data:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      const applications = response.data?.data?.map((app: any) => {
        logger.info(`Processing app:`, JSON.stringify(app, null, 2));
        return {
          id: app.id,
          name: app.attributes?.name || app.name || `Application ${app.id}`,
        };
      }) || [];

      logger.info(`Successfully fetched ${applications.length} applications`);
      res.json(successResponse(applications));
    } else {
      logger.error(`Unexpected response status: ${response.status}`);
      res.status(500).json(
        errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch applications')
      );
    }
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      logger.error('Talon.One API error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('No response from Talon.One API:', error.message);
    } else {
      // Something else happened
      logger.error('Get applications error:', error);
    }

    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch applications'
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

// POST /instances/:id/test - Test existing instance connection
router.post('/:id/test', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    // Get instance with credentials
    const instance = await getInstance(instanceId, userId);

    // Test the connection
    const result = await testConnection({
      type: instance.type as 'talon' | 'contentful',
      url: instance.url,
      credentials: instance.credentials
    });

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Test instance connection error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Connection test failed'
      )
    );
  }
});

// GET /instances/:id/key - Get decrypted API key (admin only)
router.get('/:id/key', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    // Get instance with credentials
    const instance = await getInstance(instanceId, userId);

    // Return the API key
    res.json(successResponse({
      apiKey: instance.credentials.apiKey || instance.credentials.accessToken
    }));
  } catch (error) {
    logger.error('Get API key error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to retrieve API key'
      )
    );
  }
});

// GET /instances/:id/applications - Get applications from instance
export default router;
