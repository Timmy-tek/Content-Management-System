'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Platform } from '@/types';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusCapsule } from '@/components/StatusCapsule';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

export default function SchedulerPage() {
  const { posts } = useApp();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');

  const scheduledVersions: {
    postId: string;
    title: string;
    platform: Platform;
    caption: string;
    scheduledAt: string;
    status: string;
  }[] = [];

  posts.forEach((post) => {
    Object.entries(post.versions).forEach(([pKey, ver]) => {
      if (ver) {
        scheduledVersions.push({
          postId: post.id,
          title: post.title,
          platform: pKey as Platform,
          caption: ver.caption,
          scheduledAt: ver.publishedAt || new Date(Date.now() + 86400000).toISOString(),
          status: ver.status || post.status,
        });
      }
    });
  });

  const filteredVersions = scheduledVersions.filter(
    (item) => selectedPlatform === 'all' || item.platform === selectedPlatform
  );

  const platforms: (Platform | 'all')[] = ['all', 'instagram', 'linkedin', 'tiktok', 'facebook'];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted block">
            PUBLISHING CALENDAR
          </span>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Multi-Channel Publication Scheduler
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage time slots, scheduled automated release queues, and channel pacing.
          </p>
        </div>

        <Link
          href="/posts/new"
          className="inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black font-bold text-xs px-5 py-2.5 rounded-full card-shadow transition-all font-display shrink-0"
        >
          <Plus className="w-4 h-4 text-accent-yellow" />
          <span>New AI Adaptation</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-foreground card-shadow shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setSelectedPlatform(p)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold font-display transition-all border shrink-0 ${
              selectedPlatform === p
                ? 'bg-header-dark text-white border-header-dark card-shadow'
                : 'bg-surface-card text-foreground border-surface-border hover:bg-surface-muted'
            }`}
          >
            {p !== 'all' && <PlatformBadge platform={p} size="sm" />}
            <span className="capitalize">{p === 'all' ? 'All Channels' : p}</span>
          </button>
        ))}
      </div>

      {/* 4-Column Synchronized Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(['instagram', 'linkedin', 'tiktok', 'facebook'] as Platform[]).map((plat) => {
          const items = filteredVersions.filter((v) => v.platform === plat);

          return (
            <div key={plat} className="bg-surface-card rounded-2xl p-4 border border-surface-border card-shadow flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
                  <PlatformBadge platform={plat} size="md" showLabel />
                  <span className="text-[10px] font-mono bg-surface-muted px-2 py-0.5 rounded-full text-muted border border-surface-border">
                    {items.length} queued
                  </span>
                </div>

                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-muted text-xs font-sans">
                      No posts scheduled for {plat}
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-muted p-3.5 rounded-xl border border-surface-border space-y-2 hover:border-foreground/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <StatusCapsule status={item.status} size="sm" />
                          <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold font-display text-foreground line-clamp-2">
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>

                        <div className="pt-2 border-t border-surface-border flex items-center justify-between text-[10px] text-muted">
                          <span>Date: {new Date(item.scheduledAt).toLocaleDateString()}</span>
                          <Link
                            href={`/posts/${item.postId}`}
                            className="hover:text-foreground font-bold flex items-center gap-0.5 font-display"
                          >
                            Open <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                href="/posts/new"
                className="mt-4 w-full py-2 rounded-xl bg-surface-muted hover:bg-surface-border text-foreground text-xs font-bold font-display flex items-center justify-center gap-1 transition-colors border border-surface-border"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule for {plat}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Scrubber Dock Bar at Bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-header-dark text-white rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 border border-header-border max-w-2xl w-[92%] justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <CalendarIcon className="w-4 h-4 text-accent-yellow" />
          <span className="text-xs font-bold font-display text-white">Calendar Scrubber</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar text-xs font-medium">
          <span className="opacity-50">Mon 14</span>
          <span className="px-3 py-1 rounded-full bg-accent-yellow text-foreground font-bold shadow-md">
            Today 15
          </span>
          <span className="opacity-80">Wed 16</span>
          <span className="opacity-50">Thu 17</span>
          <span className="opacity-50">Fri 18</span>
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
