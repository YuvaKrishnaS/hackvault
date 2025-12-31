'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  LogOut, 
  Shield, 
  Eye, 
  EyeOff, 
  Copy, 
  Pencil, 
  Trash2,
  Download,
  Sparkles,
  Moon,
  Sun,
  Info,
  Lock,
  Puzzle,
  Zap,
  Boxes,
  Link,
  Plug,
  Menu,
  Settings,
  Activity
} from 'lucide-react';
import { getAllPasswords, deletePassword } from '@/lib/storage/database';
import { decryptData, base64ToUint8Array } from '@/lib/crypto/encryption';
import { DecryptedPasswordEntry } from '@/lib/types';
import { useToast } from '@/components/ui/toast-simple';
import { useTheme } from '@/lib/theme-context';
import { syncPasswordsToLocalStorage } from '@/lib/extension-sync';
import { autoLockManager } from '@/lib/auto-lock';
import { AddPasswordDialog } from './add-password-dialog';
import { EditPasswordDialog } from './edit-password-dialog';
import { PasswordGeneratorDialog } from './password-generator-dialog';
import { ExportImportDialog } from './export-import-dialog';
import { AboutDialog } from '@/components/about-dialog';
import { SettingsDialog } from '@/components/settings-dialog';
import { HealthDashboard } from '@/components/health-dashboard';
import { Footer } from '@/components/footer';
import { Logo } from '@/components/logo';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';

