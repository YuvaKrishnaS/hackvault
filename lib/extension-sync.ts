'use client';

/**
 * Extension Sync - Syncs decrypted passwords to browser extension
 */

export function syncPasswordsToLocalStorage(passwords: any[]): void {
  try {
    // Format passwords for extension
    const formattedPasswords = passwords.map(p => ({
      id: p.id,
      title: p.title,
      username: p.username,
      password: p.password, // Already decrypted
      url: p.url || '',
      category: p.category,
      notes: p.notes || ''
    }));

    // Store in localStorage
    localStorage.setItem('hackvault_passwords', JSON.stringify(formattedPasswords));
    localStorage.setItem('hackvault_sync_time', Date.now().toString());
    
    // Also store in a way the extension can easily access
    window.postMessage({
      type: 'HACKVAULT_SYNC',
      passwords: formattedPasswords
    }, '*');
    
    console.log('Synced', formattedPasswords.length, 'passwords to extension');
  } catch (error) {
    console.error('Failed to sync to localStorage:', error);
    throw error;
  }
}

export function getPasswordsFromLocalStorage(): any[] {
  try {
    const data = localStorage.getItem('hackvault_passwords');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearPasswordsFromLocalStorage(): void {
  try {
    localStorage.removeItem('hackvault_passwords');
    localStorage.removeItem('hackvault_sync_time');
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}
