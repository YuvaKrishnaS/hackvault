'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts({
  onAddPassword,
  onGeneratePassword,
  onSearch,
}: {
  onAddPassword?: () => void;
  onGeneratePassword?: () => void;
  onSearch?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K = Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
      }

      // Ctrl/Cmd + N = New Password
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onAddPassword?.();
      }

      // Ctrl/Cmd + G = Generate Password
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        onGeneratePassword?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddPassword, onGeneratePassword, onSearch]);

  return null;
}

// Keyboard Shortcuts Help Component
export function KeyboardShortcutsHelp() {
  return (
    <div className="text-xs text-black/60 dark:text-white/60 space-y-1">
      <p className="font-bold mb-2">Keyboard Shortcuts:</p>
      <p>⌘/Ctrl + K → Search</p>
      <p>⌘/Ctrl + N → New Password</p>
      <p>⌘/Ctrl + G → Generate Password</p>
    </div>
  );
}
