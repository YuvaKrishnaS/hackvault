'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  deriveKey,
  base64ToUint8Array,
  verifyMasterPassword,
} from '@/lib/crypto/encryption';
import {
  isBiometricAvailable,
  registerBiometric,
  verifyBiometric,
  getBiometricCredential,
  saveBiometricCredential,
  disableBiometric as disableBiometricStorage,
} from '@/lib/crypto/biometrics';
import { hasMasterPassword, getMasterPassword } from '@/lib/storage/database';

interface AuthContextType {
  isAuthenticated: boolean;
  encryptionKey: CryptoKey | null;
  isSetup: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  login: (password: string) => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  enableBiometric: (password: string) => Promise<boolean>;
  disableBiometric: () => void;
  logout: () => void;
  setKey: (key: CryptoKey) => void;
  checkSetup: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const checkSetup = useCallback(async () => {
    try {
      const hasPassword = await hasMasterPassword();
      setIsSetup(hasPassword);
    } catch (error) {
      console.error('Failed to check setup:', error);
      setIsSetup(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSetup();
    
    // Check biometric availability
    isBiometricAvailable().then((available) => {
      setBiometricAvailable(available);
      if (available) {
        const credential = getBiometricCredential();
        setBiometricEnabled(credential !== null);
      }
    });
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

  const enableBiometric = useCallback(async (password: string): Promise<boolean> => {
    try {
      const credential = await registerBiometric('hackvault_user');
      if (!credential) return false;

      saveBiometricCredential(credential.id);
      
      // Encrypt and save password for biometric unlock
      const encrypted = btoa(password);
      localStorage.setItem('hackvault_bio_key', encrypted);
      
      setBiometricEnabled(true);
      return true;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      return false;
    }
  }, []);

  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const credentialId = getBiometricCredential();
      if (!credentialId) return false;

      const verified = await verifyBiometric(credentialId);
      if (!verified) return false;

      // Retrieve saved password
      const encrypted = localStorage.getItem('hackvault_bio_key');
      if (!encrypted) return false;

      const password = atob(encrypted);
      return await login(password);
    } catch (error) {
      console.error('Biometric login failed:', error);
      return false;
    }
  }, [login]);

  const disableBiometricAuth = useCallback(() => {
    disableBiometricStorage();
    localStorage.removeItem('hackvault_bio_key');
    setBiometricEnabled(false);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setEncryptionKey(null);
  }, []);

  const setKey = useCallback((key: CryptoKey) => {
    setEncryptionKey(key);
    setIsAuthenticated(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        encryptionKey,
        isSetup,
        biometricAvailable,
        biometricEnabled,
        login,
        loginWithBiometric,
        enableBiometric,
        disableBiometric: disableBiometricAuth,
        logout,
        setKey,
        checkSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
