'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { StatusCapsule } from '@/components/StatusCapsule';
import { PlatformBadge } from '@/components/PlatformBadge';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  FileText,
  Sparkles,
  ChevronRight,
  Sliders,
  ChevronLeft,
  Layers,
  ArrowUpRight,
  CheckCircle2
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

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Diagnostic Summary Header Panel (Cardiology style medical header) */}
      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow flex flex-col lg:flex-row items-stretch justify-between gap-6">
        {/* Left Profile / Campaign Card */}
        <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-surface-border pr-6 pb-4 lg:pb-0 shrink-0">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-header-dark shrink-0 border border-surface-border">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Sarah Chen"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-muted tracking-wider block font-sans">
              Engine Lead & Strategy
            </span>
            <h2 className="text-xl font-bold font-display text-foreground leading-tight">
              Sarah Chen
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted font-medium">Active Campaign: Q3 AI Launch</span>
              <span className="px-2 py-0.5 rounded-full bg-accent-yellow text-foreground text-[10px] font-bold">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Right Diagnostic Metrics Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-sans">
              DIAGNOSIS / GOAL
            </span>
            <div className="text-base sm:text-lg font-bold font-display text-foreground truncate">
              Multi-Channel Scale
            </div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Ready
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-sans">
              TOTAL REACH
            </span>
            <div className="text-base sm:text-2xl font-bold font-display text-foreground tabular-nums">
              {(totalReach || 242800).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 font-medium">
              +28.9% velocity
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-sans">
              AUDIENCE
            </span>
            <div className="text-base sm:text-2xl font-bold font-display text-foreground tabular-nums">
              {totalFollowers.toLocaleString()}
            </div>
            <div className="text-xs text-muted font-medium">
              4 Channels Sync
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-sans">
              AVG ENGAGEMENT
            </span>
            <div className="text-base sm:text-2xl font-bold font-display text-foreground tabular-nums">
              {avgEngagement}%
            </div>
            <div className="text-xs text-emerald-600 font-medium">
              +1.8% benchmark
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-foreground card-shadow shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
        {['All Pipeline', 'Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Pending Review', 'Scheduled'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
              selectedFilter === tab
                ? 'bg-header-dark text-white border-header-dark font-bold card-shadow'
                : 'bg-surface-card text-foreground border-surface-border hover:bg-surface-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Interactive Branching Pipeline (Timeline Axis + S-Curve Connectors) */}
      <div className="relative bg-surface rounded-3xl p-6 border border-surface-border overflow-hidden">
        {/* Timeline Axis Line */}
        <div className="absolute top-12 left-0 right-0 h-0.5 bg-surface-border -z-0" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-accent-yellow text-foreground flex items-center justify-center text-xs font-bold font-display">
              01
            </span>
            <span className="text-sm font-bold font-display text-foreground">
              Aug <span className="text-muted text-xs font-normal">1 Week Cycle</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-accent-yellow text-foreground flex items-center justify-center text-xs font-bold font-display">
              02
            </span>
            <span className="text-sm font-bold font-display text-foreground">
              Sep <span className="text-muted text-xs font-normal">Active Adaptation Stage</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/posts/new"
              className="w-10 h-10 rounded-full bg-header-dark text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5 text-accent-yellow" />
            </Link>
          </div>
        </div>

        {/* Branching SVG Pipeline Node Graph */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-4">
          {posts.slice(0, 4).map((post, idx) => (
            <div key={post.id} className="relative group">
              {/* SVG S-Curve connector leading from timeline top */}
              <svg className="absolute -top-10 left-12 w-12 h-10 overflow-visible pointer-events-none stroke-muted-light fill-none" strokeWidth="2">
                <path d="M 0 0 C 0 20, 24 20, 24 40" />
              </svg>

              {/* Master Node Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-header-dark text-white text-xs font-semibold mb-3 shadow-md">
                <FileText className="w-3.5 h-3.5 text-accent-yellow" />
                <span className="truncate max-w-[140px]">{post.title}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">
                  {post.platforms.length}x
                </span>
              </div>

              {/* Diagnostic Card for the post */}
              <div className="bg-surface-card rounded-2xl p-5 border border-surface-border card-shadow hover:border-foreground/30 transition-all flex flex-col justify-between h-56">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <StatusCapsule status={post.status} size="sm" />
                    <span className="text-[10px] text-muted font-mono">#00{idx + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-foreground line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mt-2 leading-relaxed">
                    {post.sourceContent}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                  <div className="flex items-center -space-x-1">
                    {post.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} size="sm" />
                    ))}
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="w-7 h-7 rounded-full bg-surface-muted hover:bg-header-dark hover:text-white flex items-center justify-center transition-colors text-foreground"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Lower Diagnostic Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Diagnostic Card 1: AI Tone & Adaptation Health */}
        <div className="bg-surface-card rounded-2xl p-5 border border-surface-border card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display text-foreground uppercase tracking-wider">
              Adaptation Velocity
            </span>
            <Sliders className="w-4 h-4 text-muted" />
          </div>

          <div className="my-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold font-display text-foreground">
                98.4<span className="text-sm text-muted">/100</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-accent-yellow text-foreground text-xs font-bold">
                Optimal
              </span>
            </div>
            {/* Gauge Mockup */}
            <div className="h-3 w-full bg-surface-muted rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-header-dark rounded-full w-[88%]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-surface-border">
            <span>Average Generation: 2.1s</span>
            <span className="font-semibold text-foreground">+10% efficiency</span>
          </div>
        </div>

        {/* Diagnostic Card 2: Platform Balance */}
        <div className="bg-surface-card rounded-2xl p-5 border border-surface-border card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display text-foreground uppercase tracking-wider">
              Platform Allocation
            </span>
            <Layers className="w-4 h-4 text-muted" />
          </div>

          <div className="my-4 space-y-2">
            {[
              { platform: 'LinkedIn', pct: '40%' },
              { platform: 'Instagram', pct: '30%' },
              { platform: 'TikTok', pct: '20%' },
              { platform: 'Facebook', pct: '10%' },
            ].map((item) => (
              <div key={item.platform} className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{item.platform}</span>
                <span className="text-muted font-mono">{item.pct}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-surface-border">
            <span>Sync Frequency</span>
            <span className="font-semibold text-emerald-600">Real-time</span>
          </div>
        </div>

        {/* Diagnostic Card 3: Quick Creation Engine Dock */}
        <div className="bg-header-dark text-white rounded-2xl p-5 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-display text-accent-yellow uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Engine Quick Dock
              </span>
              <span className="text-[10px] text-white/50">v2.4 Ready</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Paste long-form content or article URLs to trigger instant 4-channel adaptation.
            </p>
          </div>

          <Link
            href="/posts/new"
            className="w-full py-2.5 rounded-full bg-accent-yellow text-foreground font-bold text-xs font-display flex items-center justify-center gap-2 hover:bg-accent-yellowHover transition-colors"
          >
            <Plus className="w-4 h-4" /> Start AI Adaptation Workflow
          </Link>
        </div>
      </div>

      {/* 4. Bottom Timeline Scrubber Dock Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-header-dark text-white rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 border border-header-border max-w-2xl w-[92%] justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-full bg-accent-yellow text-foreground font-bold text-xs font-display flex items-center justify-center">
            2026
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar text-xs font-medium">
          <span className="opacity-50">Jul</span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold flex items-center gap-1">
            Aug <span className="w-4 h-4 rounded-full bg-accent-yellow text-foreground text-[10px] flex items-center justify-center">2</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-accent-yellow text-foreground font-bold flex items-center gap-1 shadow-md">
            Sep <span className="w-4 h-4 rounded-full bg-header-dark text-white text-[10px] flex items-center justify-center">5</span>
          </span>
          <span className="opacity-50">Oct</span>
          <span className="opacity-50">Nov</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button type="button" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
