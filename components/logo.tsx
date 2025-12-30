'use client';

import Image from 'next/image';
import { useTheme } from '@/lib/theme-context';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { width: 24, height: 24, text: 'text-base' },
  md: { width: 32, height: 32, text: 'text-xl' },
  lg: { width: 40, height: 40, text: 'text-2xl' },
  xl: { width: 56, height: 56, text: 'text-3xl' },
};

export function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const { theme } = useTheme();
  const dimensions = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo without black box */}
      <div className="relative flex-shrink-0">
        <LogoImage 
          width={dimensions.width} 
          height={dimensions.height}
          theme={theme}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-black leading-none tracking-tight ${dimensions.text}`}>
            HackVault
          </h1>
          {size === 'lg' || size === 'xl' ? (
            <p className="text-xs font-bold text-black/60 dark:text-white/60">
              Password Manager
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function LogoImage({ width, height, theme }: { width: number; height: number; theme: string }) {
  const logoPath = theme === 'dark' ? '/logos/logo-light.svg' : '/logos/logo.svg';
  const fallbackLogoPath = '/logos/logo.png';

  return (
    <div 
      className="flex items-center justify-center"
      style={{ width, height }}
    >
      {/* Clean logo without background box */}
      <Image
        src={logoPath}
        alt="HackVault"
        width={width}
        height={height}
        className="object-contain"
        onError={(e) => {
          // Fallback to PNG if SVG fails
          const target = e.target as HTMLImageElement;
          target.src = fallbackLogoPath;
          target.onerror = () => {
            // If both fail, show nothing (logo will be hidden)
            target.style.display = 'none';
          };
        }}
      />
    </div>
  );
}

// Simple text logo version
export function TextLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`}>
      HackVault
    </span>
  );
}
