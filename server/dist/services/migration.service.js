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
function determineAssetName(asset, assetNames, appNames, newName) {
    if (assetNames) {
        const typeKey = asset.type === 'application' ? 'applications' :
            asset.type === 'loyalty_program' ? 'loyalty_programs' :
                asset.type === 'giveaway' ? 'giveaways' :
                    asset.type === 'campaign_template' ? 'campaign_templates' :
                        asset.type === 'audience' ? 'audiences' : null;
        if (typeKey && assetNames[typeKey]) {
            const assetId = asset.id.toString();
            if (assetNames[typeKey][assetId]) {
                return assetNames[typeKey][assetId];
            }
        }
    }
    if (appNames && asset.id) {
        const appName = appNames[asset.id.toString()] || appNames[asset.id];
        if (appName) {
            return appName;
        }
    }
    return newName;
}
const migrate = async (params) => {
    const { sourceId, destId, assets, userId, newName, copySchema = true, appNames, assetNames } = params;
    logger_1.default.info('Migrate service called with params:', {
        sourceId,
        destId,
        userId,
        userIdType: typeof userId,
        assetsCount: assets.length,
        newName,
        appNames,
        copySchema
    });
    try {
        logger_1.default.info(`Fetching source instance ${sourceId} for user ${userId}`);
        const source = await (0, instance_service_1.getInstance)(sourceId, userId);
        logger_1.default.info(`Fetching dest instance ${destId} for user ${userId}`);
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
                    const assetName = determineAssetName(asset, assetNames, appNames, newName);
                    switch (asset.type) {
                        case 'application':
                            await migrateTalonAsset(source, dest, asset, assetName, copySchema);
                            break;
                        case 'loyalty_program':
                            await migrateLoyaltyProgram(source, dest, asset, assetName);
                            break;
                        case 'giveaway':
                            await migrateGiveaway(source, dest, asset, assetName);
                            break;
                        case 'campaign_template':
                            await migrateCampaignTemplate(source, dest, asset, assetName);
                            break;
                        case 'audience':
                            await migrateAudience(source, dest, asset, assetName);
                            break;
                        default:
                            logger_1.default.warn(`Unknown asset type: ${asset.type}, falling back to application migration`);
                            await migrateTalonAsset(source, dest, asset, assetName, copySchema);
                    }
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
                logger_1.default.error(`Migration error for ${asset.type}:${asset.id}:`, {
                    message: errorMsg,
                    response: error.response?.data,
                    stack: error.stack,
                });
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
async function migrateTalonAsset(source, dest, asset, newName, copySchema = true) {
    const appIdStr = typeof asset.id === 'string' && asset.id.startsWith('app-')
        ? asset.id.substring(4)
        : asset.id;
    const appId = typeof appIdStr === 'string' ? parseInt(appIdStr, 10) : appIdStr;
    logger_1.default.info(`Cloning Talon.One application ${appId} with new name: ${newName || 'default'}`);
    const response = await axios_1.default.get(`${source.url}/v1/applications/${appId}`, {
        headers: {
            Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
    });
    logger_1.default.info(`Fetched application response:`, JSON.stringify(response.data, null, 2));
    const appData = response.data.data || response.data;
    if (!appData) {
        throw new Error('No application data returned from Talon.One API');
    }
    const attrs = appData.attributes || appData;
    logger_1.default.info(`Application attributes:`, JSON.stringify(attrs, null, 2));
    const enableCascading = attrs.enableCascadingDiscounts || false;
    const newAppPayload = {
        name: newName || `${attrs.name || 'Cloned App'} (Copy)`,
        description: attrs.description || '',
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
    logger_1.default.info(`Creating new application with payload:`, JSON.stringify(newAppPayload, null, 2));
    let newAppId;
    try {
        const createResponse = await axios_1.default.post(`${dest.url}/v1/applications`, newAppPayload, {
            headers: {
                Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        logger_1.default.info(`Created new application:`, JSON.stringify(createResponse.data, null, 2));
        newAppId = createResponse.data.data?.id || createResponse.data.id;
        logger_1.default.info(`Successfully cloned Talon application ${appId} to new application ${newAppId}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to create application:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw new Error(`Failed to create application: ${error.response?.data?.message || error.message}`);
    }
    await cloneCampaignsAndRules(source, dest, appId, newAppId);
    if (copySchema) {
        logger_1.default.info(`Copying schema attributes from app ${appId} to app ${newAppId}`);
        await cloneApplicationAttributes(source, dest, appId, newAppId);
    }
    else {
        logger_1.default.info(`Skipping schema copy as requested by user`);
    }
}
async function migrateLoyaltyProgram(source, dest, asset, newName) {
    const programId = typeof asset.id === 'string' ? parseInt(asset.id, 10) : asset.id;
    logger_1.default.info(`Cloning loyalty program ${programId} with new name: ${newName || 'default'}`);
    const response = await axios_1.default.get(`${source.url}/v1/loyalty_programs/${programId}`, {
        headers: {
            Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
    });
    const program = response.data.data || response.data;
    const payload = {
        name: newName || `${program.name} (Copy)`,
        title: program.title || program.name,
        description: program.description || '',
        subscribedApplications: program.subscribedApplications || [],
        defaultValidity: program.defaultValidity,
        defaultPending: program.defaultPending,
        allowSubledger: program.allowSubledger || false,
        usersPerCardLimit: program.usersPerCardLimit,
    };
    const createResponse = await axios_1.default.post(`${dest.url}/v1/loyalty_programs`, payload, {
        headers: {
            Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    const newProgramId = createResponse.data.data?.id || createResponse.data.id;
    logger_1.default.info(`Created loyalty program ${newProgramId}`);
    await cloneLoyaltyTiers(source, dest, programId, newProgramId);
}
async function cloneLoyaltyTiers(source, dest, sourceProgramId, destProgramId) {
    try {
        const tiersResponse = await axios_1.default.get(`${source.url}/v1/loyalty_programs/${sourceProgramId}/tiers`, {
            headers: {
                Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
            },
        });
        const tiers = tiersResponse.data.data || [];
        logger_1.default.info(`Found ${tiers.length} tiers to clone for loyalty program ${sourceProgramId}`);
        for (const tier of tiers) {
            const tierPayload = {
                name: tier.name,
                minPoints: tier.minPoints,
            };
            await axios_1.default.post(`${dest.url}/v1/loyalty_programs/${destProgramId}/tiers`, tierPayload, {
                headers: {
                    Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
        }
        logger_1.default.info(`Successfully cloned ${tiers.length} tiers for loyalty program ${destProgramId}`);
    }
    catch (error) {
        logger_1.default.error(`Error cloning tiers for program ${sourceProgramId}:`, error.message);
    }
}
async function migrateGiveaway(source, dest, asset, newName) {
    const giveawayId = typeof asset.id === 'string' ? parseInt(asset.id, 10) : asset.id;
    logger_1.default.info(`Cloning giveaway pool ${giveawayId} with new name: ${newName || 'default'}`);
    const response = await axios_1.default.get(`${source.url}/v1/giveaways/pools/${giveawayId}`, {
        headers: {
            Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
    });
    const pool = response.data.data || response.data;
    const payload = {
        name: newName || `${pool.name} (Copy)`,
        description: pool.description || '',
        subscribedApplications: pool.subscribedApplications || [],
    };
    const createResponse = await axios_1.default.post(`${dest.url}/v1/giveaways/pools`, payload, {
        headers: {
            Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    const newGiveawayId = createResponse.data.data?.id || createResponse.data.id;
    logger_1.default.info(`Created giveaway pool ${newGiveawayId} in destination instance`);
}
async function migrateCampaignTemplate(source, dest, asset, newName) {
    const templateId = typeof asset.id === 'string' ? parseInt(asset.id, 10) : asset.id;
    logger_1.default.info(`Cloning campaign template ${templateId} with new name: ${newName || 'default'}`);
    const response = await axios_1.default.get(`${source.url}/v1/campaign_templates/${templateId}`, {
        headers: {
            Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
    });
    const template = response.data.data || response.data;
    const payload = {
        name: newName || `${template.name} (Copy)`,
        description: template.description || '',
        instructions: template.instructions || '',
        campaignAttributes: template.campaignAttributes || {},
        couponAttributes: template.couponAttributes || {},
        state: template.state || 'draft',
    };
    const createResponse = await axios_1.default.post(`${dest.url}/v1/campaign_templates`, payload, {
        headers: {
            Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    const newTemplateId = createResponse.data.data?.id || createResponse.data.id;
    logger_1.default.info(`Created campaign template ${newTemplateId}`);
}
async function migrateAudience(source, dest, asset, newName) {
    const audienceId = typeof asset.id === 'string' ? parseInt(asset.id, 10) : asset.id;
    logger_1.default.info(`Cloning audience ${audienceId} with new name: ${newName || 'default'}`);
    const response = await axios_1.default.get(`${source.url}/v1/audiences/${audienceId}`, {
        headers: {
            Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
    });
    const audience = response.data.data || response.data;
    const payload = {
        name: newName || `${audience.name} (Copy)`,
    };
    const createResponse = await axios_1.default.post(`${dest.url}/v1/audiences`, payload, {
        headers: {
            Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    const newAudienceId = createResponse.data.data?.id || createResponse.data.id;
    logger_1.default.info(`Created audience ${newAudienceId} (members not copied)`);
}
async function cloneCampaignsAndRules(source, dest, sourceAppId, destAppId) {
    logger_1.default.info(`Cloning campaigns and rules from app ${sourceAppId} to app ${destAppId}`);
    try {
        const campaignsResponse = await axios_1.default.get(`${source.url}/v1/applications/${sourceAppId}/campaigns`, {
            headers: {
                Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
            },
            params: {
                pageSize: 1000,
            },
        });
        const campaigns = campaignsResponse.data.data || [];
        logger_1.default.info(`Found ${campaigns.length} campaigns to clone`);
        for (const campaign of campaigns) {
            try {
                logger_1.default.info(`Campaign ${campaign.id} raw data: ${JSON.stringify(campaign, null, 2)}`);
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
                const newCampaignResponse = await axios_1.default.post(`${dest.url}/v1/applications/${destAppId}/campaigns`, campaignPayload, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                const newCampaignId = newCampaignResponse.data.data?.id || newCampaignResponse.data.id;
                logger_1.default.info(`Cloned campaign ${campaign.id} to ${newCampaignId}`);
                const newRulesetId = await cloneRulesets(source, dest, sourceAppId, campaign.id, destAppId, newCampaignId);
                if (newRulesetId) {
                    await axios_1.default.put(`${dest.url}/v1/applications/${destAppId}/campaigns/${newCampaignId}`, {
                        ...campaignPayload,
                        activeRulesetId: newRulesetId,
                    }, {
                        headers: {
                            Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    logger_1.default.info(`Activated ruleset ${newRulesetId} for campaign ${newCampaignId}`);
                }
                if (campaign.features && campaign.features.includes('coupons')) {
                    await cloneCoupons(source, dest, sourceAppId, campaign.id, destAppId, newCampaignId);
                }
                if (campaign.features && campaign.features.includes('referrals')) {
                    await cloneReferrals(source, dest, sourceAppId, campaign.id, destAppId, newCampaignId);
                }
            }
            catch (error) {
                logger_1.default.error(`Failed to clone campaign ${campaign.id}:`, {
                    message: error.message,
                    response: error.response?.data,
                });
            }
        }
        logger_1.default.info(`Successfully cloned campaigns and rules`);
    }
    catch (error) {
        logger_1.default.error(`Failed to clone campaigns:`, {
            message: error.message,
            response: error.response?.data,
        });
    }
}
async function cloneRulesets(source, dest, sourceAppId, sourceCampaignId, destAppId, destCampaignId) {
    try {
        const rulesetsResponse = await axios_1.default.get(`${source.url}/v1/applications/${sourceAppId}/campaigns/${sourceCampaignId}/rulesets`, {
            headers: {
                Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
            },
        });
        const rulesets = rulesetsResponse.data.data || [];
        logger_1.default.info(`Found ${rulesets.length} rulesets for campaign ${sourceCampaignId}`);
        let newRulesetId = null;
        for (const ruleset of rulesets) {
            try {
                logger_1.default.info(`Ruleset ${ruleset.id} structure: ${JSON.stringify(ruleset, null, 2)}`);
                const rulesetPayload = {
                    rules: ruleset.rules || [],
                    bindings: ruleset.bindings || [],
                };
                if (ruleset.strikethroughRules && ruleset.strikethroughRules.length > 0) {
                    rulesetPayload.strikethroughRules = ruleset.strikethroughRules;
                }
                logger_1.default.info(`Creating ruleset with payload: ${JSON.stringify(rulesetPayload, null, 2)}`);
                const newRulesetResponse = await axios_1.default.post(`${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/rulesets`, rulesetPayload, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                newRulesetId = newRulesetResponse.data.data?.id || newRulesetResponse.data.id;
                logger_1.default.info(`Cloned ruleset ${ruleset.id} to new ruleset ${newRulesetId} for campaign ${destCampaignId}`);
            }
            catch (error) {
                logger_1.default.error(`Failed to clone ruleset ${ruleset.id}:`, {
                    message: error.message,
                    response: error.response?.data,
                });
            }
        }
        return newRulesetId;
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch/clone rulesets:`, {
            message: error.message,
            response: error.response?.data,
        });
        return null;
    }
}
async function cloneCoupons(source, dest, sourceAppId, sourceCampaignId, destAppId, destCampaignId) {
    try {
        logger_1.default.info(`Cloning coupons from campaign ${sourceCampaignId} to ${destCampaignId}`);
        const couponsResponse = await axios_1.default.get(`${source.url}/v1/applications/${sourceAppId}/campaigns/${sourceCampaignId}/coupons/no_total`, {
            headers: {
                Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
            },
            params: {
                pageSize: 1000,
            },
        });
        const coupons = couponsResponse.data.data || [];
        logger_1.default.info(`Found ${coupons.length} coupons to clone`);
        if (coupons.length > 0) {
            console.log(`SOURCE COUPON DATA:`, JSON.stringify(coupons[0], null, 2));
            logger_1.default.info(`Sample source coupon - value: ${coupons[0].value}, expiryDate: ${coupons[0].expiryDate}, startDate: ${coupons[0].startDate}`);
        }
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
        await axios_1.default.post(`${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_coupons`, formData, {
            headers: {
                Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                ...formData.getHeaders(),
            },
        });
        logger_1.default.info(`Successfully imported ${coupons.length} coupon codes to campaign ${destCampaignId}`);
        let newCoupons = [];
        let retries = 0;
        const maxRetries = 10;
        while (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newCouponsResponse = await axios_1.default.get(`${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/no_total`, {
                headers: {
                    Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                },
                params: {
                    pageSize: 1000,
                },
            });
            newCoupons = newCouponsResponse.data.data || [];
            logger_1.default.info(`Fetched ${newCoupons.length} coupons from destination campaign (attempt ${retries + 1})`);
            if (newCoupons.length >= coupons.length) {
                break;
            }
            retries++;
        }
        if (newCoupons.length === 0) {
            logger_1.default.warn(`No coupons found after import - skipping property updates`);
            return;
        }
        for (const sourceCoupon of coupons) {
            try {
                const destCoupon = newCoupons.find((c) => c.value === sourceCoupon.value);
                if (!destCoupon) {
                    logger_1.default.warn(`Could not find destination coupon for ${sourceCoupon.value}`);
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
                    console.log(`Coupon ${sourceCoupon.value} startDate: ${sourceCoupon.startDate}`);
                }
                if (sourceCoupon.expiryDate) {
                    updatePayload.expiryDate = sourceCoupon.expiryDate;
                    console.log(`Coupon ${sourceCoupon.value} expiryDate: ${sourceCoupon.expiryDate}`);
                }
                if (sourceCoupon.attributes) {
                    updatePayload.attributes = sourceCoupon.attributes;
                }
                if (Object.keys(updatePayload).length > 0) {
                    logger_1.default.info(`Updating coupon ${sourceCoupon.value} with payload: ${JSON.stringify(updatePayload)}`);
                    console.log(`COUPON UPDATE PAYLOAD for ${sourceCoupon.value}:`, JSON.stringify(updatePayload, null, 2));
                    const updateResponse = await axios_1.default.put(`${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/${destCoupon.id}`, updatePayload, {
                        headers: {
                            Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log(`COUPON UPDATE RESPONSE for ${sourceCoupon.value}:`, JSON.stringify(updateResponse.data, null, 2));
                    logger_1.default.info(`Updated properties for coupon ${sourceCoupon.value} (ID: ${destCoupon.id})`);
                }
            }
            catch (error) {
                logger_1.default.error(`Failed to update coupon ${sourceCoupon.value}:`, {
                    message: error.message,
                    response: error.response?.data,
                });
            }
        }
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch/clone coupons:`, {
            message: error.message,
            response: error.response?.data,
        });
    }
}
async function cloneApplicationAttributes(source, dest, sourceAppId, destAppId) {
    try {
        if (source.url === dest.url) {
            logger_1.default.info(`Skipping attribute cloning - source and destination are the same instance`);
            return;
        }
        logger_1.default.info(`Cloning application attributes from app ${sourceAppId} to app ${destAppId}`);
        const attributesResponse = await axios_1.default.get(`${source.url}/v1/attributes`, {
            headers: {
                Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
            },
            params: {
                applicationId: sourceAppId,
            },
        });
        const attributes = attributesResponse.data.data || [];
        logger_1.default.info(`Found ${attributes.length} attributes to clone`);
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
                await axios_1.default.post(`${dest.url}/v1/attributes`, attributePayload, {
                    headers: {
                        Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                logger_1.default.info(`Cloned attribute ${attribute.entity}.${attribute.name} to app ${destAppId}`);
            }
            catch (error) {
                logger_1.default.error(`Failed to clone attribute ${attribute.entity}.${attribute.name}:`, {
                    message: error.message,
                    response: error.response?.data,
                });
            }
        }
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch/clone attributes:`, {
            message: error.message,
            response: error.response?.data,
        });
    }
}
async function cloneReferrals(source, dest, sourceAppId, sourceCampaignId, destAppId, destCampaignId) {
    try {
        logger_1.default.info(`Cloning referrals from campaign ${sourceCampaignId} to ${destCampaignId}`);
        const referralsResponse = await axios_1.default.get(`${source.url}/v1/applications/${sourceAppId}/campaigns/${sourceCampaignId}/referrals/no_total`, {
            headers: {
                Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
            },
            params: {
                pageSize: 1000,
            },
        });
        const referrals = referralsResponse.data.data || [];
        logger_1.default.info(`Found ${referrals.length} referral codes to clone`);
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
        await axios_1.default.post(`${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_referrals`, formData, {
            headers: {
                Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                ...formData.getHeaders(),
            },
        });
        logger_1.default.info(`Successfully imported ${referrals.length} referral codes to campaign ${destCampaignId}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch/clone referrals:`, {
            message: error.message,
            response: error.response?.data,
        });
    }
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