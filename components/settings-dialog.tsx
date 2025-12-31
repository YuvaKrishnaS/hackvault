'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast-simple';
import { Fingerprint, Trash2, Shield } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { biometricAvailable, biometricEnabled, enableBiometric, disableBiometric, login } = useAuth();
  const { showToast } = useToast();

  const handleEnableBiometric = async () => {
    const password = prompt('Enter your master password to enable biometric authentication:');
    if (!password) return;

    try {
      // First verify the password
      const loginSuccess = await login(password);
      if (!loginSuccess) {
        showToast('Invalid password', 'error');
        return;
      }

      // Then enable biometric
      const enabled = await enableBiometric(password);
      if (enabled) {
        showToast('Biometric unlock enabled successfully!', 'success');
      } else {
        showToast('Failed to enable biometric. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Failed to enable biometric', 'error');
      console.error(error);
    }
  };

  const handleDisableBiometric = () => {
    if (!confirm('Disable biometric unlock? You will need to use your master password to login.')) {
      return;
    }

    disableBiometric();
    showToast('Biometric unlock disabled', 'success');
  };

  const handleResetVault = async () => {
    const confirmation = prompt('⚠️ DELETE ALL DATA? This CANNOT be undone!\n\nType "DELETE" to confirm:');
    if (confirmation !== 'DELETE') {
      showToast('Reset cancelled', 'error');
      return;
    }

    try {
      await window.indexedDB.deleteDatabase('HackVaultDB');
      localStorage.clear();
      showToast('Vault reset complete. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showToast('Failed to reset vault', 'error');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <DialogHeader className="border-b-2 border-black dark:border-white pb-4">
          <DialogTitle className="text-2xl font-black">Settings</DialogTitle>
          <DialogDescription className="sr-only">Manage your vault settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Biometric Authentication */}
          {biometricAvailable && (
            <div className="space-y-3 p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a] rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Fingerprint className="h-4 w-4" />
                    Biometric Unlock
                  </h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                    Use fingerprint or Face ID to unlock vault
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {biometricEnabled ? (
                    <span className="text-green-600 dark:text-green-400 font-bold text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-600 dark:border-green-400 rounded">
                      Enabled
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 font-bold text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-400 rounded">
                      Disabled
                    </span>
                  )}
                </div>
              </div>

              {!biometricEnabled ? (
                <Button
                  onClick={handleEnableBiometric}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 border-2 border-black dark:border-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Enable Biometric Unlock
                </Button>
              ) : (
                <Button
                  onClick={handleDisableBiometric}
                  variant="outline"
                  className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                >
                  Disable Biometric Unlock
                </Button>
              )}
            </div>
          )}

          {/* Security Info */}
          <div className="p-4 border-2 border-black dark:border-white bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="flex gap-2 items-start">
              <Shield className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="text-sm">
                <p className="font-bold mb-1">Zero-Knowledge Security</p>
                <p className="text-black/70 dark:text-white/70 text-xs">
                  All encryption happens locally on your device. Your master password and data never leave your browser.
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-4 border-t-2 border-red-600">
            <h3 className="font-bold text-sm text-red-600">Danger Zone</h3>
            <Button
              onClick={handleResetVault}
              variant="outline"
              className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Vault (Delete All Data)
            </Button>
            <p className="text-xs text-red-600 dark:text-red-400">
              ⚠️ This will permanently delete all passwords and settings. This action cannot be undone.
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Close Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
