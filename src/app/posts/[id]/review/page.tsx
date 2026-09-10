'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Platform } from '@/types';
import { BranchingPipeline } from '@/components/BranchingPipeline';
import { ScrubberBar } from '@/components/ScrubberBar';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusCapsule } from '@/components/StatusCapsule';
import {
  Check,
  RotateCw,
  ArrowRight,
  AlertCircle,
  Eye,
  Hash
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
  const [currentScrubberStage, setCurrentScrubberStage] = useState(3);
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
      <div className="max-w-2xl mx-auto my-12 bg-surface-card rounded-3xl p-8 text-center border border-surface-border card-shadow space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold font-display text-foreground">
          Post not found
        </h2>
        <p className="text-xs text-muted">
          The content master ID `{postId}` does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => router.push('/posts')}
          className="bg-header-dark text-white px-6 py-2.5 rounded-full text-xs font-bold font-display"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const platforms = post.platforms;
  const currentVersion = post.versions[activePlatform];

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
    <div className="space-y-6 pb-28">
      {/* Surface Header */}
      <div className="bg-header-dark text-white rounded-3xl p-6 sm:p-8 border border-header-border card-shadow relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-yellow font-display">
                Review Studio & Pipeline
              </span>
              <StatusCapsule status={post.status} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              {post.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 font-sans">
              Master Source: {post.contentType}
            </span>
          </div>
        </div>

        {/* 1. Pipeline Stages animated Visual at top */}
        <div className="bg-surface-dark rounded-2xl p-4 border border-white/10 mb-6 relative z-10">
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
                  type="button"
                  onClick={() => setActivePlatform(p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-display transition-all ${
                    isActive
                      ? 'bg-surface-card text-foreground card-shadow'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <PlatformBadge platform={p} size="sm" />
                  <span className="capitalize">{p}</span>
                  {isApproved && (
                    <span className="w-2 h-2 rounded-full bg-accent-yellow" title="Approved" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-white/70 font-sans">
            {platforms.filter((p) => post.versions[p]?.approved).length} of {platforms.length} approved
          </div>
        </div>

        {/* 3. Off-white Surface Card floating inside dark header panel */}
        {currentVersion && (
          <div className="bg-surface text-foreground rounded-2xl p-6 sm:p-8 card-shadow relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 border border-surface-border">

            {/* Left Column: Editable Caption & Hashtags */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={activePlatform} size="md" showLabel />
                  <StatusCapsule status={currentVersion.approved ? 'approved' : 'review'} size="sm" />
                </div>

                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 text-xs font-bold font-display text-foreground bg-surface-muted hover:bg-surface-border px-3 py-1.5 rounded-full transition-colors border border-surface-border"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Adapting...' : 'Regenerate AI'}</span>
                </button>
              </div>

              {/* Editable Caption area */}
              <div>
                <label className="block text-[11px] font-bold font-display uppercase tracking-wider text-muted mb-1.5">
                  Adapted Caption & Copy
                </label>
                <textarea
                  rows={6}
                  value={currentVersion.caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  className="w-full bg-surface-card border border-surface-border rounded-xl p-4 text-xs font-sans text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              {/* Editable Hashtags */}
              <div>
                <label className="block text-[11px] font-bold font-display uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  Target Hashtags
                </label>
                <input
                  type="text"
                  value={currentVersion.hashtags.join(' ')}
                  onChange={(e) => handleHashtagsChange(e.target.value)}
                  className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-xs font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              {/* Individual Approve button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted font-sans">
                  Status: {currentVersion.approved ? 'Approved for publishing' : 'Awaiting review'}
                </span>

                <button
                  type="button"
                  onClick={handleApproveCurrent}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold font-display transition-all ${
                    currentVersion.approved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-header-dark text-white hover:bg-black card-shadow'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{currentVersion.approved ? 'Approved ✓' : 'Approve Draft'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Platform Feed Preview Box */}
            <div className="lg:col-span-5 bg-surface-card rounded-xl p-5 border border-surface-border flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2">
                  <span className="text-[10px] font-bold uppercase font-display text-muted flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Live Preview Box
                  </span>
                  <span className="text-[10px] bg-surface-muted px-2 py-0.5 rounded-full font-mono text-muted">
                    {currentVersion.previewType}
                  </span>
                </div>

                <div className="bg-surface-muted rounded-xl p-4 border border-surface-border space-y-3 font-sans text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-header-dark text-accent-yellow flex items-center justify-center font-bold text-[10px] font-display">
                      CE
                    </div>
                    <div>
                      <span className="font-bold text-foreground text-xs block leading-tight font-display">
                        Content Engine Studio
                      </span>
                      <span className="text-[10px] text-muted">1m ago</span>
                    </div>
                  </div>

                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-[11px] line-clamp-6">
                    {currentVersion.caption}
                  </p>

                  <div className="text-[10px] text-foreground font-semibold font-mono">
                    {currentVersion.hashtags.join(' ')}
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-muted font-sans">
                  Human review ensures tone safety before publishing.
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Primary Action Button Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
          {!allApproved && (
            <button
              type="button"
              onClick={() => approveAllPlatformVersions(postId)}
              className="text-xs font-bold font-display text-accent-yellow hover:underline"
            >
              Approve all drafts at once
            </button>
          )}
          <div className="text-xs text-white/70 font-sans">
            {allApproved ? (
              <span className="text-accent-yellow font-bold font-display">
                ✓ All platform drafts approved! Ready to publish or schedule.
              </span>
            ) : (
              <span>Approving all formats will enable automated publishing queue.</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleApproveAllAndContinue}
            disabled={!allApproved}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-xs font-bold font-display transition-all shadow-xl ${
              allApproved
                ? 'bg-accent-yellow text-foreground hover:bg-accent-yellowHover'
                : 'bg-white/20 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <span>Approve All & Continue</span>
            <ArrowRight className="w-4 h-4 text-foreground" />
          </button>
        </div>

      </div>

      <ScrubberBar
        currentStage={currentScrubberStage}
        totalStages={5}
        onScrub={(stageIdx) => setCurrentScrubberStage(stageIdx)}
      />
    </div>
  );
}
