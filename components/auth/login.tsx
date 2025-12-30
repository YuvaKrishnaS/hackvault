'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { Logo } from '@/components/logo';
import { loginRateLimiter } from '@/lib/rate-limiter';

export function Login() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limit
    if (loginRateLimiter.isBlocked()) {
      setError(`Too many failed attempts. Try again in ${loginRateLimiter.getRemainingTimeString()}`);
      return;
    }

    if (!password) {
      setError('Please enter your master password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(password);
      
      if (result) {
        loginRateLimiter.reset(); // Reset on successful login
      } else {
        // Record failed attempt
        const limitResult = loginRateLimiter.recordAttempt();
        
        if (!limitResult.allowed) {
          setError(`Too many failed attempts. Locked for ${loginRateLimiter.getRemainingTimeString()}`);
        } else {
          setError(`Incorrect master password. ${limitResult.remainingAttempts} attempt${limitResult.remainingAttempts !== 1 ? 's' : ''} remaining.`);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-2 border-black dark:border-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-8">
            <Logo size="lg" showText={true} />
          </div>

          <h2 className="text-2xl font-black mb-2">Welcome Back</h2>
          <p className="text-sm text-black/70 dark:text-white/70 mb-6">
            Enter your master password to unlock your vault
          </p>

          {error && (
            <div className="mb-4 p-3 border-2 border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50 dark:text-white/50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-2 border-black dark:border-white font-medium"
                  placeholder="Enter your master password"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-black/50 dark:text-white/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-black/50 dark:text-white/50" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Unlocking...' : 'Unlock Vault'}
            </Button>
          </form>

          <div className="mt-6 p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a]">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold mb-1">Security Note:</p>
                <p className="text-black/70 dark:text-white/70">
                  Your master password is never stored or sent anywhere. If you forget it, 
                  your data cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-black/50 dark:text-white/50 mt-6">
          Built with hardwork by Krishna Naveen
        </p>
      </div>
    </div>
  );
}
