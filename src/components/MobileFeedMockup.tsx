'use client';

import React from 'react';
import { Platform } from '@/types';
import {
  Heart as HeartIcon,
  MessageCircle as CommentIcon,
  Send as SendIcon,
  Bookmark as BookmarkIcon,
  Share2 as ShareIcon,
  ThumbsUp as LikeIcon,
  Repeat2 as RepostIcon,
  MoreHorizontal as MoreIcon,
  Globe as GlobeIcon,
  Music2 as MusicIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  User as UserIcon,
  Bell as BellIcon,
  Briefcase as JobsIcon,
  Users as NetworkIcon,
  Compass as ExploreIcon,
  X as CloseIcon,
  ChevronLeft as BackIcon
} from 'lucide-react';

interface MobileFeedMockupProps {
  platform: Platform;
  caption: string;
  hashtags: string[] | string;
  mediaUrl?: string;
  title?: string;
}

export function MobileFeedMockup({
  platform,
  caption,
  hashtags,
  mediaUrl,
  title = 'Content Engine'
}: MobileFeedMockupProps) {
  const formattedHashtags = Array.isArray(hashtags)
    ? hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
    : hashtags;

  const defaultImage =
    mediaUrl ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="w-full max-w-[350px] mx-auto bg-black rounded-[44px] p-3 shadow-2xl border-[6px] border-[#222222] relative overflow-hidden font-sans">
      {/* Phone Notch / Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 flex items-center justify-between px-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10" />
        <div className="w-2 h-2 rounded-full bg-[#111]" />
      </div>

      {/* Screen Frame Container */}
      <div className="w-full rounded-[34px] overflow-hidden bg-white text-black flex flex-col h-[620px] relative select-none">
        {/* Status Bar */}
        <div
          className={`px-6 pt-3 pb-1 flex justify-between items-center text-[11px] font-semibold z-40 ${
            platform === 'tiktok' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-current rounded-xs" />
            </div>
          </div>
        </div>

        {/* Platform Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          {platform === 'instagram' && (
            <InstagramMockup
              caption={caption}
              hashtags={formattedHashtags}
              mediaUrl={defaultImage}
            />
          )}

          {platform === 'facebook' && (
            <FacebookMockup
              caption={caption}
              hashtags={formattedHashtags}
              mediaUrl={defaultImage}
              title={title}
            />
          )}

          {platform === 'linkedin' && (
            <LinkedInMockup
              caption={caption}
              hashtags={formattedHashtags}
              mediaUrl={defaultImage}
              title={title}
            />
          )}

          {platform === 'tiktok' && (
            <TikTokMockup
              caption={caption}
              hashtags={formattedHashtags}
              mediaUrl={defaultImage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   INSTAGRAM MOCKUP
   ========================================================================= */
function InstagramMockup({
  caption,
  hashtags,
  mediaUrl
}: {
  caption: string;
  hashtags: string;
  mediaUrl: string;
}) {
  return (
    <div className="bg-white text-black flex flex-col min-h-full">
      {/* IG App Top Header Bar */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <BackIcon className="w-5 h-5 text-black" />
          <span className="font-bold text-sm font-sans tracking-tight">content_engine</span>
        </div>
        <div className="flex items-center gap-4">
          <HeartIcon className="w-5 h-5 text-black" />
          <SendIcon className="w-5 h-5 text-black" />
        </div>
      </div>

      {/* IG Feed Post Card Header */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs border-2 border-white">
              CE
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-xs text-black">content_engine</span>
              <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
            </div>
            <span className="text-[10px] text-gray-500 block -mt-0.5">Original Audio</span>
          </div>
        </div>
        <MoreIcon className="w-4 h-4 text-gray-600" />
      </div>

      {/* Media Box */}
      <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl}
          alt="Post preview"
          className="w-full h-full object-cover"
        />
      </div>

      {/* IG Post Actions Bar */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <HeartIcon className="w-6 h-6 text-black hover:text-red-500 transition-colors cursor-pointer" />
          <CommentIcon className="w-6 h-6 text-black -rotate-90 cursor-pointer" />
          <SendIcon className="w-6 h-6 text-black cursor-pointer" />
        </div>
        <BookmarkIcon className="w-6 h-6 text-black cursor-pointer" />
      </div>

      {/* Likes line */}
      <div className="px-3 pb-1">
        <span className="text-xs font-semibold text-black">Liked by alex_design and 1,420 others</span>
      </div>

      {/* Caption & Hashtags Block */}
      <div className="px-3 pb-3 space-y-1 text-xs">
        <p className="leading-relaxed">
          <span className="font-semibold text-black mr-1.5">content_engine</span>
          <span className="text-gray-900 whitespace-pre-line">{caption}</span>
        </p>

        {hashtags && (
          <p className="text-[#00376B] font-medium text-xs break-words">{hashtags}</p>
        )}

        <div className="pt-1 text-gray-400 text-[10px] uppercase tracking-wide">
          2 HOURS AGO • SEE TRANSLATION
        </div>
      </div>

      {/* IG Bottom Navigation Bar */}
      <div className="mt-auto border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-white text-black">
        <HomeIcon className="w-5 h-5 fill-black stroke-black" />
        <SearchIcon className="w-5 h-5" />
        <PlusIcon className="w-5 h-5 p-0.5 border-2 border-black rounded-lg" />
        <ExploreIcon className="w-5 h-5" />
        <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[9px] font-bold">
          CE
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   FACEBOOK MOCKUP
   ========================================================================= */
function FacebookMockup({
  caption,
  hashtags,
  mediaUrl,
  title
}: {
  caption: string;
  hashtags: string;
  mediaUrl: string;
  title: string;
}) {
  return (
    <div className="bg-[#F0F2F5] text-black flex flex-col min-h-full">
      {/* FB App Header Bar */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <span className="text-xl font-black tracking-tight text-[#0866FF] font-sans">facebook</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <SearchIcon className="w-4 h-4 text-black" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <CommentIcon className="w-4 h-4 text-black" />
          </div>
        </div>
      </div>

      {/* Post Container Card */}
      <div className="bg-white mt-2 border-y border-gray-200 shadow-sm">
        {/* Post Header */}
        <div className="p-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#0866FF] text-white flex items-center justify-center font-bold text-xs">
              CE
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-gray-900">{title}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <span>2 hrs ago</span>
                <span>•</span>
                <GlobeIcon className="w-3 h-3" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <MoreIcon className="w-4 h-4" />
            <CloseIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Caption Body */}
        <div className="px-3 pb-2 text-xs text-gray-900 leading-relaxed space-y-1">
          <p className="whitespace-pre-line">{caption}</p>
          {hashtags && <p className="text-[#0866FF] font-medium">{hashtags}</p>}
        </div>

        {/* Media Container */}
        <div className="w-full bg-gray-100 max-h-[280px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl} alt="FB media preview" className="w-full h-full object-cover" />
        </div>

        {/* Reaction Counts Row */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-[#0866FF] flex items-center justify-center text-[8px] text-white font-bold">
                👍
              </div>
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold">
                ❤️
              </div>
            </div>
            <span>1.2K</span>
          </div>
          <div className="flex gap-2">
            <span>234 comments</span>
            <span>•</span>
            <span>89 shares</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="px-2 py-1 flex items-center justify-around text-gray-600 text-xs font-semibold">
          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-md">
            <LikeIcon className="w-4 h-4" />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-md">
            <CommentIcon className="w-4 h-4" />
            <span>Comment</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-md">
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* FB Bottom Nav */}
      <div className="mt-auto bg-white border-t border-gray-200 px-4 py-2.5 flex justify-between items-center text-gray-500">
        <HomeIcon className="w-5 h-5 text-[#0866FF]" />
        <NetworkIcon className="w-5 h-5" />
        <BellIcon className="w-5 h-5" />
        <UserIcon className="w-5 h-5" />
      </div>
    </div>
  );
}

/* =========================================================================
   LINKEDIN MOCKUP
   ========================================================================= */
function LinkedInMockup({
  caption,
  hashtags,
  mediaUrl,
  title
}: {
  caption: string;
  hashtags: string;
  mediaUrl: string;
  title: string;
}) {
  return (
    <div className="bg-[#F3F2EF] text-black flex flex-col min-h-full">
      {/* LinkedIn Top Header */}
      <div className="bg-white px-3 py-2 border-b border-gray-200 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[10px] font-bold">
          CE
        </div>
        <div className="flex-1 bg-[#EDF3F8] rounded-md px-3 py-1 flex items-center gap-2 text-xs text-gray-500">
          <SearchIcon className="w-3.5 h-3.5" />
          <span>Search</span>
        </div>
        <CommentIcon className="w-5 h-5 text-gray-600" />
      </div>

      {/* Post Card */}
      <div className="bg-white mt-2 border-y border-gray-200 shadow-sm">
        {/* Post Header */}
        <div className="p-3 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-sm">
              CE
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-gray-900">{title}</span>
                <span className="text-[10px] text-gray-400">• 1st</span>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-1">
                AI-Powered Content Multiplier & Publishing Engine
              </p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                <span>1h • Edited •</span>
                <GlobeIcon className="w-3 h-3" />
              </div>
            </div>
          </div>
          <button className="text-[#0A66C2] font-semibold text-xs flex items-center gap-0.5 hover:bg-blue-50 px-2 py-1 rounded">
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Follow</span>
          </button>
        </div>

        {/* Text Body */}
        <div className="px-3 pb-2 text-xs text-gray-900 leading-relaxed space-y-1">
          <p className="whitespace-pre-line">{caption}</p>
          {hashtags && <p className="text-[#0A66C2] font-semibold">{hashtags}</p>}
        </div>

        {/* Media */}
        <div className="w-full bg-gray-100 max-h-[260px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl} alt="LinkedIn preview" className="w-full h-full object-cover" />
        </div>

        {/* Social Counts */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[7px]">👍</span>
              <span className="w-3.5 h-3.5 rounded-full bg-green-600 text-white flex items-center justify-center text-[7px]">👏</span>
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[7px]">❤️</span>
            </div>
            <span>482</span>
          </div>
          <span>38 comments • 12 reposts</span>
        </div>

        {/* Actions Bar */}
        <div className="px-1 py-1 flex items-center justify-between text-gray-600 text-[11px] font-semibold">
          <button className="flex-1 py-1.5 flex justify-center items-center gap-1 hover:bg-gray-100 rounded">
            <LikeIcon className="w-3.5 h-3.5" />
            <span>Like</span>
          </button>
          <button className="flex-1 py-1.5 flex justify-center items-center gap-1 hover:bg-gray-100 rounded">
            <CommentIcon className="w-3.5 h-3.5" />
            <span>Comment</span>
          </button>
          <button className="flex-1 py-1.5 flex justify-center items-center gap-1 hover:bg-gray-100 rounded">
            <RepostIcon className="w-3.5 h-3.5" />
            <span>Repost</span>
          </button>
          <button className="flex-1 py-1.5 flex justify-center items-center gap-1 hover:bg-gray-100 rounded">
            <SendIcon className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="mt-auto bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center text-gray-500 text-[10px]">
        <div className="flex flex-col items-center gap-0.5 text-black font-semibold">
          <HomeIcon className="w-4 h-4" />
          <span>Home</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <NetworkIcon className="w-4 h-4" />
          <span>My Network</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <PlusIcon className="w-4 h-4 p-0.5 border border-current rounded" />
          <span>Post</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <BellIcon className="w-4 h-4" />
          <span>Notifications</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <JobsIcon className="w-4 h-4" />
          <span>Jobs</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TIKTOK MOCKUP
   ========================================================================= */
function TikTokMockup({
  caption,
  hashtags,
  mediaUrl
}: {
  caption: string;
  hashtags: string;
  mediaUrl: string;
}) {
  return (
    <div className="bg-black text-white flex flex-col h-full relative overflow-hidden font-sans">
      {/* Background Media */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl}
        alt="TikTok background media"
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      />

      {/* Top Gradient Overlay */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />

      {/* TikTok Top Tab Bar */}
      <div className="relative z-20 pt-2 px-4 flex items-center justify-between">
        <div className="w-6" />
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-white/60">Following</span>
          <span className="text-white border-b-2 border-white pb-0.5">For You</span>
        </div>
        <SearchIcon className="w-5 h-5 text-white" />
      </div>

      {/* Right Interaction Sidebar */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5">
        {/* Profile Avatar with + button */}
        <div className="relative mb-2">
          <div className="w-10 h-10 rounded-full border-2 border-white bg-red-500 text-white flex items-center justify-center font-bold text-xs">
            CE
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            +
          </div>
        </div>

        {/* Heart / Like */}
        <div className="flex flex-col items-center gap-1">
          <HeartIcon className="w-7 h-7 text-white fill-white/20 hover:text-red-500 cursor-pointer" />
          <span className="text-[10px] font-bold">45.2K</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <CommentIcon className="w-7 h-7 text-white fill-white/20 cursor-pointer" />
          <span className="text-[10px] font-bold">1,280</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center gap-1">
          <BookmarkIcon className="w-7 h-7 text-white fill-white/20 cursor-pointer" />
          <span className="text-[10px] font-bold">3,410</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <ShareIcon className="w-7 h-7 text-white fill-white/20 cursor-pointer" />
          <span className="text-[10px] font-bold">892</span>
        </div>

        {/* Spinning Disc / Vinyl Record */}
        <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center animate-spin mt-2">
          <div className="w-3 h-3 rounded-full bg-white" />
        </div>
      </div>

      {/* Bottom Gradient Overlay & Caption Info */}
      <div className="mt-auto relative z-20 p-4 pb-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pr-16 space-y-2">
        <div className="font-bold text-sm tracking-wide flex items-center gap-1">
          <span>@contentengine</span>
          <span className="w-3 h-3 rounded-full bg-[#20D5EC] text-black flex items-center justify-center text-[8px]">✓</span>
        </div>

        <p className="text-xs text-white/95 line-clamp-3 leading-snug font-sans">
          {caption}
        </p>

        {hashtags && (
          <p className="text-xs font-bold text-white tracking-tight">{hashtags}</p>
        )}

        {/* Audio Track marquee */}
        <div className="flex items-center gap-2 text-[11px] text-white/80 pt-1">
          <MusicIcon className="w-3.5 h-3.5 animate-pulse" />
          <div className="overflow-hidden whitespace-nowrap text-[10px]">
            <span>original sound - Content Engine Studio</span>
          </div>
        </div>
      </div>

      {/* TikTok Bottom Navigation Bar */}
      <div className="relative z-20 border-t border-white/10 px-6 py-2.5 flex items-center justify-between bg-black text-white text-[10px]">
        <div className="flex flex-col items-center gap-0.5">
          <HomeIcon className="w-5 h-5 text-white" />
          <span>Home</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-white/60">
          <NetworkIcon className="w-5 h-5" />
          <span>Friends</span>
        </div>
        <div className="w-10 h-6 bg-gradient-to-r from-[#20D5EC] to-[#FE2C55] rounded-lg flex items-center justify-center p-0.5 cursor-pointer">
          <div className="w-full h-full bg-white rounded-md flex items-center justify-center text-black font-bold text-xs">
            +
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-white/60">
          <CommentIcon className="w-5 h-5" />
          <span>Inbox</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-white/60">
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
}
