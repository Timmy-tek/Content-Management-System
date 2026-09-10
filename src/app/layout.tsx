import type { Metadata } from 'next';
import { Space_Grotesk, Inter_Tight } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { HeaderToolbar } from '@/components/HeaderToolbar';
import { SidebarNav } from '@/components/SidebarNav';

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
      <body className="font-sans antialiased min-h-screen text-foreground bg-surface selection:bg-[#E5F23A] selection:text-foreground">
        <AppProvider>
          <div className="flex flex-col min-h-screen bg-surface">
            {/* Top Header Bar spans edge-to-edge full width */}
            <HeaderToolbar />

            {/* Main Section under Header Bar: Sidebar (Left) + Content (Right) */}
            <div className="flex-1 flex relative">
              {/* Vertical Sidebar placed underneath top header bar */}
              <SidebarNav />

              {/* Main Content Workspace Canvas */}
              <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 pb-20 sm:pl-24 md:pl-28 transition-all duration-300">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
