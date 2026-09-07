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
  title: 'Content Engine — AI Content Adaptation & Publishing',
  description: 'Adapt single content pieces for Instagram, LinkedIn, TikTok, and Facebook with AI and human review.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${interTight.variable}`}>
      <body className="font-inter antialiased min-h-screen text-[#111111] bg-fixed selection:bg-[#E5F23A] selection:text-[#111111]">
        {/* Surface 1 "Mesh" Gradient Background Canvas */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #B8F0D6 0%, #C7C4F0 100%)',
          }}
        />

        <AppProvider>
          {/* Left Vertical Navigation Sidebar */}
          <SidebarNav />

          {/* Right Main Content Area with Header */}
          <div className="sm:pl-20 md:pl-24 transition-all duration-300">
            {/* Top Contextual Header Toolbar */}
            <HeaderToolbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 min-h-[calc(100vh-6rem)]">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
