'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Login() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    setError('');
    setIsLoggingIn(true);

    try {
      const success = await login(password);

      if (!success) {
        setError('Incorrect master password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="space-y-2 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div>
              <Logo size="lg" showText={false} />
            </div>
            <div>
              <CardTitle className="text-3xl font-black">HackVault</CardTitle>
              <CardDescription className="text-black/70 font-medium">
                Enter your master password
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Master Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Master Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="pr-10 border-2 border-black font-mono focus:ring-2 focus:ring-black"
                disabled={isLoggingIn}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 border-2 border-black bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-black">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={!password || isLoggingIn}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? 'Unlocking...' : 'Unlock Vault'}
          </Button>

          {/* Warning */}
          <div className="p-4 border-2 border-black bg-gray-50">
            <p className="text-xs text-black/70">
              <span className="font-bold">⚠️ Forgot your password?</span>
              <br />
              There is no way to recover your passwords. You'll need to reset the vault and lose all data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
