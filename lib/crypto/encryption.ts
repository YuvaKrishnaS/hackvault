'use client';

/**
 * HackVault Encryption Layer
 * Uses Web Crypto API for AES-256-GCM encryption
 * Zero-knowledge architecture - all encryption happens client-side
 */
if (typeof window !== 'undefined' && !window.isSecureContext) {
  console.error('Web Crypto API requires a secure context (HTTPS or localhost)');
}

// Helper to check crypto availability
function ensureCryptoAvailable() {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error(
      'Web Crypto API is not available. Please access via HTTPS or localhost. ' +
      'Network IP addresses (http://192.168.x.x) are not supported due to browser security restrictions.'
    );
  }
}

// Convert string to Uint8Array
export function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert Uint8Array to string
export function uint8ArrayToString(arr: Uint8Array): string {
  return new TextDecoder().decode(arr);
}

// Convert ArrayBuffer to base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 string to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive encryption key from master password using PBKDF2
 * @param masterPassword - User's master password
 * @param salt - Random salt (generate once, store with hash)
 * @param iterations - Number of iterations (600,000+ recommended)
 */
export async function deriveKey(
  masterPassword: string,
  salt: Uint8Array,
  iterations: number = 600000
): Promise<CryptoKey> {
  ensureCryptoAvailable(); // Add this line
  // Import master password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToUint8Array(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-256-GCM key (set extractable to true for hashing)
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, // Changed to TRUE - makes key extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate random salt for PBKDF2
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate random initialization vector for AES-GCM
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Hash master password for verification (never store plaintext password)
 * @param masterPassword - User's master password
 * @param salt - Random salt
 */
export async function hashMasterPassword(
  masterPassword: string,
  salt: Uint8Array
): Promise<string> {
  const key = await deriveKey(masterPassword, salt, 600000);
  // Export key to verify password later (now works because extractable=true)
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Verify master password against stored hash
 */
export async function verifyMasterPassword(
  masterPassword: string,
  storedSalt: string,
  storedHash: string
): Promise<boolean> {
  const salt = base64ToUint8Array(storedSalt);
  const hash = await hashMasterPassword(masterPassword, salt);
  return hash === storedHash;
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Plaintext data to encrypt
 * @param key - Encryption key (derived from master password)
 * @param iv - Initialization vector (must be unique per encryption)
 */
export async function encryptData(
  data: string,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
    },
    key,
    stringToUint8Array(data)
  );
  return arrayBufferToBase64(encrypted);
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Base64 encoded encrypted data
 * @param key - Decryption key (same as encryption key)
 * @param iv - Initialization vector (same as used for encryption)
 */
export async function decryptData(
  encryptedData: string,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any,
      },
      key,
      base64ToUint8Array(encryptedData)
    );
    return uint8ArrayToString(new Uint8Array(decrypted));
  } catch (error) {
    throw new Error('Decryption failed. Invalid password or corrupted data.');
  }
}

/**
 * Generate secure random password
 */
export function generateSecurePassword(
  length: number = 16,
  includeUppercase: boolean = true,
  includeLowercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  let password = '';

  // Build character set
  if (includeUppercase) charset += uppercase;
  if (includeLowercase) charset += lowercase;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  // Generate password using crypto.getRandomValues for cryptographic randomness
  const randomValues = crypto.getRandomValues(new Uint8Array(length));

  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}

/**
 * Calculate password strength (0-100 score)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length < 8) feedback.push('Use at least 8 characters');

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters');

  // Complexity bonuses
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.7) score += 10;

  // Check for common patterns (penalty)
  if (/^(.)\1+$/.test(password)) score -= 30; // All same character
  if (/^(012|123|234|345|456|567|678|789|890)/.test(password)) score -= 20;
  if (/^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) score -= 20;

  score = Math.max(0, Math.min(100, score));

  // Determine label and color
  let label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  let color: string;

  if (score < 20) {
    label = 'Very Weak';
    color = '#000000';
  } else if (score < 40) {
    label = 'Weak';
    color = '#404040';
  } else if (score < 60) {
    label = 'Fair';
    color = '#606060';
  } else if (score < 80) {
    label = 'Strong';
    color = '#808080';
  } else {
    label = 'Very Strong';
    color = '#000000';
  }

  return { score, label, color, feedback };
}
