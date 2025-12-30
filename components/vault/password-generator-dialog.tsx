'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { generateSecurePassword, calculatePasswordStrength } from '@/lib/crypto/encryption';
import { useToast } from '@/components/ui/toast-simple';
import { Copy, RefreshCw } from 'lucide-react';

interface PasswordGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordGeneratorDialog({ isOpen, onClose }: PasswordGeneratorDialogProps) {
  const { showToast } = useToast();
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleGenerate = () => {
    try {
      const password = generateSecurePassword(
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols
      );
      setGeneratedPassword(password);
    } catch (error) {
      showToast('Please select at least one character type', 'error');
    }
  };

  const handleCopy = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      showToast('Password copied to clipboard', 'success');
    }
  };

  const strength = generatedPassword ? calculatePasswordStrength(generatedPassword) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black pb-4">
          <DialogTitle className="text-2xl font-black">Password Generator</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Generated Password Display */}
          {generatedPassword && (
            <div>
              <label className="text-sm font-bold block mb-2">Generated Password</label>
              <div className="flex gap-2">
                <Input
                  value={generatedPassword}
                  readOnly
                  className="border-2 border-black font-mono text-lg"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-2 border-black"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {strength && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">Strength:</span>
                    <span className="font-bold" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 border border-black">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${strength.score}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Length Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold">Password Length</label>
              <span className="text-sm font-bold">{length} characters</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 border border-black appearance-none cursor-pointer"
            />
          </div>

          {/* Character Options */}
          <div className="space-y-3">
            <label className="text-sm font-bold block">Include Characters</label>

            <div className="flex items-center justify-between p-3 border-2 border-black">
              <span className="font-medium">Uppercase (A-Z)</span>
              <Switch
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
                className="data-[state=checked]:bg-black"
              />
            </div>

            <div className="flex items-center justify-between p-3 border-2 border-black">
              <span className="font-medium">Lowercase (a-z)</span>
              <Switch
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
                className="data-[state=checked]:bg-black"
              />
            </div>

            <div className="flex items-center justify-between p-3 border-2 border-black">
              <span className="font-medium">Numbers (0-9)</span>
              <Switch
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
                className="data-[state=checked]:bg-black"
              />
            </div>

            <div className="flex items-center justify-between p-3 border-2 border-black">
              <span className="font-medium">Symbols (!@#$%)</span>
              <Switch
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
                className="data-[state=checked]:bg-black"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
