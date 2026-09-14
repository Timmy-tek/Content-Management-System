'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Platform, PostStatus } from '@/types';
import { StatusCapsule } from '@/components/StatusCapsule';
import { PlatformBadge } from '@/components/PlatformBadge';
import {
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Filter,
  ArrowUpRight,
  Trash2,
  FileText
} from 'lucide-react';

export default function PostLibraryPage() {
  const { posts, deletePost } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.sourceContent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform =
      platformFilter === 'all' || post.platforms.includes(platformFilter);

    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const allPlatforms: Platform[] = ['instagram', 'linkedin', 'tiktok', 'facebook'];
  const allStatuses: { id: PostStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Statuses' },
    { id: 'published', label: 'Published' },
    { id: 'review', label: 'In Review' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'draft', label: 'Draft' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-space text-[#111111]">
            Content Master Library
          </h1>
          <p className="text-sm text-[#555555] font-inter mt-1">
            Browse and manage multi-platform adaptation history, drafts, and published assets.
          </p>
        </div>

        {/* Single Black Pill CTA */}
        <Link
          href="/posts/new"
          className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] font-bold text-sm px-6 py-3 rounded-full shadow-lg transition-all cursor-pointer font-space shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E5F23A]" />
          <span>New Adaptation</span>
        </Link>
      </div>

      {/* Filter & View Controls Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-black/5 border border-black/5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by headline or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F2F1EF] border border-black/10 rounded-full pl-10 pr-4 py-2 text-xs text-[#111111] placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#111111] font-inter"
            />
          </div>

          {/* Grid vs Table Toggle */}
          <div className="bg-[#F2F1EF] p-1 rounded-full flex items-center gap-1 border border-black/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#111111] shadow-sm font-bold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#111111] shadow-sm font-bold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pill Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-black/5">
          <div className="flex items-center gap-1.5 text-xs text-[#666666] font-space font-semibold mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Platform filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold font-space transition-all cursor-pointer ${
                platformFilter === 'all'
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F2F1EF] text-[#555555] hover:bg-[#E2E1DF]'
              }`}
            >
              All Platforms
            </button>
            {allPlatforms.map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-space transition-all cursor-pointer ${
                  platformFilter === p
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F2F1EF] text-[#555555] hover:bg-[#E2E1DF]'
                }`}
              >
                <PlatformBadge platform={p} size="sm" />
                <span className="capitalize">{p}</span>
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-black/10 hidden sm:block" />

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {allStatuses.map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold font-space transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F2F1EF] text-[#555555] hover:bg-[#E2E1DF]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Posts List View */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-black/5 space-y-4 max-w-lg mx-auto">
          <FileText className="w-10 h-10 text-[#777777] mx-auto" />
          <h3 className="text-lg font-bold font-space text-[#111111]">
            No posts match active filters
          </h3>
          <p className="text-xs text-[#666666] font-inter">
            Try adjusting your search query or reset platform and status filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPlatformFilter('all');
              setStatusFilter('all');
            }}
            className="bg-[#111111] text-white px-5 py-2 rounded-full text-xs font-bold font-space"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between hover:shadow-xl transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusCapsule status={post.status} size="sm" />
                  <span className="text-[11px] text-[#777777] font-inter">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <Link href={`/posts/${post.id}`}>
                  <h3 className="text-base font-bold font-space text-[#111111] group-hover:text-[#2E7BD1] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-xs text-[#555555] font-inter line-clamp-2 leading-relaxed">
                  {post.sourceContent}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center -space-x-1.5">
                  {post.platforms.map((p) => (
                    <PlatformBadge key={p} platform={p} size="sm" />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={post.status === 'review' ? `/posts/${post.id}/review` : `/posts/${post.id}`}
                    className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-0.5 font-space"
                  >
                    <span>View</span> <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-[#777777] hover:text-[#5C0A0A] p-1 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-[#F8F8F7] text-[11px] font-bold font-space text-[#555555] uppercase tracking-wider">
                  <th className="py-4 px-6">Content Title</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Channels</th>
                  <th className="py-4 px-4">Owner</th>
                  <th className="py-4 px-4">Created</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs font-inter">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={`/posts/${post.id}`}
                        className="font-bold font-space text-[#111111] hover:text-[#2E7BD1] transition-colors block max-w-xs truncate"
                      >
                        {post.title}
                      </Link>
                      <span className="text-[10px] text-[#777777] uppercase font-mono">
                        {post.contentType}
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
                        <Link
                          href={post.status === 'review' ? `/posts/${post.id}/review` : `/posts/${post.id}`}
                          className="font-bold font-space text-[#111111] hover:underline"
                        >
                          {post.status === 'review' ? 'Review' : 'Open'}
                        </Link>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-[#777777] hover:text-[#5C0A0A]"
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
    </div>
  );
}
