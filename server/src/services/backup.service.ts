// Backup Service
// Creates and restores backups of instances

import prisma from '../models/prisma';
import { getInstance } from './instance.service';
import logger from '../utils/logger';
import axios from 'axios';

interface CreateBackupParams {
  instanceId: number;
  name: string;
  userId: number;
}

interface RestoreBackupParams {
  backupId: number;
  targetInstanceId: number;
  userId: number;
  newName: string;
}

export const createBackup = async (params: CreateBackupParams) => {
  const { instanceId, name, userId } = params;

  try {
    // Get instance details
    const instance = await getInstance(instanceId, userId);

    logger.info(`Creating backup for instance: ${instance.name}`);

    // Fetch all data from instance based on type
    let backupData: any = {};

    if (instance.type === 'talon') {
      backupData = await fetchTalonData(instance);
    } else if (instance.type === 'contentful') {
      backupData = await fetchContentfulData(instance);
    }

    // Calculate size of backup data
    const backupSize = JSON.stringify(backupData).length;

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        name,
        instanceId,
        data: backupData,
        size: backupSize,
        vertical: instance.vertical,
      },
    });

    logger.info(`Backup created: ${backup.name} (${backupSize} bytes) for vertical: ${instance.vertical}`);

    return {
      id: backup.id,
      name: backup.name,
      instanceId: backup.instanceId,
      createdAt: backup.createdAt,
      size: backup.size,
      vertical: backup.vertical,
    };
  } catch (error) {
    logger.error('Create backup error:', error);
    throw error;
  }
};

export const restoreBackup = async (params: RestoreBackupParams) => {
  const { backupId, targetInstanceId, userId, newName } = params;

  try {
    // Get backup
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    // Get target instance
    const instance = await getInstance(targetInstanceId, userId);

    logger.info(`Restoring backup ${backup.name} to instance: ${instance.name} with new name: ${newName}`);

    // Check if application with the same name already exists
    if (instance.type === 'talon') {
      const existingApps = await checkExistingTalonApp(instance, newName);
      if (existingApps) {
        throw new Error(`An application named "${newName}" already exists in the target instance`);
      }
      await restoreTalonData(instance, backup.data, newName);
    } else if (instance.type === 'contentful') {
      await restoreContentfulData(instance, backup.data, newName);
    }

    logger.info(`Backup restored successfully with name: ${newName}`);

    return {
      success: true,
      message: 'Backup restored successfully',
      applicationName: newName,
    };
  } catch (error) {
    logger.error('Restore backup error:', error);
    throw error;
  }
};

