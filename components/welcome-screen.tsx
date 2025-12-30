'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Zap, Code, ArrowRight, Check } from 'lucide-react';

export function WelcomeScreen() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hackvault_visited');
    if (!hasVisited) {
      setShow(true);
    }
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Zero-Knowledge Security",
      description: "Your master password never leaves your device. Not even we can access your data."
    },
    {
      icon: Lock,
      title: "Military-Grade Encryption",
      description: "AES-256-GCM encryption with PBKDF2 key derivation (600,000+ iterations)."
    },
    {
      icon: Zap,
      title: "Offline-First Architecture",
      description: "Works completely offline using IndexedDB. No internet required after initial load."
    },
    {
      icon: Code,
      title: "Open Source & Transparent",
      description: "Fully open source on GitHub. Audit the code yourself or contribute improvements."
    }
  ];

  const handleClose = () => {
    localStorage.setItem('hackvault_visited', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#1a1a1a] flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-2xl w-full">
        {/* Logo Animation */}
        <div className="text-center mb-8 animate-bounce">
          <Logo size="xl" showText={false} className="justify-center mb-4" />
          <h1 className="text-4xl md:text-5xl font-black mb-2">Welcome to HackVault</h1>
          <p className="text-lg text-black/70 dark:text-white/70">
            Your passwords, your device, your control.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <feature.icon className="h-8 w-8 mb-3" />
              <h3 className="font-black text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-black/70 dark:text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="p-6 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a] mb-6">
          <h3 className="font-black text-lg mb-4">Quick Tips:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>Use a <strong>strong master password</strong> you'll never forget</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>Enable the <strong>browser extension</strong> for auto-fill</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span><strong>Export backups</strong> regularly to avoid data loss</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>There is <strong>no password recovery</strong> - keep it safe!</span>
            </li>
          </ul>
        </div>

        {/* Get Started Button */}
        <Button
          onClick={handleClose}
          className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-xs text-black/50 dark:text-white/50 mt-4">
          Built with hardwork by Krishna Naveen
        </p>
      </div>
    </div>
  );
}
