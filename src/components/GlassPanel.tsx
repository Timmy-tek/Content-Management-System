'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PerformanceInsight } from '@/types';
import { PlatformBadge } from './PlatformBadge';
import { Sparkles, Lock } from 'lucide-react';

interface GlassPanelProps {
  insight: PerformanceInsight;
  isGated?: boolean;
  minPostsRequired?: number;
  currentPostCount?: number;
  onUnlock?: () => void;
  className?: string;
}

export function GlassPanel({
  insight,
  isGated = false,
  minPostsRequired = 5,
  currentPostCount = 3,
  onUnlock,
  className = '',
}: GlassPanelProps) {
  const [internalGated, setInternalGated] = useState(isGated);

  const confidenceBadges = {
    high: { label: 'High Confidence', color: 'bg-accent-yellow text-foreground border-accent-yellow' },
    medium: { label: 'Medium Confidence', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    low: { label: 'Low Confidence', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  };

  if (internalGated) {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl p-8 text-white bg-header-dark border border-header-border card-shadow ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-center py-6 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Lock className="w-5 h-5 text-accent-yellow" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-accent-yellow font-display">
              Performance Agent Locked
            </span>
            <h3 className="text-lg font-bold font-display text-white">
              Need at least {minPostsRequired} posts for Live Insights
            </h3>
            <p className="text-xs text-white/80 font-sans leading-relaxed">
              You currently have {currentPostCount} published posts on this channel. Publish {minPostsRequired - currentPostCount} more post to unlock live AI interpretation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setInternalGated(false);
              if (onUnlock) onUnlock();
            }}
            className="mt-2 bg-accent-yellow text-foreground font-bold text-xs px-5 py-2.5 rounded-full card-shadow hover:bg-accent-yellowHover transition-all font-display"
          >
            Preview Sample AI Agent
          </button>
        </div>
      </div>
    );
  }

  const badgeInfo = confidenceBadges[insight.confidence];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-header-dark border border-header-border card-shadow ${className}`}
    >
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="w-4 h-4 text-accent-yellow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-accent-yellow font-display">
                Performance Agent
              </span>
              {insight.platform !== 'all' && (
                <PlatformBadge platform={insight.platform} size="sm" />
              )}
            </div>
            <h3 className="text-lg font-bold font-display text-white leading-tight">
              Live AI Interpretation Engine
            </h3>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold font-display border ${badgeInfo.color}`}>
          {badgeInfo.label}
        </div>
      </div>

      {/* Observed vs Interpretation Sentiment Scale */}
      <div className="bg-surface-dark/50 bg-black/20 rounded-2xl p-5 border border-white/10 my-4 space-y-4">
        <div className="flex items-center justify-between text-xs font-display font-semibold text-white/90">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-yellow" />
            Observed Data Point
          </span>
          <span className="flex items-center gap-1.5">
            AI Synthesis
            <span className="w-2 h-2 rounded-full bg-white" />
          </span>
        </div>

        {/* Slider scale track */}
        <div className="relative h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-accent-yellow transition-all duration-700 shadow-md"
            style={{ width: `${insight.impactScore}%` }}
          />
        </div>

        {/* Two-column layout: Observed vs Interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-accent-yellow tracking-wider block mb-1 font-display">
              Observed Signal
            </span>
            <p className="text-white/90 leading-relaxed font-sans">
              {insight.observed}
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-white tracking-wider block mb-1 font-display">
              Strategic Interpretation
            </span>
            <p className="text-white leading-relaxed font-sans font-medium">
              {insight.interpretation}
            </p>
          </div>
        </div>
      </div>

      {/* Post References & Action Footer */}
      {insight.postReferences && insight.postReferences.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/70 font-sans">Referenced posts:</span>
            <div className="flex items-center -space-x-2 overflow-hidden">
              {insight.postReferences.map((ref, i) => (
                <Image
                  key={i}
                  src={ref.avatar}
                  alt={ref.title}
                  title={ref.title}
                  width={24}
                  height={24}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-accent-yellow object-cover"
                />
              ))}
            </div>
          </div>

          <button type="button" className="text-accent-yellow hover:underline text-xs font-bold font-display flex items-center gap-1">
            Apply insight to future posts
          </button>
        </div>
      )}
    </div>
  );
}
