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
        const { name, type, region, url, credentials, bundleId } = req.body;
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
exports.default = router;
//# sourceMappingURL=instance.routes.js.map