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
    <div className="space-y-6 pb-16">
      {/* 1. Header Toolbar Control Dock */}
      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted block">
            MASTER REPOSITORY
          </span>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Content Master Library
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Browse and manage multi-platform adaptation history, drafts, and published assets.
          </p>
        </div>

        <Link
          href="/posts/new"
          className="inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black font-bold text-xs px-5 py-2.5 rounded-full card-shadow transition-all font-display shrink-0"
        >
          <Plus className="w-4 h-4 text-accent-yellow" />
          <span>New AI Adaptation</span>
        </Link>
      </div>

      {/* 2. Filter & View Controls Dock Bar */}
      <div className="bg-surface-card rounded-2xl p-4 border border-surface-border card-shadow space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by headline or source topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-full pl-9 pr-4 py-1.5 text-xs text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-foreground font-sans"
            />
          </div>

          {/* Grid vs Table Toggle */}
          <div className="bg-surface-muted p-1 rounded-full flex items-center gap-1 border border-surface-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-surface-card text-foreground card-shadow font-bold'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'table'
                  ? 'bg-surface-card text-foreground card-shadow font-bold'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Pill Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-border">
          <div className="flex items-center gap-1 text-xs text-muted font-display font-semibold mr-2">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </div>

          {/* Platform filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold font-display transition-all ${
                platformFilter === 'all'
                  ? 'bg-header-dark text-white'
                  : 'bg-surface-muted text-foreground hover:bg-surface-border'
              }`}
            >
              All Platforms
            </button>
            {allPlatforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatformFilter(p)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-display transition-all ${
                  platformFilter === p
                    ? 'bg-header-dark text-white'
                    : 'bg-surface-muted text-foreground hover:bg-surface-border'
                }`}
              >
                <PlatformBadge platform={p} size="sm" />
                <span className="capitalize">{p}</span>
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-surface-border hidden sm:block" />

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {allStatuses.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold font-display transition-all ${
                  statusFilter === st.id
                    ? 'bg-header-dark text-white'
                    : 'bg-surface-muted text-foreground hover:bg-surface-border'
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
        <div className="bg-surface-card rounded-3xl p-12 text-center border border-surface-border card-shadow space-y-4 max-w-lg mx-auto">
          <FileText className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-base font-bold font-display text-foreground">
            No posts match active filters
          </h3>
          <p className="text-xs text-muted">
            Try adjusting your search query or reset platform and status filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPlatformFilter('all');
              setStatusFilter('all');
            }}
            className="bg-header-dark text-white px-5 py-2 rounded-full text-xs font-bold font-display"
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
              className="bg-surface-card rounded-2xl p-5 border border-surface-border card-shadow hover:border-foreground/30 transition-all flex flex-col justify-between group h-64"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <StatusCapsule status={post.status} size="sm" />
                  <span className="text-[10px] text-muted font-mono">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <Link href={`/posts/${post.id}`}>
                  <h3 className="text-base font-bold font-display text-foreground group-hover:text-header-dark transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {post.sourceContent}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <div className="flex items-center -space-x-1.5">
                  {post.platforms.map((p) => (
                    <PlatformBadge key={p} platform={p} size="sm" />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={post.status === 'review' ? `/posts/${post.id}/review` : `/posts/${post.id}`}
                    className="w-7 h-7 rounded-full bg-surface-muted hover:bg-header-dark hover:text-white flex items-center justify-center transition-colors text-foreground"
                    title="View Details"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => deletePost(post.id)}
                    className="w-7 h-7 rounded-full hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors text-muted"
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
        <div className="bg-surface-card rounded-2xl border border-surface-border card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-[10px] font-bold font-display text-muted uppercase tracking-wider">
                  <th className="py-3 px-5">Content Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Channels</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-xs">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/posts/${post.id}`}
                        className="font-bold font-display text-foreground hover:underline block max-w-xs truncate"
                      >
                        {post.title}
                      </Link>
                      <span className="text-[10px] text-muted font-mono uppercase">
                        {post.contentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusCapsule status={post.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center -space-x-1">
                        {post.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} size="sm" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src={post.owner.avatar}
                          alt={post.owner.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs text-foreground">{post.owner.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={post.status === 'review' ? `/posts/${post.id}/review` : `/posts/${post.id}`}
                          className="w-7 h-7 rounded-full bg-surface-muted hover:bg-header-dark hover:text-white flex items-center justify-center transition-colors text-foreground"
                          title="Open Post"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => deletePost(post.id)}
                          className="w-7 h-7 rounded-full hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors text-muted"
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
    </div>
  );
}
