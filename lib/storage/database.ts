'use client';

import Dexie from 'dexie';
import type { EntityTable } from 'dexie';
import { PasswordEntry, MasterPasswordData } from '@/lib/types';

/**
 * HackVault Database
 * Uses IndexedDB for offline-first storage
 * All data is encrypted before storage
 */
export class HackVaultDB extends Dexie {
  passwords!: EntityTable<PasswordEntry, 'id'>;
  masterPassword!: EntityTable<MasterPasswordData, 'id'>;

  constructor() {
    super('HackVaultDB');

    // Define database schema
    this.version(1).stores({
      passwords: '++id, title, username, url, category, createdAt, updatedAt',
      masterPassword: '++id, createdAt',
    });
  }
}

// Create database instance
export const db = new HackVaultDB();

/**
 * Database operations
 */

// Master Password Operations
export async function saveMasterPassword(salt: string, hash: string): Promise<void> {
  await db.masterPassword.clear(); // Only one master password
  await db.masterPassword.add({
    salt,
    hash,
    createdAt: Date.now(),
  });
}

export async function getMasterPassword(): Promise<MasterPasswordData | undefined> {
  return await db.masterPassword.toCollection().first();
}

export async function hasMasterPassword(): Promise<boolean> {
  const count = await db.masterPassword.count();
  return count > 0;
}

// Password Entry Operations
export async function addPassword(entry: Omit<PasswordEntry, 'id'>): Promise<number> {
  return await db.passwords.add(entry as PasswordEntry);
}

export async function updatePassword(id: number, updates: Partial<PasswordEntry>): Promise<number> {
  return await db.passwords.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deletePassword(id: number): Promise<void> {
  await db.passwords.delete(id);
}

export async function getPassword(id: number): Promise<PasswordEntry | undefined> {
  return await db.passwords.get(id);
}

export async function getAllPasswords(): Promise<PasswordEntry[]> {
  return await db.passwords.toArray();
}

export async function searchPasswords(query: string): Promise<PasswordEntry[]> {
  const lowerQuery = query.toLowerCase();
  return await db.passwords
    .filter(
      (entry: PasswordEntry) =>
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.username.toLowerCase().includes(lowerQuery) ||
        entry.url?.toLowerCase().includes(lowerQuery) ||
        entry.category.toLowerCase().includes(lowerQuery)
    )
    .toArray();
}

export async function getPasswordsByCategory(category: string): Promise<PasswordEntry[]> {
  return await db.passwords.where('category').equals(category).toArray();
}

// Clear all data (for logout/reset)
export async function clearAllData(): Promise<void> {
  await db.passwords.clear();
  await db.masterPassword.clear();
}

// Export data to CSV
export async function exportToCSV(): Promise<string> {
  const passwords = await getAllPasswords();
  
  // CSV header
  let csv = 'Title,Username,Password,URL,Category,Notes,Created,Updated\n';
  
  // CSV rows
  passwords.forEach((entry: PasswordEntry) => {
    const row = [
      entry.title,
      entry.username,
      entry.password, // Will be encrypted
      entry.url || '',
      entry.category,
      entry.notes || '',
      new Date(entry.createdAt).toISOString(),
      new Date(entry.updatedAt).toISOString(),
    ];
    
    // Escape commas and quotes
    const escapedRow = row.map((field) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    });
    
    csv += escapedRow.join(',') + '\n';
  });
  
  return csv;
}

// Import data from CSV
export async function importFromCSV(csvContent: string): Promise<number> {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  let imported = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',');
    
    if (values.length >= 6) {
      const entry: Omit<PasswordEntry, 'id'> = {
        title: values[0]?.replace(/^"|"$/g, '') || '',
        username: values[1]?.replace(/^"|"$/g, '') || '',
        password: values[2]?.replace(/^"|"$/g, '') || '',
        url: values[3]?.replace(/^"|"$/g, '') || '',
        category: values[4]?.replace(/^"|"$/g, '') || 'General',
        notes: values[5]?.replace(/^"|"$/g, '') || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        iv: '', // Will be generated during encryption
      };
      
      await addPassword(entry);
      imported++;
    }
  }
  
  return imported;
}
