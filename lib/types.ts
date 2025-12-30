export interface PasswordEntry {
  id?: number;
  title: string;
  username: string;
  password: string; // This will be encrypted
  url?: string;
  category: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  iv: string; // Initialization vector for encryption
}

export interface MasterPasswordData {
  id?: number;
  salt: string;
  hash: string;
  createdAt: number;
}

export interface DecryptedPasswordEntry extends Omit<PasswordEntry, 'password'> {
  password: string; // Decrypted password
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface PasswordStrength {
  score: number; // 0-100
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
}
