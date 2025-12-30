'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  deriveKey,
  base64ToUint8Array,
  verifyMasterPassword,
} from '@/lib/crypto/encryption';
import { hasMasterPassword, getMasterPassword } from '@/lib/storage/database';

interface AuthContextType {
  isAuthenticated: boolean;
  encryptionKey: CryptoKey | null;
  isSetup: boolean;
  checkSetup: () => Promise<void>;
  login: (masterPassword: string) => Promise<boolean>;
  logout: () => void;
  setKey: (key: CryptoKey) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isSetup, setIsSetup] = useState(false);

  const checkSetup = useCallback(async () => {
    const hasPassword = await hasMasterPassword();
    setIsSetup(hasPassword);
  }, []);

  useEffect(() => {
    checkSetup();
  }, [checkSetup]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const stored = await getMasterPassword();
      if (!stored) return false;

      // Verify password hash
      const isValid = await verifyMasterPassword(password, stored.hash);
      if (!isValid) return false;

      // Derive encryption key
      const salt = base64ToUint8Array(stored.salt);
      const key = await deriveKey(password, salt);

      setEncryptionKey(key);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);



  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setEncryptionKey(null);
  }, []);

  const setKey = useCallback((key: CryptoKey) => {
    setEncryptionKey(key);
    setIsAuthenticated(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        encryptionKey,
        isSetup,
        checkSetup,
        login,
        logout,
        setKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
