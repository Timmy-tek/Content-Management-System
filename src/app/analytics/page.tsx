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
  RefreshCw,
  Users,
  TrendingUp,
  Zap,
  Activity,
  MoreHorizontal
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
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');

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

  // Calculate totals
  const totalReach = crossPostRows.reduce((acc, r) => acc + r.reach, 0);
  const avgEngagement = crossPostRows.length
    ? (crossPostRows.reduce((acc, r) => acc + r.engagementRate, 0) / crossPostRows.length).toFixed(2)
    : '4.85';
  const totalReactions = crossPostRows.reduce((acc, r) => acc + r.likes, 0);

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

  // Growth trend datasets based on timeRange
  const growthData = {
    day: [
      { label: '00:00', reach: 1200, followers: 8200 },
      { label: '04:00', reach: 2400, followers: 8210 },
      { label: '08:00', reach: 7800, followers: 8250 },
      { label: '12:00', reach: 18500, followers: 8340 },
      { label: '16:00', reach: 24100, followers: 8420 },
      { label: '20:00', reach: 31200, followers: 8510 },
    ],
    month: [
      { label: 'Jan 2025', reach: 84000, followers: 210000 },
      { label: 'Feb 2025', reach: 112000, followers: 232000 },
      { label: 'Mar 2025', reach: 145000, followers: 254000 },
      { label: 'Apr 2025', reach: 188000, followers: 278000 },
      { label: 'May 2025', reach: 242000, followers: 294100 },
    ],
    year: [
      { label: '2021', reach: 340000, followers: 110000 },
      { label: '2022', reach: 520000, followers: 165000 },
      { label: '2023', reach: 890000, followers: 215000 },
      { label: '2024', reach: 1420000, followers: 260000 },
      { label: '2025', reach: 2100000, followers: 294100 },
    ],
  };

  const currentPoints = growthData[timeRange];

  // Best Time to Publish Matrix Data (Days x Time Slots)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const times = ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm'];

  // Heatmap intensity matrix values (0 to 4)
  const heatmapMatrix = [
    [0, 0, 0, 1, 2, 3, 1, 2, 2, 1], // Sun
    [0, 0, 1, 2, 3, 4, 2, 3, 2, 1], // Mon
    [0, 0, 1, 2, 2, 4, 3, 2, 1, 1], // Tue
    [0, 0, 1, 1, 2, 4, 3, 2, 2, 1], // Wed
    [0, 0, 0, 1, 2, 4, 3, 2, 1, 1], // Thu
    [0, 0, 1, 2, 3, 4, 2, 2, 1, 1], // Fri
    [0, 0, 0, 1, 2, 3, 2, 2, 2, 1], // Sat
  ];

  const getHeatColor = (val: number) => {
    switch (val) {
      case 0: return 'bg-[#EEF2F6] opacity-60';
      case 1: return 'bg-[#C5E1F5]';
      case 2: return 'bg-[#73B3F3]';
      case 3: return 'bg-[#3785EA]';
      case 4: return 'bg-[#1862D5]';
      default: return 'bg-[#EEF2F6]';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#111111] text-white text-[10px] font-bold font-space uppercase px-2 py-0.5 rounded">
              Performance Intelligence
            </span>
            <span className="text-xs text-[#666666] font-space font-medium">Live Audience Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold font-space text-[#111111] mt-1 tracking-tight">
            Cross-Channel Analytics & Velocity
          </h1>
          <p className="text-sm text-[#555555] font-inter mt-1">
            Real-time post performance tracking, audience engagement heatmaps, and AI synthesis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Channel Filters */}
          <div className="bg-white p-1.5 rounded-full shadow-md border border-black/5 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
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
            className="flex items-center gap-2 bg-[#111111] hover:bg-black text-white px-4 py-2.5 rounded-full text-xs font-bold font-space transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E5F23A] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Analytics'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="bg-[#111111] text-[#E5F23A] text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-between shadow-sm">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="text-white hover:underline ml-4">Dismiss</button>
        </div>
      )}

      {/* KPI Quadrant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 hover:border-black/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-xs font-bold uppercase font-space tracking-wider">Total Reach</span>
            <div className="w-8 h-8 rounded-full bg-[#F2F1EF] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-space text-[#111111] tracking-tight">
              {totalReach ? totalReach.toLocaleString() : '284,910'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#555555] font-inter">Across 4 platforms</span>
              <StatusCapsule status="positive" label="+12.4% MoM" size="sm" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 hover:border-black/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-xs font-bold uppercase font-space tracking-wider">Avg. Engagement Rate</span>
            <div className="w-8 h-8 rounded-full bg-[#F2F1EF] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-space text-[#111111] tracking-tight">
              {avgEngagement}%
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#555555] font-inter">Industry benchmark: 2.1%</span>
              <StatusCapsule status="positive" label="+3.8% vs last wk" size="sm" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 hover:border-black/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-xs font-bold uppercase font-space tracking-wider">Total Reactions</span>
            <div className="w-8 h-8 rounded-full bg-[#F2F1EF] flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-space text-[#111111] tracking-tight">
              {totalReactions ? totalReactions.toLocaleString() : '18,584'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#555555] font-inter">Likes, comments, shares</span>
              <StatusCapsule status="positive" label="+18.9% MoM" size="sm" />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 hover:border-black/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-xs font-bold uppercase font-space tracking-wider">AI Optimization Score</span>
            <div className="w-8 h-8 rounded-full bg-[#E5F23A] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-space text-[#111111] tracking-tight">
              94 / 100
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#555555] font-inter">High resonance resonance</span>
              <span className="bg-[#111111] text-[#E5F23A] text-[10px] font-bold font-space px-2 py-0.5 rounded-full">Optimal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Surface 1 & Gotics Inspired Visual Grid: Active Velocity Chart + Best Time Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Velocity Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase font-space text-[#777777] block">
                Audience Velocity Telemetry
              </span>
              <h2 className="text-xl font-bold font-space text-[#111111] flex items-center gap-2">
                <span>Active Reach & Growth</span>
                <StatusCapsule status="positive" label="High Velocity" size="sm" />
              </h2>
            </div>

            {/* Time Toggle Pills */}
            <div className="bg-[#F2F1EF] p-1 rounded-full flex items-center gap-1 text-xs font-bold font-space">
              {(['day', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-full transition-all capitalize cursor-pointer ${
                    timeRange === range
                      ? 'bg-white text-[#111111] shadow-sm'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Bar / Growth Visualizer */}
          <div className="h-56 pt-4 flex items-end justify-between gap-3 sm:gap-6 px-2">
            {currentPoints.map((pt, idx) => {
              const maxReach = Math.max(...currentPoints.map(p => p.reach));
              const maxFollowers = Math.max(...currentPoints.map(p => p.followers));
              const reachHeight = (pt.reach / maxReach) * 85;
              const followerHeight = (pt.followers / maxFollowers) * 85;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Reach Bar */}
                    <div
                      className="w-1/2 bg-[#111111] rounded-t-xl group-hover:bg-[#1862D5] transition-all relative"
                      style={{ height: `${Math.max(reachHeight, 10)}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111111] text-white text-[10px] py-1 px-2 rounded-md font-mono font-bold whitespace-nowrap z-20 shadow-md">
                        {pt.reach.toLocaleString()} reach
                      </span>
                    </div>
                    {/* Follower Bar */}
                    <div
                      className="w-1/2 bg-[#2E7BD1] rounded-t-xl opacity-80 group-hover:opacity-100 transition-all relative"
                      style={{ height: `${Math.max(followerHeight, 10)}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#2E7BD1] text-white text-[10px] py-1 px-2 rounded-md font-mono font-bold whitespace-nowrap z-20 shadow-md">
                        {pt.followers.toLocaleString()} audience
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold font-space text-[#555555]">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs font-space text-[#666666] pt-2 border-t border-black/5">
            <div className="flex items-center gap-4 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#111111]" /> Total Organic Reach
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#2E7BD1]" /> Connected Audience
              </span>
            </div>
            <a href="#scorecard" className="font-bold text-[#111111] hover:underline flex items-center gap-0.5">
              View Detailed Scorecard <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Gotics Inspired "Best Time to Publish" Heatmap (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <div>
              <h2 className="text-lg font-bold font-space text-[#111111]">
                Best Time to Publish
              </h2>
              <p className="text-xs text-[#666666] font-inter">
                User engagement activity by time of day
              </p>
            </div>
            <button className="text-[#888888] hover:text-[#111111] p-1 rounded-lg">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              {/* Times Row Header */}
              <div className="grid grid-cols-11 gap-1 text-[10px] font-space text-[#777777] font-semibold mb-2 text-center">
                <span></span>
                {times.map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>

              {/* Day Rows */}
              {days.map((day, dayIdx) => (
                <div key={day} className="grid grid-cols-11 gap-1 items-center my-1.5">
                  <span className="text-[11px] font-bold font-space text-[#666666]">{day}</span>
                  {heatmapMatrix[dayIdx].map((val, timeIdx) => (
                    <div
                      key={timeIdx}
                      className={`h-6 rounded-md ${getHeatColor(val)} transition-transform hover:scale-110 cursor-pointer relative group`}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111111] text-white text-[9px] py-0.5 px-1.5 rounded font-mono font-bold whitespace-nowrap z-20 shadow-lg">
                        {day} {times[timeIdx]}: {val * 200 + 100}+ interactions
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Intensity Scale Bar (as seen in Gotics UI) */}
          <div className="pt-2 border-t border-black/5 space-y-1.5">
            <div className="flex h-2 rounded-full overflow-hidden bg-[#EEF2F6]">
              <div className="w-1/4 bg-[#C5E1F5]" />
              <div className="w-1/4 bg-[#73B3F3]" />
              <div className="w-1/4 bg-[#3785EA]" />
              <div className="w-1/4 bg-[#1862D5]" />
            </div>
            <div className="flex justify-between text-[10px] font-space font-bold text-[#888888] px-0.5">
              <span>50</span>
              <span>200</span>
              <span>400</span>
              <span>600</span>
              <span>800+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Surface 2: Channel Audience Share Donut & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions / Reach by Channel Ring Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <div>
              <h2 className="text-lg font-bold font-space text-[#111111]">
                Channel Share Split
              </h2>
              <p className="text-xs text-[#666666] font-inter">
                Audience distribution across networks
              </p>
            </div>
            <StatusCapsule status="positive" label="4 Connected" size="sm" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-[#F2F1EF]"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Instagram (38.5%) */}
                <path
                  className="text-[#E1306C]"
                  strokeDasharray="38.5, 100"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* LinkedIn (28.2%) */}
                <path
                  className="text-[#0A66C2]"
                  strokeDasharray="28.2, 100"
                  strokeDashoffset="-38.5"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* TikTok (19.8%) */}
                <path
                  className="text-[#111111]"
                  strokeDasharray="19.8, 100"
                  strokeDashoffset="-66.7"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Facebook (13.5%) */}
                <path
                  className="text-[#1877F2]"
                  strokeDasharray="13.5, 100"
                  strokeDashoffset="-86.5"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold font-space text-[#111111]">10,739</span>
                <span className="text-[10px] text-[#777777] font-space font-semibold uppercase">Total Posts</span>
              </div>
            </div>

            {/* Platform Stats List */}
            <div className="space-y-2.5 w-full max-w-[180px] text-xs font-space font-semibold">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#333333]">
                  <PlatformBadge platform="instagram" size="sm" /> Instagram
                </span>
                <span className="font-extrabold text-[#111111]">38.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#333333]">
                  <PlatformBadge platform="linkedin" size="sm" /> LinkedIn
                </span>
                <span className="font-extrabold text-[#111111]">28.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#333333]">
                  <PlatformBadge platform="tiktok" size="sm" /> TikTok
                </span>
                <span className="font-extrabold text-[#111111]">19.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#333333]">
                  <PlatformBadge platform="facebook" size="sm" /> Facebook
                </span>
                <span className="font-extrabold text-[#111111]">13.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Insight Glass Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2FBFA8]" />
              <span className="text-xs font-bold uppercase tracking-wider font-space text-[#111111]">
                Performance Agent Synthesis (LLM Analysis)
              </span>
            </div>
          </div>

          {selectedPlatform === 'all' ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-[#F2F1EF] flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-[#111111]" />
              </div>
              <h3 className="text-base font-bold font-space text-[#111111]">Select a Social Channel</h3>
              <p className="text-xs text-[#666666] font-inter max-w-md mt-1">
                Choose Instagram, LinkedIn, TikTok, or Facebook above to trigger the Performance Agent AI synthesis for that network.
              </p>
            </div>
          ) : insightLoading ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[220px]">
              <RefreshCw className="w-6 h-6 text-[#111111] animate-spin mb-3" />
              <p className="text-xs text-[#666666] font-space font-bold">Synthesizing post metrics for {selectedPlatform}...</p>
            </div>
          ) : insightError ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[220px]">
              <p className="text-xs text-[#D9383A] font-space font-bold">{insightError}</p>
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
      </div>

      {/* Surface 1: Cross-Post Performance Scorecard Table */}
      <div id="scorecard" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold font-space text-[#111111]">
              Cross-Post Performance Scorecard
            </h2>
            <p className="text-xs text-[#666666] font-inter mt-0.5">
              Comparative metrics across adapted multi-channel variations.
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
                <th className="py-3.5 px-4 rounded-l-xl">Adapted Post Title</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4 text-right">Reach</th>
                <th className="py-3.5 px-4 text-right">Engagement</th>
                <th className="py-3.5 px-4 text-right">Likes & Reactions</th>
                <th className="py-3.5 px-4 text-right">Saves</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-inter">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#777777] font-space">
                    No analytics snapshots available for this filter yet.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8F8F7]/80 transition-colors">
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
                        className="inline-flex items-center gap-0.5 text-xs font-bold font-space text-[#111111] hover:underline bg-[#F2F1EF] hover:bg-[#111111] hover:text-white px-3 py-1 rounded-full transition-colors"
                      >
                        Detail <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
