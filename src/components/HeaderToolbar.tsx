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
  Search,
  Settings,
  Activity,
  Layers
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function HeaderToolbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const { connections } = useApp();
  const connectedCount = connections.filter(a => a.status === 'connected').length;

  const navTabs = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Master Library', href: '/posts', icon: FolderKanban },
    { label: 'Adapt Studio', href: '/posts/new', icon: PlusCircle },
    { label: 'Scheduler', href: '/posts/scheduler', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Accounts', href: '/settings/accounts', icon: Layers },
  ];

  return (
    <header className="w-full bg-header-dark text-white shadow-md relative z-30">
      {/* Top Header Bar with Cutout S-curve and Pill Navigation */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-2 gap-3 min-h-[56px]">
        {/* Left Side: Cutout Title Tab ("Content Engine") with S-Curve contour */}
        <div className="flex items-center gap-2">
          {/* S-curve tab container */}
          <div className="relative flex items-center bg-surface text-foreground font-display font-bold text-lg md:text-xl pl-4 pr-6 py-1.5 rounded-br-2xl shadow-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-header-dark text-accent-yellow flex items-center justify-center font-bold text-sm font-display">
                CE
              </span>
              <span>Content Engine</span>
            </Link>
            {/* SVG Inward S-curve overlay on top right */}
            <svg
              className="absolute -right-6 top-0 h-full w-6 text-surface pointer-events-none fill-current"
              viewBox="0 0 24 52"
              preserveAspectRatio="none"
            >
              <path d="M 0 0 C 8 0, 16 52, 24 52 L 0 52 Z" />
            </svg>
          </div>
        </div>

        {/* Center / Navigation Pills Inside Header Dark Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Quick Search Pill */}
          <div className="hidden xl:flex items-center bg-surface-card text-foreground px-3.5 py-1.5 rounded-full text-xs font-medium card-shadow mr-2 border border-surface-border">
            <Search className="w-3.5 h-3.5 text-muted mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search engine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground placeholder-muted text-xs font-sans w-28 focus:w-40 transition-all"
            />
          </div>

          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== '/settings');

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-surface-card text-foreground card-shadow font-bold'
                    : 'bg-header-dark/60 text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-foreground' : 'text-white/70'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions: Active Channels & Settings Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-surface-card text-foreground rounded-full text-xs font-medium border border-surface-border card-shadow">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>{connectedCount}/4 Channels</span>
          </div>

          <Link
            href="/settings"
            className="w-8 h-8 rounded-full bg-surface-card text-foreground flex items-center justify-center border border-surface-border card-shadow hover:bg-surface-muted transition-colors"
            title="Engine Settings"
          >
            <Settings className="w-4 h-4 text-foreground/80" />
          </Link>
        </div>
      </div>
    </header>
  );
}
