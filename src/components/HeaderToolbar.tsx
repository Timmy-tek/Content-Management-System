'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Plus,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function HeaderToolbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { connections } = useApp();
  const connectedCount = connections.filter(a => a.status === 'connected').length;

  return (
    <header className="sticky top-4 z-40 flex justify-center w-full px-4 mb-6 pointer-events-none">
      <div className="pointer-events-auto relative bg-white/95 backdrop-blur-md text-[#111827] rounded-full px-5 py-2.5 shadow-md flex items-center justify-between gap-3 md:gap-6 border border-gray-200/80 w-full max-w-7xl overflow-hidden">
        {/* Decorative SVG Curve Background Accent */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0"
          preserveAspectRatio="none"
          viewBox="0 0 1200 60"
        >
          <path
            d="M 0,30 Q 300,5 600,30 T 1200,30"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 0,40 C 400,10 800,50 1200,20"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
        </svg>

        {/* Left Mobile Brand Title & Quick Search */}
        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/"
            className="flex sm:hidden items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors group shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold font-space text-sm shadow-sm">
              CE
            </div>
          </Link>

          {/* Search Input Bar */}
          <div className="flex items-center bg-gray-100 hover:bg-gray-200/70 focus-within:bg-gray-200/80 px-3.5 py-1.5 rounded-full text-xs transition-all w-48 sm:w-64 border border-gray-200">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search posts or analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full text-xs font-inter"
            />
          </div>
        </div>

        {/* Center Connected Channels Quick Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-gray-100/80 rounded-full border border-gray-200 text-xs relative z-10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gray-700 font-medium">
            {connectedCount}/4 Channels Active
          </span>
        </div>

        {/* Right Actions: + New Post CTA, Notifications & Avatar */}
        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <Link
            href="/posts/new"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#111827] hover:bg-black text-white font-semibold text-xs transition-transform active:scale-95 shadow-sm font-space"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">New Post</span>
          </Link>

          {/* Notification Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200/80 flex items-center justify-center transition-colors relative border border-gray-200"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* User Account Capsule */}
          <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/80 pl-1.5 pr-2.5 py-1 rounded-full cursor-pointer transition-colors border border-gray-200">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Sarah Chen"
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover border border-gray-300"
            />
            <span className="text-xs font-medium text-gray-800 hidden sm:inline-block font-space">
              Sarah C.
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:inline-block" />
          </div>
        </div>
      </div>
    </header>
  );
}
