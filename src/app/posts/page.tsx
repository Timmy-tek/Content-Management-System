'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Platform, PostStatus, Post } from '@/types';
import { StatusCapsule } from '@/components/StatusCapsule';
import { PlatformBadge } from '@/components/PlatformBadge';
import { initialPosts as mockFallbackPosts } from '@/lib/mockData';
import {
  Plus,
  LayoutGrid,
  Kanban as KanbanIcon,
  Table as TableIcon,
  Search,
  Filter,
  ArrowUpRight,
  Trash2,
  FileText,
  Sparkles,
  Layers,
  Video,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  ChevronRight,
  Calendar,
  Pill
} from 'lucide-react';

export default function PostLibraryPage() {
  const { posts: contextPosts, deletePost } = useApp();

  // Fallback to mock data if context empty
  const activePosts = contextPosts.length > 0 ? contextPosts : mockFallbackPosts;

  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'table'>('kanban');
  const [activeFormatTab, setActiveFormatTab] = useState<'all' | 'image' | 'video' | 'text' | 'article'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all'); // 0 = Jan, 1 = Feb, etc.

  const months = [
    { num: 0, label: 'Jan' },
    { num: 1, label: 'Feb' },
    { num: 2, label: 'Mar' },
    { num: 3, label: 'Apr' },
    { num: 4, label: 'May' },
    { num: 5, label: 'Jun' },
    { num: 6, label: 'Jul' },
    { num: 7, label: 'Aug' },
    { num: 8, label: 'Sep' },
    { num: 9, label: 'Oct' },
    { num: 10, label: 'Nov' },
    { num: 11, label: 'Dec' },
  ];

  // Helper to count posts per month
  const getMonthCount = (monthNum: number) => {
    return activePosts.filter((post) => {
      const d = new Date(post.createdAt);
      return d.getMonth() === monthNum;
    }).length;
  };

  // Filter posts
  const filteredPosts = activePosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.sourceContent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform =
      platformFilter === 'all' || post.platforms.includes(platformFilter);

    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;

    const matchesFormat =
      activeFormatTab === 'all' || post.contentType === activeFormatTab;

    const matchesMonth =
      selectedMonth === 'all' || new Date(post.createdAt).getMonth() === selectedMonth;

    return matchesSearch && matchesPlatform && matchesStatus && matchesFormat && matchesMonth;
  });

  const allPlatforms: Platform[] = ['instagram', 'linkedin', 'tiktok', 'facebook'];
  const allStatuses: { id: PostStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Statuses' },
    { id: 'draft', label: 'Drafts' },
    { id: 'review', label: 'Pending Review' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'published', label: 'Published' },
  ];

  // Pipeline metrics calculations
  const totalCount = activePosts.length;
  const draftCount = activePosts.filter((p) => p.status === 'draft').length;
  const reviewCount = activePosts.filter((p) => p.status === 'review').length;
  const scheduledCount = activePosts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = activePosts.filter((p) => p.status === 'published').length;

  // Kanban column definitions
  const kanbanColumns: {
    status: PostStatus;
    title: string;
    bgHeader: string;
    badgeBg: string;
    icon: React.ReactNode;
  }[] = [
    {
      status: 'draft',
      title: 'Drafts & Ideas',
      bgHeader: 'bg-[#F2EFF8]',
      badgeBg: 'bg-[#E0D9EF] text-[#4A3075]',
      icon: <FileText className="w-4 h-4 text-[#4A3075]" />,
    },
    {
      status: 'review',
      title: 'In Review & Approval',
      bgHeader: 'bg-[#EBE5FF]',
      badgeBg: 'bg-[#D6C7FF] text-[#3D1D85]',
      icon: <Clock className="w-4 h-4 text-[#3D1D85]" />,
    },
    {
      status: 'scheduled',
      title: 'Scheduled Queue',
      bgHeader: 'bg-[#FFF8D6]',
      badgeBg: 'bg-[#FFE280] text-[#6B5200]',
      icon: <Send className="w-4 h-4 text-[#6B5200]" />,
    },
    {
      status: 'published',
      title: 'Published Live',
      bgHeader: 'bg-[#D8F5E5]',
      badgeBg: 'bg-[#A3EBBF] text-[#0A522A]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#0A522A]" />,
    },
  ];

  // Helper for card background tint
  const getCardBg = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-[#EBF7EF] border-[#BCE8C9]';
      case 'scheduled':
        return 'bg-[#FFFBEB] border-[#FDE68A]';
      case 'review':
        return 'bg-[#F3E8FF] border-[#DDD6FE]';
      default:
        return 'bg-[#F8F7F3] border-black/10';
    }
  };

  // Helper for workflow CTA button
  const renderWorkflowCta = (post: Post) => {
    if (post.status === 'review') {
      return (
        <Link
          href={`/posts/${post.id}/review`}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-space font-bold text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm shrink-0"
        >
          <span>Review & Approve</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      );
    }
    if (post.status === 'approved' || post.status === 'scheduled') {
      return (
        <Link
          href={`/posts/${post.id}/publish`}
          className="bg-[#D97706] hover:bg-[#B45309] text-white font-space font-bold text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm shrink-0"
        >
          <span>Publish Dispatch</span>
          <Send className="w-3 h-3" />
        </Link>
      );
    }
    if (post.status === 'published') {
      return (
        <Link
          href={`/posts/${post.id}`}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-space font-bold text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm shrink-0"
        >
          <span>View Performance</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      );
    }
    return (
      <Link
        href={`/posts/${post.id}`}
        className="bg-[#111111] hover:bg-[#333333] text-white font-space font-bold text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm shrink-0"
      >
        <span>Open Post</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    );
  };

  return (
    <div className="space-y-8 pb-28 font-inter text-[#111111] relative">
      {/* =========================================================================
          HERO METRIC BAR (Un-carded, directly on light background)
          ========================================================================= */}
      <div className="pt-2 pb-2 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#666666] font-space">
                Multi-Platform Catalog
              </span>
              <span className="bg-[#E2E8F0] text-[#334155] text-[10px] font-bold font-space px-2 py-0.5 rounded-full">
                {totalCount} Active Items
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-space text-[#111111] tracking-tight">
              Content Master Library
            </h1>
            <p className="text-xs text-[#555555] font-inter mt-1 max-w-xl">
              Centralized repository for AI-adapted social posts, multi-channel review workflows, and dispatch histories.
            </p>
          </div>

          {/* Primary CTA */}
          <Link
            href="/posts/new"
            className="inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white font-space font-bold text-xs px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E5F23A]" />
            <span>New Adaptation</span>
          </Link>
        </div>

        {/* Metric Bar Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-black/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold font-space text-[#777777] uppercase tracking-wider block">Draft Ideas</span>
              <span className="text-2xl font-black font-space text-[#111111]">{draftCount}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#F2EFF8] text-[#4A3075] flex items-center justify-center font-bold font-space text-xs">
              {Math.round((draftCount / (totalCount || 1)) * 100)}%
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-black/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold font-space text-[#777777] uppercase tracking-wider block">In Review</span>
              <span className="text-2xl font-black font-space text-[#3D1D85]">{reviewCount}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#EBE5FF] text-[#3D1D85] flex items-center justify-center font-bold font-space text-xs">
              {Math.round((reviewCount / (totalCount || 1)) * 100)}%
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-black/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold font-space text-[#777777] uppercase tracking-wider block">Scheduled</span>
              <span className="text-2xl font-black font-space text-[#6B5200]">{scheduledCount}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#FFF8D6] text-[#6B5200] flex items-center justify-center font-bold font-space text-xs">
              {Math.round((scheduledCount / (totalCount || 1)) * 100)}%
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-black/10 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold font-space text-[#777777] uppercase tracking-wider block">Published Live</span>
              <span className="text-2xl font-black font-space text-[#0A522A]">{publishedCount}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#D8F5E5] text-[#0A522A] flex items-center justify-center font-bold font-space text-xs">
              {Math.round((publishedCount / (totalCount || 1)) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR: Social Format Folder Tabs + Search + View Switcher
          ========================================================================= */}
      <div className="space-y-4">
        {/* Protruding Social Format Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFormatTab('all')}
            className={`font-space font-bold text-xs px-5 py-3 rounded-t-2xl shadow-sm border-t border-x border-black/10 flex items-center gap-2 transition-all cursor-pointer ${
              activeFormatTab === 'all'
                ? 'bg-white text-[#111111] border-b-2 border-b-white -mb-px z-10'
                : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            All Content Assets
          </button>
          <button
            onClick={() => setActiveFormatTab('image')}
            className={`font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeFormatTab === 'image'
                ? 'bg-white text-[#111111] border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 font-bold'
                : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#E4405F]" />
            Carousels & Graphics
          </button>
          <button
            onClick={() => setActiveFormatTab('video')}
            className={`font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeFormatTab === 'video'
                ? 'bg-white text-[#111111] border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 font-bold'
                : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#000000]" />
            Short Video / Reels
          </button>
          <button
            onClick={() => setActiveFormatTab('text')}
            className={`font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeFormatTab === 'text'
                ? 'bg-white text-[#111111] border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 font-bold'
                : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#0A66C2]" />
            Threads & Text
          </button>
          <button
            onClick={() => setActiveFormatTab('article')}
            className={`font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeFormatTab === 'article'
                ? 'bg-white text-[#111111] border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 font-bold'
                : 'bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#1877F2]" />
            Longform Articles
          </button>
        </div>

        {/* Filter Box */}
        <div className="bg-white rounded-b-3xl rounded-tr-3xl p-5 shadow-sm border border-black/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search headlines, captions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F3EF] border border-black/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-black/20 font-inter"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#F4F3EF] p-1 rounded-full border border-black/5 self-start md:self-auto shrink-0">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-space transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#111111] shadow-sm font-bold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
                title="Kanban Board View"
              >
                <KanbanIcon className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-space transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#111111] shadow-sm font-bold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-space transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#111111] shadow-sm font-bold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
                title="Table Sheet View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>

          {/* Filter Pills Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-black/5">
            <div className="flex items-center gap-1.5 text-xs text-[#666666] font-space font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Channels:</span>
            </div>

            {/* Platform filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                  platformFilter === 'all'
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F4F3EF] text-[#555555] hover:bg-[#EBEADF]'
                }`}
              >
                All Channels
              </button>
              {allPlatforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                    platformFilter === p
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F4F3EF] text-[#555555] hover:bg-[#EBEADF]'
                  }`}
                >
                  <PlatformBadge platform={p} size="sm" />
                  <span className="capitalize">{p}</span>
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-black/10 hidden sm:block mx-1" />

            {/* Status filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {allStatuses.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F4F3EF] text-[#555555] hover:bg-[#EBEADF]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT AREA (Kanban Board / Grid / Table)
          ========================================================================= */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-black/10 space-y-4 max-w-lg mx-auto">
          <FileText className="w-10 h-10 text-[#777777] mx-auto" />
          <h3 className="text-lg font-bold font-space text-[#111111]">
            No posts match current filters
          </h3>
          <p className="text-xs text-[#666666] font-inter">
            Try adjusting your search query, content format tabs, timeline dock, or channel filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPlatformFilter('all');
              setStatusFilter('all');
              setActiveFormatTab('all');
              setSelectedMonth('all');
            }}
            className="bg-[#111111] text-white px-5 py-2.5 rounded-full text-xs font-bold font-space cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* =======================================================================
           KANBAN BOARD VIEW
           ======================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {kanbanColumns.map((col) => {
            const colPosts = filteredPosts.filter((p) => {
              if (col.status === 'review') {
                return p.status === 'review' || p.status === 'approved';
              }
              return p.status === col.status;
            });

            return (
              <div
                key={col.status}
                className="bg-[#F8F7F3] rounded-3xl p-4 border border-black/10 space-y-4 shadow-sm"
              >
                {/* Column Header */}
                <div className={`p-3.5 rounded-2xl ${col.bgHeader} flex items-center justify-between border border-black/5`}>
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <h3 className="text-xs font-black font-space text-[#111111]">
                      {col.title}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold font-space px-2.5 py-0.5 rounded-full ${col.badgeBg}`}>
                    {colPosts.length}
                  </span>
                </div>

                {/* Column Cards Stack */}
                <div className="space-y-3.5 min-h-[300px]">
                  {colPosts.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-black/10 rounded-2xl">
                      <span className="text-[11px] font-semibold text-[#888888] font-space">
                        No posts in {col.title.toLowerCase()}
                      </span>
                    </div>
                  ) : (
                    colPosts.map((post) => (
                      <div
                        key={post.id}
                        className={`rounded-2xl p-4.5 border transition-all hover:shadow-md space-y-3.5 ${getCardBg(
                          post.status
                        )}`}
                      >
                        {/* Card Top Hashtag Pills */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold font-space bg-white/80 text-[#111111] px-2.5 py-0.5 rounded-full border border-black/5">
                              #{post.contentType}
                            </span>
                            {post.platforms.slice(0, 2).map((p) => (
                              <span
                                key={p}
                                className="text-[10px] font-bold font-space bg-white/60 text-[#555555] px-2 py-0.5 rounded-full capitalize"
                              >
                                #{p}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-[#888888] hover:text-[#7A1C1C] transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Preview Excerpt */}
                        <div className="space-y-1.5">
                          <Link href={`/posts/${post.id}`}>
                            <h4 className="text-xs font-bold font-space text-[#111111] hover:text-[#2563EB] leading-snug line-clamp-2">
                              {post.title}
                            </h4>
                          </Link>
                          <p className="text-[11px] text-[#555555] font-inter line-clamp-2 leading-relaxed">
                            {post.sourceContent}
                          </p>
                        </div>

                        {/* Channel Readiness Dot Barcode Meter */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[10px] font-bold font-space text-[#666666]">
                            <span>Channel Readiness</span>
                            <span>
                              {post.platforms.length}/4 Channels
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {allPlatforms.map((p) => {
                              const isConnected = post.platforms.includes(p);
                              return (
                                <div
                                  key={p}
                                  title={`${p.toUpperCase()} ${isConnected ? 'Adapted' : 'Pending'}`}
                                  className={`h-2 flex-1 rounded-full transition-all ${
                                    isConnected ? 'bg-[#111111]' : 'bg-black/10'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Card Footer: Owner + Workflow Action CTA */}
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Image
                              src={post.owner.avatar}
                              alt={post.owner.name}
                              width={22}
                              height={22}
                              className="w-5 h-5 rounded-full object-cover border border-black/10"
                            />
                            <span className="text-[10px] font-medium text-[#444444] truncate max-w-[80px]">
                              {post.owner.name}
                            </span>
                          </div>

                          {renderWorkflowCta(post)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        /* =======================================================================
           GRID CARDS VIEW
           ======================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`rounded-3xl p-6 border transition-all hover:shadow-lg space-y-4 flex flex-col justify-between ${getCardBg(
                post.status
              )}`}
            >
              <div className="space-y-3">
                {/* Status Capsule + Date Stamp */}
                <div className="flex items-center justify-between">
                  <StatusCapsule status={post.status} size="sm" />
                  <span className="text-[11px] text-[#666666] font-space font-semibold">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <Link href={`/posts/${post.id}`}>
                  <h3 className="text-sm font-bold font-space text-[#111111] hover:text-[#2563EB] leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-xs text-[#555555] font-inter line-clamp-3 leading-relaxed">
                  {post.sourceContent}
                </p>

                {/* Hashtag pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold font-space bg-white/80 text-[#111111] px-2.5 py-0.5 rounded-full border border-black/5">
                    #{post.contentType}
                  </span>
                  {post.platforms.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-bold font-space bg-white/60 text-[#555555] px-2 py-0.5 rounded-full capitalize"
                    >
                      #{p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom Row */}
              <div className="pt-4 border-t border-black/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {post.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} size="sm" />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-[#777777] hover:text-[#7A1C1C] p-1"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={post.owner.avatar}
                      alt={post.owner.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-[#444444]">{post.owner.name}</span>
                  </div>

                  {renderWorkflowCta(post)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* =======================================================================
           TABLE SHEET VIEW
           ======================================================================= */
        <div className="bg-white rounded-3xl shadow-sm border border-black/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-[#F8F7F3] text-[11px] font-bold font-space text-[#555555] uppercase tracking-wider">
                  <th className="py-4 px-6">Content Headline</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Adapted Channels</th>
                  <th className="py-4 px-4">Author</th>
                  <th className="py-4 px-4">Created Date</th>
                  <th className="py-4 px-6 text-right">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs font-inter">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                    <td className="py-4 px-6 max-w-xs">
                      <Link
                        href={`/posts/${post.id}`}
                        className="font-bold font-space text-[#111111] hover:text-[#2563EB] transition-colors block truncate"
                      >
                        {post.title}
                      </Link>
                      <span className="text-[10px] text-[#777777] font-space uppercase">
                        #{post.contentType}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusCapsule status={post.status} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center -space-x-1">
                        {post.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} size="sm" />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src={post.owner.avatar}
                          alt={post.owner.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs text-[#222222]">{post.owner.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#666666]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {renderWorkflowCta(post)}
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-[#777777] hover:text-[#7A1C1C] p-1"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          FLOATING BOTTOM TIMELINE FILTER DOCK (Inspired by user attached image.png)
          ========================================================================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] sm:max-w-4xl w-full px-2">
        <div className="bg-[#EFECE6]/95 backdrop-blur-md border border-black/15 shadow-2xl rounded-full p-2 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none transition-all">
          {/* Year Indicator Pill */}
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-space font-bold text-xs shrink-0 transition-all cursor-pointer ${
              selectedMonth === 'all'
                ? 'bg-[#111111] text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-[#333333]'
            }`}
            title="Show All Months"
          >
            <Calendar className="w-3.5 h-3.5 text-[#E5F23A]" />
            <span>2025</span>
          </button>

          <div className="h-4 w-[1px] bg-black/15 shrink-0 my-auto" />

          {/* Month Buttons Bar */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {months.map((m) => {
              const count = getMonthCount(m.num);
              const isSelected = selectedMonth === m.num;

              return (
                <button
                  key={m.num}
                  onClick={() => setSelectedMonth(isSelected ? 'all' : m.num)}
                  className={`px-3 py-1.5 rounded-full text-xs font-space font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-[#111111] text-white shadow-md'
                      : count > 0
                      ? 'bg-white/70 hover:bg-white text-[#111111]'
                      : 'text-[#888888] hover:text-[#222222] hover:bg-white/40'
                  }`}
                >
                  <span>{m.label}</span>

                  {/* Badge Pills matching image.png style */}
                  {count > 0 && !isSelected && (
                    <span className="bg-[#E5F23A] text-[#111111] text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <FileText className="w-2.5 h-2.5" />
                      <span>{count}</span>
                    </span>
                  )}
                  {count > 0 && isSelected && (
                    <span className="bg-[#E5F23A] text-[#111111] text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <Pill className="w-2.5 h-2.5" />
                      <span>{count}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
