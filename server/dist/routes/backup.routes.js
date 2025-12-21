"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const backup_service_1 = require("../services/backup.service");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma_1 = __importDefault(require("../models/prisma"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const vertical = req.query.vertical;
        const backups = await (0, backup_service_1.listBackups)(userId, vertical);
        res.json((0, response_1.successResponse)(backups));
    }
    catch (error) {
        logger_1.default.error('List backups error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to list backups'));
    }
});
router.get('/stats/counts', async (req, res) => {
    try {
        const counts = await (0, backup_service_1.getBackupCountsByVertical)();
        res.json((0, response_1.successResponse)(counts));
    }
    catch (error) {
        logger_1.default.error('Get backup counts error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get backup counts'));
    }
});
router.get('/:id', async (req, res) => {
    try {
        const backupId = parseInt(req.params.id, 10);
        const backup = await (0, backup_service_1.getBackup)(backupId);
        res.json((0, response_1.successResponse)(backup));
    }
    catch (error) {
        logger_1.default.error('Get backup error:', error);
        res.status(404).json((0, response_1.errorResponse)(response_1.ErrorCodes.NOT_FOUND, error instanceof Error ? error.message : 'Backup not found'));
    }
});
router.post('/create', async (req, res) => {
    try {
        const userId = req.user.id;
        const { instanceId, name } = req.body;
        if (!instanceId || !name) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required fields: instanceId, name'));
            return;
        }
        const backup = await (0, backup_service_1.createBackup)({
            instanceId,
            name,
            userId,
        });
        res.status(201).json((0, response_1.successResponse)(backup));
    }
    catch (error) {
        logger_1.default.error('Create backup error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to create backup'));
    }
});
router.post('/restore', async (req, res) => {
    try {
        const userId = req.user.id;
        const { backupId, targetInstanceId, newName } = req.body;
        if (!backupId || !targetInstanceId || !newName) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required fields: backupId, targetInstanceId, newName'));
            return;
        }
        const result = await (0, backup_service_1.restoreBackup)({
            backupId,
            targetInstanceId,
            userId,
            newName,
        });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('Restore backup error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to restore backup'));
    }
});
router.get('/:id/download', async (req, res) => {
    try {
        const backupId = parseInt(req.params.id, 10);
        const backup = await (0, backup_service_1.getBackup)(backupId);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="backup-${backup.name.replace(/[^a-z0-9]/gi, '_')}-${backup.id}.json"`);
        res.send(JSON.stringify(backup.data, null, 2));
    }
    catch (error) {
        logger_1.default.error('Download backup error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to download backup'));
    }
});
router.post('/upload', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, data, instanceId, vertical } = req.body;
        if (!name || !data) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required fields: name, data'));
            return;
        }
        const backupSize = JSON.stringify(data).length;
        const backup = await prisma_1.default.backup.create({
            data: {
                name,
                instanceId: instanceId ? parseInt(instanceId.toString(), 10) : null,
                data,
                size: backupSize,
                vertical: vertical || 'Uploaded',
            },
        });
        logger_1.default.info(`Uploaded backup: ${backup.name} (${backupSize} bytes) for vertical: ${backup.vertical}`);
        res.status(201).json((0, response_1.successResponse)({
            id: backup.id,
            name: backup.name,
            instanceId: backup.instanceId,
            createdAt: backup.createdAt,
            size: backup.size,
            vertical: backup.vertical,
        }));
    }
    catch (error) {
        logger_1.default.error('Upload backup error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to upload backup'));
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const backupId = parseInt(req.params.id, 10);
        await (0, backup_service_1.deleteBackup)(backupId);
        res.json((0, response_1.successResponse)({ message: 'Backup deleted successfully' }));
    }
    catch (error) {
        logger_1.default.error('Delete backup error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to delete backup'));
    }
});
exports.default = router;
//# sourceMappingURL=backup.routes.js.map