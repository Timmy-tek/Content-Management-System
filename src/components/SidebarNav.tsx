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
    <aside className="group/sidebar fixed left-4 top-4 bottom-4 z-50 hidden sm:flex flex-col justify-between bg-[#0E0E10] text-white rounded-3xl p-3 border border-white/10 shadow-2xl w-16 md:w-20 hover:w-64 transition-all duration-300 ease-in-out pointer-events-auto overflow-hidden">
      {/* Top Brand Logo */}
      <div className="flex flex-col gap-6 w-full pt-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-1.5 focus:outline-none"
          title="Content Engine"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-[#E5F23A] text-[#111111] flex items-center justify-center font-bold font-space text-lg shadow-md hover:scale-105 transition-transform">
            CE
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <span className="font-space font-bold text-base text-white tracking-tight block">Content Engine</span>
            <span className="text-[10px] text-white/50 block -mt-1 font-sans">Multi-channel AI Studio</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-full h-px bg-white/10" />

        {/* Vertical Navigation Items */}
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
                className={`relative flex items-center gap-3 px-2 py-2 md:py-2.5 rounded-2xl transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'bg-[#E5F23A] text-[#111111] font-bold shadow-lg shadow-[#E5F23A]/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {/* Icon Container */}
                <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center rounded-xl">
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'text-[#111111]' : 'text-white/80'}`} />
                </div>

                {/* Text Content (visible on sidebar hover) */}
                <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden flex-1 min-w-0 pr-1">
                  <div className={`text-sm font-medium leading-tight truncate ${isActive ? 'text-[#111111] font-bold' : 'text-white'}`}>
                    {item.label}
                  </div>
                  <div className={`text-[11px] truncate ${isActive ? 'text-[#111111]/70' : 'text-white/50'}`}>
                    {item.desc}
                  </div>
                </div>

                {/* Active Indicator Dot / Arrow */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#E5F23A] rounded-r-full group-hover/sidebar:hidden" />
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-[#111111] shrink-0 hidden group-hover/sidebar:block" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom AI Status Badge */}
      <div className="flex flex-col w-full pb-2">
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer overflow-hidden">
          <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-xl bg-[#E5F23A]/10 flex items-center justify-center text-[#E5F23A]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <div className="text-xs font-semibold text-white">Engine AI Active</div>
            <div className="text-[10px] text-white/50">Models ready</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
