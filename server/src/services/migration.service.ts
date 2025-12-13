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
}

export const migrate = async (params: MigrateParams) => {
  const { sourceId, destId, assets, userId } = params;

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
          await migrateTalonAsset(source, dest, asset);
        } else if (source.type === 'contentful') {
          await migrateContentfulAsset(source, dest, asset);
        }

        results.push({
          type: asset.type,
          id: asset.id,
          status: 'success',
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Migration error for ${asset.type}:${asset.id}:`, errorMsg);
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
async function migrateTalonAsset(source: any, dest: any, asset: Asset) {
  // Fetch asset from source
  const response = await axios.get(`${source.url}/v1/${asset.type}/${asset.id}`, {
    headers: {
      Authorization: `Bearer ${source.credentials.apiKey}`,
    },
  });

  const assetData = response.data;

  // Remove read-only fields
  delete assetData.id;
  delete assetData.created;
  delete assetData.modified;

  // Create asset in destination
  await axios.post(`${dest.url}/v1/${asset.type}`, assetData, {
    headers: {
      Authorization: `Bearer ${dest.credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  logger.info(`Migrated Talon asset: ${asset.type}:${asset.id}`);
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
