// Authentication Service
// Handles user login and JWT token generation

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prisma';
import config from '../config';
import logger from '../utils/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
  const { email, password } = credentials;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn(`Login attempt failed: User not found (${email})`);
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    logger.warn(`Login attempt failed: Invalid password (${email})`);
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.security.jwtSecret,
    {
      expiresIn: '24h',
    }
  );

  logger.info(`User logged in successfully: ${email}`);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};