export function VaultMain() {
  const { logout, encryptionKey } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [passwords, setPasswords] = useState<DecryptedPasswordEntry[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<DecryptedPasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingPassword, setEditingPassword] = useState<DecryptedPasswordEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

  // Load and decrypt passwords
  const loadPasswords = async () => {
    if (!encryptionKey) return;

    setIsLoading(true);
    try {
      const encrypted = await getAllPasswords();
      const decrypted: DecryptedPasswordEntry[] = [];

      for (const entry of encrypted) {
        try {
          const decryptedPassword = await decryptData(
            entry.password,
            encryptionKey,
            base64ToUint8Array(entry.iv)
          );

          decrypted.push({
            ...entry,
            password: decryptedPassword,
          });
        } catch (error) {
          console.error('Failed to decrypt entry:', entry.id, error);
        }
      }

      setPasswords(decrypted);
      setFilteredPasswords(decrypted);
    } catch (error) {
      showToast('Failed to load passwords', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPasswords();
  }, [encryptionKey]);

  // Setup auto-lock
  useEffect(() => {
    autoLockManager.start(() => {
      showToast('Vault locked due to inactivity', 'info');
      logout();
    });

    return () => {
      autoLockManager.stop();
    };
  }, [logout]);

  // Filter passwords by search and category
  useEffect(() => {
    let filtered = passwords;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.username.toLowerCase().includes(query) ||
          p.url?.toLowerCase().includes(query)
      );
    }

    setFilteredPasswords(filtered);
  }, [searchQuery, selectedCategory, passwords]);

  // Get unique categories
  const categories = ['All', ...new Set(passwords.map((p) => p.category))];

  // Copy to clipboard with animation
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    
    // Create floating animation
    const notification = document.createElement('div');
    notification.textContent = `✓ ${label} copied!`;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #000;
      color: #fff;
      padding: 16px 32px;
      border: 3px solid #000;
      font-weight: 900;
      font-size: 16px;
      z-index: 9999;
      animation: copyPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: none;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 600);
    
    showToast(`${label} copied to clipboard`, 'success');
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Delete password
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await deletePassword(id);
      showToast('Password deleted', 'success');
      loadPasswords();
    } catch (error) {
      showToast('Failed to delete password', 'error');
    }
  };

  // Sync to extension
  const syncToExtension = () => {
    if (passwords.length > 0) {
      syncPasswordsToLocalStorage(passwords);
      showToast('Passwords synced to extension', 'success');
    } else {
      showToast('No passwords to sync', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onAddPassword={() => setShowAddDialog(true)}
        onGeneratePassword={() => setShowGeneratorDialog(true)}
        onSearch={() => document.getElementById('search-input')?.focus()}
      />

      {/* Header - Fully Responsive */}
      <header className="border-b-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <Logo size="md" showText={false} className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-black truncate">HackVault</h1>
                <p className="text-xs text-black/60 dark:text-white/60 hidden sm:block">
                  {passwords.length} password{passwords.length !== 1 ? 's' : ''} stored
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                onClick={() => setShowHealth(true)}
                variant="outline"
                size="sm"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowAbout(true)}
                variant="outline"
                size="sm"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                onClick={syncToExtension}
                variant="outline"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Sync Extension
              </Button>
              <Button
                onClick={() => setShowExportImport(true)}
                variant="outline"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export/Import
              </Button>
              <Button
                onClick={() => setShowGeneratorDialog(true)}
                variant="outline"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="border-2 border-black dark:border-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              variant="outline"
              size="sm"
              className="lg:hidden border-2 border-black dark:border-white font-bold"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="lg:hidden mt-3 pb-3 border-t-2 border-black dark:border-white pt-3 space-y-2 animate-fadeIn">
              <Button
                onClick={() => { setShowHealth(true); setShowMobileMenu(false); }}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <Activity className="h-4 w-4 mr-2" />
                Password Health
              </Button>
              <Button
                onClick={() => { setShowSettings(true); setShowMobileMenu(false); }}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => { setShowAbout(true); setShowMobileMenu(false); }}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <Info className="h-4 w-4 mr-2" />
                About
              </Button>
              <Button
                onClick={() => { toggleTheme(); setShowMobileMenu(false); }}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Toggle Theme
              </Button>
              <Button
                onClick={() => { syncToExtension(); setShowMobileMenu(false); }}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <Puzzle className="h-4 w-4 mr-2" />
                Sync Extension
              </Button>
              <Button
                onClick={() => { setShowExportImport(true); setShowMobileMenu(false); }}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export/Import
              </Button>
              <Button
                onClick={() => { setShowGeneratorDialog(true); setShowMobileMenu(false); }}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Password
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="w-full border-2 border-black dark:border-white font-bold justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Stats Banner - Animated */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group">
            <div className="text-3xl md:text-4xl font-black mb-1 group-hover:scale-110 transition-transform">
              {passwords.length}
            </div>
            <div className="text-xs font-bold text-black/60 dark:text-white/60">TOTAL PASSWORDS</div>
          </div>
          <div className="p-4 border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group">
            <div className="text-3xl md:text-4xl font-black mb-1 group-hover:scale-110 transition-transform">
              {categories.length - 1}
            </div>
            <div className="text-xs font-bold text-black/60 dark:text-white/60">CATEGORIES</div>
          </div>
          <div className="p-4 border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group">
            <Lock className="h-8 w-8 mb-2 group-hover:rotate-12 transition-transform" />
            <div className="text-xs font-bold text-black/60 dark:text-white/60">AES-256-GCM</div>
          </div>
          <div className="p-4 border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group">
            <Shield className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-black/60 dark:text-white/60">ZERO-KNOWLEDGE</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50 dark:text-white/50" />
              <Input
                id="search-input"
                type="text"
                placeholder="Search passwords... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black dark:border-white font-medium"
              />
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Password
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 md:px-4 py-2 border-2 border-black dark:border-white font-bold transition-all text-sm ${
                  selectedCategory === category
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Password List */}
        {isLoading ? (
          <div className="text-center py-12 md:py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent"></div>
            <p className="mt-4 font-medium text-black/60 dark:text-white/60">Loading passwords...</p>
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="text-center py-12 md:py-20 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a] animate-fadeIn">
            <div className="mb-6">
              <Shield className="h-20 w-20 md:h-24 md:w-24 mx-auto text-black/20 dark:text-white/20" />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2">
              {searchQuery ? 'No Matches Found' : 'Your Vault is Empty'}
            </h3>
            <p className="text-black/60 dark:text-white/60 mb-6 text-sm md:text-base px-4">
              {searchQuery
                ? 'Try adjusting your search query or browse all passwords'
                : 'Get started by adding your first password securely'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Password
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {filteredPasswords.map((entry) => (
              <Card
                key={entry.id}
                className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <CardHeader className="border-b-2 border-black dark:border-white pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-black truncate">
                        {entry.title}
                      </CardTitle>
                      <p className="text-sm text-black/60 dark:text-white/60 truncate">{entry.username}</p>
                    </div>
                    <Badge className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold flex-shrink-0">
                      {entry.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-black/60 dark:text-white/60 mb-1 block">
                      PASSWORD
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 font-mono text-sm border-2 border-black dark:border-white px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] truncate">
                        {visiblePasswords.has(entry.id!)
                          ? entry.password
                          : '••••••••••••'}
                      </div>
                      <Button
                        onClick={() => togglePasswordVisibility(entry.id!)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-black dark:border-white flex-shrink-0"
                      >
                        {visiblePasswords.has(entry.id!) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(entry.password, 'Password')}
                        variant="outline"
                        size="sm"
                        className="border-2 border-black dark:border-white flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {entry.url && (
                    <div>
                      <label className="text-xs font-bold text-black/60 dark:text-white/60 mb-1 block">
                        WEBSITE
                      </label>
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline hover:no-underline truncate block"
                      >
                        {entry.url}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t-2 border-black dark:border-white">
                    <Button
                      onClick={() => setEditingPassword(entry)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-black dark:border-white font-bold"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(entry.id!, entry.title)}
                      variant="outline"
                      size="sm"
                      className="border-2 border-black dark:border-white font-bold hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Dialogs */}
      {showAddDialog && (
        <AddPasswordDialog
          isOpen={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            loadPasswords();
          }}
        />
      )}

      {editingPassword && (
        <EditPasswordDialog
          isOpen={!!editingPassword}
          password={editingPassword}
          onClose={() => {
            setEditingPassword(null);
            loadPasswords();
          }}
        />
      )}

      {showGeneratorDialog && (
        <PasswordGeneratorDialog
          isOpen={showGeneratorDialog}
          onClose={() => setShowGeneratorDialog(false)}
        />
      )}

      {showExportImport && (
        <ExportImportDialog
          isOpen={showExportImport}
          onClose={() => setShowExportImport(false)}
          onImportComplete={loadPasswords}
        />
      )}

      {showAbout && (
        <AboutDialog
          isOpen={showAbout}
          onClose={() => setShowAbout(false)}
        />
      )}
      //vhrvk

      {showSettings && (
        <SettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHealth && (
        <HealthDashboard
          isOpen={showHealth}
          onClose={() => setShowHealth(false)}
          passwords={passwords}
          onFixPassword={(id) => {
            const password = passwords.find(p => p.id === id);
            if (password) setEditingPassword(password);
          }}
        />
      )}
    </div>
  );
}
