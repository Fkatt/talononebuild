"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
const prisma_1 = __importDefault(require("../models/prisma"));
const instance_service_1 = require("./instance.service");
const logger_1 = __importDefault(require("../utils/logger"));
const axios_1 = __importDefault(require("axios"));
const migrate = async (params) => {
    const { sourceId, destId, assets, userId } = params;
    try {
        const source = await (0, instance_service_1.getInstance)(sourceId, userId);
        const dest = await (0, instance_service_1.getInstance)(destId, userId);
        if (source.type !== dest.type) {
            throw new Error('Source and destination must be the same type');
        }
        logger_1.default.info(`Starting migration from ${source.name} to ${dest.name}`);
        const migrationLog = await prisma_1.default.migrationLog.create({
            data: {
                sourceId,
                destId,
                assets: assets,
                status: 'in_progress',
            },
        });
        const results = [];
        const errors = [];
        for (const asset of assets) {
            try {
                if (source.type === 'talon') {
                    await migrateTalonAsset(source, dest, asset);
                }
                else if (source.type === 'contentful') {
                    await migrateContentfulAsset(source, dest, asset);
                }
                results.push({
                    type: asset.type,
                    id: asset.id,
                    status: 'success',
                });
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                logger_1.default.error(`Migration error for ${asset.type}:${asset.id}:`, errorMsg);
                errors.push({
                    type: asset.type,
                    id: asset.id,
                    error: errorMsg,
                });
            }
        }
        const status = errors.length === 0 ? 'success' : errors.length < assets.length ? 'partial' : 'failed';
        await prisma_1.default.migrationLog.update({
            where: { id: migrationLog.id },
            data: {
                status,
                errors: errors.length > 0 ? errors : undefined,
                completedAt: new Date(),
            },
        });
        logger_1.default.info(`Migration completed with status: ${status}`);
        return {
            migrationId: migrationLog.id,
            status,
            results,
            errors,
        };
    }
    catch (error) {
        logger_1.default.error('Migration error:', error);
        throw error;
    }
};
exports.migrate = migrate;
async function migrateTalonAsset(source, dest, asset) {
    const response = await axios_1.default.get(`${source.url}/v1/${asset.type}/${asset.id}`, {
        headers: {
            Authorization: `Bearer ${source.credentials.apiKey}`,
        },
    });
    const assetData = response.data;
    delete assetData.id;
    delete assetData.created;
    delete assetData.modified;
    await axios_1.default.post(`${dest.url}/v1/${asset.type}`, assetData, {
        headers: {
            Authorization: `Bearer ${dest.credentials.apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    logger_1.default.info(`Migrated Talon asset: ${asset.type}:${asset.id}`);
}
async function migrateContentfulAsset(source, dest, asset) {
    const response = await axios_1.default.get(`https://api.contentful.com/spaces/${source.credentials.spaceId}/${asset.type}/${asset.id}`, {
        headers: {
            Authorization: `Bearer ${source.credentials.accessToken}`,
        },
    });
    const assetData = response.data;
    delete assetData.sys;
    await axios_1.default.post(`https://api.contentful.com/spaces/${dest.credentials.spaceId}/${asset.type}`, assetData, {
        headers: {
            Authorization: `Bearer ${dest.credentials.accessToken}`,
            'Content-Type': 'application/vnd.contentful.management.v1+json',
        },
    });
    logger_1.default.info(`Migrated Contentful asset: ${asset.type}:${asset.id}`);
}
//# sourceMappingURL=migration.service.js.map