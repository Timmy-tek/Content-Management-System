'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Platform } from '@/types';
import { BranchingPipeline } from '@/components/BranchingPipeline';
import { ScrubberBar } from '@/components/ScrubberBar';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusCapsule } from '@/components/StatusCapsule';
import { SocialPreview } from '@/components/SocialPreview';
import {
  Check,
  RotateCw,
  ArrowRight,
  AlertCircle,
  Eye,
  Hash,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { posts, updatePlatformVersion, approvePlatformVersion, approveAllPlatformVersions } = useApp();

  const postId = params.id as string;
  const post = posts.find((p) => p.id === postId);

  const shouldAnimate = searchParams.get('animate') === 'true';

  const [activePlatform, setActivePlatform] = useState<Platform>('instagram');
  const [currentScrubberStage, setCurrentScrubberStage] = useState(3); // Stage 3 = Review
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (post && post.platforms.length > 0) {
      if (!post.platforms.includes(activePlatform)) {
        setActivePlatform(post.platforms[0]);
      }
    }
  }, [post, activePlatform]);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 text-center shadow-lg border border-black/5 space-y-4">
        <AlertCircle className="w-10 h-10 text-[#F5A9A9] mx-auto" />
        <h2 className="text-xl font-bold font-space text-[#111111]">
          Post not found
        </h2>
        <p className="text-xs text-[#666666] font-inter">
          The content master ID `{postId}` does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/posts')}
          className="bg-[#111111] text-white px-6 py-2.5 rounded-full text-xs font-bold font-space"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const platforms = post.platforms;
  const currentVersion = post.versions[activePlatform];

  // Check if every platform version in this post is approved
  const allApproved = platforms.every((p) => post.versions[p]?.approved);

  const handleCaptionChange = (newCaption: string) => {
    updatePlatformVersion(postId, activePlatform, { caption: newCaption });
  };

  const handleHashtagsChange = (hashtagsStr: string) => {
    const tags = hashtagsStr
      .split(' ')
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);
    updatePlatformVersion(postId, activePlatform, { hashtags: tags });
  };

  const handleRegenerate = async () => {
    if (!currentVersion) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformVersionId: currentVersion.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updatePlatformVersion(postId, activePlatform, { caption: data.caption, hashtags: data.hashtags });
    } catch (err) {
      console.error('Regenerate failed:', err);
    }
    setIsRegenerating(false);
  };

  const handleApproveCurrent = () => {
    approvePlatformVersion(postId, activePlatform);
  };

  const handleApproveAllAndContinue = () => {
    approveAllPlatformVersions(postId);
    router.push(`/posts/${postId}/publish`);
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/posts')}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-space text-[#111111] bg-white px-4 py-2 rounded-full shadow-sm hover:bg-white/80 transition-all cursor-pointer border border-black/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusCapsule status={post.status} size="md" />
        </div>
      </div>

      {/* SURFACE 2: Dedicated dark charcoal panel (#3A3936) with acid lime-yellow glow border (#E5F23A) */}
      <div className="bg-[#3A3936] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#E5F23A] shadow-2xl relative overflow-hidden">

        {/* Glow backdrop blur effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5F23A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5F23A] font-space">
                Surface 2 — Adaptation Workspace & Review
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-space text-white mt-1">
              {post.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-[#2A2926] px-4 py-2 rounded-2xl border border-white/10">
            <span className="text-xs text-white/80 font-inter">
              Content Source: <strong className="text-white capitalize">{post.contentType}</strong>
            </span>
          </div>
        </div>

        {/* 1. Pipeline Stages animated Visual at top */}
        <div className="bg-[#2A2926] rounded-2xl p-4 border border-white/10 mb-8 relative z-10">
          <BranchingPipeline
            mode="pipeline"
            currentStageIndex={currentScrubberStage}
            animatePipeline={shouldAnimate}
          />
        </div>

        {/* 2. Platform Navigation Filter Pills inside Panel */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {platforms.map((p) => {
              const isActive = activePlatform === p;
              const isApproved = post.versions[p]?.approved;

              return (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E5F23A] text-black shadow-lg scale-105'
                      : 'bg-[#4A4945] text-white hover:bg-[#5A5955]'
                  }`}
                >
                  <PlatformBadge platform={p} size="sm" />
                  <span className="capitalize">{p}</span>
                  {isApproved && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-white/70 font-inter bg-black/20 px-3 py-1.5 rounded-full">
            {platforms.filter((p) => post.versions[p]?.approved).length} of {platforms.length} platforms approved
          </div>
        </div>

        {/* 3. Inverted Warm Cream Card (#EFEDE3, dark text) floating inside dark panel */}
        {currentVersion && (
          <div className="bg-[#EFEDE3] text-[#111111] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Editable Caption & Hashtags */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={activePlatform} size="md" showLabel />
                  <StatusCapsule status={currentVersion.approved ? 'approved' : 'review'} size="sm" />
                </div>

                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 text-xs font-bold font-space text-[#111111] bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-[#111111]' : ''}`} />
                  <span>{isRegenerating ? 'Adapting AI...' : 'Regenerate Draft'}</span>
                </button>
              </div>

              {/* Editable Caption area */}
              <div>
                <label className="block text-[11px] font-bold font-space uppercase tracking-wider text-[#444444] mb-2 flex items-center justify-between">
                  <span>Adapted Platform Copy</span>
                  <span className="text-[10px] text-gray-500 font-normal">Real-time sync to feed preview</span>
                </label>
                <textarea
                  rows={8}
                  value={currentVersion.caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-2xl p-4 text-xs font-inter text-[#111111] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-inner"
                  placeholder="Enter or edit caption..."
                />
              </div>

              {/* Editable Hashtags */}
              <div>
                <label className="block text-[11px] font-bold font-space uppercase tracking-wider text-[#444444] mb-2 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  Target Hashtags & Keywords
                </label>
                <input
                  type="text"
                  value={currentVersion.hashtags.join(' ')}
                  onChange={(e) => handleHashtagsChange(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-2xl px-4 py-3 text-xs font-inter text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  placeholder="#tag1 #tag2"
                />
              </div>

              {/* Individual Approve button */}
              <div className="pt-2 flex items-center justify-between border-t border-black/5">
                <span className="text-[11px] text-[#666666] font-inter">
                  Draft status: {currentVersion.approved ? 'Approved for publishing queue' : 'Needs review & verification'}
                </span>

                <button
                  type="button"
                  onClick={handleApproveCurrent}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                    currentVersion.approved
                      ? 'bg-[#A9F5A0] text-[#0B4F07] border border-[#0B4F07]/20 shadow-sm'
                      : 'bg-[#111111] text-white hover:bg-[#222222] shadow-md'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{currentVersion.approved ? 'Approved ✓' : `Approve ${activePlatform}`}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Platform Mobile Feed Mockup Preview Box */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase font-space text-[#555555] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#111111]" />
                  Live Mobile Feed Mockup
                </span>
                <span className="text-[10px] bg-black/10 px-2.5 py-1 rounded-full font-mono text-gray-700 capitalize">
                  {activePlatform} Format
                </span>
              </div>

              {/* Dynamic Native Mobile Mockup Component */}
              <div className="bg-[#18181B] p-4 rounded-3xl shadow-xl border border-black/10">
                <SocialPreview
                  platform={activePlatform}
                  caption={currentVersion.caption}
                  hashtags={currentVersion.hashtags}
                  imageUrl={post.imageUrl || currentVersion.mediaUrl}
                  authorName={post.owner.name}
                  authorAvatar={post.owner.avatar}
                />
              </div>
            </div>

          </div>
        )}

        {/* Primary Action Button Bar: "Approve All & Continue" */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
          {!allApproved && (
            <button
              type="button"
              onClick={() => approveAllPlatformVersions(postId)}
              className="text-xs font-bold font-space text-[#E5F23A] hover:text-white transition-colors cursor-pointer underline underline-offset-2"
            >
              Approve all platform drafts at once
            </button>
          )}
          <div className="text-xs text-white/70 font-inter">
            {allApproved ? (
              <span className="text-[#A9F5A0] font-bold font-space flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> All platform drafts approved! Ready to publish or schedule.
              </span>
            ) : (
              <span>Approving all formats will enable automated publishing queue.</span>
            )}
          </div>

          <button
            onClick={handleApproveAllAndContinue}
            disabled={!allApproved}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold font-space transition-all cursor-pointer shadow-xl ${
              allApproved
                ? 'bg-[#111111] text-white hover:bg-[#222222] ring-2 ring-[#E5F23A]'
                : 'bg-[#111111]/60 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <span>Approve All & Continue</span>
            <ArrowRight className="w-4 h-4 text-[#E5F23A]" />
          </button>
        </div>

      </div>

      {/* Fixed dark pill-shaped scrubber bar sits at bottom with lime dot markers */}
      <ScrubberBar
        currentStage={currentScrubberStage}
        totalStages={5}
        onScrub={(stageIdx) => setCurrentScrubberStage(stageIdx)}
      />
    </div>
  );
}
