'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Copy, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/toast-simple';
import { generatePassword, getStrengthColor } from '@/lib/crypto/password-generator';

interface PasswordGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordGeneratorDialog({ isOpen, onClose }: PasswordGeneratorDialogProps) {
  const { showToast } = useToast();
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('strong');

  const handleGenerate = () => {
    const result = generatePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
    });
    setGeneratedPassword(result.password);
    setStrength(result.strength);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    showToast('Password copied to clipboard', 'success');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black dark:border-white pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            <DialogTitle className="text-2xl font-black">Password Generator</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Generate secure random passwords
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generated Password Display */}
          {generatedPassword && (
            <div className="p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-black/60 dark:text-white/60">GENERATED PASSWORD</span>
                <span className={`text-xs font-bold ${getStrengthColor(strength)}`}>
                  {strength.toUpperCase().replace('-', ' ')}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 font-mono text-sm p-2 border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] break-all">
                  {generatedPassword}
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="border-2 border-black dark:border-white font-bold"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Length Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-bold">Length</Label>
              <span className="text-2xl font-black">{length}</span>
            </div>
            <Slider
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
              min={8}
              max={64}
              step={1}
              className="w-full"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Uppercase (A-Z)</Label>
              <Switch checked={uppercase} onCheckedChange={setUppercase} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-bold">Lowercase (a-z)</Label>
              <Switch checked={lowercase} onCheckedChange={setLowercase} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-bold">Numbers (0-9)</Label>
              <Switch checked={numbers} onCheckedChange={setNumbers} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-bold">Symbols (!@#$)</Label>
              <Switch checked={symbols} onCheckedChange={setSymbols} />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold py-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
