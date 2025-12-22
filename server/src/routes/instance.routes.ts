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

// GET /instances/:id/loyalty_programs - Get loyalty programs from Talon.One instance
router.get('/:id/loyalty_programs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    logger.info(`Fetching loyalty programs for instance ${instanceId}, user ${userId}`);

    const instance = await getInstance(instanceId, userId);
    logger.info(`Instance found: ${instance.name} (${instance.type}) at ${instance.url}`);

    if (instance.type !== 'talon') {
      logger.warn(`Invalid instance type: ${instance.type}, expected 'talon'`);
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint')
      );
      return;
    }

    const axios = require('axios');
    const apiUrl = `${instance.url}/v1/loyalty_programs`;
    logger.info(`Calling Talon.One API: ${apiUrl}`);

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
      },
      params: { pageSize: 1000 },
      timeout: 10000,
    });

    logger.info(`Talon.One API response status: ${response.status}`);

    if (response.status === 200) {
      const loyaltyPrograms = response.data?.data?.map((lp: any) => ({
        id: lp.id,
        name: lp.name || lp.title || `Loyalty Program ${lp.id}`,
      })) || [];

      logger.info(`Successfully fetched ${loyaltyPrograms.length} loyalty programs`);
      res.json(successResponse(loyaltyPrograms));
    } else {
      logger.error(`Unexpected response status: ${response.status}`);
      res.status(500).json(
        errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch loyalty programs')
      );
    }
  } catch (error: any) {
    logger.error('Get loyalty programs error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch loyalty programs'
      )
    );
  }
});

/**
 * GET /instances/:id/giveaways - Fetch giveaway pools from Talon.One instance
 *
 * Retrieves all giveaway pools using the Talon.One Management API.
 * Note: Requires API key with GET /v1/giveaways/pools permission.
 * Returns 401 if API key lacks permission (handled gracefully by frontend).
 */
router.get('/:id/giveaways', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    logger.info(`Fetching giveaways for instance ${instanceId}, user ${userId}`);

    const instance = await getInstance(instanceId, userId);

    if (instance.type !== 'talon') {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint')
      );
      return;
    }

    const axios = require('axios');

    // Fetch giveaway pools from Talon.One Management API
    // Endpoint: GET /v1/giveaways/pools (list all pools)
    try {
      const poolsResponse = await axios.get(`${instance.url}/v1/giveaways/pools`, {
        headers: {
          Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
        },
        params: { pageSize: 1000 },
        timeout: 10000,
      });

      const pools = poolsResponse.data?.data || [];
      logger.info(`Found ${pools.length} giveaway pools, response status: ${poolsResponse.status}`);

      if (pools.length > 0) {
        logger.info(`First giveaway pool:`, JSON.stringify(pools[0]));
      }

      // Transform pool data for frontend consumption
      const giveaways = pools.map((pool: any) => ({
        id: pool.id,
        name: pool.name || `Giveaway Pool ${pool.id}`,
        description: pool.description || '',
        subscribedApplications: pool.subscribedApplications || []
      }));

      logger.info(`Successfully fetched ${giveaways.length} giveaway pools`);
      res.json(successResponse(giveaways));
    } catch (axiosError: any) {
      logger.error('Get giveaways error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });

      // Return empty array on error (401 errors are handled gracefully by frontend)
      // Frontend displays permission error message when it receives empty array + 401 status
      res.json(successResponse([]));
    }
  } catch (error: any) {
    logger.error('Get giveaways outer error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch giveaways'
      )
    );
  }
});

// GET /instances/:id/campaign_templates - Get campaign templates from Talon.One instance
router.get('/:id/campaign_templates', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    logger.info(`Fetching campaign templates for instance ${instanceId}, user ${userId}`);

    const instance = await getInstance(instanceId, userId);

    if (instance.type !== 'talon') {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint')
      );
      return;
    }

    const axios = require('axios');
    const response = await axios.get(`${instance.url}/v1/campaign_templates`, {
      headers: {
        Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
      },
      params: { pageSize: 1000 },
      timeout: 10000,
    });

    if (response.status === 200) {
      const templates = response.data?.data?.map((tpl: any) => ({
        id: tpl.id,
        name: tpl.name || `Template ${tpl.id}`,
      })) || [];

      logger.info(`Successfully fetched ${templates.length} campaign templates`);
      res.json(successResponse(templates));
    } else {
      res.status(500).json(
        errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch campaign templates')
      );
    }
  } catch (error: any) {
    logger.error('Get campaign templates error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch campaign templates'
      )
    );
  }
});

// GET /instances/:id/audiences - Get audiences from Talon.One instance
router.get('/:id/audiences', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instanceId = parseInt(req.params.id!, 10);
    const userId = req.user!.id;

    logger.info(`Fetching audiences for instance ${instanceId}, user ${userId}`);

    const instance = await getInstance(instanceId, userId);

    if (instance.type !== 'talon') {
      res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint')
      );
      return;
    }

    const axios = require('axios');
    const response = await axios.get(`${instance.url}/v1/audiences`, {
      headers: {
        Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
      },
      params: { pageSize: 1000 },
      timeout: 10000,
    });

    if (response.status === 200) {
      const audiences = response.data?.data?.map((aud: any) => ({
        id: aud.id,
        name: aud.name || `Audience ${aud.id}`,
      })) || [];

      logger.info(`Successfully fetched ${audiences.length} audiences`);
      res.json(successResponse(audiences));
    } else {
      res.status(500).json(
        errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch audiences')
      );
    }
  } catch (error: any) {
    logger.error('Get audiences error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch audiences'
      )
    );
  }
});

export default router;
