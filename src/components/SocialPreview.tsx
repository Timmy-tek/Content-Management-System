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
  Globe,
  Home,
  Search,
  PlusSquare,
  Film,
  User,
  Bell,
  Briefcase,
  Compass
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
      <div className="w-full max-w-[380px] mx-auto bg-black text-white rounded-[36px] overflow-hidden border border-neutral-800 shadow-2xl font-sans flex flex-col relative">
        {/* Phone Frame Status Bar Header */}
        <div className="px-6 pt-3 pb-1 flex justify-between items-center text-[10px] text-gray-300 font-semibold tracking-tight z-10">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 rounded-sm border border-gray-300 p-[1px]">
              <div className="w-full h-full bg-white rounded-px" />
            </div>
          </div>
        </div>

        {/* IG App Header */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-900 z-10">
          <div className="text-xl font-bold tracking-tight font-serif italic text-white">
            Instagram
          </div>
          <div className="flex items-center gap-4 text-white">
            <Heart className="w-5 h-5 cursor-pointer" />
            <MessageCircle className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        {/* User Post Header */}
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <Image
                src={authorAvatar}
                alt={authorName}
                width={30}
                height={30}
                className="w-7 h-7 rounded-full object-cover border border-black"
              />
            </div>
            <div>
              <span className="font-semibold text-xs flex items-center gap-1">
                contentengine.ai
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
              </span>
              <span className="text-[10px] text-gray-400 block leading-none">Original Audio</span>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
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
        <div className="p-3 pb-2 space-y-2 flex-grow">
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
              <p className="text-sky-400 text-[11px] font-medium">{formattedHashtags}</p>
            )}
          </div>

          <div className="text-[10px] text-neutral-500 uppercase tracking-wide pt-1">
            2 HOURS AGO
          </div>
        </div>

        {/* Bottom Platform Navigation Bar */}
        <div className="px-6 py-2.5 bg-black border-t border-neutral-900 flex justify-between items-center text-white">
          <Home className="w-5 h-5" />
          <Search className="w-5 h-5 text-gray-400" />
          <PlusSquare className="w-5 h-5 text-gray-400" />
          <Film className="w-5 h-5 text-gray-400" />
          <div className="w-5 h-5 rounded-full overflow-hidden border border-white">
            <Image src={authorAvatar} alt="Profile" width={20} height={20} className="object-cover w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'linkedin') {
    return (
      <div className="w-full max-w-[380px] mx-auto bg-[#1D2226] text-white rounded-[32px] overflow-hidden border border-neutral-800 shadow-2xl font-sans flex flex-col">
        {/* Phone Frame Status Bar Header */}
        <div className="px-6 pt-3 pb-1 flex justify-between items-center text-[10px] text-gray-300 font-semibold tracking-tight">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 rounded-sm border border-gray-300 p-[1px]">
              <div className="w-full h-full bg-white rounded-px" />
            </div>
          </div>
        </div>

        {/* Top Search Bar */}
        <div className="px-3 py-2 bg-[#1B1F23] flex items-center gap-2 border-b border-neutral-800">
          <Image src={authorAvatar} alt={authorName} width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
          <div className="flex-1 bg-[#283238] h-8 rounded-md px-3 flex items-center text-xs text-gray-400 gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </div>
          <MessageSquare className="w-5 h-5 text-gray-300" />
        </div>

        {/* Header Bar */}
        <div className="p-3 pb-2 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex gap-2.5">
              <Image
                src={authorAvatar}
                alt={authorName}
                width={38}
                height={38}
                className="w-9.5 h-9.5 rounded-full object-cover border border-neutral-700"
              />
              <div>
                <h4 className="font-semibold text-xs text-white leading-tight flex items-center gap-1">
                  {authorName}
                  <span className="text-[10px] text-gray-400 font-normal">• 1st</span>
                </h4>
                <p className="text-[10px] text-gray-400 line-clamp-1 leading-tight mt-0.5">
                  AI Content Adaptation & Scaled Social Operations
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                  <span>1d • Edited</span>
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
        <div className="px-3 py-2 border-b border-neutral-800 flex justify-between items-center text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[8px]">👏</span>
            <span>2,410</span>
          </div>
          <div>48 comments • 12 reposts</div>
        </div>

        {/* Action Buttons */}
        <div className="px-1 py-1 flex justify-around items-center text-xs text-gray-300 font-medium border-b border-neutral-800">
          <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" /> Like
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> Comment
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <Repeat className="w-3.5 h-3.5" /> Repost
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>

        {/* LinkedIn Bottom App Navigation */}
        <div className="px-4 py-2 bg-[#1B1F23] flex justify-between items-center text-gray-400 text-[9px] font-medium">
          <div className="flex flex-col items-center gap-0.5 text-white">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <User className="w-4 h-4" />
            <span>My Network</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <PlusSquare className="w-4 h-4" />
            <span>Post</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Briefcase className="w-4 h-4" />
            <span>Jobs</span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'tiktok') {
    return (
      <div className="w-full max-w-[380px] mx-auto bg-black text-white rounded-[36px] overflow-hidden border border-neutral-800 shadow-2xl relative aspect-[9/18] flex flex-col justify-between font-sans">
        {/* Background Image / Video Mock */}
        <Image
          src={displayImage}
          alt="TikTok Media background"
          fill
          className="object-cover opacity-85"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

        {/* Phone Frame Status Bar Header */}
        <div className="relative z-10 px-6 pt-3 pb-1 flex justify-between items-center text-[10px] text-gray-200 font-semibold tracking-tight">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 rounded-sm border border-gray-200 p-[1px]">
              <div className="w-full h-full bg-white rounded-px" />
            </div>
          </div>
        </div>

        {/* Top bar tabs */}
        <div className="relative z-10 px-4 pt-1 flex justify-between items-center text-xs font-semibold">
          <Compass className="w-5 h-5 text-gray-300" />
          <div className="flex gap-4 text-gray-300 text-xs">
            <span className="hover:text-white cursor-pointer">Following</span>
            <span className="text-white font-bold border-b-2 border-white pb-0.5">For You</span>
          </div>
          <Search className="w-5 h-5 text-gray-300" />
        </div>

        {/* Right Side Bar Action Icons */}
        <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4 text-white">
          <div className="relative mb-1">
            <Image
              src={authorAvatar}
              alt={authorName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white">
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

          <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-neutral-700 animate-spin flex items-center justify-center mt-1">
            <Music className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Bottom Overlay Info */}
        <div className="relative z-10 p-4 space-y-2 text-white max-w-[80%]">
          <h4 className="font-bold text-sm flex items-center gap-1">
            @contentengine.ai
            <span className="w-3 h-3 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[7px] font-bold">✓</span>
          </h4>
          <p className="text-xs text-neutral-100 line-clamp-3 leading-snug whitespace-pre-wrap">
            {caption}
          </p>
          {formattedHashtags && (
            <p className="text-xs font-bold text-white line-clamp-1">{formattedHashtags}</p>
          )}

          <div className="flex items-center gap-2 text-[11px] text-gray-200 font-medium pt-1">
            <Music className="w-3.5 h-3.5" />
            <span className="truncate">Original Sound - Content Engine Studio</span>
          </div>
        </div>

        {/* TikTok Bottom Navigation Bar */}
        <div className="relative z-10 px-4 py-2.5 bg-black border-t border-neutral-900 flex justify-between items-center text-gray-400 text-[9px] font-medium">
          <div className="flex flex-col items-center gap-0.5 text-white">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <User className="w-4 h-4" />
            <span>Friends</span>
          </div>
          <div className="w-9 h-6 bg-gradient-to-r from-cyan-400 via-white to-rose-500 rounded-md flex items-center justify-center text-black font-bold text-sm">
            +
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <MessageSquare className="w-4 h-4" />
            <span>Inbox</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Facebook
  return (
    <div className="w-full max-w-[380px] mx-auto bg-[#242526] text-white rounded-[32px] overflow-hidden border border-neutral-800 shadow-2xl font-sans flex flex-col">
      {/* Phone Frame Status Bar Header */}
      <div className="px-6 pt-3 pb-1 flex justify-between items-center text-[10px] text-gray-300 font-semibold tracking-tight">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">5G</span>
          <div className="w-4 h-2 rounded-sm border border-gray-300 p-[1px]">
            <div className="w-full h-full bg-white rounded-px" />
          </div>
        </div>
      </div>

      {/* Facebook App Header */}
      <div className="px-3 py-2 bg-[#242526] flex items-center justify-between border-b border-neutral-800">
        <span className="text-xl font-bold text-blue-500 tracking-tight">facebook</span>
        <div className="flex items-center gap-3 text-gray-300">
          <Search className="w-5 h-5 cursor-pointer" />
          <MessageSquare className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Header Post Details */}
      <div className="p-3 pb-2 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex gap-2.5 items-center">
            <Image
              src={authorAvatar}
              alt={authorName}
              width={38}
              height={38}
              className="w-9.5 h-9.5 rounded-full object-cover border border-neutral-700"
            />
            <div>
              <h4 className="font-semibold text-xs text-white leading-tight flex items-center gap-1">
                {authorName}
                <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] font-bold">✓</span>
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
      <div className="px-3 py-2 border-b border-neutral-800 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">👍</span>
          <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">❤️</span>
          <span>1.2K</span>
        </div>
        <div>142 Comments • 89 Shares</div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex justify-around items-center text-xs text-gray-300 font-medium border-b border-neutral-800">
        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <ThumbsUp className="w-4 h-4" /> Like
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <MessageSquare className="w-4 h-4" /> Comment
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      {/* Facebook Navigation Bar */}
      <div className="px-4 py-2 bg-[#242526] flex justify-between items-center text-gray-400 text-[9px] font-medium">
        <Home className="w-5 h-5 text-blue-500" />
        <Film className="w-5 h-5" />
        <User className="w-5 h-5" />
        <Bell className="w-5 h-5" />
        <div className="w-5 h-5 rounded-full border border-gray-400 overflow-hidden">
          <Image src={authorAvatar} alt="Profile" width={20} height={20} className="object-cover w-full h-full" />
        </div>
      </div>
    </div>
  );
}
