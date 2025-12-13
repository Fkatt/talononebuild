// Instance Service
// Handles CRUD operations for Talon.One and Contentful instances

import prisma from '../models/prisma';
import { encrypt, decrypt } from '../utils/encryption';
import logger from '../utils/logger';
import axios from 'axios';

interface InstanceCredentials {
  apiKey?: string;
  apiToken?: string;
  spaceId?: string;
  accessToken?: string;
  [key: string]: any;
}

interface CreateInstanceData {
  name: string;
  type: 'talon' | 'contentful';
  region: string;
  url: string;
  credentials: InstanceCredentials;
  bundleId?: string;
  userId: number;
}

interface UpdateInstanceData {
  name?: string;
  region?: string;
  url?: string;
  credentials?: InstanceCredentials;
  bundleId?: string;
}

interface ConnectionTestParams {
  type: 'talon' | 'contentful';
  url: string;
  credentials: InstanceCredentials;
}

// Get all instances for a user
export const getUserInstances = async (userId: number) => {
  const instances = await prisma.instance.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Return instances without encrypted credentials for security
  return instances.map((instance) => ({
    id: instance.id,
    name: instance.name,
    type: instance.type,
    region: instance.region,
    url: instance.url,
    bundleId: instance.bundleId,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  }));
};

// Get single instance by ID
export const getInstance = async (instanceId: number, userId: number) => {
  const instance = await prisma.instance.findFirst({
    where: {
      id: instanceId,
      userId,
    },
  });

  if (!instance) {
    throw new Error('Instance not found');
  }

  // Decrypt credentials for authorized access
  const decryptedCredentials = JSON.parse(decrypt(instance.encryptedCredentials));

  return {
    id: instance.id,
    name: instance.name,
    type: instance.type,
    region: instance.region,
    url: instance.url,
    bundleId: instance.bundleId,
    credentials: decryptedCredentials,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
};

// Create new instance
export const createInstance = async (data: CreateInstanceData) => {
  // Encrypt credentials before saving
  const encryptedCredentials = encrypt(JSON.stringify(data.credentials));

  const instance = await prisma.instance.create({
    data: {
      name: data.name,
      type: data.type,
      region: data.region,
      url: data.url,
      encryptedCredentials,
      bundleId: data.bundleId,
      userId: data.userId,
    },
  });

  logger.info(`Instance created: ${instance.name} (${instance.type})`);

  return {
    id: instance.id,
    name: instance.name,
    type: instance.type,
    region: instance.region,
    url: instance.url,
    bundleId: instance.bundleId,
    createdAt: instance.createdAt,
  };
};

// Update instance
export const updateInstance = async (
  instanceId: number,
  userId: number,
  data: UpdateInstanceData
) => {
  // Verify instance belongs to user
  const instance = await prisma.instance.findFirst({
    where: { id: instanceId, userId },
  });

  if (!instance) {
    throw new Error('Instance not found');
  }

  // Prepare update data
  const updateData: any = {
    name: data.name,
    region: data.region,
    url: data.url,
    bundleId: data.bundleId,
  };

  // Encrypt new credentials if provided
  if (data.credentials) {
    updateData.encryptedCredentials = encrypt(JSON.stringify(data.credentials));
  }

  const updated = await prisma.instance.update({
    where: { id: instanceId },
    data: updateData,
  });

  logger.info(`Instance updated: ${updated.name}`);

  return {
    id: updated.id,
    name: updated.name,
    type: updated.type,
    region: updated.region,
    url: updated.url,
    bundleId: updated.bundleId,
    updatedAt: updated.updatedAt,
  };
};

// Delete instance
export const deleteInstance = async (instanceId: number, userId: number) => {
  const instance = await prisma.instance.findFirst({
    where: { id: instanceId, userId },
  });

  if (!instance) {
    throw new Error('Instance not found');
  }

  await prisma.instance.delete({
    where: { id: instanceId },
  });

  logger.info(`Instance deleted: ${instance.name}`);

  return { success: true };
};

// Test connection to Talon.One or Contentful instance
export const testConnection = async (
  params: ConnectionTestParams
): Promise<{ success: boolean; error?: string }> => {
  const { type, url, credentials } = params;

  try {
    if (type === 'talon') {
      // Test Talon.One Management API connection
      // Talon.One uses Bearer token authentication
      const response = await axios.get(`${url}/v1/applications`, {
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        logger.info('Talon.One connection test successful');
        return { success: true };
      }
    } else if (type === 'contentful') {
      // Test Contentful Management API connection
      const response = await axios.get(
        `https://api.contentful.com/spaces/${credentials.spaceId}`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        logger.info('Contentful connection test successful');
        return { success: true };
      }
    }

    return { success: false, error: 'Unknown instance type' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      logger.warn(`Connection test failed: ${message}`);
      return { success: false, error: `Connection failed: ${message}` };
    }

    logger.error('Connection test error:', error);
    return { success: false, error: 'Connection test failed' };
  }
};

// Update instance bundle
export const updateInstanceBundle = async (
  instanceId: number,
  userId: number,
  bundleId: string | null
) => {
  const instance = await prisma.instance.findFirst({
    where: { id: instanceId, userId },
  });

  if (!instance) {
    throw new Error('Instance not found');
  }

  const updated = await prisma.instance.update({
    where: { id: instanceId },
    data: { bundleId },
  });

  logger.info(`Instance bundle updated: ${updated.name} -> ${bundleId || 'none'}`);

  return {
    id: updated.id,
    bundleId: updated.bundleId,
  };
};
