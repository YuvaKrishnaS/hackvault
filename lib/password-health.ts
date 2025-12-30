/**
 * Password Health Checker
 * Analyzes password strength and detects issues
 */

import { DecryptedPasswordEntry } from './types';

export interface PasswordIssue {
  id: number;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  issue: string;
  recommendation: string;
}

export interface HealthReport {
  score: number; // 0-100
  total: number;
  weak: number;
  reused: number;
  old: number;
  issues: PasswordIssue[];
}

// Check if password is weak
export function isWeakPassword(password: string): boolean {
  if (password.length < 12) return true;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  
  const criteriaCount = [hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(Boolean).length;
  
  return criteriaCount < 3;
}

// Check if password is old (placeholder - requires timestamp)
export function isOldPassword(createdAt?: Date): boolean {
  if (!createdAt) return false;
  
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return createdAt < threeMonthsAgo;
}

// Find duplicate passwords
export function findDuplicates(passwords: DecryptedPasswordEntry[]): Map<string, DecryptedPasswordEntry[]> {
  const duplicates = new Map<string, DecryptedPasswordEntry[]>();
  
  passwords.forEach(entry => {
    const existing = duplicates.get(entry.password) || [];
    existing.push(entry);
    duplicates.set(entry.password, existing);
  });
  
  // Remove entries that only appear once
  Array.from(duplicates.keys()).forEach(key => {
    if (duplicates.get(key)!.length < 2) {
      duplicates.delete(key);
    }
  });
  
  return duplicates;
}

// Generate health report
export function generateHealthReport(passwords: DecryptedPasswordEntry[]): HealthReport {
  const issues: PasswordIssue[] = [];
  let weakCount = 0;
  let reusedCount = 0;
  
  // Check for weak passwords
  passwords.forEach(entry => {
    if (isWeakPassword(entry.password)) {
      weakCount++;
      issues.push({
        id: entry.id!,
        title: entry.title,
        severity: 'warning',
        issue: 'Weak password detected',
        recommendation: 'Use a password with 12+ characters, uppercase, lowercase, numbers, and symbols',
      });
    }
  });
  
  // Check for duplicates
  const duplicates = findDuplicates(passwords);
  duplicates.forEach((entries, password) => {
    reusedCount += entries.length;
    entries.forEach(entry => {
      issues.push({
        id: entry.id!,
        title: entry.title,
        severity: 'critical',
        issue: `Password reused across ${entries.length} accounts`,
        recommendation: 'Use a unique password for each account to prevent credential stuffing attacks',
      });
    });
  });
  
  // Calculate score (0-100)
  const total = passwords.length;
  if (total === 0) {
    return { score: 100, total: 0, weak: 0, reused: 0, old: 0, issues: [] };
  }
  
  const weakPenalty = (weakCount / total) * 40;
  const reusedPenalty = (reusedCount / total) * 60;
  const score = Math.max(0, 100 - weakPenalty - reusedPenalty);
  
  return {
    score: Math.round(score),
    total,
    weak: weakCount,
    reused: reusedCount,
    old: 0,
    issues: issues.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
  };
}

// Get health score color
export function getHealthColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

// Get health grade
export function getHealthGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
