'use client';

import React, { useState } from 'react';
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
    instagram: '2025-03-05T14:00',
    linkedin: '2025-03-05T12:00',
    tiktok: '2025-03-05T16:00',
    facebook: '2025-03-05T15:00',
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedDone, setPublishedDone] = useState(false);

  if (!post) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 text-center shadow-lg border border-black/5 space-y-4">
        <h2 className="text-lg font-bold font-space text-[#111111]">
          Post not found
        </h2>
        <button
          onClick={() => router.push('/posts')}
          className="bg-[#111111] text-white px-5 py-2 rounded-full text-xs font-bold font-space"
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

  const handleExecutePublishing = () => {
    setIsPublishing(true);

    setTimeout(() => {
      // Check if any platform is set to 'schedule' vs 'now'
      const hasScheduled = Object.values(publishModes).some((m) => m === 'schedule');

      if (hasScheduled) {
        schedulePost(postId, scheduledTimes);
      } else {
        publishPostNow(postId);
      }

      setIsPublishing(false);
      setPublishedDone(true);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/posts/${postId}/review`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-space text-[#111111] bg-white px-3.5 py-2 rounded-full shadow-sm hover:bg-white/80 transition-all cursor-pointer border border-black/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review</span>
        </button>

        <StatusCapsule status={post.status} size="md" />
      </div>

      <div>
        <h1 className="text-3xl font-bold font-space text-[#111111]">
          Publish & Schedule Queue
        </h1>
        <p className="text-sm text-[#555555] font-inter mt-1">
          Review approved platform drafts and trigger instantaneous sync or time-slotted queue.
        </p>
      </div>

      {publishedDone ? (
        /* Success Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-black/5 space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#A9F5A0] text-[#0B4F07] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold font-space text-[#111111]">
              Campaign Multi-Publish Triggered!
            </h2>
            <p className="text-xs text-[#555555] font-inter leading-relaxed">
              Approved versions have been routed to live APIs. Performance analytics will populate in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => router.push(`/posts/${postId}`)}
              className="bg-[#111111] text-white px-6 py-3 rounded-full text-xs font-bold font-space hover:bg-[#222222] shadow-md transition-all cursor-pointer"
            >
              View Post Detail & Branching Graph
            </button>
            <button
              onClick={() => router.push('/posts')}
              className="bg-[#F2F1EF] text-[#111111] px-6 py-3 rounded-full text-xs font-bold font-space hover:bg-[#E2E1DF] transition-all cursor-pointer"
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
                className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 space-y-4 hover:shadow-xl transition-shadow"
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
                  <div className="bg-[#F2F1EF] p-1 rounded-full flex items-center gap-1 border border-black/5">
                    <button
                      type="button"
                      onClick={() => toggleMode(p, 'now')}
                      className={`px-3 py-1 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                        currentMode === 'now'
                          ? 'bg-[#111111] text-white shadow-sm'
                          : 'text-[#666666] hover:text-[#111111]'
                      }`}
                    >
                      Publish Now
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMode(p, 'schedule')}
                      className={`px-3 py-1 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                        currentMode === 'schedule'
                          ? 'bg-[#111111] text-white shadow-sm'
                          : 'text-[#666666] hover:text-[#111111]'
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>

                {/* Draft snippet */}
                <div className="bg-[#F2F1EF] rounded-2xl p-4 text-xs font-inter text-[#222222] leading-relaxed">
                  <p className="line-clamp-2">{ver?.caption || 'No caption created.'}</p>
                  <div className="text-[11px] text-[#2E7BD1] font-semibold mt-1">
                    {ver?.hashtags.join(' ')}
                  </div>
                </div>

                {/* Schedule datetime picker if in schedule mode */}
                {currentMode === 'schedule' && (
                  <div className="flex flex-wrap items-center gap-3 bg-[#F5E6A3]/30 p-3 rounded-2xl border border-[#F5E6A3]">
                    <Clock className="w-4 h-4 text-[#574300]" />
                    <span className="text-xs font-bold font-space text-[#574300]">
                      Target Publication Time:
                    </span>
                    <input
                      type="datetime-local"
                      value={scheduledTimes[p]}
                      onChange={(e) => handleTimeChange(p, e.target.value)}
                      className="bg-white border border-black/10 rounded-xl px-3 py-1.5 text-xs font-inter text-[#111111] focus:outline-none"
                    />
                  </div>
                )}

                {/* Connection status warning if disconnected */}
                {isDisconnected && (
                  <div className="flex items-center gap-2 text-xs text-[#5C0A0A] bg-[#F5A9A9]/30 p-3 rounded-2xl border border-[#F5A9A9]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      This channel account is disconnected. Reconnect token in Account Settings before triggering.
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Primary Action Button: High contrast solid black (#111111) pill */}
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleExecutePublishing}
              disabled={isPublishing}
              className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] font-bold text-sm px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer font-space"
            >
              <Send className={`w-4 h-4 text-[#E5F23A] ${isPublishing ? 'animate-bounce' : ''}`} />
              <span>{isPublishing ? 'Transmitting to Social APIs...' : 'Publish / Schedule All Channels'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
