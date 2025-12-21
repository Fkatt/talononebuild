// Migration Service
// Handles migration/cloning of data between Talon.One and Contentful instances

import prisma from '../models/prisma';
import { getInstance } from './instance.service';
import logger from '../utils/logger';
import axios from 'axios';

interface Asset {
  type: string;
  id: string | number;
}

interface MigrateParams {
  sourceId: number;
  destId: number;
  assets: Asset[];
  userId: number;
  newName?: string;
}

export const migrate = async (params: MigrateParams) => {
  const { sourceId, destId, assets, userId, newName } = params;

  try {
    // Get source and destination instances
    const source = await getInstance(sourceId, userId);
    const dest = await getInstance(destId, userId);

    // Verify both instances are the same type
    if (source.type !== dest.type) {
      throw new Error('Source and destination must be the same type');
    }

    logger.info(`Starting migration from ${source.name} to ${dest.name}`);

    // Create migration log
    const migrationLog = await prisma.migrationLog.create({
      data: {
        sourceId,
        destId,
        assets: assets as any,
        status: 'in_progress',
      },
    });

    const results: any[] = [];
    const errors: any[] = [];

    // Process each asset
    for (const asset of assets) {
      try {
        if (source.type === 'talon') {
          await migrateTalonAsset(source, dest, asset, newName);
        } else if (source.type === 'contentful') {
          await migrateContentfulAsset(source, dest, asset);
        }

        results.push({
          type: asset.type,
          id: asset.id,
          status: 'success',
        });
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Migration error for ${asset.type}:${asset.id}:`, {
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

    // Update migration log
    const status = errors.length === 0 ? 'success' : errors.length < assets.length ? 'partial' : 'failed';

    await prisma.migrationLog.update({
      where: { id: migrationLog.id },
      data: {
        status,
        errors: errors.length > 0 ? (errors as any) : undefined,
        completedAt: new Date(),
      },
    });

    logger.info(`Migration completed with status: ${status}`);

    return {
      migrationId: migrationLog.id,
      status,
      results,
      errors,
    };
  } catch (error) {
    logger.error('Migration error:', error);
    throw error;
  }
};

// Migrate Talon.One asset
async function migrateTalonAsset(source: any, dest: any, asset: Asset, newName?: string) {
  // Extract the actual application ID from the asset ID (format: "app-123")
  const appIdStr = typeof asset.id === 'string' && asset.id.startsWith('app-')
    ? asset.id.substring(4)
    : asset.id;
  const appId = typeof appIdStr === 'string' ? parseInt(appIdStr, 10) : appIdStr;

  logger.info(`Cloning Talon.One application ${appId} with new name: ${newName || 'default'}`);

  // Fetch application from source
  const response = await axios.get(`${source.url}/v1/applications/${appId}`, {
    headers: {
      Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
    },
  });

  logger.info(`Fetched application response:`, JSON.stringify(response.data, null, 2));

  // Handle both possible response structures
  const appData = response.data.data || response.data;

  if (!appData) {
    throw new Error('No application data returned from Talon.One API');
  }

  // Get attributes - might be at attributes or at root level
  const attrs = appData.attributes || appData;

  logger.info(`Application attributes:`, JSON.stringify(attrs, null, 2));

  // Prepare the payload for creating a new application
  const enableCascading = attrs.enableCascadingDiscounts || false;

  const newAppPayload: any = {
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

  // Only set these fields if cascading discounts is enabled (Talon.One requirement)
  if (enableCascading) {
    if (attrs.defaultDiscountScope) {
      newAppPayload.defaultDiscountScope = attrs.defaultDiscountScope;
    }
    if (attrs.defaultDiscountAdditionalCostPerItemScope) {
      newAppPayload.defaultDiscountAdditionalCostPerItemScope = attrs.defaultDiscountAdditionalCostPerItemScope;
    }
  }

  logger.info(`Creating new application with payload:`, JSON.stringify(newAppPayload, null, 2));

  // Create new application in destination
  let newAppId: number;
  try {
    const createResponse = await axios.post(`${dest.url}/v1/applications`, newAppPayload, {
      headers: {
        Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info(`Created new application:`, JSON.stringify(createResponse.data, null, 2));
    newAppId = createResponse.data.data?.id || createResponse.data.id;
    logger.info(`Successfully cloned Talon application ${appId} to new application ${newAppId}`);
  } catch (error: any) {
    logger.error(`Failed to create application:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Failed to create application: ${error.response?.data?.message || error.message}`);
  }

  // Now clone campaigns, rules, coupons, referrals, and attributes
  await cloneCampaignsAndRules(source, dest, appId, newAppId);

  // Clone application-level attributes
  await cloneApplicationAttributes(source, dest, appId, newAppId);
}

// Clone campaigns and rules from source application to destination application
async function cloneCampaignsAndRules(source: any, dest: any, sourceAppId: number, destAppId: number) {
  logger.info(`Cloning campaigns and rules from app ${sourceAppId} to app ${destAppId}`);

  try {
    // Fetch campaigns from source application
    const campaignsResponse = await axios.get(`${source.url}/v1/applications/${sourceAppId}/campaigns`, {
      headers: {
        Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
      },
      params: {
        pageSize: 1000, // Get all campaigns
      },
    });

    const campaigns = campaignsResponse.data.data || [];
    logger.info(`Found ${campaigns.length} campaigns to clone`);

    for (const campaign of campaigns) {
      try {
        logger.info(`Campaign ${campaign.id} raw data: ${JSON.stringify(campaign, null, 2)}`);

        // Prepare campaign payload - use campaign directly, not campaign.attributes
        const campaignPayload: any = {
          name: campaign.name || `Campaign ${campaign.id}`,
          description: campaign.description || '',
          startTime: campaign.startTime,
          endTime: campaign.endTime,
          attributes: campaign.attributes || {},
          state: 'disabled', // Create in disabled state to avoid immediate activation
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
          `${dest.url}/v1/applications/${destAppId}/campaigns`,
          campaignPayload,
          {
            headers: {
              Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const newCampaignId = newCampaignResponse.data.data?.id || newCampaignResponse.data.id;
        logger.info(`Cloned campaign ${campaign.id} to ${newCampaignId}`);

        // Clone rulesets/rules for this campaign and get the new ruleset ID
        const newRulesetId = await cloneRulesets(source, dest, sourceAppId, campaign.id, destAppId, newCampaignId);

        // If a ruleset was created, activate it on the campaign
        if (newRulesetId) {
          await axios.put(
            `${dest.url}/v1/applications/${destAppId}/campaigns/${newCampaignId}`,
            {
              ...campaignPayload,
              activeRulesetId: newRulesetId,
            },
            {
              headers: {
                Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
          logger.info(`Activated ruleset ${newRulesetId} for campaign ${newCampaignId}`);
        }

        // Clone coupons for this campaign if it has coupon features
        if (campaign.features && campaign.features.includes('coupons')) {
          await cloneCoupons(source, dest, sourceAppId, campaign.id, destAppId, newCampaignId);
        }

        // Clone referral codes for this campaign if it has referral features
        if (campaign.features && campaign.features.includes('referrals')) {
          await cloneReferrals(source, dest, sourceAppId, campaign.id, destAppId, newCampaignId);
        }
      } catch (error: any) {
        logger.error(`Failed to clone campaign ${campaign.id}:`, {
          message: error.message,
          response: error.response?.data,
        });
        // Continue with other campaigns even if one fails
      }
    }

    logger.info(`Successfully cloned campaigns and rules`);
  } catch (error: any) {
    logger.error(`Failed to clone campaigns:`, {
      message: error.message,
      response: error.response?.data,
    });
    // Don't throw - we still created the application successfully
  }
}

// Clone rulesets from source campaign to destination campaign
// Returns the ID of the new active ruleset, or null if none created
async function cloneRulesets(
  source: any,
  dest: any,
  sourceAppId: number,
  sourceCampaignId: number,
  destAppId: number,
  destCampaignId: number
): Promise<number | null> {
  try {
    // Fetch rulesets from source campaign
    const rulesetsResponse = await axios.get(
      `${source.url}/v1/applications/${sourceAppId}/campaigns/${sourceCampaignId}/rulesets`,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
      }
    );

    const rulesets = rulesetsResponse.data.data || [];
    logger.info(`Found ${rulesets.length} rulesets for campaign ${sourceCampaignId}`);

    let newRulesetId: number | null = null;

    for (const ruleset of rulesets) {
      try {
        logger.info(`Ruleset ${ruleset.id} structure: ${JSON.stringify(ruleset, null, 2)}`);

        // Create ruleset in destination with all required fields - use ruleset directly
        const rulesetPayload: any = {
          rules: ruleset.rules || [],
          bindings: ruleset.bindings || [],
        };

        // Only include strikethroughRules if they exist
        if (ruleset.strikethroughRules && ruleset.strikethroughRules.length > 0) {
          rulesetPayload.strikethroughRules = ruleset.strikethroughRules;
        }

        logger.info(`Creating ruleset with payload: ${JSON.stringify(rulesetPayload, null, 2)}`);

        const newRulesetResponse = await axios.post(
          `${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/rulesets`,
          rulesetPayload,
          {
            headers: {
              Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Get the new ruleset ID from the response
        newRulesetId = newRulesetResponse.data.data?.id || newRulesetResponse.data.id;
        logger.info(`Cloned ruleset ${ruleset.id} to new ruleset ${newRulesetId} for campaign ${destCampaignId}`);
      } catch (error: any) {
        logger.error(`Failed to clone ruleset ${ruleset.id}:`, {
          message: error.message,
          response: error.response?.data,
        });
      }
    }

    return newRulesetId;
  } catch (error: any) {
    logger.error(`Failed to fetch/clone rulesets:`, {
      message: error.message,
      response: error.response?.data,
    });
    return null;
  }
}

// Clone coupons from source campaign to destination campaign
async function cloneCoupons(
  source: any,
  dest: any,
  sourceAppId: number,
  sourceCampaignId: number,
  destAppId: number,
  destCampaignId: number
) {
  try {
    logger.info(`Cloning coupons from campaign ${sourceCampaignId} to ${destCampaignId}`);

    // Fetch coupons from source campaign using no_total endpoint
    const couponsResponse = await axios.get(
      `${source.url}/v1/applications/${sourceAppId}/campaigns/${sourceCampaignId}/coupons/no_total`,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
        params: {
          pageSize: 1000,
        },
      }
    );

    const coupons = couponsResponse.data.data || [];
    logger.info(`Found ${coupons.length} coupons to clone`);

    if (coupons.length === 0) {
      return;
    }

    // Step 1: Import just the coupon codes via CSV (only "value" column is supported)
    const csvRows: string[] = ['value'];

    for (const coupon of coupons) {
      csvRows.push(coupon.value);
    }

    const csvData = csvRows.join('\n');

    // Import coupons using the import endpoint with multipart/form-data
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('upFile', csvData, {
      filename: 'coupons.csv',
      contentType: 'text/csv',
    });

    await axios.post(
      `${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_coupons`,
      formData,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    logger.info(`Successfully imported ${coupons.length} coupon codes to campaign ${destCampaignId}`);

    // Step 2: Wait for coupons to be created, then fetch them to get their IDs
    // The import is asynchronous, so we need to wait and retry
    let newCoupons: any[] = [];
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      // Wait a bit before fetching
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCouponsResponse = await axios.get(
        `${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/no_total`,
        {
          headers: {
            Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
          },
          params: {
            pageSize: 1000,
          },
        }
      );

      newCoupons = newCouponsResponse.data.data || [];
      logger.info(`Fetched ${newCoupons.length} coupons from destination campaign (attempt ${retries + 1})`);

      // Check if we found all the coupons we imported
      if (newCoupons.length >= coupons.length) {
        break;
      }

      retries++;
    }

    if (newCoupons.length === 0) {
      logger.warn(`No coupons found after import - skipping property updates`);
      return;
    }

    // Step 3: Update each coupon with its properties (usageLimit, dates, etc.)
    for (const sourceCoupon of coupons) {
      try {
        // Find the corresponding coupon in the destination by matching the value
        const destCoupon = newCoupons.find((c: any) => c.value === sourceCoupon.value);
        if (!destCoupon) {
          logger.warn(`Could not find destination coupon for ${sourceCoupon.value}`);
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

        // Only update if there are properties to set
        if (Object.keys(updatePayload).length > 0) {
          await axios.put(
            `${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/coupons/${destCoupon.id}`,
            updatePayload,
            {
              headers: {
                Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
          logger.info(`Updated properties for coupon ${sourceCoupon.value} (ID: ${destCoupon.id})`);
        }
      } catch (error: any) {
        logger.error(`Failed to update coupon ${sourceCoupon.value}:`, {
          message: error.message,
          response: error.response?.data,
        });
      }
    }
  } catch (error: any) {
    logger.error(`Failed to fetch/clone coupons:`, {
      message: error.message,
      response: error.response?.data,
    });
  }
}

// Clone application-level attributes
async function cloneApplicationAttributes(
  source: any,
  dest: any,
  sourceAppId: number,
  destAppId: number
) {
  try {
    // If source and destination are the same instance, skip attribute cloning
    // Attributes are account-wide in Talon.One, so they're already shared
    if (source.url === dest.url) {
      logger.info(`Skipping attribute cloning - source and destination are the same instance`);
      return;
    }

    logger.info(`Cloning application attributes from app ${sourceAppId} to app ${destAppId}`);

    // Fetch attributes from source (account-level endpoint)
    const attributesResponse = await axios.get(
      `${source.url}/v1/attributes`,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
        params: {
          applicationId: sourceAppId,
        },
      }
    );

    const attributes = attributesResponse.data.data || [];
    logger.info(`Found ${attributes.length} attributes to clone`);

    for (const attribute of attributes) {
      try {
        // Create attribute in destination (account-level endpoint)
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
          `${dest.url}/v1/attributes`,
          attributePayload,
          {
            headers: {
              Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        logger.info(`Cloned attribute ${attribute.entity}.${attribute.name} to app ${destAppId}`);
      } catch (error: any) {
        logger.error(`Failed to clone attribute ${attribute.entity}.${attribute.name}:`, {
          message: error.message,
          response: error.response?.data,
        });
      }
    }
  } catch (error: any) {
    logger.error(`Failed to fetch/clone attributes:`, {
      message: error.message,
      response: error.response?.data,
    });
  }
}

// Clone referral codes from source campaign to destination campaign
async function cloneReferrals(
  source: any,
  dest: any,
  sourceAppId: number,
  sourceCampaignId: number,
  destAppId: number,
  destCampaignId: number
) {
  try {
    logger.info(`Cloning referrals from campaign ${sourceCampaignId} to ${destCampaignId}`);

    // Fetch referral codes from source campaign using no_total endpoint
    const referralsResponse = await axios.get(
      `${source.url}/v1/applications/${sourceAppId}/campaigns/${sourceCampaignId}/referrals/no_total`,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${source.credentials.apiKey}`,
        },
        params: {
          pageSize: 1000,
        },
      }
    );

    const referrals = referralsResponse.data.data || [];
    logger.info(`Found ${referrals.length} referral codes to clone`);

    if (referrals.length === 0) {
      return;
    }

    // Build CSV format for import_referrals endpoint
    // Try with "code" as the header
    const csvRows: string[] = ['code'];

    for (const referral of referrals) {
      // Add the referral code
      csvRows.push(referral.code);
    }

    const csvData = csvRows.join('\n');

    // Import referrals using the import endpoint with multipart/form-data
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('upFile', csvData, {
      filename: 'referrals.csv',
      contentType: 'text/csv',
    });

    await axios.post(
      `${dest.url}/v1/applications/${destAppId}/campaigns/${destCampaignId}/import_referrals`,
      formData,
      {
        headers: {
          Authorization: `ManagementKey-v1 ${dest.credentials.apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    logger.info(`Successfully imported ${referrals.length} referral codes to campaign ${destCampaignId}`);
  } catch (error: any) {
    logger.error(`Failed to fetch/clone referrals:`, {
      message: error.message,
      response: error.response?.data,
    });
  }
}

// Migrate Contentful asset
async function migrateContentfulAsset(source: any, dest: any, asset: Asset) {
  // Fetch asset from source
  const response = await axios.get(
    `https://api.contentful.com/spaces/${source.credentials.spaceId}/${asset.type}/${asset.id}`,
    {
      headers: {
        Authorization: `Bearer ${source.credentials.accessToken}`,
      },
    }
  );

  const assetData = response.data;

  // Remove read-only fields
  delete assetData.sys;

  // Create asset in destination
  await axios.post(
    `https://api.contentful.com/spaces/${dest.credentials.spaceId}/${asset.type}`,
    assetData,
    {
      headers: {
        Authorization: `Bearer ${dest.credentials.accessToken}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
      },
    }
  );

  logger.info(`Migrated Contentful asset: ${asset.type}:${asset.id}`);
}
