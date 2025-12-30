'use client';

import { Shield, Github, Heart, Lock, Zap, Code } from 'lucide-react';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white dark:bg-[#1a1a1a] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <Logo size="md" showText={false} className="mb-4" />
            <h3 className="text-xl font-black mb-2">HackVault</h3>
            <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
    Zero-knowledge password manager built with security and privacy at its core. 
    Your passwords never leave your device.
  </p>
          </div>

          {/* Features Section */}
          <div>
            <h4 className="font-black mb-4">Security Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>AES-256-GCM Encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Client-Side Only</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Zero-Knowledge Architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>Open Source</span>
              </li>
            </ul>
          </div>

          {/* Open Source Section */}
          <div>
            <h4 className="font-black mb-4">Open Source</h4>
            <p className="text-sm text-black/70 dark:text-white/70 mb-4">
              HackVault is free and open source. Contributions, feedback, and stars are welcome.
            </p>
            <a
              href="https://github.com/yuvakrishnas/hackvault"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-black dark:border-white my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Credits */}
          <div className="flex items-center gap-2 text-sm">
            <span>Built with</span>
            <Heart className="h-4 w-4 fill-black dark:fill-white" />
            <span>and hardwork by</span>
            <strong className="font-black">Krishna Naveen</strong>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="px-3 py-1 border-2 border-black dark:border-white text-xs font-bold">
              YSWS @ Hack Club
            </span>
            <span className="px-3 py-1 border-2 border-black dark:border-white text-xs font-bold">
              Next.js 14
            </span>
            <span className="px-3 py-1 border-2 border-black dark:border-white text-xs font-bold">
              TypeScript
            </span>
            <span className="px-3 py-1 border-2 border-black dark:border-white text-xs font-bold">
              Web Crypto API
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a]">
          <p className="text-xs text-center text-black/60 dark:text-white/60">
            <strong>Security Notice:</strong> HackVault uses industry-standard encryption. 
            However, no system is 100% secure. Always use strong master passwords and enable 2FA where available.
          </p>
        </div>
      </div>
    </footer>
  );
}
