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
      <div className="max-w-md mx-auto my-12 bg-surface-card rounded-3xl p-8 text-center border border-surface-border card-shadow space-y-4">
        <FileText className="w-10 h-10 text-muted mx-auto" />
        <h2 className="text-base font-bold font-display text-foreground">
          Post not found
        </h2>
        <p className="text-xs text-muted">
          The requested content ID `{postId}` could not be located.
        </p>
        <button
          type="button"
          onClick={() => router.push('/posts')}
          className="bg-header-dark text-white px-5 py-2 rounded-full text-xs font-bold font-display"
        >
          Return to Library
        </button>
      </div>
    );
  }
  const hasVersions = Object.keys(post.versions).length > 0;

  if (!hasVersions) {
    return (
      <div className="max-w-md mx-auto my-12 bg-surface-card rounded-3xl p-8 text-center border border-surface-border card-shadow space-y-4">
        <FileText className="w-10 h-10 text-muted mx-auto" />
        <h2 className="text-base font-bold font-display text-foreground">
          No adapted content yet
        </h2>
        <p className="text-xs text-muted">
          This post hasn&apos;t been through AI adaptation. Delete it if it was a test entry, or start a new adaptation with this content.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.push('/posts')}
            className="bg-surface-muted text-foreground px-5 py-2 rounded-full text-xs font-bold font-display"
          >
            Back to Library
          </button>
          <button
            type="button"
            onClick={() => router.push('/posts/new')}
            className="bg-header-dark text-white px-5 py-2 rounded-full text-xs font-bold font-display"
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
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-card rounded-3xl p-4 border border-surface-border card-shadow">
        <button
          type="button"
          onClick={() => router.push('/posts')}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-display text-foreground bg-surface-muted px-4 py-2 rounded-full border border-surface-border hover:bg-surface-border transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusCapsule status={post.status} size="md" />
          {post.status === 'review' && (
            <Link
              href={`/posts/${post.id}/review`}
              className="bg-header-dark text-white px-4 py-1.5 rounded-full text-xs font-bold font-display hover:bg-black"
            >
              Review Drafts
            </Link>
          )}
        </div>
      </div>

      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold font-display uppercase text-muted">
          <span>Master ID: {post.id}</span>
          <span>•</span>
          <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground mt-1">
          {post.title}
        </h1>
      </div>

      {/* SURFACE 2 (PANEL): Post Branch Visual Node Hierarchy */}
      <div className="bg-header-dark text-white rounded-3xl p-6 sm:p-8 border border-header-border shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-yellow font-display block">
              Adaptation Tree Node Hierarchy
            </span>
            <h2 className="text-lg font-bold font-display text-white">
              Root Content → Platform Variants
            </h2>
          </div>
          <span className="text-xs text-white/60 font-sans hidden sm:inline-block">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Platform Adapted Copy & Hashtags */}
        <div className="lg:col-span-7 bg-surface-card rounded-3xl p-6 border border-surface-border card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <PlatformBadge platform={activePlatKey} size="md" showLabel />
            <StatusCapsule status={activeVersion?.status || 'review'} size="sm" />
          </div>

          <div>
            <h3 className="text-xs font-bold font-display uppercase text-muted mb-2">
              Adapted Copy Format
            </h3>
            <div className="bg-surface-muted rounded-2xl p-4 text-xs font-sans text-foreground leading-relaxed whitespace-pre-wrap border border-surface-border">
              {activeVersion?.caption || 'No caption generated.'}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold font-display uppercase text-muted mb-2">
              Platform Hashtags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeVersion?.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-surface-muted text-foreground px-3 py-1 rounded-full text-xs font-medium font-sans border border-surface-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {activeVersion?.publishedAt && (
            <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs text-muted font-sans">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
          <div className="bg-surface-card rounded-3xl p-6 border border-surface-border card-shadow space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-foreground" />
                <h3 className="text-base font-bold font-display text-foreground">
                  Channel Performance
                </h3>
              </div>
              <span className="text-xs font-bold font-display text-foreground bg-accent-yellow px-3 py-1 rounded-full">
                Live Sync
              </span>
            </div>

            {metrics ? (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-surface-muted p-4 rounded-2xl border border-surface-border">
                  <span className="text-[10px] font-bold font-display uppercase text-muted block">
                    Total Reach
                  </span>
                  <span className="text-2xl font-bold font-display tabular-nums text-foreground mt-1 block">
                    {metrics.reach.toLocaleString()}
                  </span>
                </div>

                <div className="bg-surface-muted p-4 rounded-2xl border border-surface-border">
                  <span className="text-[10px] font-bold font-display uppercase text-muted block">
                    Engagement Rate
                  </span>
                  <span className="text-2xl font-bold font-display tabular-nums text-foreground mt-1 block">
                    {metrics.engagementRate}%
                  </span>
                </div>

                <div className="bg-surface-muted p-4 rounded-2xl border border-surface-border">
                  <span className="text-[10px] font-bold font-display uppercase text-muted block">
                    Likes / Reactions
                  </span>
                  <span className="text-xl font-bold font-display tabular-nums text-foreground mt-1 block">
                    {metrics.likes.toLocaleString()}
                  </span>
                </div>

                <div className="bg-surface-muted p-4 rounded-2xl border border-surface-border">
                  <span className="text-[10px] font-bold font-display uppercase text-muted block">
                    Saves & Bookmarks
                  </span>
                  <span className="text-xl font-bold font-display tabular-nums text-foreground mt-1 block">
                    {metrics.saves.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-surface-muted rounded-2xl p-8 text-center space-y-2 border border-surface-border">
                <Eye className="w-8 h-8 text-muted mx-auto" />
                <p className="text-xs text-muted font-sans">
                  Performance metrics will populate automatically once published to social API queues.
                </p>
              </div>
            )}
          </div>

          {/* Owner Card */}
          <div className="bg-surface-card rounded-3xl p-6 border border-surface-border card-shadow flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={post.owner.avatar}
                alt={post.owner.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-surface-border"
              />
              <div>
                <span className="text-xs font-bold font-display text-foreground block">
                  {post.owner.name}
                </span>
                <span className="text-[11px] text-muted font-sans block">
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
