'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function SecurityWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSecure = window.isSecureContext;
      const hasSubtle = typeof crypto !== 'undefined' && crypto.subtle;
      
      if (!isSecure || !hasSubtle) {
        setShowWarning(true);
      }
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white p-4 border-b-4 border-red-500">
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-lg mb-1">Security Warning</p>
          <p className="text-sm">
            Web Crypto API is not available. HackVault requires a secure context (HTTPS or localhost).
            <br />
            <strong>Please access via:</strong> http://localhost:3000 instead of the network IP address.
          </p>
        </div>
      </div>
    </div>
  );
}
