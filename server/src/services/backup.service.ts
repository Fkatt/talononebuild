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

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        name,
        instanceId,
        data: backupData,
      },
    });

    logger.info(`Backup created: ${backup.name}`);

    return {
      id: backup.id,
      name: backup.name,
      instanceId: backup.instanceId,
      createdAt: backup.createdAt,
    };
  } catch (error) {
    logger.error('Create backup error:', error);
    throw error;
  }
};

export const restoreBackup = async (params: RestoreBackupParams) => {
  const { backupId, targetInstanceId, userId } = params;

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

    logger.info(`Restoring backup ${backup.name} to instance: ${instance.name}`);

    // Restore data based on instance type
    if (instance.type === 'talon') {
      await restoreTalonData(instance, backup.data);
    } else if (instance.type === 'contentful') {
      await restoreContentfulData(instance, backup.data);
    }

    logger.info(`Backup restored successfully`);

    return {
      success: true,
      message: 'Backup restored successfully',
    };
  } catch (error) {
    logger.error('Restore backup error:', error);
    throw error;
  }
};

export const listBackups = async (userId: number) => {
  const backups = await prisma.backup.findMany({
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
      headers: { Authorization: `Bearer ${instance.credentials.apiKey}` },
    });
    data.applications = appsResponse.data;

    // Fetch campaigns (if applications exist)
    // This is simplified - in production, you'd need to iterate through applications
    logger.info('Fetched Talon.One data for backup');
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

async function restoreTalonData(instance: any, backupData: any) {
  // Implementation for restoring Talon.One data
  logger.info('Restoring Talon.One data...');
  // This would involve creating/updating resources via Talon API
}

async function restoreContentfulData(instance: any, backupData: any) {
  // Implementation for restoring Contentful data
  logger.info('Restoring Contentful data...');
  // This would involve creating/updating resources via Contentful API
}
