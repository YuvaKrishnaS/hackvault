/**
 * Password Generator
 * Generates secure random passwords with customizable options
 */

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface GeneratedPassword {
  password: string;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  entropy: number;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(options: PasswordOptions): GeneratedPassword {
  let charset = '';
  let password = '';

  // Build charset
  if (options.uppercase) charset += UPPERCASE;
  if (options.lowercase) charset += LOWERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  if (charset.length === 0) {
    charset = LOWERCASE + NUMBERS; // Fallback
  }

  // Generate password using crypto.getRandomValues for security
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Ensure at least one character from each selected type
  if (options.uppercase && !new RegExp(`[${UPPERCASE}]`).test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)] + password.substring(pos + 1);
  }
  if (options.lowercase && !new RegExp(`[${LOWERCASE}]`).test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)] + password.substring(pos + 1);
  }
  if (options.numbers && !new RegExp(`[${NUMBERS}]`).test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + NUMBERS[Math.floor(Math.random() * NUMBERS.length)] + password.substring(pos + 1);
  }
  if (options.symbols && !new RegExp(`[${SYMBOLS}]`).test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] + password.substring(pos + 1);
  }

  // Calculate strength
  const strength = calculateStrength(password, options);
  const entropy = calculateEntropy(password.length, charset.length);

  return {
    password,
    strength,
    entropy,
  };
}

function calculateStrength(password: string, options: PasswordOptions): 'weak' | 'medium' | 'strong' | 'very-strong' {
  let score = 0;

  // Length score
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Complexity score
  if (options.uppercase) score++;
  if (options.lowercase) score++;
  if (options.numbers) score++;
  if (options.symbols) score++;

  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 6) return 'strong';
  return 'very-strong';
}

function calculateEntropy(length: number, charsetSize: number): number {
  return Math.log2(Math.pow(charsetSize, length));
}

export function getStrengthColor(strength: string): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
    case 'very-strong':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}
