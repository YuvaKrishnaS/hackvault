'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { updatePassword } from '@/lib/storage/database';
import { encryptData, generateIV, arrayBufferToBase64, generateSecurePassword } from '@/lib/crypto/encryption';
import { useToast } from '@/components/ui/toast-simple';
import { DecryptedPasswordEntry } from '@/lib/types';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface EditPasswordDialogProps {
  isOpen: boolean;
  password: DecryptedPasswordEntry;
  onClose: () => void;
}

export function EditPasswordDialog({ isOpen, password, onClose }: EditPasswordDialogProps) {
  const { encryptionKey } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState(password.title);
  const [username, setUsername] = useState(password.username);
  const [passwordValue, setPasswordValue] = useState(password.password);
  const [url, setUrl] = useState(password.url || '');
  const [category, setCategory] = useState(password.category);
  const [notes, setNotes] = useState(password.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !username || !passwordValue) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!encryptionKey) {
      showToast('Encryption key not available', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const iv = generateIV();
      const encryptedPassword = await encryptData(passwordValue, encryptionKey, iv);

      await updatePassword(password.id!, {
        title,
        username,
        password: encryptedPassword,
        url: url || undefined,
        category,
        notes: notes || undefined,
        iv: arrayBufferToBase64(iv),
      });

      showToast('Password updated successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to update password', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword(16, true, true, true, true);
    setPasswordValue(generated);
    setShowPassword(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black pb-4">
          <DialogTitle className="text-2xl font-black">Edit Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-bold block mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., GitHub, Gmail"
              className="border-2 border-black"
            />
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Username / Email</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your@email.com"
              className="border-2 border-black"
            />
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder="Enter password"
                  className="border-2 border-black font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                type="button"
                onClick={handleGeneratePassword}
                variant="outline"
                className="border-2 border-black"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Website URL (Optional)</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="border-2 border-black"
            />
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-2 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Notes (Optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              className="border-2 border-black"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-black font-bold"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
