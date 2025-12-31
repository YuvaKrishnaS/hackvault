'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Lock, Fingerprint } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Login() {
  const { login, loginWithBiometric, biometricAvailable, biometricEnabled } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your master password');
      return;
    }

    setIsLoggingIn(true);

    try {
      const success = await login(password);
      
      if (!success) {
        setError('Incorrect master password');
        setPassword('');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError('');
    setIsLoggingIn(true);

    try {
      const success = await loginWithBiometric();
      
      if (!success) {
        setError('Biometric authentication failed. Please use your password.');
      }
    } catch (err) {
      setError('Biometric login failed. Please use your password.');
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <CardHeader className="space-y-2 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <Logo size="lg" showText={true} />
          </div>
          <p className="text-sm text-black/60 dark:text-white/60">
            Enter your master password to unlock your vault
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Biometric Login Button */}
          {biometricAvailable && biometricEnabled && (
            <Button
              type="button"
              onClick={handleBiometricLogin}
              disabled={isLoggingIn}
              className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 border-2 border-black dark:border-white font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Fingerprint className="h-5 w-5 mr-2" />
              {isLoggingIn ? 'Authenticating...' : 'Unlock with Biometric'}
            </Button>
          )}

          {/* Divider */}
          {biometricAvailable && biometricEnabled && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black/20 dark:border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-[#1a1a1a] text-black/60 dark:text-white/60 font-bold">
                  OR USE PASSWORD
                </span>
              </div>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Master Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  className="pr-10 border-2 border-black dark:border-white font-mono"
                  disabled={isLoggingIn}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={isLoggingIn}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 border-2 border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={!password || isLoggingIn}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Unlocking...' : 'Unlock Vault'}
            </Button>
          </form>

          {/* Security Note */}
          <div className="text-xs text-black/60 dark:text-white/60 text-center pt-2 border-t-2 border-black/20 dark:border-white/20">
            <Lock className="h-3 w-3 inline mr-1" />
            Your password is never sent or stored anywhere
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
