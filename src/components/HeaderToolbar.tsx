'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Bell,
  LogOut
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

export function HeaderToolbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { connections } = useApp();
  const connectedCount = connections.filter(a => a.status === 'connected').length;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const name = (u?.user_metadata?.full_name as string | undefined) || u?.email?.split('@')[0] || '';
      setDisplayName(name);
    });
  }, []);

  const initials = displayName
      ? displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
      : '?';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // hard navigation wipes all in-memory app state
    window.location.href = '/login';
  };

  return (
      <header className="sticky top-4 z-40 flex justify-center w-full px-4 mb-6 pointer-events-none">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md text-[#111111] rounded-full px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 md:gap-6 border border-black/10 w-full max-w-7xl">
          {/* Left Mobile Brand Title & Quick Search */}
          <div className="flex items-center gap-3">
            <Link
                href="/"
                className="flex sm:hidden items-center gap-2 px-2 py-1 rounded-full hover:bg-black/5 transition-colors group shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-[#E5F23A] text-[#111111] flex items-center justify-center font-bold font-space text-sm shadow-sm">
                CE
              </div>
            </Link>

            {/* Search Input Bar */}
            <div className="flex items-center bg-black/5 hover:bg-black/10 focus-within:bg-black/10 px-3.5 py-1.5 rounded-full text-xs transition-all w-48 sm:w-64 border border-black/5">
              <Search className="w-3.5 h-3.5 text-black/50 mr-2 shrink-0" />
              <input
                  type="text"
                  placeholder="Search posts or analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[#111111] placeholder-black/40 w-full text-xs font-inter"
              />
            </div>
          </div>

          {/* Center Connected Channels Quick Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full border border-black/10 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#111111]/80 font-medium">
            {connectedCount}/4 Channels Active
          </span>
          </div>

          {/* Right Actions: + New Post CTA, Notifications & Account */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
                href="/posts/new"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white font-semibold text-xs transition-transform active:scale-95 shadow-md font-space"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">New Post</span>
            </Link>

            {/* Notification Button */}
            <button
                type="button"
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors relative border border-black/5"
                title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-[#111111]/80" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            {/* User Account Capsule */}
            <div className="flex items-center gap-2 bg-black/5 pl-1.5 pr-1.5 py-1 rounded-full border border-black/10">
              <div className="w-6 h-6 rounded-full bg-[#111111] text-[#E5F23A] flex items-center justify-center text-[10px] font-bold font-space">
                {initials}
              </div>
              <span className="text-xs font-medium text-[#111111]/90 hidden sm:inline-block font-space max-w-[120px] truncate">
              {displayName}
            </span>
              <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-black/60" />
              </button>
            </div>
          </div>
        </div>
      </header>
  );
}