// Centralized Configuration
// ALL process.env calls must happen here. NEVER use process.env inside service logic.

import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  url: string;
}

interface ServerConfig {
  port: number;
  nodeEnv: string;
}

interface SecurityConfig {
  encryptionKey: string;
  jwtSecret: string;
}

interface TalonConfig {
  // Talon.One API configuration
  // Will be configured per-instance in the database
}

interface ContentfulConfig {
  // Contentful API configuration
  // Will be configured per-instance in the database
}

interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  talon: TalonConfig;
  contentful: ContentfulConfig;
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/talonforge',
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  },
  talon: {},
  contentful: {},
};

// Validation: Ensure critical env vars are set in production
if (config.server.nodeEnv === 'production') {
  if (config.security.encryptionKey === 'default-key-change-in-production') {
    throw new Error('ENCRYPTION_KEY must be set in production');
  }
  if (config.security.jwtSecret === 'default-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production');
  }
}

export default config;
