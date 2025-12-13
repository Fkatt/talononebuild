// Encryption Utility
// AES-256 encryption for API credentials storage
// Format: IV:ciphertext

import CryptoJS from 'crypto-js';
import config from '../config';

/**
 * Encrypts data using AES-256
 * Returns format: IV:ciphertext
 */
export const encrypt = (data: string): string => {
  const key = config.security.encryptionKey;

  // Generate random IV (16 bytes)
  const iv = CryptoJS.lib.WordArray.random(16);

  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Return IV and ciphertext separated by colon
  return `${iv.toString(CryptoJS.enc.Base64)}:${encrypted.toString()}`;
};

/**
 * Decrypts data encrypted with the encrypt function
 * Expects format: IV:ciphertext
 */
export const decrypt = (encryptedData: string): string => {
  const key = config.security.encryptionKey;

  try {
    // Split IV and ciphertext
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = CryptoJS.enc.Base64.parse(parts[0]!);
    const ciphertext = parts[1]!;

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
};
