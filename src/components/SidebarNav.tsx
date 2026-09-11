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
  Sparkles,
  ChevronRight
} from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const mainNav = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, desc: 'Overview & metrics' },
    { label: 'Post Library', href: '/posts', icon: FolderKanban, desc: 'All social content' },
    { label: 'New Post', href: '/posts/new', icon: PlusCircle, desc: 'Create & AI adapt' },
    { label: 'Analytics', href: '/analytics', icon: BarChart3, desc: 'Performance Insights' },
    { label: 'Connected Accounts', href: '/settings/accounts', icon: Layers, desc: 'Channels & tokens' },
    { label: 'Settings', href: '/settings', icon: Sliders, desc: 'Voice & API keys' },
  ];

  return (
    <aside className="group/sidebar fixed left-4 top-4 bottom-4 z-50 hidden sm:flex flex-col justify-between bg-white text-gray-900 rounded-full p-3 border border-gray-200/80 shadow-lg w-16 md:w-20 hover:w-64 transition-all duration-300 ease-in-out pointer-events-auto overflow-hidden">
      {/* Top Brand Logo & Nav List */}
      <div className="flex flex-col gap-5 w-full pt-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-1.5 focus:outline-none"
          title="Content Engine"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold font-space text-base shadow-sm hover:scale-105 transition-transform">
            CE
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <span className="font-space font-bold text-base text-gray-900 tracking-tight block">Content Engine</span>
            <span className="text-[10px] text-gray-500 block -mt-1 font-sans">Multi-channel AI Studio</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Vertical Navigation Items (Pill shaped active state) */}
        <nav className="flex flex-col gap-2 w-full">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/settings');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-2 py-2 md:py-2.5 rounded-full transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-bold border border-gray-200/80 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {/* Icon Container Capsule */}
                <div className={`w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center rounded-full ${isActive ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}>
                  <Icon className="w-5 h-5 md:w-5 md:h-5" />
                </div>

                {/* Text Content (visible on hover) */}
                <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden flex-1 min-w-0 pr-1">
                  <div className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {item.desc}
                  </div>
                </div>

                {isActive && (
                  <ChevronRight className="w-4 h-4 text-gray-800 shrink-0 hidden group-hover/sidebar:block" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom AI Status Badge */}
      <div className="flex flex-col w-full pb-2">
        <div className="w-full rounded-full bg-gray-50 border border-gray-200 p-2 flex items-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden">
          <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full bg-gray-900 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <div className="text-xs font-semibold text-gray-900">Engine AI Active</div>
            <div className="text-[10px] text-gray-500">Models ready</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
