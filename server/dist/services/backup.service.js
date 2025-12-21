"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBackup = exports.getBackup = exports.getBackupCountsByVertical = exports.listBackups = exports.restoreBackup = exports.createBackup = void 0;
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
        const backupSize = JSON.stringify(backupData).length;
        const backup = await prisma_1.default.backup.create({
            data: {
                name,
                instanceId,
                data: backupData,
                size: backupSize,
                vertical: instance.vertical,
            },
        });
        logger_1.default.info(`Backup created: ${backup.name} (${backupSize} bytes) for vertical: ${instance.vertical}`);
        return {
            id: backup.id,
            name: backup.name,
            instanceId: backup.instanceId,
            createdAt: backup.createdAt,
            size: backup.size,
            vertical: backup.vertical,
        };
    }
    catch (error) {
        logger_1.default.error('Create backup error:', error);
        throw error;
    }
};
exports.createBackup = createBackup;
const restoreBackup = async (params) => {
    const { backupId, targetInstanceId, userId, newName } = params;
    try {
        const backup = await prisma_1.default.backup.findUnique({
            where: { id: backupId },
        });
        if (!backup) {
            throw new Error('Backup not found');
        }
        const instance = await (0, instance_service_1.getInstance)(targetInstanceId, userId);
        logger_1.default.info(`Restoring backup ${backup.name} to instance: ${instance.name} with new name: ${newName}`);
        if (instance.type === 'talon') {
            const existingApps = await checkExistingTalonApp(instance, newName);
            if (existingApps) {
                throw new Error(`An application named "${newName}" already exists in the target instance`);
            }
            await restoreTalonData(instance, backup.data, newName);
        }
        else if (instance.type === 'contentful') {
            await restoreContentfulData(instance, backup.data, newName);
        }
        logger_1.default.info(`Backup restored successfully with name: ${newName}`);
        return {
            success: true,
            message: 'Backup restored successfully',
            applicationName: newName,
        };
    }
    catch (error) {
        logger_1.default.error('Restore backup error:', error);
        throw error;
    }
};
exports.restoreBackup = restoreBackup;
const listBackups = async (userId, vertical) => {
    const backups = await prisma_1.default.backup.findMany({
        where: vertical ? { vertical } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            instanceId: true,
            createdAt: true,
            size: true,
            vertical: true,
        },
    });
    return backups;
};
exports.listBackups = listBackups;
const getBackupCountsByVertical = async () => {
    const backups = await prisma_1.default.backup.findMany({
        select: {
            vertical: true,
        },
    });
    const counts = {};
    backups.forEach(backup => {
        const vertical = backup.vertical || 'Uncategorized';
        counts[vertical] = (counts[vertical] || 0) + 1;
    });
    return counts;
};
exports.getBackupCountsByVertical = getBackupCountsByVertical;
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
            headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
        });
        data.applications = appsResponse.data;
        const applications = appsResponse.data?.data || [];
        data.applicationDetails = [];
        for (const app of applications) {
            const appId = app.id;
            const appData = {
                application: app,
                campaigns: [],
                attributes: [],
            };
            try {
                const campaignsResponse = await axios_1.default.get(`${instance.url}/v1/applications/${appId}/campaigns`, {
                    headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
                    params: { pageSize: 1000 },
                });
                appData.campaigns = campaignsResponse.data?.data || [];
                for (const campaign of appData.campaigns) {
                    try {
                        const rulesetsResponse = await axios_1.default.get(`${instance.url}/v1/applications/${appId}/campaigns/${campaign.id}/rulesets`, {
                            headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
                        });
                        campaign.rulesets = rulesetsResponse.data?.data || [];
                    }
                    catch (error) {
                        logger_1.default.error(`Error fetching rulesets for campaign ${campaign.id}:`, error);
                        campaign.rulesets = [];
                    }
                    if (campaign.features && campaign.features.includes('coupons')) {
                        try {
                            const couponsResponse = await axios_1.default.get(`${instance.url}/v1/applications/${appId}/campaigns/${campaign.id}/coupons/no_total`, {
                                headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
                                params: { pageSize: 1000 },
                            });
                            campaign.coupons = couponsResponse.data?.data || [];
                        }
                        catch (error) {
                            logger_1.default.error(`Error fetching coupons for campaign ${campaign.id}:`, error);
                            campaign.coupons = [];
                        }
                    }
                    if (campaign.features && campaign.features.includes('referrals')) {
                        try {
                            const referralsResponse = await axios_1.default.get(`${instance.url}/v1/applications/${appId}/campaigns/${campaign.id}/referrals/no_total`, {
                                headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
                                params: { pageSize: 1000 },
                            });
                            campaign.referrals = referralsResponse.data?.data || [];
                        }
                        catch (error) {
                            logger_1.default.error(`Error fetching referrals for campaign ${campaign.id}:`, error);
                            campaign.referrals = [];
                        }
                    }
                }
            }
            catch (error) {
                logger_1.default.error(`Error fetching campaigns for app ${appId}:`, error);
            }
            try {
                const attributesResponse = await axios_1.default.get(`${instance.url}/v1/attributes`, {
                    headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
                    params: { applicationId: appId },
                });
                appData.attributes = attributesResponse.data?.data || [];
            }
            catch (error) {
                logger_1.default.error(`Error fetching attributes for app ${appId}:`, error);
            }
            data.applicationDetails.push(appData);
        }
        logger_1.default.info(`Fetched Talon.One data for backup: ${applications.length} applications`);
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
async function checkExistingTalonApp(instance, appName) {
    try {
        const response = await axios_1.default.get(`${instance.url}/v1/applications`, {
            headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
        });
        const applications = response.data?.data || [];
        const exists = applications.some((app) => {
            const name = app.attributes?.name || app.name;
            return name === appName;
        });
        return exists;
    }
    catch (error) {
        logger_1.default.error('Error checking existing Talon app:', error);
        throw new Error('Failed to check for existing applications');
    }
}
async function restoreTalonData(instance, backupData, newName) {
    logger_1.default.info(`Restoring Talon.One data with name: ${newName}...`);
    logger_1.default.info(`Target instance: ${instance.name}`);
    try {
        const appDetails = backupData.applicationDetails?.[0];
        if (!appDetails || !appDetails.application) {
            throw new Error('No application data found in backup');
        }
        const sourceApp = appDetails.application;
        logger_1.default.info(`Using source application as template: ${sourceApp.name || sourceApp.attributes?.name || 'Unknown'}`);
        const attrs = sourceApp.attributes || sourceApp;
        const enableCascading = attrs.enableCascadingDiscounts || false;
        const newAppPayload = {
            name: newName,
            description: attrs.description || `Restored from backup on ${new Date().toLocaleDateString()}`,
            timezone: attrs.timezone || 'UTC',
            currency: attrs.currency || 'USD',
            caseSensitivity: attrs.caseSensitivity || 'sensitive',
            attributes: attrs.attributes || {},
            limits: attrs.limits || [],
            enableCascadingDiscounts: enableCascading,
            enableFlattenedCartItems: attrs.enableFlattenedCartItems || false,
            attributesSettings: attrs.attributesSettings || {},
            sandbox: attrs.sandbox || false,
            enablePartialDiscounts: attrs.enablePartialDiscounts || false,
        };
        if (enableCascading) {
            if (attrs.defaultDiscountScope) {
                newAppPayload.defaultDiscountScope = attrs.defaultDiscountScope;
            }
            if (attrs.defaultDiscountAdditionalCostPerItemScope) {
                newAppPayload.defaultDiscountAdditionalCostPerItemScope = attrs.defaultDiscountAdditionalCostPerItemScope;
            }
        }
        logger_1.default.info(`Creating new application: ${newName}`);
        const createResponse = await axios_1.default.post(`${instance.url}/v1/applications`, newAppPayload, {
            headers: {
                Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        const newAppId = createResponse.data.data?.id || createResponse.data.id;
        logger_1.default.info(`Successfully created application with ID: ${newAppId}`);
        await restoreCampaignsAndRules(instance, appDetails.campaigns || [], newAppId);
        await restoreApplicationAttributes(instance, appDetails.attributes || [], newAppId);
        logger_1.default.info(`Application restoration complete for: ${newName}`);
        return {
            applicationId: newAppId,
            applicationName: newName,
        };
    }
    catch (error) {
        logger_1.default.error('Error restoring Talon.One data:', error);
        if (error.response) {
            logger_1.default.error('API error response:', {
                status: error.response.status,
                data: error.response.data,
            });
            throw new Error(`Failed to create application: ${error.response.data?.message || error.message}`);
        }
        throw error;
    }
}
async function restoreCampaignsAndRules(instance, campaigns, destAppId) {
    logger_1.default.info(`Restoring ${campaigns.length} campaigns to app ${destAppId}`);
    for (const campaign of campaigns) {
        try {
            logger_1.default.info(`Restoring campaign: ${campaign.name}`);
            const campaignPayload = {
                name: campaign.name || `Campaign ${campaign.id}`,
                description: campaign.description || '',
                startTime: campaign.startTime,
                endTime: campaign.endTime,
                attributes: campaign.attributes || {},
                state: 'disabled',
                tags: campaign.tags || [],
                features: campaign.features || [],
                limits: campaign.limits || [],
                campaignGroups: campaign.campaignGroups || [],
                linkedStoreIds: campaign.linkedStoreIds || [],
            };
            if (campaign.couponSettings) {
                campaignPayload.couponSettings = campaign.couponSettings;
            }
            if (campaign.referralSettings) {
                campaignPayload.referralSettings = campaign.referralSettings;
            }
            if (campaign.type && (campaign.type === 'cartItem' || campaign.type === 'advanced')) {
                campaignPayload.type = campaign.type;
            }
            logger_1.default.info(`Creating campaign with payload: ${JSON.stringify(campaignPayload, null, 2)}`);
            const newCampaignResponse = await axios_1.default.post(`${instance.url}/v1/applications/${destAppId}/campaigns`, campaignPayload, {
                headers: {
                    Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const newCampaignId = newCampaignResponse.data.data?.id || newCampaignResponse.data.id;
            logger_1.default.info(`Created campaign ${newCampaignId}`);
            const newRulesetId = await restoreRulesets(instance, campaign.rulesets || [], destAppId, newCampaignId);
            if (newRulesetId) {
                await axios_1.default.put(`${instance.url}/v1/applications/${destAppId}/campaigns/${newCampaignId}`, {
                    ...campaignPayload,
                    activeRulesetId: newRulesetId,
                }, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                logger_1.default.info(`Activated ruleset ${newRulesetId} for campaign ${newCampaignId}`);
            }
            if (campaign.features && campaign.features.includes('coupons') && campaign.coupons) {
                await restoreCoupons(instance, campaign.coupons, destAppId, newCampaignId);
            }
            if (campaign.features && campaign.features.includes('referrals') && campaign.referrals) {
                await restoreReferrals(instance, campaign.referrals, destAppId, newCampaignId);
            }
        }
        catch (error) {
            logger_1.default.error(`Failed to restore campaign ${campaign.name}:`, {
                message: error.message,
                response: error.response?.data,
            });
        }
    }
    logger_1.default.info(`Successfully restored campaigns`);
}
async function restoreRulesets(instance, rulesets, destAppId, destCampaignId) {
    try {
        logger_1.default.info(`Restoring ${rulesets.length} rulesets for campaign ${destCampaignId}`);
        let newRulesetId = null;
        for (const ruleset of rulesets) {
            try {
                const rulesetPayload = {
                    rules: ruleset.rules || [],
                    bindings: ruleset.bindings || [],
                };
                if (ruleset.strikethroughRules && ruleset.strikethroughRules.length > 0) {
                    rulesetPayload.strikethroughRules = ruleset.strikethroughRules;
                }
                logger_1.default.info(`Creating ruleset with ${rulesetPayload.rules.length} rules`);
                const newRulesetResponse = await axios_1.default.post(`${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/rulesets`, rulesetPayload, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                newRulesetId = newRulesetResponse.data.data?.id || newRulesetResponse.data.id;
                logger_1.default.info(`Created ruleset ${newRulesetId}`);
            }
            catch (error) {
                logger_1.default.error(`Failed to restore ruleset:`, {
                    message: error.message,
                    response: error.response?.data,
                });
            }
        }
        return newRulesetId;
    }
    catch (error) {
        logger_1.default.error(`Failed to restore rulesets:`, {
            message: error.message,
            response: error.response?.data,
        });
        return null;
    }
}
async function restoreCoupons(instance, coupons, destAppId, destCampaignId) {
    try {
        logger_1.default.info(`Restoring ${coupons.length} coupons to campaign ${destCampaignId}`);
        if (coupons.length === 0) {
            return;
        }
        const csvRows = ['value'];
        for (const coupon of coupons) {
            csvRows.push(coupon.value);
        }
        const csvData = csvRows.join('\n');
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('upFile', csvData, {
            filename: 'coupons.csv',
            contentType: 'text/csv',
        });
        await axios_1.default.post(`${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_coupons`, formData, {
            headers: {
                Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                ...formData.getHeaders(),
            },
        });
        logger_1.default.info(`Imported ${coupons.length} coupon codes`);
        let newCoupons = [];
        let retries = 0;
        const maxRetries = 10;
        while (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newCouponsResponse = await axios_1.default.get(`${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/no_total`, {
                headers: {
                    Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                },
                params: { pageSize: 1000 },
            });
            newCoupons = newCouponsResponse.data.data || [];
            if (newCoupons.length >= coupons.length) {
                break;
            }
            retries++;
        }
        for (const sourceCoupon of coupons) {
            try {
                const destCoupon = newCoupons.find((c) => c.value === sourceCoupon.value);
                if (!destCoupon) {
                    continue;
                }
                const updatePayload = {};
                if (sourceCoupon.usageLimit !== undefined) {
                    updatePayload.usageLimit = sourceCoupon.usageLimit;
                }
                if (sourceCoupon.discountLimit !== undefined) {
                    updatePayload.discountLimit = sourceCoupon.discountLimit;
                }
                if (sourceCoupon.reservationLimit !== undefined) {
                    updatePayload.reservationLimit = sourceCoupon.reservationLimit;
                }
                if (sourceCoupon.startDate) {
                    updatePayload.startDate = sourceCoupon.startDate;
                }
                if (sourceCoupon.expiryDate) {
                    updatePayload.expiryDate = sourceCoupon.expiryDate;
                }
                if (sourceCoupon.attributes) {
                    updatePayload.attributes = sourceCoupon.attributes;
                }
                if (Object.keys(updatePayload).length > 0) {
                    await axios_1.default.put(`${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/${destCoupon.id}`, updatePayload, {
                        headers: {
                            Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                    });
                }
            }
            catch (error) {
                logger_1.default.error(`Failed to update coupon ${sourceCoupon.value}:`, error);
            }
        }
        logger_1.default.info(`Successfully restored coupons`);
    }
    catch (error) {
        logger_1.default.error(`Failed to restore coupons:`, {
            message: error.message,
            response: error.response?.data,
        });
    }
}
async function restoreReferrals(instance, referrals, destAppId, destCampaignId) {
    try {
        logger_1.default.info(`Restoring ${referrals.length} referral codes to campaign ${destCampaignId}`);
        if (referrals.length === 0) {
            return;
        }
        const csvRows = ['code'];
        for (const referral of referrals) {
            csvRows.push(referral.code);
        }
        const csvData = csvRows.join('\n');
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('upFile', csvData, {
            filename: 'referrals.csv',
            contentType: 'text/csv',
        });
        await axios_1.default.post(`${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_referrals`, formData, {
            headers: {
                Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                ...formData.getHeaders(),
            },
        });
        logger_1.default.info(`Successfully imported ${referrals.length} referral codes`);
    }
    catch (error) {
        logger_1.default.error(`Failed to restore referrals:`, {
            message: error.message,
            response: error.response?.data,
        });
    }
}
async function restoreApplicationAttributes(instance, attributes, destAppId) {
    try {
        logger_1.default.info(`Restoring ${attributes.length} attributes to app ${destAppId}`);
        for (const attribute of attributes) {
            try {
                const attributePayload = {
                    entity: attribute.entity,
                    name: attribute.name,
                    title: attribute.title,
                    type: attribute.type,
                    description: attribute.description || '',
                    suggestions: attribute.suggestions || [],
                    hasAllowedList: attribute.hasAllowedList || false,
                    restrictedBySuggestions: attribute.restrictedBySuggestions || false,
                    editable: attribute.editable !== undefined ? attribute.editable : true,
                    applicationId: destAppId,
                };
                if (attribute.hasAllowedList && attribute.allowedValues) {
                    attributePayload.allowedValues = attribute.allowedValues;
                }
                await axios_1.default.post(`${instance.url}/v1/attributes`, attributePayload, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                logger_1.default.info(`Restored attribute ${attribute.entity}.${attribute.name}`);
            }
            catch (error) {
                if (error.response?.status === 409) {
                    logger_1.default.info(`Attribute ${attribute.entity}.${attribute.name} already exists - skipping`);
                }
                else {
                    logger_1.default.error(`Failed to restore attribute ${attribute.entity}.${attribute.name}:`, {
                        message: error.message,
                        response: error.response?.data,
                    });
                }
            }
        }
    }
    catch (error) {
        logger_1.default.error(`Failed to restore attributes:`, {
            message: error.message,
            response: error.response?.data,
        });
    }
}
async function restoreContentfulData(instance, backupData, newName) {
    logger_1.default.info(`Restoring Contentful data with name: ${newName}...`);
    logger_1.default.info('Restore functionality is a placeholder - full implementation requires creating content via Contentful API');
}
//# sourceMappingURL=backup.service.js.map