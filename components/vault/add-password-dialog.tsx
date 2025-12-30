'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addPassword } from '@/lib/storage/database';
import { encryptData, generateIV, uint8ArrayToBase64 } from '@/lib/crypto/encryption';
import { useToast } from '@/components/ui/toast-simple';
import { validatePasswordEntry, validateURL } from '@/lib/validation';
import { Shield, Sparkles } from 'lucide-react';
import { generatePassword } from '@/lib/crypto/password-generator';

interface AddPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['General', 'Work', 'Social', 'Finance', 'Email', 'Shopping'];

export function AddPasswordDialog({ isOpen, onClose }: AddPasswordDialogProps) {
  const { encryptionKey } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('General');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePassword = () => {
    const generated = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    setPassword(generated.password);
    showToast('Password generated', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate input
    const validation = validatePasswordEntry({ title, username, password });
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    if (url && !validateURL(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    if (!encryptionKey) {
      setError('Encryption key not available');
      return;
    }

    setIsLoading(true);

    try {
      const iv = generateIV();
      const encryptedPassword = await encryptData(password, encryptionKey, iv);

      await addPassword({
        title: title.trim(),
        username: username.trim(),
        password: encryptedPassword,
        url: url.trim() || undefined,
        category,
        notes: notes.trim() || undefined,
        iv: uint8ArrayToBase64(iv),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      showToast('Password saved successfully', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to save password:', err);
      setError('Failed to save password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black dark:border-white pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <DialogTitle className="text-2xl font-black">Add Password</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Add a new password entry to your vault
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 border-2 border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-bold mb-2 block">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., GitHub Account"
              className="border-2 border-black dark:border-white font-medium"
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div>
            <Label className="font-bold mb-2 block">Username/Email *</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., user@example.com"
              className="border-2 border-black dark:border-white font-medium"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          <div>
            <Label className="font-bold mb-2 block">Password *</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="border-2 border-black dark:border-white font-mono font-medium"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleGeneratePassword}
                variant="outline"
                className="border-2 border-black dark:border-white font-bold flex-shrink-0"
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="font-bold mb-2 block">Website URL</Label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="border-2 border-black dark:border-white font-medium"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label className="font-bold mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger className="border-2 border-black dark:border-white font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-bold">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-bold mb-2 block">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              className="border-2 border-black dark:border-white font-medium resize-none"
              rows={3}
              disabled={isLoading}
              maxLength={500}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t-2 border-black dark:border-white">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-black dark:border-white font-bold"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
