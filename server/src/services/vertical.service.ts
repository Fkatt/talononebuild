// Vertical Service
// Handles CRUD operations for industry verticals

import prisma from '../models/prisma';
import logger from '../utils/logger';

// Get all verticals
export const getAllVerticals = async () => {
  return await prisma.vertical.findMany({
    orderBy: { name: 'asc' },
  });
};

// Create new vertical
export const createVertical = async (name: string) => {
  return await prisma.vertical.create({
    data: { name },
  });
};

// Delete vertical
export const deleteVertical = async (id: number) => {
  return await prisma.vertical.delete({
    where: { id },
  });
};

// Seed default verticals if none exist
export const seedDefaultVerticals = async () => {
  const count = await prisma.vertical.count();

  if (count === 0) {
    const defaults = ['Retail', 'Gaming', 'FinTech', 'On-Demand'];

    for (const name of defaults) {
      await prisma.vertical.create({
        data: { name },
      });
    }

    logger.info('Seeded default verticals');
  }
};
