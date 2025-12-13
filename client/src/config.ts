// Frontend Configuration
// Centralized configuration for API endpoints and feature flags

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  appName: 'TalonForge',
  appVersion: '3.0',
  features: {
    aiArchitect: true,
    backupVault: true,
    loyaltyHub: true,
  },
};

export default config;
