'use client';

import React, { useEffect, useState } from 'react';
import { Platform, Post } from '@/types';
import { PlatformBadge } from './PlatformBadge';
import { StatusCapsule } from './StatusCapsule';

interface BranchingPipelineProps {
  mode: 'pipeline' | 'branching';
  post?: Post;
  currentStageIndex?: number; // 0: Upload, 1: Analyze, 2: Adapt, 3: Review, 4: Publish
  onSelectPlatform?: (platform: Platform) => void;
  activePlatform?: Platform;
  animatePipeline?: boolean;
}

const STAGES = [
  { id: 'upload', label: 'Upload Source' },
  { id: 'analyze', label: 'Analyze Context' },
  { id: 'adapt', label: 'AI Adaptation' },
  { id: 'review', label: 'Human Review' },
  { id: 'publish', label: 'Publish & Sync' },
];

export function BranchingPipeline({
  mode,
  post,
  currentStageIndex = 3,
  onSelectPlatform,
  activePlatform,
  animatePipeline = false,
}: BranchingPipelineProps) {
  const [animatedIndex, setAnimatedIndex] = useState(animatePipeline ? 0 : currentStageIndex);

  useEffect(() => {
    if (!animatePipeline) {
      setAnimatedIndex(currentStageIndex);
      return;
    }

    setAnimatedIndex(0);
    const interval = setInterval(() => {
      setAnimatedIndex((prev) => {
        if (prev < currentStageIndex) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [animatePipeline, currentStageIndex]);

  if (mode === 'pipeline') {
    return (
      <div className="w-full py-4 px-2">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Connector SVG line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-[#4A4945] -z-0 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E5F23A] transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${(animatedIndex / (STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stage Nodes */}
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < animatedIndex;
            const isCurrent = idx === animatedIndex;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#E5F23A] text-[#111111] ring-4 ring-[#E5F23A]/30 scale-110 shadow-lg'
                      : isCompleted
                      ? 'bg-[#E5F23A] text-[#111111]'
                      : 'bg-[#4A4945] text-white/50 border border-white/10'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-2.5 text-xs font-medium tracking-tight text-center transition-colors ${
                    isCurrent
                      ? 'text-[#E5F23A] font-bold'
                      : isCompleted
                      ? 'text-white'
                      : 'text-white/40'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Branching node structure
  const platforms = post?.platforms || (['instagram', 'linkedin', 'tiktok', 'facebook'] as Platform[]);

  return (
    <div className="w-full py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Root Node (Source Content) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-[#EFEDE3] text-[#111111] px-6 py-3.5 rounded-2xl border-2 border-[#E5F23A] shadow-xl flex items-center gap-3 max-w-md">
            <div className="w-9 h-9 rounded-full bg-[#111111] text-[#E5F23A] flex items-center justify-center font-bold text-sm shrink-0">
              SRC
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#111111]/50 block">
                Source Master Content
              </span>
              <p className="text-xs font-bold font-space truncate max-w-xs text-[#111111]">
                {post?.title || 'Master Article & Video Asset'}
              </p>
            </div>
          </div>
          <div className="w-3 h-3 bg-[#E5F23A] rounded-full mt-2 shadow-md" />
        </div>

        {/* Curved Connection SVG */}
        <div className="w-full h-16 relative my-1">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {platforms.map((p, idx) => {
              const count = platforms.length;
              const startX = 50; // percentage
              const endX = ((idx + 0.5) / count) * 100;
              return (
                <path
                  key={p}
                  d={`M ${startX}% 0 C ${startX}% 30, ${endX}% 30, ${endX}% 100`}
                  fill="none"
                  stroke="#E5F23A"
                  strokeWidth="2.5"
                  strokeDasharray={idx % 2 === 0 ? 'none' : '4 4'}
                  className="opacity-80"
                />
              );
            })}
          </svg>
        </div>

        {/* Platform Branch Nodes Grid */}
        <div className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4`}>
          {platforms.map((plat) => {
            const version = post?.versions?.[plat];
            const isSelected = activePlatform === plat;
            const metrics = version?.metrics;

            return (
              <div
                key={plat}
                onClick={() => onSelectPlatform && onSelectPlatform(plat)}
                className={`relative bg-[#EFEDE3] text-[#111111] p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] ${
                  isSelected
                    ? 'border-[#E5F23A] ring-4 ring-[#E5F23A]/30 shadow-2xl scale-[1.02]'
                    : 'border-transparent opacity-90 hover:opacity-100 shadow-md'
                }`}
              >
                {/* Node Connector Dot Top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#E5F23A] border-2 border-[#3A3936] shadow-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                  <PlatformBadge platform={plat} size="sm" showLabel />
                  <StatusCapsule status={version?.status || 'review'} size="sm" />
                </div>

                {/* Caption snippet */}
                <p className="text-xs text-[#222222] line-clamp-2 my-2 font-inter leading-relaxed">
                  {version?.caption || 'AI adaptation generating post format...'}
                </p>

                {/* Sparkline Performance visualization (if metrics exist) */}
                {metrics?.sparkline ? (
                  <div className="mt-3 pt-2 border-t border-black/10">
                    <div className="flex items-center justify-between text-[11px] text-[#444444] mb-1">
                      <span className="font-semibold">Reach: {metrics.reach.toLocaleString()}</span>
                      <span className="text-[#0B4F07] font-bold">+{metrics.engagementRate}%</span>
                    </div>
                    {/* Mini Sparkline Bar Chart */}
                    <div className="flex items-end gap-1 h-6 pt-1">
                      {metrics.sparkline.map((val, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#111111] rounded-t-xs hover:bg-[#E5F23A] transition-colors"
                          style={{ height: `${val}%` }}
                          title={`Day ${i + 1}: ${val}% velocity`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-black/5 text-[10px] text-gray-500 italic">
                    Ready for approval
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
