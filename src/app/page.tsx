'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Plus,
  Search,
  Grid,
  List,
  MoreHorizontal,
  ArrowUpRight,
  FileText,
  Radio,
  Sparkles,
  Check,
  Clock,
  Zap,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { initialPosts as mockFallbackPosts } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { posts: contextPosts } = useApp();
  const [activeTab, setActiveTab] = useState<'adapted' | 'master' | 'templates' | 'notes'>('adapted');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function checkConnection() {
      const { data, error } = await supabase.from('posts').select('*');
      console.log('Supabase Data:', data);
      console.log('Supabase Error:', error);
    }
    checkConnection();
  }, []);

  // Use AppContext posts if populated; fallback to mock data if empty
  const activePostsList = contextPosts.length > 0 ? contextPosts : mockFallbackPosts;

  // Filter posts based on search query
  const filteredPosts = activePostsList.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.sourceContent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status style helper
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-[#D2F3D0] text-[#0E520A]';
      case 'scheduled':
        return 'bg-[#FFE8B3] text-[#6B4B00]';
      case 'review':
      case 'pending review':
        return 'bg-[#FFE2C7] text-[#7A3500]';
      default:
        return 'bg-[#E5E5E5] text-[#444444]';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'Published';
      case 'scheduled':
        return 'Scheduled';
      case 'review':
      case 'pending review':
        return 'Pending Review';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="space-y-8 pb-12 font-inter text-[#111111]">
      {/* =========================================================================
          HERO SECTION (Un-carded, directly on gradient background — RonDesignLab style)
          ========================================================================= */}
      <div className="pt-2 pb-4 space-y-6">
        {/* Top Header Row: Icon + Large Numeric Metric + Right Meta Items */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: File Icon + Oversized Metric */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md border border-black/10 flex items-center justify-center text-[#111111] shadow-sm shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#666666] font-space block mb-0.5">
                Total Multi-Channel Audience Reach
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black font-space tracking-tight text-[#111111] tabular-nums">
                  294,100
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0E520A] bg-[#D2F3D0] px-2.5 py-1 rounded-full font-space">
                  <TrendingUp className="w-3.5 h-3.5" /> +28.9%
                </span>
              </div>
            </div>
          </div>

          {/* Right: Meta Items (Account, Pipeline ID, Status) */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#555555] font-inter">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 shadow-xs">
              <span className="text-[#888888] font-space uppercase text-[10px] tracking-wider">Account</span>
              <strong className="text-[#111111] font-bold font-space">Content Engine Lab</strong>
            </div>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 shadow-xs">
              <span className="text-[#888888] font-space uppercase text-[10px] tracking-wider">Pipeline ID</span>
              <strong className="text-[#111111] font-bold font-space">CE-4905</strong>
            </div>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#888888] font-space uppercase text-[10px] tracking-wider">Status</span>
              <strong className="text-[#111111] font-bold font-space">Multi-Channel Active</strong>
            </div>
          </div>
        </div>

        {/* Bottom Row: Connected Metric Pills + Striped Bar + Action Pill Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* Option A: Colored Pipeline Status Pills (Exact RonDesignLab Track Style) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Green Pill */}
            <div className="bg-[#86EFAC] text-[#064E3B] font-space font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs border border-black/5">
              <div className="w-4 h-4 rounded-full bg-[#064E3B] text-[#86EFAC] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>50,000 Published</span>
            </div>

            {/* Yellow Pill */}
            <div className="bg-[#FDE047] text-[#713F12] font-space font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs border border-black/5">
              <div className="w-4 h-4 rounded-full bg-[#713F12] text-[#FDE047] flex items-center justify-center">
                <Clock className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>18,000 In Review</span>
            </div>

            {/* Gray/Lavender Pill */}
            <div className="bg-[#E2E8F0] text-[#334155] font-space font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs border border-black/5">
              <div className="w-4 h-4 rounded-full bg-[#334155] text-[#E2E8F0] flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>24,000 AI Adapting</span>
            </div>
          </div>

          {/* Right: Striped Pattern Sync Meter + Action Pill */}
          <div className="flex items-center gap-4">
            {/* Vertical Barcode/Striped Pattern Indicator */}
            <div className="hidden sm:flex items-center gap-0.5 px-3 py-2 bg-white/40 backdrop-blur-xs rounded-2xl border border-black/5">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[2px] h-4 rounded-full ${
                    i < 24 ? 'bg-[#111111]/70' : 'bg-[#111111]/20'
                  }`}
                />
              ))}
            </div>

            {/* Active Sync Tag */}
            <div className="bg-white/80 backdrop-blur-sm border border-black/10 px-4 py-2.5 rounded-2xl text-xs font-bold font-space text-[#444444] shadow-xs">
              Active Sync: <span className="text-[#111111]">8 Days</span>
            </div>

            {/* Primary Action Button (Solid Black Pill) */}
            <Link
              href="/posts/new"
              className="bg-[#111111] hover:bg-[#222222] text-white font-space font-bold text-xs px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E5F23A]" />
              New Adaptation
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN SPLIT BODY SECTION
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* -----------------------------------------------------------------------
            LEFT PANEL: Folder Tab Content Grid
            ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Protruding Folder Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('adapted')}
              className={`font-space font-bold text-xs px-5 py-3 rounded-t-2xl shadow-sm border-t border-x border-black/10 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'adapted'
                  ? 'bg-white text-[#111111] border-b-2 border-b-white -mb-px z-10'
                  : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              Adapted Lines
            </button>
            <button
              onClick={() => setActiveTab('master')}
              className={`font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all cursor-pointer ${
                activeTab === 'master'
                  ? 'bg-white text-[#111111] border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 font-bold'
                  : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
              }`}
            >
              Master Docs
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white text-[#111111] border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 font-bold'
                  : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-white text-[#111111] border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 font-bold'
                  : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
              }`}
            >
              Notes
            </button>
          </div>

          {/* Folder Content Box */}
          <div className="bg-white rounded-b-3xl rounded-tr-3xl p-6 shadow-sm border border-black/10 space-y-6">
            {/* Folder Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-space text-[#111111]">
                  {filteredPosts.length}
                </span>
                <span className="text-xs font-semibold text-[#666666] font-space uppercase tracking-wider">
                  Items in Pipeline
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Pill */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F4F3EF] text-xs font-inter rounded-full pl-9 pr-4 py-2 border border-black/5 focus:outline-none focus:ring-1 focus:ring-black/20"
                  />
                </div>

                {/* Grid / List Switcher */}
                <div className="flex items-center bg-[#F4F3EF] p-1 rounded-full border border-black/5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-[#111111]'
                        : 'text-[#777777] hover:text-[#111111]'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-[#111111]'
                        : 'text-[#777777] hover:text-[#111111]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Cards Grid / List */}
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs font-semibold text-[#666666]">
                  No posts found matching search query.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-[#111111] underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#F8F7F3] rounded-[24px] p-5 border border-black/5 hover:border-black/15 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Card Top Row */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold font-space px-3 py-1 rounded-full ${getStatusStyle(
                            post.status
                          )}`}
                        >
                          {getStatusLabel(post.status)}
                        </span>
                        <button className="text-[#888888] hover:text-[#111111] p-1 cursor-pointer">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Post Title */}
                      <Link href={`/posts/${post.id}`}>
                        <h3 className="text-sm font-bold font-space text-[#111111] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      {/* Excerpt Preview */}
                      <p className="text-xs text-[#555555] font-inter line-clamp-3 leading-relaxed">
                        {post.sourceContent}
                      </p>
                    </div>

                    {/* Card Bottom Row */}
                    <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Platform Icons */}
                        <div className="flex items-center -space-x-1">
                          {post.platforms.includes('instagram') && (
                            <span className="w-5 h-5 rounded-full bg-[#E4405F] text-white flex items-center justify-center text-[9px] font-bold">
                              IG
                            </span>
                          )}
                          {post.platforms.includes('linkedin') && (
                            <span className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[9px] font-bold">
                              LI
                            </span>
                          )}
                          {post.platforms.includes('tiktok') && (
                            <span className="w-5 h-5 rounded-full bg-[#000000] text-white flex items-center justify-center text-[9px] font-bold">
                              TT
                            </span>
                          )}
                          {post.platforms.includes('facebook') && (
                            <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold">
                              FB
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#666666] font-space">
                          {post.platforms.length}{' '}
                          {post.platforms.length === 1 ? 'Platform' : 'Platforms'}
                        </span>
                        <Link
                          href={`/posts/${post.id}`}
                          className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-black/5 border border-black/5 rounded-2xl overflow-hidden">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-[#F8F7F3] hover:bg-white flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1 max-w-md">
                      <Link href={`/posts/${post.id}`} className="font-bold text-xs font-space hover:underline">
                        {post.title}
                      </Link>
                      <p className="text-[11px] text-[#666666] line-clamp-1">{post.sourceContent}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold font-space px-2.5 py-0.5 rounded-full ${getStatusStyle(
                          post.status
                        )}`}
                      >
                        {getStatusLabel(post.status)}
                      </span>
                      <Link
                        href={`/posts/${post.id}`}
                        className="w-6 h-6 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            RIGHT PANEL: Activity & Schedule Stack
            ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Protruding Tab Header */}
          <div className="flex items-center justify-between">
            <div className="bg-white text-[#111111] font-space font-bold text-xs px-5 py-3 rounded-t-2xl shadow-sm border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#2563EB]" />
              Activity & Schedule
            </div>
            <span className="text-xs font-bold text-[#666666] font-space px-3 py-1">
              12 Activities
            </span>
          </div>

          {/* Schedule Container */}
          <div className="bg-white rounded-b-3xl rounded-tr-3xl p-6 shadow-sm border border-black/10 space-y-5">
            {/* Quick Action Shortcuts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Link
                href="/posts/new"
                className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#E4405F]" />
                + IG
              </Link>
              <Link
                href="/posts/new"
                className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#0A66C2]" />
                + LI
              </Link>
              <Link
                href="/posts/new"
                className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#000000]" />
                + TT
              </Link>
              <Link
                href="/posts/new"
                className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                + FB
              </Link>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] font-space">
                Upcoming Dispatch Queue
              </h4>
              <p className="text-[11px] text-[#666666] font-inter">
                Scheduled platform publications & human review approvals.
              </p>
            </div>

            {/* Stacked Wavy Pastel Cards */}
            <div className="space-y-3">
              {/* Lavender Card */}
              <div className="bg-[#EBE5FF] rounded-[20px] p-4 space-y-3 border border-black/5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-space text-[#4F339B] flex items-center gap-1">
                    <Radio className="w-3 h-3" /> 12 Feb @ 9:00 PM
                  </span>
                  <span className="text-[10px] font-bold font-space bg-white/70 px-2 py-0.5 rounded-full text-[#4F339B]">
                    Instagram Reel
                  </span>
                </div>
                <h5 className="text-xs font-bold font-space text-[#111111]">
                  Send Payment & Review Reminder
                </h5>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[9px] font-bold">
                      JJ
                    </div>
                    <span className="text-[11px] font-medium text-[#4F339B]">
                      Jessi Johnson (Editor)
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#4F339B]" />
                </div>
              </div>

              {/* Soft Yellow Card */}
              <div className="bg-[#FFF8D6] rounded-[20px] p-4 space-y-3 border border-black/5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-space text-[#6B5200] flex items-center gap-1">
                    <Radio className="w-3 h-3" /> 13 Feb @ 11:30 AM
                  </span>
                  <span className="text-[10px] font-bold font-space bg-white/70 px-2 py-0.5 rounded-full text-[#6B5200]">
                    LinkedIn
                  </span>
                </div>
                <h5 className="text-xs font-bold font-space text-[#111111]">
                  Call about contract & Q3 Expansion RFC
                </h5>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#EAB308] text-white flex items-center justify-center text-[9px] font-bold">
                      BC
                    </div>
                    <span className="text-[11px] font-medium text-[#6B5200]">
                      Brian Carpenter
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#6B5200]" />
                </div>
              </div>

              {/* Mint Green Card */}
              <div className="bg-[#D8F5E5] rounded-[20px] p-4 space-y-3 border border-black/5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-space text-[#0A522A] flex items-center gap-1">
                    <Radio className="w-3 h-3" /> 14 Feb @ 4:00 PM
                  </span>
                  <span className="text-[10px] font-bold font-space bg-white/70 px-2 py-0.5 rounded-full text-[#0A522A]">
                    TikTok
                  </span>
                </div>
                <h5 className="text-xs font-bold font-space text-[#111111]">
                  Viral Trend Script & AI Audio Overdub
                </h5>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[9px] font-bold">
                      CE
                    </div>
                    <span className="text-[11px] font-medium text-[#0A522A]">
                      Content Engine Bot
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#0A522A]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
