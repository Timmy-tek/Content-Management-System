'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Calendar,
  BarChart3,
  Layers,
  Sliders,
  Moon,
  Sun
} from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const mainNav = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Post Library', href: '/posts', icon: FolderKanban },
    { label: 'New Post', href: '/posts/new', icon: PlusCircle },
    { label: 'Scheduler', href: '/scheduler', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Connected Accounts', href: '/settings/accounts', icon: Layers },
    { label: 'Settings', href: '/settings', icon: Sliders },
  ];

  return (
    <aside className="fixed left-3 top-16 bottom-4 z-40 hidden sm:flex flex-col justify-between bg-[#EFECE6] text-gray-900 rounded-full p-2.5 border border-[#E0DDD5] shadow-sm w-16 items-center">
      {/* Top Section: Logo Badge & Navigation Buttons */}
      <div className="flex flex-col items-center gap-4 w-full pt-1">
        {/* Black CE Brand Circle Badge */}
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-[#1B1A18] text-[#D4F63D] flex items-center justify-center font-bold font-space text-sm shadow-sm hover:scale-105 transition-transform"
          title="Content Engine"
        >
          CE
        </Link>

        {/* Thin Divider Line */}
        <div className="w-8 h-px bg-gray-300/60" />

        {/* Nav Circle Buttons */}
        <nav className="flex flex-col gap-2.5 items-center w-full">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/settings');

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isActive
                    ? 'bg-[#1B1A18] text-[#D4F63D] shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-white/80 hover:text-gray-950'
                }`}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Thin Divider & Theme Mode Toggles */}
      <div className="flex flex-col items-center gap-2.5 w-full pb-1">
        <div className="w-8 h-px bg-gray-300/60" />

        <div className="flex flex-col gap-2 items-center">
          {/* Moon Theme Button */}
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              themeMode === 'dark'
                ? 'bg-[#1B1A18] text-[#D4F63D] shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            title="Dark mode"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Sun Theme Button */}
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              themeMode === 'light'
                ? 'bg-[#1B1A18] text-[#D4F63D] shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            title="Light mode"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
