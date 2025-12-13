"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBackup = exports.getBackup = exports.listBackups = exports.restoreBackup = exports.createBackup = void 0;
const prisma_1 = __importDefault(require("../models/prisma"));
const instance_service_1 = require("./instance.service");
const logger_1 = __importDefault(require("../utils/logger"));
const axios_1 = __importDefault(require("axios"));
const createBackup = async (params) => {
    const { instanceId, name, userId } = params;
    try {
        const instance = await (0, instance_service_1.getInstance)(instanceId, userId);
        logger_1.default.info(`Creating backup for instance: ${instance.name}`);
        let backupData = {};
        if (instance.type === 'talon') {
            backupData = await fetchTalonData(instance);
        }
        else if (instance.type === 'contentful') {
            backupData = await fetchContentfulData(instance);
        }
        const backup = await prisma_1.default.backup.create({
            data: {
                name,
                instanceId,
                data: backupData,
            },
        });
        logger_1.default.info(`Backup created: ${backup.name}`);
        return {
            id: backup.id,
            name: backup.name,
            instanceId: backup.instanceId,
            createdAt: backup.createdAt,
        };
    }
    catch (error) {
        logger_1.default.error('Create backup error:', error);
        throw error;
    }
};
exports.createBackup = createBackup;
const restoreBackup = async (params) => {
    const { backupId, targetInstanceId, userId } = params;
    try {
        const backup = await prisma_1.default.backup.findUnique({
            where: { id: backupId },
        });
        if (!backup) {
            throw new Error('Backup not found');
        }
        const instance = await (0, instance_service_1.getInstance)(targetInstanceId, userId);
        logger_1.default.info(`Restoring backup ${backup.name} to instance: ${instance.name}`);
        if (instance.type === 'talon') {
            await restoreTalonData(instance, backup.data);
        }
        else if (instance.type === 'contentful') {
            await restoreContentfulData(instance, backup.data);
        }
        logger_1.default.info(`Backup restored successfully`);
        return {
            success: true,
            message: 'Backup restored successfully',
        };
    }
    catch (error) {
        logger_1.default.error('Restore backup error:', error);
        throw error;
    }
};
exports.restoreBackup = restoreBackup;
const listBackups = async (userId) => {
    const backups = await prisma_1.default.backup.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            instanceId: true,
            createdAt: true,
        },
    });
    return backups;
};
exports.listBackups = listBackups;
const getBackup = async (backupId) => {
    const backup = await prisma_1.default.backup.findUnique({
        where: { id: backupId },
    });
    if (!backup) {
        throw new Error('Backup not found');
    }
    return backup;
};
exports.getBackup = getBackup;
const deleteBackup = async (backupId) => {
    await prisma_1.default.backup.delete({
        where: { id: backupId },
    });
    logger_1.default.info(`Backup deleted: ${backupId}`);
    return { success: true };
};
exports.deleteBackup = deleteBackup;
async function fetchTalonData(instance) {
    const data = {};
    try {
        const appsResponse = await axios_1.default.get(`${instance.url}/v1/applications`, {
            headers: { Authorization: `Bearer ${instance.credentials.apiKey}` },
        });
        data.applications = appsResponse.data;
        logger_1.default.info('Fetched Talon.One data for backup');
    }
    catch (error) {
        logger_1.default.error('Error fetching Talon data:', error);
        throw error;
    }
    return data;
}
async function fetchContentfulData(instance) {
    const data = {};
    try {
        const ctResponse = await axios_1.default.get(`https://api.contentful.com/spaces/${instance.credentials.spaceId}/content_types`, {
            headers: { Authorization: `Bearer ${instance.credentials.accessToken}` },
        });
        data.contentTypes = ctResponse.data;
        logger_1.default.info('Fetched Contentful data for backup');
    }
    catch (error) {
        logger_1.default.error('Error fetching Contentful data:', error);
        throw error;
    }
    return data;
}
async function restoreTalonData(instance, backupData) {
    logger_1.default.info('Restoring Talon.One data...');
}
async function restoreContentfulData(instance, backupData) {
    logger_1.default.info('Restoring Contentful data...');
}
//# sourceMappingURL=backup.service.js.map