'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Platform, PerformanceInsight } from '@/types';
import { GlassPanel } from '@/components/GlassPanel';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusCapsule } from '@/components/StatusCapsule';
import {
  Sparkles,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { RefreshCw } from 'lucide-react';

interface SyncResult {
  versionId: string;
  success: boolean;
  error?: string;
}

export default function AnalyticsPage() {
  const { posts } = useApp();

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [sortField, setSortField] = useState<'reach' | 'engagement' | 'likes'>('reach');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/sync-analytics', { method: 'POST' });
      const data = await res.json();
      const succeeded = data.results?.filter((r: SyncResult) => r.success).length || 0;
      const failed = data.results?.filter((r: SyncResult) => !r.success).length || 0;
      setSyncMessage(`Synced ${succeeded} post${succeeded === 1 ? '' : 's'}${failed > 0 ? `, ${failed} failed` : ''}. Refresh to see updates.`);
    } catch {
      setSyncMessage('Sync failed. Try again.');
    }
    setIsSyncing(false);
  };

  const publishedPostsCount = posts.filter((p) => p.status === 'published').length;

  // Aggregate Cross-Post Performance Table Data
  const crossPostRows: {
    id: string;
    postId: string;
    title: string;
    platform: Platform;
    publishedAt: string;
    reach: number;
    engagementRate: number;
    likes: number;
    comments: number;
    saves: number;
  }[] = [];

  posts.forEach((post) => {
    Object.entries(post.versions).forEach(([pKey, ver]) => {
      if (ver && ver.metrics) {
        crossPostRows.push({
          id: ver.id,
          postId: post.id,
          title: post.title,
          platform: pKey as Platform,
          publishedAt: ver.publishedAt || post.createdAt,
          reach: ver.metrics.reach,
          engagementRate: ver.metrics.engagementRate,
          likes: ver.metrics.likes,
          comments: ver.metrics.comments,
          saves: ver.metrics.saves,
        });
      }
    });
  });

  // Filter & Sort
  const filteredRows = crossPostRows
    .filter((row) => selectedPlatform === 'all' || row.platform === selectedPlatform)
    .sort((a, b) => {
      if (sortField === 'reach') return b.reach - a.reach;
      if (sortField === 'engagement') return b.engagementRate - a.engagementRate;
      return b.likes - a.likes;
    });

  // Pick insight for Surface 3 Glass panel
  // const activeInsight = initialInsights.find(
  //   (i) => selectedPlatform === 'all' || i.platform === selectedPlatform
  // ) || initialInsights[0];

  const [liveInsight, setLiveInsight] = useState<PerformanceInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlatform === 'all') {
      setLiveInsight(null);
      return;
    }

    setInsightLoading(true);
    setInsightError(null);

    fetch('/api/generate-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: selectedPlatform }),
    })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setInsightError(data.error);
            setLiveInsight(null);
          } else {
            setLiveInsight(data);
          }
        })
        .catch(() => setInsightError('Failed to generate insight'))
        .finally(() => setInsightLoading(false));
  }, [selectedPlatform]);

  const platforms: (Platform | 'all')[] = ['all', 'instagram', 'linkedin', 'tiktok', 'facebook'];

  // Mock growth trend data points
  const growthPoints = [
    { month: 'Oct', reach: 84000, followers: 210000 },
    { month: 'Nov', reach: 112000, followers: 232000 },
    { month: 'Dec', reach: 145000, followers: 254000 },
    { month: 'Jan', reach: 188000, followers: 278000 },
    { month: 'Feb', reach: 242000, followers: 294100 },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-space text-[#111111]">
            Cross-Channel Performance & Insights
          </h1>
          <p className="text-sm text-[#555555] font-inter mt-1">
            Track multi-platform velocity and live Performance Agent AI synthesis.
          </p>
        </div>

        {/* Channel Filter Pills */}
        <div className="bg-white p-1.5 rounded-full shadow-md border border-black/5 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold font-space transition-all cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#F2F1EF]'
              }`}
            >
              {p !== 'all' && <PlatformBadge platform={p} size="sm" />}
              <span className="capitalize">{p === 'all' ? 'All Channels' : p}</span>
            </button>
          ))}
        </div>

        <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-full text-xs font-bold font-space disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E5F23A] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Analytics'}</span>
        </button>
      </div>

      {syncMessage && (
          <p className="text-xs text-[#555555] font-inter">{syncMessage}</p>
      )}

      {/* Surface 1: Growth Line Chart & KPI Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase font-space text-[#777777] block">
              Aggregate Audience Expansion
            </span>
            <h2 className="text-xl font-bold font-space text-[#111111] flex items-center gap-2">
              <span>Follower Count & Reach Velocity (30d)</span>
              <StatusCapsule status="positive" label="+24.2% MoM" size="sm" />
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-space font-semibold text-[#555555]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#111111]" /> Total Reach
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2E7BD1]" /> Connected Followers
            </span>
          </div>
        </div>

        {/* Visual Line/Bar Chart Representation */}
        <div className="h-48 pt-4 flex items-end justify-between gap-4 sm:gap-8 px-2">
          {growthPoints.map((pt, idx) => {
            const reachHeight = (pt.reach / 250000) * 100;
            const followerHeight = (pt.followers / 300000) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Reach Bar */}
                  <div
                    className="w-1/2 bg-[#111111] rounded-t-xl group-hover:bg-[#E5F23A] transition-all relative"
                    style={{ height: `${reachHeight}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111111] text-white text-[10px] py-0.5 px-1.5 rounded font-mono font-bold whitespace-nowrap z-20">
                      {pt.reach.toLocaleString()}
                    </span>
                  </div>
                  {/* Follower Bar */}
                  <div
                    className="w-1/2 bg-[#2E7BD1] rounded-t-xl opacity-80 group-hover:opacity-100 transition-all relative"
                    style={{ height: `${followerHeight}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#2E7BD1] text-white text-[10px] py-0.5 px-1.5 rounded font-mono font-bold whitespace-nowrap z-20">
                      {pt.followers.toLocaleString()}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold font-space text-[#555555]">
                  {pt.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SURFACE 3: "GLASS" — The ONE Performance Agent Insight Panel */}
      {/* "One card, and only one, uses a teal-to-blue diagonal gradient glass material (#2FBFA8 -> #2E7BD1)" */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2FBFA8]" />
            <span className="text-xs font-bold uppercase tracking-wider font-space text-[#111111]">
              Surface 3 — Dedicated Performance Agent (Scarcity Spec)
            </span>
          </div>
        </div>

        {selectedPlatform === 'all' ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-black/5">
              <p className="text-sm text-[#666666] font-inter">Select a specific platform above to see its Performance Agent analysis.</p>
            </div>
        ) : insightLoading ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-black/5">
              <p className="text-sm text-[#666666] font-inter">Analyzing published posts...</p>
            </div>
        ) : insightError ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-black/5">
              <p className="text-sm text-[#666666] font-inter">{insightError}</p>
            </div>
        ) : liveInsight ? (
            <GlassPanel
                insight={liveInsight}
                isGated={liveInsight.currentPostCount < 5}
                minPostsRequired={5}
                currentPostCount={liveInsight.currentPostCount}
            />
        ) : null}
      </div>

      {/* Surface 1: Cross-Post Performance Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-space text-[#111111]">
              Cross-Post Performance Scorecard
            </h2>
            <p className="text-xs text-[#666666] font-inter mt-0.5">
              Comparative engagement breakdown across adapted channel variants.
            </p>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666666] font-space font-semibold">Sort by:</span>
            <div className="relative">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as 'reach' | 'engagement' | 'likes')}
                className="bg-[#F2F1EF] border border-black/10 rounded-full px-4 py-1.5 text-xs font-space font-bold text-[#111111] appearance-none pr-8 focus:outline-none cursor-pointer"
              >
                <option value="reach">Highest Reach</option>
                <option value="engagement">Engagement Rate %</option>
                <option value="likes">Reactions & Likes</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#111111] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-[#F8F8F7] text-[11px] font-bold font-space text-[#555555] uppercase tracking-wider">
                <th className="py-3.5 px-4">Adapted Post Title</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4 text-right">Reach</th>
                <th className="py-3.5 px-4 text-right">Engagement</th>
                <th className="py-3.5 px-4 text-right">Likes</th>
                <th className="py-3.5 px-4 text-right">Saves</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-inter">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                  <td className="py-4 px-4 font-bold font-space text-[#111111]">
                    <span className="truncate max-w-xs block">{row.title}</span>
                  </td>
                  <td className="py-4 px-4">
                    <PlatformBadge platform={row.platform} size="sm" showLabel />
                  </td>
                  <td className="py-4 px-4 text-right font-space font-bold tabular-nums text-[#111111]">
                    {row.reach.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-space font-bold text-[#0B4F07]">
                    +{row.engagementRate}%
                  </td>
                  <td className="py-4 px-4 text-right font-space tabular-nums text-[#333333]">
                    {row.likes.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-space tabular-nums text-[#333333]">
                    {row.saves.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <a
                      href={`/posts/${row.postId}`}
                      className="inline-flex items-center gap-0.5 text-xs font-bold font-space text-[#111111] hover:underline"
                    >
                      Detail <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
