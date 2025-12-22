"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const migration_service_1 = require("../services/migration.service");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { sourceId, destId, assets, newName, appNames, assetNames, copySchema } = req.body;
        console.log('=== MIGRATION REQUEST RECEIVED ===');
        console.log('userId:', userId);
        console.log('sourceId:', sourceId, 'destId:', destId);
        console.log('assets:', JSON.stringify(assets));
        console.log('newName:', newName);
        console.log('appNames:', JSON.stringify(appNames));
        console.log('assetNames:', JSON.stringify(assetNames));
        console.log('copySchema:', copySchema);
        logger_1.default.info('Migration request received:', {
            userId,
            sourceId,
            destId,
            assetsCount: assets?.length,
            newName,
            appNames,
            assetNames,
            copySchema,
            sameInstance: sourceId === destId
        });
        if (!sourceId || !destId || !assets || !Array.isArray(assets)) {
            logger_1.default.warn('Validation failed: missing required fields');
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required fields: sourceId, destId, assets (array)'));
            return;
        }
        if (sourceId === destId && !newName && !appNames && !assetNames) {
            logger_1.default.warn('Validation failed: same instance but no names provided', {
                newName,
                appNames,
                assetNames,
                hasNewName: !!newName,
                hasAppNames: !!appNames,
                hasAssetNames: !!assetNames
            });
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'When cloning to the same instance, new names must be provided (newName, appNames, or assetNames)'));
            return;
        }
        logger_1.default.info('Validation passed, calling migrate service');
        const result = await (0, migration_service_1.migrate)({
            sourceId,
            destId,
            assets,
            userId,
            newName,
            appNames,
            assetNames,
            copySchema,
        });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('Migration error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.MIGRATION_ERROR, error instanceof Error ? error.message : 'Migration failed'));
    }
});
exports.default = router;
//# sourceMappingURL=migration.routes.js.map