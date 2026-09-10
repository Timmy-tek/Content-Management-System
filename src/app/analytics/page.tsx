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
  ChevronDown,
  RefreshCw
} from 'lucide-react';

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

  const filteredRows = crossPostRows
    .filter((row) => selectedPlatform === 'all' || row.platform === selectedPlatform)
    .sort((a, b) => {
      if (sortField === 'reach') return b.reach - a.reach;
      if (sortField === 'engagement') return b.engagementRate - a.engagementRate;
      return b.likes - a.likes;
    });

  const [liveInsight, setLiveInsight] = useState<PerformanceInsight | null>(null);
  const [insightPostCount, setInsightPostCount] = useState(0);
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
          const { currentPostCount, ...insight } = data;
          setLiveInsight(insight);
          setInsightPostCount(currentPostCount);
        }
      })
      .catch(() => setInsightError('Failed to generate insight'))
      .finally(() => setInsightLoading(false));
  }, [selectedPlatform]);

  const platforms: (Platform | 'all')[] = ['all', 'instagram', 'linkedin', 'tiktok', 'facebook'];

  const growthPoints = [
    { month: 'Oct', reach: 84000, followers: 210000 },
    { month: 'Nov', reach: 112000, followers: 232000 },
    { month: 'Dec', reach: 145000, followers: 254000 },
    { month: 'Jan', reach: 188000, followers: 278000 },
    { month: 'Feb', reach: 242000, followers: 294100 },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted block">
            PERFORMANCE DIAGNOSTICS
          </span>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Cross-Channel Performance & Insights
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Track multi-platform velocity and live Performance Agent AI synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-header-dark text-white px-4 py-2 rounded-full text-xs font-bold font-display disabled:opacity-50 card-shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent-yellow ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Analytics'}</span>
          </button>
        </div>
      </div>

      {/* Channel Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
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

      {syncMessage && (
        <p className="text-xs text-muted font-sans px-2">{syncMessage}</p>
      )}

      {/* Surface 1: Growth Chart Block */}
      <div className="bg-surface-card rounded-3xl p-6 border border-surface-border card-shadow space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase font-display text-muted block">
              Aggregate Audience Expansion
            </span>
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <span>Follower Count & Reach Velocity (30d)</span>
              <StatusCapsule status="positive" label="+24.2% MoM" size="sm" />
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-display font-semibold text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-header-dark" /> Total Reach
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-muted-light" /> Connected Followers
            </span>
          </div>
        </div>

        {/* Visual Line/Bar Chart Representation */}
        <div className="h-44 pt-4 flex items-end justify-between gap-4 sm:gap-8 px-2">
          {growthPoints.map((pt, idx) => {
            const reachHeight = (pt.reach / 250000) * 100;
            const followerHeight = (pt.followers / 300000) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    className="w-1/2 bg-header-dark rounded-t-lg group-hover:bg-accent-yellow transition-all relative"
                    style={{ height: `${reachHeight}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-header-dark text-white text-[10px] py-0.5 px-1.5 rounded font-mono font-bold whitespace-nowrap z-20">
                      {pt.reach.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="w-1/2 bg-muted-light rounded-t-lg opacity-80 group-hover:opacity-100 transition-all relative"
                    style={{ height: `${followerHeight}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-header-dark text-white text-[10px] py-0.5 px-1.5 rounded font-mono font-bold whitespace-nowrap z-20">
                      {pt.followers.toLocaleString()}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold font-display text-muted">
                  {pt.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Surface 3: AI Insight Terminal Panel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider font-display text-foreground">
            Performance Agent AI Insights
          </span>
        </div>

        {selectedPlatform === 'all' ? (
          <div className="bg-surface-card rounded-2xl p-6 text-center border border-surface-border card-shadow">
            <p className="text-xs text-muted font-sans">Select a specific channel above to run Performance Agent AI analysis.</p>
          </div>
        ) : insightLoading ? (
          <div className="bg-surface-card rounded-2xl p-6 text-center border border-surface-border card-shadow">
            <p className="text-xs text-muted font-sans">Analyzing channel telemetry...</p>
          </div>
        ) : insightError ? (
          <div className="bg-surface-card rounded-2xl p-6 text-center border border-surface-border card-shadow">
            <p className="text-xs text-muted font-sans">{insightError}</p>
          </div>
        ) : liveInsight ? (
          <GlassPanel
            insight={liveInsight}
            isGated={insightPostCount < 5}
            minPostsRequired={5}
            currentPostCount={insightPostCount}
          />
        ) : null}
      </div>

      {/* Surface 1: Cross-Post Scorecard Table */}
      <div className="bg-surface-card rounded-3xl p-6 border border-surface-border card-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">
              Cross-Post Performance Scorecard
            </h2>
            <p className="text-xs text-muted">
              Comparative engagement breakdown across adapted channel variants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-display font-semibold">Sort by:</span>
            <div className="relative">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as 'reach' | 'engagement' | 'likes')}
                className="bg-surface-muted border border-surface-border rounded-full px-4 py-1.5 text-xs font-display font-bold text-foreground appearance-none pr-8 focus:outline-none cursor-pointer"
              >
                <option value="reach">Highest Reach</option>
                <option value="engagement">Engagement Rate %</option>
                <option value="likes">Reactions & Likes</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface-muted text-[10px] font-bold font-display text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">Adapted Post Title</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4 text-right">Reach</th>
                <th className="py-3.5 px-4 text-right">Engagement</th>
                <th className="py-3.5 px-4 text-right">Likes</th>
                <th className="py-3.5 px-4 text-right">Saves</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-display text-foreground">
                    <span className="truncate max-w-xs block">{row.title}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <PlatformBadge platform={row.platform} size="sm" showLabel />
                  </td>
                  <td className="py-3.5 px-4 text-right font-display font-bold tabular-nums text-foreground">
                    {row.reach.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-display font-bold text-emerald-600">
                    +{row.engagementRate}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-display tabular-nums text-foreground">
                    {row.likes.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-display tabular-nums text-foreground">
                    {row.saves.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`/posts/${row.postId}`}
                      className="inline-flex items-center gap-0.5 text-xs font-bold font-display text-foreground hover:underline"
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
