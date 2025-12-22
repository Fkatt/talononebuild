"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const instance_service_1 = require("../services/instance.service");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const instances = await (0, instance_service_1.getUserInstances)(userId);
        res.json((0, response_1.successResponse)(instances));
    }
    catch (error) {
        logger_1.default.error('Get instances error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to fetch instances'));
    }
});
router.get('/:id', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        res.json((0, response_1.successResponse)(instance));
    }
    catch (error) {
        logger_1.default.error('Get instance error:', error);
        res.status(404).json((0, response_1.errorResponse)(response_1.ErrorCodes.NOT_FOUND, error instanceof Error ? error.message : 'Instance not found'));
    }
});
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, type, region, url, credentials, bundleId, vertical } = req.body;
        if (!name || !type || !region || !url || !credentials) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required fields: name, type, region, url, credentials'));
            return;
        }
        if (type !== 'talon' && type !== 'contentful') {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Type must be "talon" or "contentful"'));
            return;
        }
        const connectionTest = await (0, instance_service_1.testConnection)({ type, url, credentials });
        if (!connectionTest.success) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.CONNECTION_TEST_FAILED, connectionTest.error || 'Connection test failed'));
            return;
        }
        const instance = await (0, instance_service_1.createInstance)({
            name,
            type,
            region,
            url,
            credentials,
            bundleId,
            vertical,
            userId,
        });
        res.status(201).json((0, response_1.successResponse)(instance));
    }
    catch (error) {
        logger_1.default.error('Create instance error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to create instance'));
    }
});
router.put('/:id', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const { name, region, url, credentials, bundleId } = req.body;
        const instance = await (0, instance_service_1.updateInstance)(instanceId, userId, {
            name,
            region,
            url,
            credentials,
            bundleId,
        });
        res.json((0, response_1.successResponse)(instance));
    }
    catch (error) {
        logger_1.default.error('Update instance error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to update instance'));
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        await (0, instance_service_1.deleteInstance)(instanceId, userId);
        res.json((0, response_1.successResponse)({ message: 'Instance deleted successfully' }));
    }
    catch (error) {
        logger_1.default.error('Delete instance error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to delete instance'));
    }
});
router.post('/test', async (req, res) => {
    try {
        const { type, url, credentials } = req.body;
        if (!type || !url || !credentials) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required fields: type, url, credentials'));
            return;
        }
        const result = await (0, instance_service_1.testConnection)({ type, url, credentials });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('Test connection error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Connection test failed'));
    }
});
router.get('/:id/applications', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        logger_1.default.info(`Fetching applications for instance ${instanceId}, user ${userId}`);
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        logger_1.default.info(`Instance found: ${instance.name} (${instance.type}) at ${instance.url}`);
        if (instance.type !== 'talon') {
            logger_1.default.warn(`Invalid instance type: ${instance.type}, expected 'talon'`);
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint'));
            return;
        }
        const axios = require('axios');
        const apiUrl = `${instance.url}/v1/applications`;
        logger_1.default.info(`Calling Talon.One API: ${apiUrl}`);
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
            },
            timeout: 10000,
        });
        logger_1.default.info(`Talon.One API response status: ${response.status}`);
        logger_1.default.info(`Talon.One API response data:`, JSON.stringify(response.data, null, 2));
        if (response.status === 200) {
            const applications = response.data?.data?.map((app) => {
                logger_1.default.info(`Processing app:`, JSON.stringify(app, null, 2));
                return {
                    id: app.id,
                    name: app.attributes?.name || app.name || `Application ${app.id}`,
                };
            }) || [];
            logger_1.default.info(`Successfully fetched ${applications.length} applications`);
            res.json((0, response_1.successResponse)(applications));
        }
        else {
            logger_1.default.error(`Unexpected response status: ${response.status}`);
            res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, 'Failed to fetch applications'));
        }
    }
    catch (error) {
        if (error.response) {
            logger_1.default.error('Talon.One API error response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        }
        else if (error.request) {
            logger_1.default.error('No response from Talon.One API:', error.message);
        }
        else {
            logger_1.default.error('Get applications error:', error);
        }
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to fetch applications'));
    }
});
router.put('/:id/bundle', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const { bundleId } = req.body;
        const result = await (0, instance_service_1.updateInstanceBundle)(instanceId, userId, bundleId || null);
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('Update instance bundle error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to update bundle'));
    }
});
router.post('/:id/test', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        const result = await (0, instance_service_1.testConnection)({
            type: instance.type,
            url: instance.url,
            credentials: instance.credentials
        });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('Test instance connection error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Connection test failed'));
    }
});
router.get('/:id/key', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        res.json((0, response_1.successResponse)({
            apiKey: instance.credentials.apiKey || instance.credentials.accessToken
        }));
    }
    catch (error) {
        logger_1.default.error('Get API key error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve API key'));
    }
});
router.get('/:id/loyalty_programs', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        logger_1.default.info(`Fetching loyalty programs for instance ${instanceId}, user ${userId}`);
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        logger_1.default.info(`Instance found: ${instance.name} (${instance.type}) at ${instance.url}`);
        if (instance.type !== 'talon') {
            logger_1.default.warn(`Invalid instance type: ${instance.type}, expected 'talon'`);
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint'));
            return;
        }
        const axios = require('axios');
        const apiUrl = `${instance.url}/v1/loyalty_programs`;
        logger_1.default.info(`Calling Talon.One API: ${apiUrl}`);
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
            },
            params: { pageSize: 1000 },
            timeout: 10000,
        });
        logger_1.default.info(`Talon.One API response status: ${response.status}`);
        if (response.status === 200) {
            const loyaltyPrograms = response.data?.data?.map((lp) => ({
                id: lp.id,
                name: lp.name || lp.title || `Loyalty Program ${lp.id}`,
            })) || [];
            logger_1.default.info(`Successfully fetched ${loyaltyPrograms.length} loyalty programs`);
            res.json((0, response_1.successResponse)(loyaltyPrograms));
        }
        else {
            logger_1.default.error(`Unexpected response status: ${response.status}`);
            res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, 'Failed to fetch loyalty programs'));
        }
    }
    catch (error) {
        logger_1.default.error('Get loyalty programs error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to fetch loyalty programs'));
    }
});
router.get('/:id/giveaways', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        logger_1.default.info(`Fetching giveaways for instance ${instanceId}, user ${userId}`);
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        if (instance.type !== 'talon') {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint'));
            return;
        }
        const axios = require('axios');
        try {
            const poolsResponse = await axios.get(`${instance.url}/v1/giveaways/pools`, {
                headers: {
                    Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                },
                params: { pageSize: 1000 },
                timeout: 10000,
            });
            const pools = poolsResponse.data?.data || [];
            logger_1.default.info(`Found ${pools.length} giveaway pools, response status: ${poolsResponse.status}`);
            if (pools.length > 0) {
                logger_1.default.info(`First giveaway pool:`, JSON.stringify(pools[0]));
            }
            const giveaways = pools.map((pool) => ({
                id: pool.id,
                name: pool.name || `Giveaway Pool ${pool.id}`,
                description: pool.description || '',
                subscribedApplications: pool.subscribedApplications || []
            }));
            logger_1.default.info(`Successfully fetched ${giveaways.length} giveaway pools`);
            res.json((0, response_1.successResponse)(giveaways));
        }
        catch (axiosError) {
            logger_1.default.error('Get giveaways error:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message
            });
            res.json((0, response_1.successResponse)([]));
        }
    }
    catch (error) {
        logger_1.default.error('Get giveaways outer error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to fetch giveaways'));
    }
});
router.get('/:id/campaign_templates', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        logger_1.default.info(`Fetching campaign templates for instance ${instanceId}, user ${userId}`);
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        if (instance.type !== 'talon') {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint'));
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
            const templates = response.data?.data?.map((tpl) => ({
                id: tpl.id,
                name: tpl.name || `Template ${tpl.id}`,
            })) || [];
            logger_1.default.info(`Successfully fetched ${templates.length} campaign templates`);
            res.json((0, response_1.successResponse)(templates));
        }
        else {
            res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, 'Failed to fetch campaign templates'));
        }
    }
    catch (error) {
        logger_1.default.error('Get campaign templates error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to fetch campaign templates'));
    }
});
router.get('/:id/audiences', async (req, res) => {
    try {
        const instanceId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        logger_1.default.info(`Fetching audiences for instance ${instanceId}, user ${userId}`);
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        if (instance.type !== 'talon') {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Only Talon.One instances support this endpoint'));
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
            const audiences = response.data?.data?.map((aud) => ({
                id: aud.id,
                name: aud.name || `Audience ${aud.id}`,
            })) || [];
            logger_1.default.info(`Successfully fetched ${audiences.length} audiences`);
            res.json((0, response_1.successResponse)(audiences));
        }
        else {
            res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, 'Failed to fetch audiences'));
        }
    }
    catch (error) {
        logger_1.default.error('Get audiences error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to fetch audiences'));
    }
});
exports.default = router;
//# sourceMappingURL=instance.routes.js.map