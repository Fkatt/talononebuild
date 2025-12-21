"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstanceBundle = exports.testConnection = exports.deleteInstance = exports.updateInstance = exports.createInstance = exports.getInstance = exports.getUserInstances = void 0;
const prisma_1 = __importDefault(require("../models/prisma"));
const encryption_1 = require("../utils/encryption");
const logger_1 = __importDefault(require("../utils/logger"));
const axios_1 = __importDefault(require("axios"));
const getUserInstances = async (userId) => {
    const instances = await prisma_1.default.instance.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    return instances.map((instance) => ({
        id: instance.id,
        name: instance.name,
        type: instance.type,
        region: instance.region,
        url: instance.url,
        bundleId: instance.bundleId,
        vertical: instance.vertical,
        status: instance.status,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
    }));
};
exports.getUserInstances = getUserInstances;
const getInstance = async (instanceId, userId) => {
    const instance = await prisma_1.default.instance.findFirst({
        where: {
            id: instanceId,
            userId,
        },
    });
    if (!instance) {
        throw new Error('Instance not found');
    }
    const decryptedCredentials = JSON.parse((0, encryption_1.decrypt)(instance.encryptedCredentials));
    return {
        id: instance.id,
        name: instance.name,
        type: instance.type,
        region: instance.region,
        url: instance.url,
        bundleId: instance.bundleId,
        vertical: instance.vertical,
        credentials: decryptedCredentials,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
    };
};
exports.getInstance = getInstance;
const createInstance = async (data) => {
    const encryptedCredentials = (0, encryption_1.encrypt)(JSON.stringify(data.credentials));
    const instance = await prisma_1.default.instance.create({
        data: {
            name: data.name,
            type: data.type,
            region: data.region,
            url: data.url,
            encryptedCredentials,
            bundleId: data.bundleId,
            vertical: data.vertical,
            userId: data.userId,
        },
    });
    logger_1.default.info(`Instance created: ${instance.name} (${instance.type})`);
    return {
        id: instance.id,
        name: instance.name,
        type: instance.type,
        region: instance.region,
        url: instance.url,
        bundleId: instance.bundleId,
        vertical: instance.vertical,
        status: instance.status,
        createdAt: instance.createdAt,
    };
};
exports.createInstance = createInstance;
const updateInstance = async (instanceId, userId, data) => {
    const instance = await prisma_1.default.instance.findFirst({
        where: { id: instanceId, userId },
    });
    if (!instance) {
        throw new Error('Instance not found');
    }
    const updateData = {
        name: data.name,
        region: data.region,
        url: data.url,
        bundleId: data.bundleId,
        vertical: data.vertical,
    };
    if (data.credentials) {
        updateData.encryptedCredentials = (0, encryption_1.encrypt)(JSON.stringify(data.credentials));
    }
    const updated = await prisma_1.default.instance.update({
        where: { id: instanceId },
        data: updateData,
    });
    logger_1.default.info(`Instance updated: ${updated.name}`);
    return {
        id: updated.id,
        name: updated.name,
        type: updated.type,
        region: updated.region,
        url: updated.url,
        bundleId: updated.bundleId,
        vertical: updated.vertical,
        status: updated.status,
        updatedAt: updated.updatedAt,
    };
};
exports.updateInstance = updateInstance;
const deleteInstance = async (instanceId, userId) => {
    const instance = await prisma_1.default.instance.findFirst({
        where: { id: instanceId, userId },
    });
    if (!instance) {
        throw new Error('Instance not found');
    }
    await prisma_1.default.instance.delete({
        where: { id: instanceId },
    });
    logger_1.default.info(`Instance deleted: ${instance.name}`);
    return { success: true };
};
exports.deleteInstance = deleteInstance;
const testConnection = async (params) => {
    const { type, url, credentials } = params;
    try {
        if (type === 'talon') {
            let response;
            try {
                response = await axios_1.default.get(`${url}/v1/applications`, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${credentials.apiKey}`,
                    },
                    timeout: 10000,
                });
            }
            catch (appError) {
                logger_1.default.warn(`Applications endpoint failed: ${appError.response?.data?.message || appError.message}`);
                response = await axios_1.default.get(`${url}/v1/accounts`, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${credentials.apiKey}`,
                    },
                    timeout: 10000,
                });
            }
            if (response.status === 200) {
                logger_1.default.info('Talon.One connection test successful');
                const applications = response.data?.data?.map((app) => ({
                    id: app.id,
                    name: app.attributes?.name || `Application ${app.id}`,
                })) || [];
                return { success: true, applications };
            }
        }
        else if (type === 'contentful') {
            const response = await axios_1.default.get(`https://api.contentful.com/spaces/${credentials.spaceId}`, {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                },
                timeout: 10000,
            });
            if (response.status === 200) {
                logger_1.default.info('Contentful connection test successful');
                return { success: true };
            }
        }
        return { success: false, error: 'Unknown instance type' };
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message;
            logger_1.default.warn(`Connection test failed: ${message}`);
            return { success: false, error: `Connection failed: ${message}` };
        }
        logger_1.default.error('Connection test error:', error);
        return { success: false, error: 'Connection test failed' };
    }
};
exports.testConnection = testConnection;
const updateInstanceBundle = async (instanceId, userId, bundleId) => {
    const instance = await prisma_1.default.instance.findFirst({
        where: { id: instanceId, userId },
    });
    if (!instance) {
        throw new Error('Instance not found');
    }
    const updated = await prisma_1.default.instance.update({
        where: { id: instanceId },
        data: { bundleId },
    });
    logger_1.default.info(`Instance bundle updated: ${updated.name} -> ${bundleId || 'none'}`);
    return {
        id: updated.id,
        bundleId: updated.bundleId,
    };
};
exports.updateInstanceBundle = updateInstanceBundle;
//# sourceMappingURL=instance.service.js.map