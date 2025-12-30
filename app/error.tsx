'use client';

import { useEffect } from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Logo size="xl" showText={false} className="justify-center mb-6" />
        
        <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-[#1a1a1a]">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-black dark:text-white" />
          <h1 className="text-2xl font-black mb-4">Something Went Wrong</h1>
          <p className="text-sm text-black/70 dark:text-white/70 mb-6">
            An unexpected error occurred. Your passwords are safe and encrypted.
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={reset}
              className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full border-2 border-black dark:border-white font-bold"
            >
              Go Home
            </Button>
          </div>
        </div>
        
        <p className="mt-6 text-xs text-black/50 dark:text-white/50">
          Built by Krishna Naveen
        </p>
      </div>
    </div>
  );
}
