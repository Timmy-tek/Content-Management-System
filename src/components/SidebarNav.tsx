'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  BarChart3,
  Sliders,
  Layers,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const mainNav = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Post Library', href: '/posts', icon: FolderKanban },
    { label: 'New Post', href: '/posts/new', icon: PlusCircle },
    { label: 'Scheduler', href: '/posts/scheduler', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Connected Accounts', href: '/settings/accounts', icon: Layers },
    { label: 'Settings', href: '/settings', icon: Sliders },
  ];

  return (
    <aside className="group/sidebar fixed left-3 top-[72px] bottom-3 z-30 hidden sm:flex flex-col justify-between items-center py-4 px-2 w-16 md:w-20 hover:w-56 bg-[#F0EEE6] rounded-[28px] border border-[#E2DFD5] shadow-md transition-all duration-300 ease-in-out pointer-events-auto overflow-hidden">
      {/* Top Stack: Brand Logo & Navigation Circles */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Top Circular Brand Logo */}
        <Link
          href="/"
          className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#111111] text-[#E5F23A] flex items-center justify-center font-bold font-display text-sm shadow-sm hover:scale-105 transition-transform shrink-0"
          title="Content Engine"
        >
          CE
        </Link>

        {/* Divider */}
        <div className="w-8 h-px bg-[#DCD8CC] my-1" />

        {/* Vertical Navigation Circles */}
        <nav className="flex flex-col gap-2.5 w-full items-center">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/settings');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-2 py-2 rounded-full w-full transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'bg-white text-[#444444] border border-[#E2DFD5] hover:border-[#111111] hover:text-[#111111] shadow-sm'
                }`}
                title={item.label}
              >
                {/* Icon Container */}
                <div className={`w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center rounded-full ${
                  isActive ? 'bg-[#111111] text-[#E5F23A]' : 'bg-transparent text-[#444444]'
                }`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>

                {/* Text Label (Visible on Sidebar Hover) */}
                <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden flex-1 pr-2">
                  <span className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-[#111111]'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Sun/Moon Theme Mode Switchers */}
      <div className="flex flex-col items-center gap-2 w-full pt-2">
        <div className="w-8 h-px bg-[#DCD8CC] my-1" />

        <div className="flex flex-col gap-2 items-center w-full">
          <button
            type="button"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-[#E2DFD5] text-[#444444] flex items-center justify-center hover:bg-[#F7F5EF] shadow-sm transition-transform hover:scale-105"
            title="Light Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#111111] text-[#E5F23A] flex items-center justify-center shadow-md transition-transform hover:scale-105"
            title="Active Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
