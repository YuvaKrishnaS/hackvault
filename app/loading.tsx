import { Logo } from '@/components/logo';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8 animate-pulse">
          <Logo size="xl" showText={false} />
        </div>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="mt-4 font-bold text-black/60 dark:text-white/60">Loading HackVault...</p>
      </div>
    </div>
  );
}
