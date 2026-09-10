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
          {/* Main Container with Floating Vertical Sidebar + Header Bar */}
          <div className="flex min-h-screen bg-surface">
            {/* Left Floating Pill Sidebar Navigation */}
            <SidebarNav />

            {/* Main Workspace Frame */}
            <div className="flex-1 flex flex-col min-w-0 sm:pl-20 md:pl-24 transition-all duration-300">
              {/* Top Header Navigation Bar */}
              <HeaderToolbar />

              {/* Main Content Area */}
              <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 pb-20">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
