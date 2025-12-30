'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  generateSalt,
  hashMasterPassword,
  deriveKey,
  uint8ArrayToBase64,
  calculatePasswordStrength,
} from '@/lib/crypto/encryption';
import { saveMasterPassword } from '@/lib/storage/database';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Logo } from '@/components/logo';

export function SetupMasterPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const { setKey, checkSetup } = useAuth();

  const strength = calculatePasswordStrength(password);

  // Helper function to get color and label from score
  const getStrengthInfo = (score: number) => {
    if (score < 40) return { color: '#ef4444', label: 'Weak' };
    if (score < 60) return { color: '#f59e0b', label: 'Fair' };
    if (score < 80) return { color: '#10b981', label: 'Good' };
    return { color: '#3b82f6', label: 'Strong' };
  };

  const strengthInfo = getStrengthInfo(strength.score);

  const handleCreate = async () => {
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Master password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (strength.score < 40) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    setIsCreating(true);

    try {
      // Generate salt
      const salt = generateSalt();
      const saltBase64 = uint8ArrayToBase64(salt);

      // Hash password for verification
      const hash = await hashMasterPassword(password);

      // Save to database
      await saveMasterPassword(saltBase64, hash);

      // Derive encryption key
      const key = await deriveKey(password, salt);
      setKey(key);

      await checkSetup();
    } catch (err) {
      setError('Failed to create master password. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <CardHeader className="space-y-2 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <Logo size="lg" showText={true} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Warning Box */}
          <div className="p-4 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black">
            <div className="flex gap-2 items-start">
              <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm font-medium">
                <p className="font-bold mb-1">⚠️ IMPORTANT WARNING</p>
                <p>
                  Your master password is the ONLY way to access your vault. If you forget it,
                  your passwords are lost forever. There is NO password recovery.
                </p>
              </div>
            </div>
          </div>

          {/* Master Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold">Master Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong master password"
                className="pr-10 border-2 border-black dark:border-white font-mono"
                disabled={isCreating}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Strength:</span>
                  <span className="font-bold" style={{ color: strengthInfo.color }}>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-white">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${strength.score}%`,
                      backgroundColor: strengthInfo.color,
                    }}
                  />
                </div>
                {strength.feedback.length > 0 && (
                  <ul className="text-xs text-black/70 dark:text-white/70 space-y-1 mt-2">
                    {strength.feedback.map((tip, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold">Confirm Master Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your master password"
                className="pr-10 border-2 border-black dark:border-white font-mono"
                disabled={isCreating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 border-2 border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!password || !confirmPassword || isCreating}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Vault...' : 'Create Vault'}
          </Button>

          {/* Security Notes */}
          <div className="text-xs text-black/60 dark:text-white/60 space-y-1 pt-2 border-t-2 border-black/20 dark:border-white/20">
            <p className="font-bold">🔒 Zero-Knowledge Security:</p>
            <p>• Your password never leaves this device</p>
            <p>• All encryption happens in your browser</p>
            <p>• No one can recover your password, not even us</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
