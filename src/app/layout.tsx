import type { Metadata } from 'next';
import { Space_Grotesk, Inter_Tight } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { HeaderToolbar } from '@/components/HeaderToolbar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Content Engine — AI Content Adaptation & Publishing Studio',
  description: 'Industrial-grade content adaptation, review, publishing and cross-platform analytics engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${interTight.variable}`}>
      <body className="font-sans antialiased min-h-screen text-foreground bg-surface selection:bg-accent-yellow selection:text-foreground">
        <AppProvider>
          <div className="flex flex-col min-h-screen bg-surface">
            {/* Top Precision Header Bar */}
            <HeaderToolbar />

            {/* Main Application Surface Container */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-4 pb-20">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
