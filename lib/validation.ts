import { config } from './config';

/**
 * Input Validation Utilities
 * Ensures all user inputs are safe and valid
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validate master password
export function validateMasterPassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  }

  if (password.length < config.security.minPasswordLength) {
    errors.push(`Password must be at least ${config.security.minPasswordLength} characters long`);
  }

  if (password.length > config.security.maxPasswordLength) {
    errors.push(`Password must not exceed ${config.security.maxPasswordLength} characters`);
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate password entry
export function validatePasswordEntry(entry: {
  title: string;
  username: string;
  password: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!entry.title || entry.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (entry.title.length > 100) {
    errors.push('Title must not exceed 100 characters');
  }

  if (!entry.username || entry.username.trim().length === 0) {
    errors.push('Username/Email is required');
  }

  if (entry.username.length > 255) {
    errors.push('Username must not exceed 255 characters');
  }

  if (!entry.password || entry.password.trim().length === 0) {
    errors.push('Password is required');
  }

  // Check for potential XSS
  const xssPattern = /<script|javascript:|onerror=/i;
  if (xssPattern.test(entry.title) || xssPattern.test(entry.username)) {
    errors.push('Invalid characters detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate URL
export function validateURL(url: string): boolean {
  if (!url) return true; // URL is optional

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Sanitize string (remove dangerous characters)
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 500); // Limit length
}

// Validate category name
export function validateCategory(category: string): boolean {
  const validCategories = ['General', 'Work', 'Social', 'Finance', 'Email', 'Shopping'];
  return validCategories.includes(category);
}
