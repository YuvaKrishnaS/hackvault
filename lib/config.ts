/**
 * Application Configuration
 * Centralized config for all app settings
 */

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'HackVault',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    author: 'Krishna Naveen',
    description: 'Zero-knowledge password manager with AES-256-GCM encryption',
  },
  
  security: {
    pbkdf2Iterations: parseInt(process.env.NEXT_PUBLIC_PBKDF2_ITERATIONS || '600000'),
    encryptionAlgorithm: process.env.NEXT_PUBLIC_ENCRYPTION_ALGORITHM || 'AES-256-GCM',
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },
  
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableExtensionSync: process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC !== 'false',
  },
  
  storage: {
    databaseName: 'HackVaultDB',
    databaseVersion: 1,
    maxStorageSize: 50 * 1024 * 1024, // 50MB
  },
} as const;

export type Config = typeof config;
