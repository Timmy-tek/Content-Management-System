'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { StatusCapsule } from '@/components/StatusCapsule';
import { PlatformBadge } from '@/components/PlatformBadge';
import {
  Plus,
  TrendingUp,
  Users,
  Radio,
  FileText,
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { posts, connections } = useApp();

  // Calculate Hero KPIs
  const totalFollowers = connections.reduce((acc, c) => acc + c.followers, 0);

  // Aggregate reach from published post versions
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

  const postsThisWeek = posts.length;

  return (
    <div className="space-[#E2E8F0] space-y-8 pb-12">
      {/* Top Welcome / Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-space text-[#111111] tracking-tight">
            Content Engine Overview
          </h1>
          <p className="text-sm text-[#444444] font-inter mt-1">
            Automated multi-platform adaptation, human review, and performance tracking.
          </p>
        </div>

        {/* Exactly one high-contrast solid black (#111111) pill button for primary action */}
        <Link
          href="/posts/new"
          className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] font-semibold text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer font-space shrink-0 group"
        >
          <Plus className="w-4 h-4 text-[#E5F23A] group-hover:rotate-90 transition-transform" />
          <span>New Post</span>
        </Link>
      </div>

      {/* Surface 1: Hero KPI Row - Oversized Space Grotesk tabular-nums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between text-[#555555]">
            <span className="text-xs font-semibold tracking-wide uppercase font-inter">
              Total Audience
            </span>
            <Users className="w-4 h-4 text-[#111111]/40" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl sm:text-5xl font-bold font-space tabular-nums text-[#111111] tracking-tight">
              {totalFollowers.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0B4F07] font-medium mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs last month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between text-[#555555]">
            <span className="text-xs font-semibold tracking-wide uppercase font-inter">
              Total Reach 30d
            </span>
            <Radio className="w-4 h-4 text-[#111111]/40" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl sm:text-5xl font-bold font-space tabular-nums text-[#111111] tracking-tight">
              {(totalReach || 220200).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0B4F07] font-medium mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+28.9% campaign velocity</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between text-[#555555]">
            <span className="text-xs font-semibold tracking-wide uppercase font-inter">
              Posts This Week
            </span>
            <FileText className="w-4 h-4 text-[#111111]/40" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl sm:text-5xl font-bold font-space tabular-nums text-[#111111] tracking-tight">
              {postsThisWeek}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#555555] font-medium mt-1">
            <span>4 pending approval in pipeline</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between text-[#555555]">
            <span className="text-xs font-semibold tracking-wide uppercase font-inter">
              Avg. Engagement
            </span>
            <Sparkles className="w-4 h-4 text-[#111111]/40" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl sm:text-5xl font-bold font-space tabular-nums text-[#111111] tracking-tight">
              {avgEngagement}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0B4F07] font-medium mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+1.8% benchmark industry avg</span>
          </div>
        </div>
      </div>

      {/* Surface 1: Connected Accounts Strip */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-space text-[#111111]">
              Connected Channels & Tokens
            </h2>
            <p className="text-xs text-[#666666] font-inter">
              Real-time API connection status and sync readiness across platforms.
            </p>
          </div>
          <Link
            href="/settings/accounts"
            className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1 font-space"
          >
            Manage Accounts <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {connections.map((conn) => (
            <div
              key={conn.platform}
              className="bg-[#F2F1EF] rounded-2xl p-4 flex items-center justify-between border border-black/5 hover:border-black/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <PlatformBadge platform={conn.platform} size="md" />
                <div>
                  <h4 className="text-xs font-bold font-space text-[#111111] leading-tight">
                    {conn.accountName}
                  </h4>
                  <span className="text-[11px] text-[#666666] font-inter block">
                    {conn.followers.toLocaleString()} followers
                  </span>
                </div>
              </div>

              <StatusCapsule status={conn.status} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Surface 1: Recent Content Posts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-space text-[#111111]">
              Recent Adapted Posts
            </h2>
            <p className="text-xs text-[#666666] font-inter">
              Master content pieces in active adaptation, review, or published state.
            </p>
          </div>

          <Link
            href="/posts"
            className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1 font-space"
          >
            View All Library <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {posts.length === 0 ? (
          /* Empty state invitation to act */
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg shadow-black/5 border border-black/5 space-y-4 max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-[#F2F1EF] flex items-center justify-center mx-auto text-[#111111]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-space text-[#111111]">
              No posts yet — upload your first piece of content
            </h3>
            <p className="text-xs text-[#666666] font-inter leading-relaxed">
              Transform blog posts, long videos, or RFCs into multi-channel campaigns in under 60 seconds.
            </p>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 bg-[#111111] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-md hover:bg-[#222222] transition-all font-space"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 6).map((post) => {
              // Calculate aggregate reach for card
              const postReach = Object.values(post.versions).reduce(
                (sum, v) => sum + (v?.metrics?.reach || 0),
                0
              );

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between hover:shadow-xl transition-all group"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <StatusCapsule status={post.status} size="sm" />
                      <span className="text-[11px] text-[#777777] font-inter">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Post Title */}
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="text-base font-bold font-space text-[#111111] group-hover:text-[#2E7BD1] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Source Content Preview */}
                    <p className="text-xs text-[#555555] font-inter line-clamp-2 leading-relaxed">
                      {post.sourceContent}
                    </p>
                  </div>

                  {/* Card Footer: Platforms & Metrics */}
                  <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                    {/* Platform Badges Row */}
                    <div className="flex items-center -space-x-1.5">
                      {post.platforms.map((p) => (
                        <PlatformBadge key={p} platform={p} size="sm" />
                      ))}
                    </div>

                    {/* Reach or Review link */}
                    {postReach > 0 ? (
                      <div className="text-right">
                        <span className="text-[10px] text-[#777777] uppercase font-bold font-space block">
                          Total Reach
                        </span>
                        <span className="text-xs font-bold font-space tabular-nums text-[#111111]">
                          {postReach.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={post.status === 'review' ? `/posts/${post.id}/review` : `/posts/${post.id}`}
                        className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-0.5 font-space"
                      >
                        {post.status === 'review' ? 'Review Drafts' : 'View Details'}{' '}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
