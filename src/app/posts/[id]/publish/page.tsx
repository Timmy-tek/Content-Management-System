'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Platform } from '@/types';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusCapsule } from '@/components/StatusCapsule';
import {
  Send,
  Clock,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { PublishResult } from '@/context/AppContext';

export default function PublishPage() {
  const params = useParams();
  const router = useRouter();
  const { posts, publishPostNow, schedulePost, connections } = useApp();

  const postId = params.id as string;
  const post = posts.find((p) => p.id === postId);

  const [publishModes, setPublishModes] = useState<Record<Platform, 'now' | 'schedule'>>({
    instagram: 'now',
    linkedin: 'now',
    tiktok: 'now',
    facebook: 'now',
  });

  const [scheduledTimes, setScheduledTimes] = useState<Record<Platform, string>>({
    instagram: '2026-09-15T14:00',
    linkedin: '2026-09-15T12:00',
    tiktok: '2026-09-15T16:00',
    facebook: '2026-09-15T15:00',
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedDone, setPublishedDone] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);

  useEffect(() => {
    setPublishModes({ instagram: 'now', linkedin: 'now', tiktok: 'now', facebook: 'now' });
    setPublishedDone(false);
  }, [postId]);

  if (!post) {
    return (
      <div className="max-w-md mx-auto my-12 bg-surface-card rounded-3xl p-8 text-center border border-surface-border card-shadow space-y-4">
        <h2 className="text-base font-bold font-display text-foreground">
          Post not found
        </h2>
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

  const toggleMode = (p: Platform, mode: 'now' | 'schedule') => {
    setPublishModes((prev) => ({ ...prev, [p]: mode }));
  };

  const handleTimeChange = (p: Platform, timeStr: string) => {
    setScheduledTimes((prev) => ({ ...prev, [p]: timeStr }));
  };

  const handleExecutePublishing = async () => {
    setIsPublishing(true);

    const nowPlatforms = post.platforms.filter((p) => publishModes[p] === 'now');
    const scheduledPlatforms = post.platforms.filter((p) => publishModes[p] === 'schedule');

    let results: PublishResult[] = [];

    if (nowPlatforms.length > 0) {
      results = await publishPostNow(postId, nowPlatforms);
    }
    if (scheduledPlatforms.length > 0) {
      schedulePost(postId, scheduledTimes, scheduledPlatforms);
    }

    setPublishResults(results);
    setIsPublishing(false);
    setPublishedDone(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface-card rounded-3xl p-4 border border-surface-border card-shadow">
        <button
          type="button"
          onClick={() => router.push(`/posts/${postId}/review`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-display text-foreground bg-surface-muted px-3.5 py-2 rounded-full border border-surface-border hover:bg-surface-border transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review</span>
        </button>

        <StatusCapsule status={post.status} size="md" />
      </div>

      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow">
        <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted block">
          AUTOMATED PUBLISHER QUEUE
        </span>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Publish & Schedule Queue
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Review approved platform drafts and trigger instantaneous sync or time-slotted queue.
        </p>
      </div>

      {publishedDone ? (
        /* Success Screen */
        <div className="bg-surface-card rounded-3xl p-8 sm:p-12 text-center border border-surface-border card-shadow space-y-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold font-display text-foreground">
              {publishResults.length === 0
                ? 'Scheduled'
                : publishResults.every((r) => r.success)
                  ? 'Published successfully'
                  : 'Publishing completed'}
            </h2>
          </div>

          {publishResults.length > 0 && (
            <div className="max-w-md mx-auto space-y-2 text-left">
              {publishResults.map((r) => (
                <div
                  key={r.platform}
                  className={`flex items-center justify-between p-3 rounded-2xl text-xs font-sans ${
                    r.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  <span className="font-bold font-display capitalize">{r.platform}</span>
                  <span>{r.success ? 'Published' : r.error}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/posts/${postId}`)}
              className="bg-header-dark text-white px-6 py-2.5 rounded-full text-xs font-bold font-display hover:bg-black card-shadow"
            >
              View Post Detail
            </button>
            <button
              type="button"
              onClick={() => router.push('/posts')}
              className="bg-surface-muted text-foreground px-6 py-2.5 rounded-full text-xs font-bold font-display hover:bg-surface-border"
            >
              Back to Library
            </button>
          </div>
        </div>
      ) : (
        /* Per-platform publish row list */
        <div className="space-y-4">
          {post.platforms.map((p) => {
            const ver = post.versions[p];
            const conn = connections.find((c) => c.platform === p);
            const isDisconnected = conn?.status === 'disconnected';
            const currentMode = publishModes[p];

            return (
              <div
                key={p}
                className="bg-surface-card rounded-2xl p-5 border border-surface-border card-shadow space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={p} size="md" showLabel />
                    {isDisconnected ? (
                      <StatusCapsule status="disconnected" size="sm" />
                    ) : (
                      <StatusCapsule status={ver?.status || 'approved'} size="sm" />
                    )}
                  </div>

                  {/* Now vs Schedule Pill Toggle */}
                  <div className="bg-surface-muted p-1 rounded-full flex items-center gap-1 border border-surface-border">
                    <button
                      type="button"
                      onClick={() => toggleMode(p, 'now')}
                      className={`px-3 py-1 rounded-full text-xs font-bold font-display transition-all ${
                        currentMode === 'now'
                          ? 'bg-header-dark text-white card-shadow'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      Publish Now
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMode(p, 'schedule')}
                      className={`px-3 py-1 rounded-full text-xs font-bold font-display transition-all ${
                        currentMode === 'schedule'
                          ? 'bg-header-dark text-white card-shadow'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>

                {/* Draft snippet */}
                <div className="bg-surface-muted rounded-xl p-4 text-xs font-sans text-foreground leading-relaxed border border-surface-border">
                  <p className="line-clamp-2">{ver?.caption || 'No caption created.'}</p>
                  <div className="text-[10px] text-muted font-semibold mt-1 font-mono">
                    {ver?.hashtags.join(' ')}
                  </div>
                </div>

                {/* Schedule datetime picker if in schedule mode */}
                {currentMode === 'schedule' && (
                  <div className="flex flex-wrap items-center gap-3 bg-surface-muted p-3 rounded-xl border border-surface-border">
                    <Clock className="w-4 h-4 text-foreground" />
                    <span className="text-xs font-bold font-display text-foreground">
                      Target Publication Time:
                    </span>
                    <input
                      type="datetime-local"
                      value={scheduledTimes[p]}
                      onChange={(e) => handleTimeChange(p, e.target.value)}
                      className="bg-surface-card border border-surface-border rounded-lg px-3 py-1 text-xs font-sans text-foreground focus:outline-none"
                    />
                  </div>
                )}

                {/* Connection status warning if disconnected */}
                {isDisconnected && (
                  <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-100 p-3 rounded-xl border border-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      This channel account is disconnected. Reconnect token in Account Settings before triggering.
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Primary Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleExecutePublishing}
              disabled={isPublishing}
              className="inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black font-bold text-xs px-8 py-3.5 rounded-full card-shadow transition-all font-display"
            >
              <Send className={`w-4 h-4 text-accent-yellow ${isPublishing ? 'animate-bounce' : ''}`} />
              <span>{isPublishing ? 'Transmitting to Social APIs...' : 'Publish / Schedule All Channels'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
