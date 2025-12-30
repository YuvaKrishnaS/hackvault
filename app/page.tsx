'use client';

import { useAuth } from '@/lib/auth-context';
import { SetupMasterPassword } from '@/components/auth/setup-master-password';
import { Login } from '@/components/auth/login';
import { VaultMain } from '@/components/vault/vault-main';
import { WelcomeScreen } from '@/components/welcome-screen';

export default function Home() {
  const { isAuthenticated, isSetup } = useAuth();

  return (
    <>
      <WelcomeScreen />
      {isAuthenticated ? (
        <VaultMain />
      ) : isSetup ? (
        <Login />
      ) : (
        <SetupMasterPassword />
      )}
    </>
  );
}
