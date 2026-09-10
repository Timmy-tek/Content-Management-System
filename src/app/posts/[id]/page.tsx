'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Platform } from '@/types';
import { BranchingPipeline } from '@/components/BranchingPipeline';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusCapsule } from '@/components/StatusCapsule';
import {
  ArrowLeft,
  BarChart2,
  Eye,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { posts } = useApp();

  const postId = params.id as string;
  const post = posts.find((p) => p.id === postId);

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('linkedin');

  if (!post) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 text-center shadow-lg border border-black/5 space-y-4">
        <FileText className="w-10 h-10 text-[#777777] mx-auto" />
        <h2 className="text-lg font-bold font-space text-[#111111]">
          Post not found
        </h2>
        <p className="text-xs text-[#666666] font-inter">
          The requested content ID `{postId}` could not be located.
        </p>
        <button
          onClick={() => router.push('/posts')}
          className="bg-[#111111] text-white px-5 py-2 rounded-full text-xs font-bold font-space"
        >
          Return to Library
        </button>
      </div>
    );
  }
  const hasVersions = Object.keys(post.versions).length > 0;

  if (!hasVersions) {
    return (
        <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 text-center shadow-lg border border-black/5 space-y-4">
          <FileText className="w-10 h-10 text-[#777777] mx-auto" />
          <h2 className="text-lg font-bold font-space text-[#111111]">
            No adapted content yet
          </h2>
          <p className="text-xs text-[#666666] font-inter">
            This post hasn&apos;t been through AI adaptation. Delete it if it was a test entry, or start a new adaptation with this content.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
                onClick={() => router.push('/posts')}
                className="bg-[#F2F1EF] text-[#111111] px-5 py-2 rounded-full text-xs font-bold font-space"
            >
              Back to Library
            </button>
            <button
                onClick={() => router.push('/posts/new')}
                className="bg-[#111111] text-white px-5 py-2 rounded-full text-xs font-bold font-space"
            >
              Start New Adaptation
            </button>
          </div>
        </div>
    );
  }

  const activeVersion = post.versions[selectedPlatform] || Object.values(post.versions)[0];
  const activePlatKey = (activeVersion?.platform || 'linkedin') as Platform;
  const metrics = activeVersion?.metrics;

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.push('/posts')}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-space text-[#111111] bg-white px-4 py-2 rounded-full shadow-sm hover:bg-white/80 transition-all cursor-pointer border border-black/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusCapsule status={post.status} size="md" />
          {post.status === 'review' && (
            <Link
              href={`/posts/${post.id}/review`}
              className="bg-[#111111] text-white px-4 py-1.5 rounded-full text-xs font-bold font-space hover:bg-[#222222]"
            >
              Review Drafts
            </Link>
          )}
        </div>
      </div>

      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold font-space uppercase text-[#555555]">
          <span>Master ID: {post.id}</span>
          <span>•</span>
          <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="text-3xl font-bold font-space text-[#111111] mt-1">
          {post.title}
        </h1>
      </div>

      {/* SURFACE 2 (PANEL): Post Branch Visual Node Hierarchy */}
      <div className="bg-[#3A3936] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#E5F23A] shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5F23A] font-space block">
              Surface 2 — Branch Architecture
            </span>
            <h2 className="text-xl font-bold font-space text-white">
              Root Content → Platform Variants → Sparklines
            </h2>
          </div>
          <span className="text-xs text-white/60 font-inter hidden sm:inline-block">
            Click any platform node to inspect telemetry
          </span>
        </div>

        {/* Branching SVG Node Hierarchy Component */}
        <BranchingPipeline
          mode="branching"
          post={post}
          activePlatform={selectedPlatform}
          onSelectPlatform={(p) => setSelectedPlatform(p)}
        />
      </div>

      {/* SURFACE 1: Detailed Per-Platform Metric Cards Below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Platform Adapted Copy & Hashtags */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <PlatformBadge platform={activePlatKey} size="md" showLabel />
            <StatusCapsule status={activeVersion?.status || 'review'} size="sm" />
          </div>

          <div>
            <h3 className="text-xs font-bold font-space uppercase text-[#777777] mb-2">
              Adapted Copy Format
            </h3>
            <div className="bg-[#F2F1EF] rounded-2xl p-4 text-xs font-inter text-[#111111] leading-relaxed whitespace-pre-wrap">
              {activeVersion?.caption || 'No caption generated.'}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold font-space uppercase text-[#777777] mb-2">
              Platform Hashtags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeVersion?.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#F2F1EF] text-[#2E7BD1] px-3 py-1 rounded-full text-xs font-medium font-inter"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {activeVersion?.publishedAt && (
            <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs text-[#555555] font-inter">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0B4F07]" />
                Published to API
              </span>
              <span className="font-mono text-[11px]">
                ID: {activeVersion.platformPostId}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Performance Telemetry Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#111111]" />
                <h3 className="text-base font-bold font-space text-[#111111]">
                  Channel Performance
                </h3>
              </div>
              <span className="text-xs font-bold font-space text-[#0B4F07] bg-[#A9F5A0] px-3 py-1 rounded-full">
                Live Sync
              </span>
            </div>

            {metrics ? (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-[#F2F1EF] p-4 rounded-2xl">
                  <span className="text-[10px] font-bold font-space uppercase text-[#777777] block">
                    Total Reach
                  </span>
                  <span className="text-2xl font-bold font-space tabular-nums text-[#111111] mt-1 block">
                    {metrics.reach.toLocaleString()}
                  </span>
                </div>

                <div className="bg-[#F2F1EF] p-4 rounded-2xl">
                  <span className="text-[10px] font-bold font-space uppercase text-[#777777] block">
                    Engagement Rate
                  </span>
                  <span className="text-2xl font-bold font-space tabular-nums text-[#111111] mt-1 block">
                    {metrics.engagementRate}%
                  </span>
                </div>

                <div className="bg-[#F2F1EF] p-4 rounded-2xl">
                  <span className="text-[10px] font-bold font-space uppercase text-[#777777] block">
                    Likes / Reactions
                  </span>
                  <span className="text-xl font-bold font-space tabular-nums text-[#111111] mt-1 block">
                    {metrics.likes.toLocaleString()}
                  </span>
                </div>

                <div className="bg-[#F2F1EF] p-4 rounded-2xl">
                  <span className="text-[10px] font-bold font-space uppercase text-[#777777] block">
                    Saves & Bookmarks
                  </span>
                  <span className="text-xl font-bold font-space tabular-nums text-[#111111] mt-1 block">
                    {metrics.saves.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#F2F1EF] rounded-2xl p-8 text-center space-y-2">
                <Eye className="w-8 h-8 text-[#777777] mx-auto" />
                <p className="text-xs text-[#555555] font-inter">
                  Performance metrics will populate automatically once published to social API queues.
                </p>
              </div>
            )}
          </div>

          {/* Owner Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={post.owner.avatar}
                alt={post.owner.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-black/10"
              />
              <div>
                <span className="text-xs font-bold font-space text-[#111111] block">
                  {post.owner.name}
                </span>
                <span className="text-[11px] text-[#666666] font-inter block">
                  {post.owner.role}
                </span>
              </div>
            </div>

            <StatusCapsule status="positive" label="Content Owner" size="sm" />
          </div>
        </div>

      </div>
    </div>
  );
}
