'use client';

import React, { useState } from 'react';
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
    high: { label: 'High Confidence', color: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' },
    medium: { label: 'Medium Confidence', color: 'bg-amber-400/20 text-amber-200 border-amber-400/30' },
    low: { label: 'Low Confidence', color: 'bg-rose-400/20 text-rose-200 border-rose-400/30' },
  };

  if (internalGated) {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl p-8 text-white border border-white/20 shadow-2xl backdrop-blur-xl ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(47, 191, 168, 0.85) 0%, rgba(46, 123, 209, 0.85) 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center py-8 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest uppercase text-white/70 font-space">
              Performance Agent Locked
            </span>
            <h3 className="text-xl font-bold font-space text-white">
              Need at least {minPostsRequired} posts for Live Insights
            </h3>
            <p className="text-xs text-white/80 font-inter leading-relaxed">
              You currently have {currentPostCount} published posts on this channel. Publish {minPostsRequired - currentPostCount} more post to unlock live AI interpretation.
            </p>
          </div>

          <button
            onClick={() => {
              setInternalGated(false);
              if (onUnlock) onUnlock();
            }}
            className="mt-2 bg-white text-[#2E7BD1] font-bold text-xs px-5 py-2.5 rounded-full shadow-lg hover:bg-white/90 transition-all cursor-pointer font-space"
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
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-white/30 shadow-2xl backdrop-blur-xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(47, 191, 168, 0.9) 0%, rgba(46, 123, 209, 0.9) 100%)',
      }}
    >
      {/* Decorative glass glow circle */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-white/70 font-space">
                Performance Agent
              </span>
              {insight.platform !== 'all' && (
                <PlatformBadge platform={insight.platform} size="sm" />
              )}
            </div>
            <h3 className="text-lg font-bold font-space text-white leading-tight">
              Live AI Interpretation Engine
            </h3>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${badgeInfo.color}`}>
          {badgeInfo.label}
        </div>
      </div>

      {/* Observed vs Interpretation Sentiment Scale */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 my-4 space-y-4">
        <div className="flex items-center justify-between text-xs font-space font-semibold text-white/90">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-300" />
            Observed Data Point
          </span>
          <span className="flex items-center gap-1.5">
            AI Synthesis
            <span className="w-2 h-2 rounded-full bg-blue-300" />
          </span>
        </div>

        {/* Slider scale track */}
        <div className="relative h-3 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 via-white to-blue-300 transition-all duration-700 shadow-md"
            style={{ width: `${insight.impactScore}%` }}
          />
          {/* Position marker dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-[#2E7BD1] transition-all"
            style={{ left: `${insight.impactScore}%` }}
          />
        </div>

        {/* Two-column layout: Observed vs Interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="bg-black/15 p-3.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider block mb-1 font-space">
              Observed Signal
            </span>
            <p className="text-white/90 leading-relaxed font-inter">
              {insight.observed}
            </p>
          </div>

          <div className="bg-black/20 p-3.5 rounded-xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block mb-1 font-space">
              Strategic Interpretation
            </span>
            <p className="text-white leading-relaxed font-inter font-medium">
              {insight.interpretation}
            </p>
          </div>
        </div>
      </div>

      {/* Post References & Action Footer */}
      {insight.postReferences && insight.postReferences.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/70 font-inter">Referenced posts:</span>
            <div className="flex items-center -space-x-2 overflow-hidden">
              {insight.postReferences.map((ref, i) => (
                <img
                  key={i}
                  src={ref.avatar}
                  alt={ref.title}
                  title={ref.title}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#2E7BD1] object-cover"
                />
              ))}
            </div>
          </div>

          <button className="text-white hover:text-white/80 underline text-xs font-medium flex items-center gap-1 font-space">
            Apply insight to future posts
          </button>
        </div>
      )}
    </div>
  );
}
