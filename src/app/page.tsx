'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { StatusCapsule } from '@/components/StatusCapsule';
import { PlatformBadge } from '@/components/PlatformBadge';
import { supabase } from '@/lib/supabase';
import { Platform } from '@/types';
import {
  Plus,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Calendar,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { posts, connections } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.from('posts').select('*');
      if (error) console.log('Supabase check:', error);
    }
    checkConnection();
  }, []);

  const totalFollowers = connections.reduce((acc, c) => acc + c.followers, 0);

  let totalReach = 0;
  let totalEngagementSum = 0;
  let publishedVersionCount = 0;

  posts.forEach((post) => {
    Object.values(post.versions).forEach((ver) => {
      if (ver && ver.metrics) {
        totalReach += ver.metrics.reach;
        totalEngagementSum += ver.metrics.engagementRate;
        publishedVersionCount++;
      }
    });
  });

  const avgEngagement = publishedVersionCount > 0
    ? (totalEngagementSum / publishedVersionCount).toFixed(1)
    : '5.4';

  // Metrics calculation
  const pendingReviewCount = posts.filter(p => p.status === 'review').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  // Filter posts based on selected tab
  const filteredPosts = posts.filter((post) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Pending Review') return post.status === 'review';
    if (selectedFilter === 'Scheduled') return post.status === 'scheduled';
    if (selectedFilter === 'Published') return post.status === 'published';
    const lowerTab = selectedFilter.toLowerCase() as Platform;
    if (['instagram', 'linkedin', 'tiktok', 'facebook'].includes(lowerTab)) {
      return post.platforms.includes(lowerTab);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Hero Card with Profile & Primary Multi-Channel Status */}
      <div className="bg-[#FFFFFF] rounded-[28px] p-6 border border-[#E8E6DF] shadow-sm flex flex-col xl:flex-row items-stretch justify-between gap-6">
        {/* Left Profile / Campaign Info */}
        <div className="flex items-center gap-5 pr-6 xl:border-r border-[#E8E6DF] shrink-0">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#2B2B2B] shrink-0 border border-white/20 shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Sarah Chen"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#111111] text-white text-[11px] font-bold tracking-tight">
                Campaign Manager
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5F23A] text-[#111111] text-[11px] font-bold">
                Active Engine
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-[#111111] leading-tight mt-1">
              Sarah Chen
            </h2>
            <p className="text-xs text-[#666666] font-medium mt-0.5">
              Multi-channel AI Adaptation & Global Campaign Distribution
            </p>
          </div>
        </div>

        {/* Diagnostic Key Performance Indicators */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E8E6DF]">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block font-sans">
              TOTAL AUDIENCE
            </span>
            <div className="text-xl sm:text-2xl font-bold font-display text-[#111111] tabular-nums mt-0.5">
              {totalFollowers.toLocaleString()}
            </div>
            <div className="text-xs text-[#2E7D32] font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4 Active Channels
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E8E6DF]">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block font-sans">
              TOTAL REACH
            </span>
            <div className="text-xl sm:text-2xl font-bold font-display text-[#111111] tabular-nums mt-0.5">
              {(totalReach || 242800).toLocaleString()}
            </div>
            <div className="text-xs text-[#2E7D32] font-semibold mt-0.5">
              +28.9% growth
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E8E6DF]">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block font-sans">
              AVG ENGAGEMENT
            </span>
            <div className="text-xl sm:text-2xl font-bold font-display text-[#111111] tabular-nums mt-0.5">
              {avgEngagement}%
            </div>
            <div className="text-xs text-[#2E7D32] font-semibold mt-0.5">
              +1.8% benchmark
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E8E6DF]">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block font-sans">
              NEEDS REVIEW
            </span>
            <div className="text-xl sm:text-2xl font-bold font-display text-[#111111] tabular-nums mt-0.5">
              {pendingReviewCount}
            </div>
            <div className="text-xs text-[#D97706] font-semibold mt-0.5">
              Requires Approval
            </div>
          </div>
        </div>
      </div>

      {/* 2. Soft Tinted Floating Project Cards (Inspired by Project Management Dashboard reference) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Warm Yellow Tint — Content Adaptation Queue */}
        <div className="bg-[#FFFDF0] rounded-[24px] p-5 border border-[#F3EBB8] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-[#111111] text-white text-xs font-bold tracking-tight">
                AI Adaptation Pipeline
              </span>
              <span className="text-xs text-[#887A2A] font-semibold">Stage 1</span>
            </div>
            <h3 className="text-lg font-bold font-display text-[#111111]">
              Active Transformations
            </h3>
            <p className="text-xs text-[#665D20] mt-1 leading-relaxed">
              Long-form content currently being translated into platform-tailored variations.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EBDD98] flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold font-display text-[#111111]">
                {draftCount + pendingReviewCount}
              </span>
              <span className="text-xs text-[#665D20] ml-1.5 font-medium">In Process</span>
            </div>
            <Link
              href="/posts/new"
              className="px-3.5 py-1.5 rounded-full bg-[#111111] text-[#E5F23A] text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Start New
            </Link>
          </div>
        </div>

        {/* Card 2: Soft Blue Tint — Human Review & Approval */}
        <div className="bg-[#F0F7FF] rounded-[24px] p-5 border border-[#D0E3FF] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-[#0052CC] text-white text-xs font-bold tracking-tight">
                Human Review
              </span>
              <span className="text-xs text-[#1D5199] font-semibold">Stage 2</span>
            </div>
            <h3 className="text-lg font-bold font-display text-[#111111]">
              Pending Approval Queue
            </h3>
            <p className="text-xs text-[#3B629B] mt-1 leading-relaxed">
              Adapted previews ready for copy edit, media confirmation, and platform approval.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#C0D9FF] flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold font-display text-[#111111]">
                {pendingReviewCount}
              </span>
              <span className="text-xs text-[#3B629B] ml-1.5 font-medium">Ready for Review</span>
            </div>
            <Link
              href="/posts?status=review"
              className="px-3.5 py-1.5 rounded-full bg-[#0052CC] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0041A3] transition-colors"
            >
              Review Queue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Soft Pink/Coral Tint — Scheduled & Publishing Velocity */}
        <div className="bg-[#FFF0F3] rounded-[24px] p-5 border border-[#FFCCD5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-[#C2185B] text-white text-xs font-bold tracking-tight">
                Scheduled & Live
              </span>
              <span className="text-xs text-[#9E1B48] font-semibold">Stage 3</span>
            </div>
            <h3 className="text-lg font-bold font-display text-[#111111]">
              Publishing Schedule
            </h3>
            <p className="text-xs text-[#8A2447] mt-1 leading-relaxed">
              Posts lined up for automated distribution across synced platform channels.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#FFB8C6] flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold font-display text-[#111111]">
                {scheduledCount + publishedCount}
              </span>
              <span className="text-xs text-[#8A2447] ml-1.5 font-medium">Scheduled / Live</span>
            </div>
            <Link
              href="/posts/scheduler"
              className="px-3.5 py-1.5 rounded-full bg-[#C2185B] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#A3134A] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" /> View Calendar
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="p-2 rounded-full bg-[#FFFFFF] border border-[#E8E6DF] text-[#111111] shrink-0">
            <Filter className="w-4 h-4 text-[#666666]" />
          </div>
          {['All', 'Pending Review', 'Scheduled', 'Published', 'Instagram', 'LinkedIn', 'TikTok', 'Facebook'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedFilter === tab
                  ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : 'bg-[#FFFFFF] text-[#111111] border border-[#E8E6DF] hover:bg-[#F7F5EF]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Link
          href="/posts/new"
          className="px-4 py-2 rounded-full bg-[#E5F23A] text-[#111111] text-xs font-bold flex items-center gap-2 shadow-sm hover:scale-105 transition-transform shrink-0"
        >
          <Sparkles className="w-4 h-4" /> Create Content Package
        </Link>
      </div>

      {/* 3. Main Content Items Grid (Asymmetrical Curved Card Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#FFFFFF] rounded-[24px] p-5 border border-[#E8E6DF] shadow-sm hover:border-[#111111]/30 transition-all flex flex-col justify-between h-[280px]"
          >
            {/* Card Top */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <StatusCapsule status={post.status} size="sm" />
                <span className="text-[11px] font-mono font-semibold text-[#888888]">
                  ID: {post.id}
                </span>
              </div>

              <h4 className="text-base font-bold font-display text-[#111111] line-clamp-2 leading-snug">
                {post.title}
              </h4>

              <p className="text-xs text-[#666666] line-clamp-3 mt-2 leading-relaxed">
                {post.sourceContent}
              </p>
            </div>

            {/* Card Bottom / Footer */}
            <div className="pt-4 border-t border-[#E8E6DF] flex items-center justify-between">
              <div className="flex items-center gap-1">
                {post.platforms.map((p) => (
                  <PlatformBadge key={p} platform={p} size="sm" />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {post.status === 'review' && (
                  <Link
                    href={`/posts/${post.id}/review`}
                    className="px-3 py-1 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors"
                  >
                    Review
                  </Link>
                )}
                {post.status === 'scheduled' && (
                  <Link
                    href={`/posts/${post.id}/publish`}
                    className="px-3 py-1 rounded-full bg-[#0052CC] text-white text-xs font-bold hover:bg-[#0041A3] transition-colors"
                  >
                    Publish
                  </Link>
                )}
                <Link
                  href={`/posts/${post.id}`}
                  className="w-8 h-8 rounded-full bg-[#F7F5EF] text-[#111111] border border-[#E8E6DF] flex items-center justify-center hover:bg-[#111111] hover:text-white transition-colors"
                  title="View Details"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
