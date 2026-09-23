'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppProvider } from '@/context/AppContext';
import { HeaderToolbar } from '@/components/HeaderToolbar';
import { SidebarNav } from '@/components/SidebarNav';

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? '';

    if (pathname === '/login' || pathname.startsWith('/auth/')) {
        return <>{children}</>;
    }

    return (
        <AppProvider>
            <SidebarNav />
            <div className="sm:pl-20 md:pl-24 transition-all duration-300">
                <HeaderToolbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 min-h-[calc(100vh-6rem)]">
                    {children}
                </main>
            </div>
        </AppProvider>
    );
}