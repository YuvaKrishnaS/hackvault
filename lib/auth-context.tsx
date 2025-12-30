'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  deriveKey, 
  base64ToUint8Array,
  verifyMasterPassword as verifyPassword 
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

  const login = useCallback(async (masterPassword: string): Promise<boolean> => {
    try {
        const masterData = await getMasterPassword();
        if (!masterData) return false;

        const isValid = await verifyPassword(
            masterPassword,
            masterData.salt,
            masterData.hash
        );

        if (isValid) {
            const salt = base64ToUint8Array(masterData.salt);
            const key = await deriveKey(masterPassword, salt);
            setEncryptionKey(key);
            setIsAuthenticated(true);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Login error:', error);
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
