'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  LayoutGrid,
  FolderKanban,
  PlusCircle,
  Calendar,
  BarChart2,
  Layers,
  Settings,
  Activity
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function HeaderToolbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { connections } = useApp();
  const connectedCount = connections.filter((a) => a.status === 'connected').length;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutGrid },
    { name: 'Master Library', href: '/posts', icon: FolderKanban },
    { name: 'Adapt Studio', href: '/posts/new', icon: PlusCircle },
    { name: 'Scheduler', href: '/scheduler', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Accounts', href: '/settings/accounts', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2B2927] text-white px-3 py-2 flex items-center justify-between gap-3 shadow-md border-b border-[#3D3A37]">
      {/* Left section: Brand Badge & Search */}
      <div className="flex items-center gap-3">
        {/* Brand Badge */}
        <div className="bg-[#FAF8F5] text-black px-3.5 py-1.5 rounded-xl flex items-center gap-2 font-space shadow-sm shrink-0">
          <div className="w-6 h-6 rounded-md bg-[#1B1A18] text-[#D4F63D] flex items-center justify-center font-bold text-xs">
            CE
          </div>
          <span className="font-bold text-sm tracking-tight text-[#1B1A18]">
            Content Engine
          </span>
        </div>

        {/* Search Engine Input Pill */}
        <div className="hidden sm:flex items-center bg-white text-gray-800 px-3.5 py-1.5 rounded-full text-xs w-48 md:w-56 shadow-inner border border-gray-200">
          <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search engine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full text-xs font-inter"
          />
        </div>
      </div>

      {/* Center section: Navigation Pills */}
      <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-950 font-semibold shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-[#3D3A37]/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right section: Active Channels & Settings */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-full border border-gray-200 text-xs font-semibold shadow-sm">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>{connectedCount}/4 Channels</span>
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-full bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