export const listBackups = async (userId: number, vertical?: string) => {
  const backups = await prisma.backup.findMany({
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

export const getBackupCountsByVertical = async () => {
  const backups = await prisma.backup.findMany({
    select: {
      vertical: true,
    },
  });

  const counts: Record<string, number> = {};
  backups.forEach(backup => {
    const vertical = backup.vertical || 'Uncategorized';
    counts[vertical] = (counts[vertical] || 0) + 1;
  });

  return counts;
};

export const getBackup = async (backupId: number) => {
  const backup = await prisma.backup.findUnique({
    where: { id: backupId },
  });

  if (!backup) {
    throw new Error('Backup not found');
  }

  return backup;
};

export const deleteBackup = async (backupId: number) => {
  await prisma.backup.delete({
    where: { id: backupId },
  });

  logger.info(`Backup deleted: ${backupId}`);

  return { success: true };
};

// Helper functions to fetch data from instances
async function fetchTalonData(instance: any) {
  const data: any = {};

  try {
    // Fetch applications
    const appsResponse = await axios.get(`${instance.url}/v1/applications`, {
      headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
    });
    data.applications = appsResponse.data;

    // Fetch detailed data for each application
    const applications = appsResponse.data?.data || [];
    data.applicationDetails = [];

    for (const app of applications) {
      const appId = app.id;
      const appData: any = {
        application: app,
        campaigns: [],
        attributes: [],
      };

      // Fetch campaigns for this application
      try {
        const campaignsResponse = await axios.get(
          `${instance.url}/v1/applications/${appId}/campaigns`,
          {
            headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
            params: { pageSize: 1000 },
          }
        );
        appData.campaigns = campaignsResponse.data?.data || [];

        // Fetch rulesets, coupons, and referrals for each campaign
        for (const campaign of appData.campaigns) {
          // Fetch rulesets
          try {
            const rulesetsResponse = await axios.get(
              `${instance.url}/v1/applications/${appId}/campaigns/${campaign.id}/rulesets`,
              {
                headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
              }
            );
            campaign.rulesets = rulesetsResponse.data?.data || [];
          } catch (error) {
            logger.error(`Error fetching rulesets for campaign ${campaign.id}:`, error);
            campaign.rulesets = [];
          }

          // Fetch coupons if campaign has coupon feature
          if (campaign.features && campaign.features.includes('coupons')) {
            try {
              const couponsResponse = await axios.get(
                `${instance.url}/v1/applications/${appId}/campaigns/${campaign.id}/coupons/no_total`,
                {
                  headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
                  params: { pageSize: 1000 },
                }
              );
              campaign.coupons = couponsResponse.data?.data || [];
            } catch (error) {
              logger.error(`Error fetching coupons for campaign ${campaign.id}:`, error);
              campaign.coupons = [];
            }
          }

          // Fetch referrals if campaign has referral feature
          if (campaign.features && campaign.features.includes('referrals')) {
            try {
              const referralsResponse = await axios.get(
                `${instance.url}/v1/applications/${appId}/campaigns/${campaign.id}/referrals/no_total`,
                {
                  headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
                  params: { pageSize: 1000 },
                }
              );
              campaign.referrals = referralsResponse.data?.data || [];
            } catch (error) {
              logger.error(`Error fetching referrals for campaign ${campaign.id}:`, error);
              campaign.referrals = [];
            }
          }
        }
      } catch (error) {
        logger.error(`Error fetching campaigns for app ${appId}:`, error);
      }

      // Fetch attributes for this application
      try {
        const attributesResponse = await axios.get(
          `${instance.url}/v1/attributes`,
          {
            headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
            params: { applicationId: appId },
          }
        );
        appData.attributes = attributesResponse.data?.data || [];
      } catch (error) {
        logger.error(`Error fetching attributes for app ${appId}:`, error);
      }

      data.applicationDetails.push(appData);
    }

    logger.info(`Fetched Talon.One data for backup: ${applications.length} applications`);
  } catch (error) {
    logger.error('Error fetching Talon data:', error);
    throw error;
  }

  return data;
}

async function fetchContentfulData(instance: any) {
  const data: any = {};

  try {
    // Fetch content types
    const ctResponse = await axios.get(
      `https://api.contentful.com/spaces/${instance.credentials.spaceId}/content_types`,
      {
        headers: { Authorization: `Bearer ${instance.credentials.accessToken}` },
      }
    );
    data.contentTypes = ctResponse.data;

    logger.info('Fetched Contentful data for backup');
  } catch (error) {
    logger.error('Error fetching Contentful data:', error);
    throw error;
  }

  return data;
}

async function checkExistingTalonApp(instance: any, appName: string): Promise<boolean> {
  try {
    const response = await axios.get(`${instance.url}/v1/applications`, {
      headers: { Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}` },
    });

    const applications = response.data?.data || [];
    const exists = applications.some((app: any) => {
      const name = app.attributes?.name || app.name;
      return name === appName;
    });

    return exists;
  } catch (error) {
    logger.error('Error checking existing Talon app:', error);
    throw new Error('Failed to check for existing applications');
  }
}

async function restoreTalonData(instance: any, backupData: any, newName: string) {
  logger.info(`Restoring Talon.One data with name: ${newName}...`);
  logger.info(`Target instance: ${instance.name}`);

  try {
    // Get the first application from backup to use as template
    const appDetails = backupData.applicationDetails?.[0];
    if (!appDetails || !appDetails.application) {
      throw new Error('No application data found in backup');
    }

    const sourceApp = appDetails.application;
    logger.info(`Using source application as template: ${sourceApp.name || sourceApp.attributes?.name || 'Unknown'}`);

    // Get attributes - might be at attributes or at root level
    const attrs = sourceApp.attributes || sourceApp;

    // Prepare the payload for creating a new application
    const enableCascading = attrs.enableCascadingDiscounts || false;

    const newAppPayload: any = {
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

    // Only set these fields if cascading discounts is enabled (Talon.One requirement)
    if (enableCascading) {
      if (attrs.defaultDiscountScope) {
        newAppPayload.defaultDiscountScope = attrs.defaultDiscountScope;
      }
      if (attrs.defaultDiscountAdditionalCostPerItemScope) {
        newAppPayload.defaultDiscountAdditionalCostPerItemScope = attrs.defaultDiscountAdditionalCostPerItemScope;
      }
    }

    logger.info(`Creating new application: ${newName}`);

    // Create new application in destination
    const createResponse = await axios.post(
      `${instance.url}/v1/applications`,
      newAppPayload,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const newAppId = createResponse.data.data?.id || createResponse.data.id;
    logger.info(`Successfully created application with ID: ${newAppId}`);

    // Now restore campaigns, rules, coupons, referrals, and attributes
    await restoreCampaignsAndRules(instance, appDetails.campaigns || [], newAppId);

    // Restore application-level attributes
    await restoreApplicationAttributes(instance, appDetails.attributes || [], newAppId);

    logger.info(`Application restoration complete for: ${newName}`);
    return {
      applicationId: newAppId,
      applicationName: newName,
    };
  } catch (error: any) {
    logger.error('Error restoring Talon.One data:', error);
    if (error.response) {
      logger.error('API error response:', {
        status: error.response.status,
        data: error.response.data,
      });
      throw new Error(`Failed to create application: ${error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

// Restore campaigns and rules from backup
async function restoreCampaignsAndRules(instance: any, campaigns: any[], destAppId: number) {
  logger.info(`Restoring ${campaigns.length} campaigns to app ${destAppId}`);

  for (const campaign of campaigns) {
    try {
      logger.info(`Restoring campaign: ${campaign.name}`);

      // Prepare campaign payload
      const campaignPayload: any = {
        name: campaign.name || `Campaign ${campaign.id}`,
        description: campaign.description || '',
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        attributes: campaign.attributes || {},
        state: 'disabled', // Create in disabled state
        tags: campaign.tags || [],
        features: campaign.features || [],
        limits: campaign.limits || [],
        campaignGroups: campaign.campaignGroups || [],
        linkedStoreIds: campaign.linkedStoreIds || [],
      };

      // Only include these fields if they have values
      if (campaign.couponSettings) {
        campaignPayload.couponSettings = campaign.couponSettings;
      }
      if (campaign.referralSettings) {
        campaignPayload.referralSettings = campaign.referralSettings;
      }
      if (campaign.type && (campaign.type === 'cartItem' || campaign.type === 'advanced')) {
        campaignPayload.type = campaign.type;
      }

      logger.info(`Creating campaign with payload: ${JSON.stringify(campaignPayload, null, 2)}`);

      // Create campaign in destination
      const newCampaignResponse = await axios.post(
        `${instance.url}/v1/applications/${destAppId}/campaigns`,
        campaignPayload,
        {
          headers: {
            Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newCampaignId = newCampaignResponse.data.data?.id || newCampaignResponse.data.id;
      logger.info(`Created campaign ${newCampaignId}`);

      // Restore rulesets for this campaign
      const newRulesetId = await restoreRulesets(instance, campaign.rulesets || [], destAppId, newCampaignId);

      // If a ruleset was created, activate it on the campaign
      if (newRulesetId) {
        await axios.put(
          `${instance.url}/v1/applications/${destAppId}/campaigns/${newCampaignId}`,
          {
            ...campaignPayload,
            activeRulesetId: newRulesetId,
          },
          {
            headers: {
              Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        logger.info(`Activated ruleset ${newRulesetId} for campaign ${newCampaignId}`);
      }

      // Restore coupons for this campaign if it has coupon features
      if (campaign.features && campaign.features.includes('coupons') && campaign.coupons) {
        await restoreCoupons(instance, campaign.coupons, destAppId, newCampaignId);
      }

      // Restore referral codes for this campaign if it has referral features
      if (campaign.features && campaign.features.includes('referrals') && campaign.referrals) {
        await restoreReferrals(instance, campaign.referrals, destAppId, newCampaignId);
      }
    } catch (error: any) {
      logger.error(`Failed to restore campaign ${campaign.name}:`, {
        message: error.message,
        response: error.response?.data,
      });
      // Continue with other campaigns even if one fails
    }
  }

  logger.info(`Successfully restored campaigns`);
}

// Restore rulesets for a campaign
async function restoreRulesets(
  instance: any,
  rulesets: any[],
  destAppId: number,
  destCampaignId: number
): Promise<number | null> {
  try {
    logger.info(`Restoring ${rulesets.length} rulesets for campaign ${destCampaignId}`);

    let newRulesetId: number | null = null;

    for (const ruleset of rulesets) {
      try {
        // Create ruleset in destination
        const rulesetPayload: any = {
          rules: ruleset.rules || [],
          bindings: ruleset.bindings || [],
        };

        // Only include strikethroughRules if they exist
        if (ruleset.strikethroughRules && ruleset.strikethroughRules.length > 0) {
          rulesetPayload.strikethroughRules = ruleset.strikethroughRules;
        }

        logger.info(`Creating ruleset with ${rulesetPayload.rules.length} rules`);

        const newRulesetResponse = await axios.post(
          `${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/rulesets`,
          rulesetPayload,
          {
            headers: {
              Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        newRulesetId = newRulesetResponse.data.data?.id || newRulesetResponse.data.id;
        logger.info(`Created ruleset ${newRulesetId}`);
      } catch (error: any) {
        logger.error(`Failed to restore ruleset:`, {
          message: error.message,
          response: error.response?.data,
        });
      }
    }

    return newRulesetId;
  } catch (error: any) {
    logger.error(`Failed to restore rulesets:`, {
      message: error.message,
      response: error.response?.data,
    });
    return null;
  }
}

// Restore coupons for a campaign
async function restoreCoupons(
  instance: any,
  coupons: any[],
  destAppId: number,
  destCampaignId: number
) {
  try {
    logger.info(`Restoring ${coupons.length} coupons to campaign ${destCampaignId}`);

    if (coupons.length === 0) {
      return;
    }

    // Step 1: Import coupon codes via CSV
    const csvRows: string[] = ['value'];
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

    await axios.post(
      `${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_coupons`,
      formData,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    logger.info(`Imported ${coupons.length} coupon codes`);

    // Step 2: Wait for coupons to be created, then fetch them
    let newCoupons: any[] = [];
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCouponsResponse = await axios.get(
        `${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/no_total`,
        {
          headers: {
            Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
          },
          params: { pageSize: 1000 },
        }
      );

      newCoupons = newCouponsResponse.data.data || [];
      if (newCoupons.length >= coupons.length) {
        break;
      }
      retries++;
    }

    // Step 3: Update each coupon with its properties
    for (const sourceCoupon of coupons) {
      try {
        const destCoupon = newCoupons.find((c: any) => c.value === sourceCoupon.value);
        if (!destCoupon) {
          continue;
        }

        const updatePayload: any = {};
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
          await axios.put(
            `${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/${destCoupon.id}`,
            updatePayload,
            {
              headers: {
                Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
        }
      } catch (error: any) {
        logger.error(`Failed to update coupon ${sourceCoupon.value}:`, error);
      }
    }

    logger.info(`Successfully restored coupons`);
  } catch (error: any) {
    logger.error(`Failed to restore coupons:`, {
      message: error.message,
      response: error.response?.data,
    });
  }
}

// Restore referral codes for a campaign
async function restoreReferrals(
  instance: any,
  referrals: any[],
  destAppId: number,
  destCampaignId: number
) {
  try {
    logger.info(`Restoring ${referrals.length} referral codes to campaign ${destCampaignId}`);

    if (referrals.length === 0) {
      return;
    }

    // Build CSV format for import
    const csvRows: string[] = ['code'];
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

    await axios.post(
      `${instance.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_referrals`,
      formData,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    logger.info(`Successfully imported ${referrals.length} referral codes`);
  } catch (error: any) {
    logger.error(`Failed to restore referrals:`, {
      message: error.message,
      response: error.response?.data,
    });
  }
}

// Restore application-level attributes
async function restoreApplicationAttributes(
  instance: any,
  attributes: any[],
  destAppId: number
) {
  try {
    logger.info(`Restoring ${attributes.length} attributes to app ${destAppId}`);

    for (const attribute of attributes) {
      try {
        const attributePayload: any = {
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

        // Only include allowedValues if hasAllowedList is true
        if (attribute.hasAllowedList && attribute.allowedValues) {
          attributePayload.allowedValues = attribute.allowedValues;
        }

        await axios.post(
          `${instance.url}/v1/attributes`,
          attributePayload,
          {
            headers: {
              Authorization: `ManagementKey-v1 ${instance.credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        logger.info(`Restored attribute ${attribute.entity}.${attribute.name}`);
      } catch (error: any) {
        // Attribute might already exist - that's okay
        if (error.response?.status === 409) {
          logger.info(`Attribute ${attribute.entity}.${attribute.name} already exists - skipping`);
        } else {
          logger.error(`Failed to restore attribute ${attribute.entity}.${attribute.name}:`, {
            message: error.message,
            response: error.response?.data,
          });
        }
      }
    }
  } catch (error: any) {
    logger.error(`Failed to restore attributes:`, {
      message: error.message,
      response: error.response?.data,
    });
  }
}

async function restoreContentfulData(instance: any, backupData: any, newName: string) {
  // Implementation for restoring Contentful data
  logger.info(`Restoring Contentful data with name: ${newName}...`);
  // This would involve creating/updating resources via Contentful API
  logger.info('Restore functionality is a placeholder - full implementation requires creating content via Contentful API');
}
