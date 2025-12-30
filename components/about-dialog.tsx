'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Lock, Zap, Code, Github, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black dark:border-white pb-4">
          <div className="flex items-center gap-3">
            <Logo size="lg" showText={false} />
            <div>
              <DialogTitle className="text-2xl md:text-3xl font-black">HackVault</DialogTitle>
              <DialogDescription className="sr-only">About HackVault password manager</DialogDescription>
              <p className="text-sm text-black/70 dark:text-white/70">Version 1.0.0</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 pt-4">
          {/* Description */}
          <div>
            <p className="text-sm md:text-base text-black/80 dark:text-white/80 leading-relaxed">
              HackVault is a zero-knowledge password manager built with security and privacy at its core. 
              Your master password never leaves your device, and all encryption happens client-side using 
              industry-standard AES-256-GCM encryption.
            </p>
          </div>

          {/* Features Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="p-3 md:p-4 border-2 border-black dark:border-white">
              <Lock className="h-5 w-5 md:h-6 md:w-6 mb-2" />
              <h4 className="font-black text-sm md:text-base mb-1">AES-256-GCM</h4>
              <p className="text-xs text-black/70 dark:text-white/70">
                Military-grade encryption
              </p>
            </div>
            <div className="p-3 md:p-4 border-2 border-black dark:border-white">
              <Zap className="h-5 w-5 md:h-6 md:w-6 mb-2" />
              <h4 className="font-black text-sm md:text-base mb-1">Offline First</h4>
              <p className="text-xs text-black/70 dark:text-white/70">
                Works without internet
              </p>
            </div>
            <div className="p-3 md:p-4 border-2 border-black dark:border-white">
              <Shield className="h-5 w-5 md:h-6 md:w-6 mb-2" />
              <h4 className="font-black text-sm md:text-base mb-1">Zero-Knowledge</h4>
              <p className="text-xs text-black/70 dark:text-white/70">
                No one can access your data
              </p>
            </div>
            <div className="p-3 md:p-4 border-2 border-black dark:border-white">
              <Code className="h-5 w-5 md:h-6 md:w-6 mb-2" />
              <h4 className="font-black text-sm md:text-base mb-1">Open Source</h4>
              <p className="text-xs text-black/70 dark:text-white/70">
                Transparent and auditable
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="p-3 md:p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a]">
            <h4 className="font-black mb-3 text-sm md:text-base">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {['Next.js 14', 'TypeScript', 'Web Crypto API', 'IndexedDB', 'Dexie.js', 'TailwindCSS', 'Shadcn UI'].map((tech) => (
                <span
                  key={tech}
                  className="px-2 md:px-3 py-1 border-2 border-black dark:border-white text-xs font-bold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Creator */}
          <div className="p-3 md:p-4 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <span>Built with</span>
                  <Heart className="h-4 w-4 fill-current" />
                  <span>and hardwork by</span>
                </div>
                <h4 className="text-xl md:text-2xl font-black">Krishna Naveen</h4>
                <p className="text-sm opacity-80 mt-1">YSWS Program at Hack Club</p>
              </div>
              <Github className="h-10 w-10 md:h-12 md:w-12 opacity-50" />
            </div>
          </div>

          {/* GitHub Button */}
          <Button
            onClick={() => window.open('https://github.com/yuvakrishnas/hackvault', '_blank')}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold py-4 md:py-6"
          >
            <Github className="h-5 w-5 mr-2" />
            Star on GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
