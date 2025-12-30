'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { autoLockManager } from '@/lib/auto-lock';
import { Shield, Clock, Bell, Trash2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/toast-simple';
import { clearAllData } from '@/lib/storage/database';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { showToast } = useToast();
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockMinutes, setAutoLockMinutes] = useState(30);
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    const settings = autoLockManager.getSettings();
    setAutoLockEnabled(settings.enabled);
    setAutoLockMinutes(Math.floor(settings.timeoutDuration / 60000));

    const notifPref = localStorage.getItem('hackvault_notifications');
    setShowNotifications(notifPref !== 'false');
  }, [isOpen]);

  const handleAutoLockToggle = (enabled: boolean) => {
    setAutoLockEnabled(enabled);
    autoLockManager.setEnabled(enabled);
    showToast(enabled ? 'Auto-lock enabled' : 'Auto-lock disabled', 'success');
  };

  const handleAutoLockMinutesChange = (minutes: number) => {
    setAutoLockMinutes(minutes);
    autoLockManager.setTimeoutDuration(minutes * 60 * 1000);
    showToast(`Auto-lock set to ${minutes} minutes`, 'success');
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setShowNotifications(enabled);
    localStorage.setItem('hackvault_notifications', enabled.toString());
    showToast(enabled ? 'Notifications enabled' : 'Notifications disabled', 'success');
  };

  const handleClearAllData = async () => {
    if (!confirm('⚠️ This will delete ALL your passwords permanently!\n\nThis action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('Last chance! Type "DELETE" in the next prompt to confirm.')) {
      return;
    }

    const confirmation = prompt('Type DELETE to confirm:');
    if (confirmation !== 'DELETE') {
      showToast('Deletion cancelled', 'info');
      return;
    }

    try {
      await clearAllData();
      localStorage.clear();
      showToast('All data cleared successfully', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showToast('Failed to clear data', 'error');
    }
  };

  const exportSettings = () => {
    const settings = {
      autoLockEnabled,
      autoLockMinutes,
      showNotifications,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hackvault-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported', 'success');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black dark:border-white pb-4">
          <DialogTitle className="text-2xl font-black">Settings</DialogTitle>
          <DialogDescription className="sr-only">Configure HackVault settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Security Settings */}
          <div className="border-2 border-black dark:border-white p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5" />
              <h3 className="text-lg font-black">Security</h3>
            </div>

            <div className="space-y-4">
              {/* Auto-Lock */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-bold">Auto-Lock Vault</Label>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Automatically lock after inactivity
                  </p>
                </div>
                <Switch
                  checked={autoLockEnabled}
                  onCheckedChange={handleAutoLockToggle}
                />
              </div>

              {/* Auto-Lock Duration */}
              {autoLockEnabled && (
                <div>
                  <Label className="font-bold">Lock After (minutes)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={autoLockMinutes}
                      onChange={(e) => handleAutoLockMinutesChange(parseInt(e.target.value) || 1)}
                      className="w-24 border-2 border-black dark:border-white font-bold"
                    />
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                    Recommended: 15-30 minutes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-2 border-black dark:border-white p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5" />
              <h3 className="text-lg font-black">Notifications</h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="font-bold">Show Notifications</Label>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Display copy and sync confirmations
                </p>
              </div>
              <Switch
                checked={showNotifications}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>
          </div>

          {/* Data Management */}
          <div className="border-2 border-black dark:border-white p-4">
            <div className="flex items-center gap-2 mb-4">
              <Download className="h-5 w-5" />
              <h3 className="text-lg font-black">Data Management</h3>
            </div>

            <div className="space-y-3">
              <Button
                onClick={exportSettings}
                variant="outline"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-2 border-red-600 dark:border-red-500 p-4 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-500" />
              <h3 className="text-lg font-black text-red-600 dark:text-red-500">Danger Zone</h3>
            </div>

            <Button
              onClick={handleClearAllData}
              variant="outline"
              className="w-full border-2 border-red-600 dark:border-red-500 font-bold text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
            <p className="text-xs text-red-600 dark:text-red-500 mt-2">
              ⚠️ This will permanently delete all passwords and settings. This cannot be undone!
            </p>
          </div>

          {/* App Info */}
          <div className="border-t-2 border-black dark:border-white pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-black/60 dark:text-white/60">Version</p>
                <p className="font-black">1.0.0</p>
              </div>
              <div>
                <p className="font-bold text-black/60 dark:text-white/60">Encryption</p>
                <p className="font-black">AES-256-GCM</p>
              </div>
              <div>
                <p className="font-bold text-black/60 dark:text-white/60">Storage</p>
                <p className="font-black">IndexedDB</p>
              </div>
              <div>
                <p className="font-bold text-black/60 dark:text-white/60">Iterations</p>
                <p className="font-black">600,000</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
