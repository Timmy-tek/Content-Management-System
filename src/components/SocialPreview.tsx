'use client';

import React from 'react';
import Image from 'next/image';
import { Platform } from '@/types';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
  Repeat,
  Plus,
  Music,
  Globe
} from 'lucide-react';

interface SocialPreviewProps {
  platform: Platform;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  authorName?: string;
  authorAvatar?: string;
}

export function SocialPreview({
  platform,
  caption,
  hashtags,
  imageUrl,
  authorName = 'Content Engine Studio',
  authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
}: SocialPreviewProps) {
  const displayImage =
    imageUrl ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

  const formattedHashtags = hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');

  if (platform === 'instagram') {
    return (
      <div className="w-full max-w-[380px] mx-auto bg-black text-white rounded-[32px] overflow-hidden border border-white/10 shadow-2xl font-sans">
        {/* Phone Frame Status Bar Header */}
        <div className="px-6 pt-3 pb-2 flex justify-between items-center text-[10px] text-gray-400 font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-3 h-2 rounded-sm border border-gray-400" />
          </div>
        </div>

        {/* IG App Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <Image
                src={authorAvatar}
                alt={authorName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-black"
              />
            </div>
            <div>
              <span className="font-semibold text-xs flex items-center gap-1">
                contentengine.ai
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              </span>
              <span className="text-[10px] text-gray-400 block leading-none">Sponsored</span>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-300" />
        </div>

        {/* Post Image Container */}
        <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden">
          <Image
            src={displayImage}
            alt="Instagram preview media"
            fill
            className="object-cover"
          />
        </div>

        {/* Actions Bar */}
        <div className="p-3 pb-2 space-y-2">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Heart className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />
              <MessageCircle className="w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
              <Send className="w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
            </div>
            <Bookmark className="w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
          </div>

          <div className="text-xs font-semibold text-white">
            1,842 likes
          </div>

          {/* Caption & Hashtags */}
          <div className="text-xs text-neutral-200 leading-snug space-y-1">
            <p className="whitespace-pre-wrap">
              <span className="font-semibold text-white mr-1">contentengine.ai</span>
              {caption}
            </p>
            {formattedHashtags && (
              <p className="text-blue-400 text-[11px] font-medium">{formattedHashtags}</p>
            )}
          </div>

          <div className="text-[10px] text-neutral-500 uppercase tracking-wide pt-1">
            2 HOURS AGO
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'linkedin') {
    return (
      <div className="w-full max-w-[380px] mx-auto bg-[#1B1F23] text-white rounded-[24px] overflow-hidden border border-white/10 shadow-2xl font-sans">
        {/* Header Bar */}
        <div className="p-4 pb-3 border-b border-white/5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Image
                src={authorAvatar}
                alt={authorName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <div>
                <h4 className="font-semibold text-xs text-white leading-tight flex items-center gap-1">
                  {authorName}
                  <span className="text-[10px] text-gray-400 font-normal">• 1st</span>
                </h4>
                <p className="text-[10px] text-gray-400 line-clamp-1 leading-tight mt-0.5">
                  AI Content Adaptation & Scaled Social Operations
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                  <span>1d • Promoted</span>
                  <Globe className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
            <button className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-0.5">
              <Plus className="w-3.5 h-3.5" /> Follow
            </button>
          </div>

          {/* Caption text */}
          <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap space-y-2">
            <p>{caption}</p>
            {formattedHashtags && (
              <p className="text-sky-400 text-[11px] font-medium">{formattedHashtags}</p>
            )}
          </div>
        </div>

        {/* Media Preview */}
        <div className="relative aspect-[16/9] w-full bg-neutral-900">
          <Image
            src={displayImage}
            alt="LinkedIn Post Media"
            fill
            className="object-cover"
          />
        </div>

        {/* Reaction statistics */}
        <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[8px]">👏</span>
            <span>2,410</span>
          </div>
          <div>48 comments • 12 reposts</div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1.5 flex justify-around items-center text-xs text-gray-300 font-medium">
          <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
            <ThumbsUp className="w-4 h-4" /> Like
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
            <MessageSquare className="w-4 h-4" /> Comment
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
            <Repeat className="w-4 h-4" /> Repost
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    );
  }

  if (platform === 'tiktok') {
    return (
      <div className="w-full max-w-[380px] mx-auto bg-black text-white rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative aspect-[9/16] flex flex-col justify-between font-sans">
        {/* Background Image / Video Mock */}
        <Image
          src={displayImage}
          alt="TikTok Media background"
          fill
          className="object-cover opacity-85"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

        {/* Top bar */}
        <div className="relative z-10 p-4 pt-6 flex justify-between items-center text-xs font-semibold">
          <div className="flex gap-4 mx-auto text-gray-300">
            <span className="hover:text-white cursor-pointer">Following</span>
            <span className="text-white border-b-2 border-white pb-0.5">For You</span>
          </div>
        </div>

        {/* Right Side Bar Action Icons */}
        <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4 text-white">
          <div className="relative mb-1">
            <Image
              src={authorAvatar}
              alt={authorName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold">
              +
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white/20" />
            </div>
            <span className="text-[10px] font-semibold mt-1">124.8K</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold mt-1">1,842</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold mt-1">9,420</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold mt-1">3,102</span>
          </div>

          <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-neutral-700 animate-spin flex items-center justify-center mt-2">
            <Music className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Bottom Overlay Info */}
        <div className="relative z-10 p-4 space-y-2 text-white max-w-[80%]">
          <h4 className="font-bold text-sm">@contentengine.ai</h4>
          <p className="text-xs text-neutral-200 line-clamp-3 leading-snug whitespace-pre-wrap">
            {caption}
          </p>
          {formattedHashtags && (
            <p className="text-xs font-bold text-white line-clamp-1">{formattedHashtags}</p>
          )}

          <div className="flex items-center gap-2 text-[11px] text-gray-300 font-medium pt-1">
            <Music className="w-3.5 h-3.5" />
            <span className="truncate">Original Sound - Content Engine Studio</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Facebook
  return (
    <div className="w-full max-w-[380px] mx-auto bg-[#242526] text-white rounded-[24px] overflow-hidden border border-white/10 shadow-2xl font-sans">
      {/* Header */}
      <div className="p-4 pb-2 border-b border-white/5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-2.5 items-center">
            <Image
              src={authorAvatar}
              alt={authorName}
              width={38}
              height={38}
              className="w-9 h-9 rounded-full object-cover border border-white/10"
            />
            <div>
              <h4 className="font-semibold text-xs text-white leading-tight">
                {authorName}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                <span>Sponsored</span>
                <span>•</span>
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        {/* Caption */}
        <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap space-y-1">
          <p>{caption}</p>
          {formattedHashtags && (
            <p className="text-blue-400 text-[11px] font-medium">{formattedHashtags}</p>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="relative aspect-square w-full bg-neutral-900">
        <Image
          src={displayImage}
          alt="Facebook Post Media"
          fill
          className="object-cover"
        />
      </div>

      {/* Social Bar */}
      <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">👍</span>
          <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">❤️</span>
          <span>1.2K</span>
        </div>
        <div>142 Comments • 89 Shares</div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex justify-around items-center text-xs text-gray-300 font-medium">
        <button className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
          <ThumbsUp className="w-4 h-4" /> Like
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
          <MessageSquare className="w-4 h-4" /> Comment
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
}
