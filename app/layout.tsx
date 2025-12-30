import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/components/ui/toast-simple';
import { SecurityWarning } from '@/components/security-warning';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HackVault - Secure Password Manager',
  description: 'Zero-knowledge password manager built with Next.js. Your passwords never leave your device.',
  keywords: ['password manager', 'encryption', 'security', 'zero-knowledge', 'privacy'],
  authors: [{ name: 'Krishna Naveen' }],
  creator: 'Krishna Naveen',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/logos/logo.svg" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SecurityWarning />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
