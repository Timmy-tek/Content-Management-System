import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Plus,
  Search,
  Grid,
  List,
  MoreHorizontal,
  ArrowUpRight,
  FileText,
  Radio,
  Sparkles,
} from 'lucide-react';
import { getMockPosts, getMockConnections } from '@/lib/mock-data';

export const revalidate = 0;

export default async function DashboardPage() {
  const posts = getMockPosts();
  const connections = getMockConnections();

  const initialPosts = [
    {
      id: 'post-1',
      title: 'How Generative AI Changes Social Media Strategy in 2025',
      content:
        'Generative AI is shifting social media strategy from manual distribution to hyper-contextual platform adaptations...',
      status: 'Published',
      statusBg: 'bg-[#D2F3D0] text-[#0E520A]',
      platforms: ['instagram', 'linkedin', 'tiktok', 'facebook'],
      platformCount: '4 Platforms',
    },
    {
      id: 'post-2',
      title: 'Scaling Engineering Culture in Remote-First Companies',
      content:
        'Building a strong engineering culture without a physical office requires deliberate asynchronous communication and structured RFCs...',
      status: 'Published',
      statusBg: 'bg-[#D2F3D0] text-[#0E520A]',
      platforms: ['linkedin', 'instagram'],
      platformCount: '2 Platforms',
    },
    {
      id: 'post-3',
      title: 'The Design System Playbook: From Figma Tokens to Tailwind UI',
      content:
        'Connecting design tokens in Figma directly to Tailwind CSS configuration automates UI updates across web and mobile platforms...',
      status: 'Scheduled',
      statusBg: 'bg-[#FFE8B3] text-[#6B4B00]',
      platforms: ['instagram', 'linkedin', 'tiktok'],
      platformCount: '3 Platforms',
    },
    {
      id: 'post-4',
      title: 'Why Next.js 14 App Router + Server Actions are Revolutionizing Fullstack',
      content:
        'Server Actions bring RPC-like simplicity back to web applications. By running server code directly from component actions, network boilerplate is eliminated...',
      status: 'Pending Review',
      statusBg: 'bg-[#FFE2C7] text-[#7A3500]',
      platforms: ['linkedin', 'instagram', 'tiktok', 'facebook'],
      platformCount: '4 Platforms',
    },
    {
      id: 'post-5',
      title: 'Building AI Agent Frameworks with Zero Latency Overhead',
      content:
        'LLM latency is the bottleneck of modern AI agent UX. By implementing streaming response pipelines and optimistic UI, perceived speed increases 5x...',
      status: 'Draft',
      statusBg: 'bg-[#E5E5E5] text-[#444444]',
      platforms: ['linkedin', 'instagram'],
      platformCount: '2 Platforms',
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-inter text-[#111111]">
      {/* =========================================================================
          HERO METRIC BANNER (RonDesignLab Style)
          ========================================================================= */}
      <div className="bg-[#EAE8E1]/80 rounded-[32px] p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Main Reach Metric */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#111111] shadow-sm border border-black/5 mt-1">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#666666] font-space block mb-1">
                Total Multi-Channel Audience Reach
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black font-space tracking-tight text-[#111111] tabular-nums">
                  294,100
                </span>
                <span className="inline-flex items-center gap-1 bg-[#D2F3D0] text-[#0E520A] text-xs font-bold px-2.5 py-1 rounded-full font-space">
                  <TrendingUp className="w-3.5 h-3.5" /> +28.9%
                </span>
              </div>
            </div>
          </div>

          {/* Account Meta Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 text-xs font-medium text-[#444444] shadow-sm">
              Account <strong className="text-[#111111] font-semibold">Content Engine Lab</strong>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 text-xs font-medium text-[#444444] shadow-sm">
              Pipeline ID <strong className="text-[#111111] font-semibold">CE-4905</strong>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 text-xs font-medium text-[#444444] shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Status <strong className="text-[#111111] font-semibold">Multi-Channel Active</strong>
            </div>
          </div>
        </div>

        {/* Pipeline Progress Bar Row */}
        <div className="pt-4 border-t border-black/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#B9F5B0] text-[#0A4D07] text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-space">
              <span className="w-2 h-2 rounded-full bg-[#0A4D07]" />
              50000 Published
            </div>
            <div className="bg-[#FFEAA5] text-[#5C4200] text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-space">
              <span className="w-2 h-2 rounded-full bg-[#5C4200]" />
              18000 In Review
            </div>
            <div className="bg-[#E0E0E0] text-[#333333] text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-space">
              <span className="w-2 h-2 rounded-full bg-[#555555]" />
              24000 AI Adapting
            </div>
          </div>

          {/* Segmented Pattern Bar & Action Button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-black/5">
              <div className="w-32 h-2 rounded-full bg-gradient-to-r from-[#10B981] via-[#F59E0B] to-[#3B82F6] opacity-80" />
            </div>

            <div className="bg-white px-3.5 py-1.5 rounded-full border border-black/5 text-xs font-semibold font-space text-[#444444]">
              Active Sync: 8 Days
            </div>

            <Link
              href="/posts/new"
              className="bg-[#111111] hover:bg-[#222222] text-white font-space font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Adaptation
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN SPLIT BODY SECTION
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* -----------------------------------------------------------------------
            LEFT PANEL: Folder Tab Content Grid (7/12 cols or 8/12 cols)
            ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Protruding Folder Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button className="bg-white text-[#111111] font-space font-bold text-xs px-5 py-3 rounded-t-2xl shadow-sm border-t border-x border-black/10 flex items-center gap-2 border-b-2 border-b-white -mb-px z-10">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              Adapted Lines
            </button>
            <button className="bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666] font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all">
              Master Docs
            </button>
            <button className="bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666] font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all">
              Templates
            </button>
            <button className="bg-[#E2E0D8]/60 hover:bg-[#E2E0D8] text-[#666666] font-space font-semibold text-xs px-5 py-3 rounded-t-2xl transition-all">
              Notes
            </button>
          </div>

          {/* Folder Content Box */}
          <div className="bg-white rounded-b-3xl rounded-tr-3xl p-6 shadow-sm border border-black/10 space-y-6">
            {/* Folder Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-space text-[#111111]">5</span>
                <span className="text-xs font-semibold text-[#666666] font-space uppercase tracking-wider">
                  Items in Pipeline
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Pill */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="w-full bg-[#F4F3EF] text-xs font-inter rounded-full pl-9 pr-4 py-2 border border-black/5 focus:outline-none focus:ring-1 focus:ring-black/20"
                  />
                </div>

                {/* Grid / List Switcher */}
                <div className="flex items-center bg-[#F4F3EF] p-1 rounded-full border border-black/5">
                  <button className="p-1.5 rounded-full bg-white shadow-sm text-[#111111]">
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-full text-[#777777] hover:text-[#111111]">
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#F8F7F3] rounded-[24px] p-5 border border-black/5 hover:border-black/15 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Card Top Row */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold font-space px-3 py-1 rounded-full ${post.statusBg}`}
                      >
                        {post.status}
                      </span>
                      <button className="text-[#888888] hover:text-[#111111] p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Post Title */}
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="text-sm font-bold font-space text-[#111111] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt Preview */}
                    <p className="text-xs text-[#555555] font-inter line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Platform Icons */}
                      <div className="flex items-center -space-x-1">
                        <span className="w-5 h-5 rounded-full bg-[#E4405F] text-white flex items-center justify-center text-[9px] font-bold">
                          IG
                        </span>
                        <span className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[9px] font-bold">
                          LI
                        </span>
                        {post.platforms.includes('tiktok') && (
                          <span className="w-5 h-5 rounded-full bg-[#000000] text-white flex items-center justify-center text-[9px] font-bold">
                            TT
                          </span>
                        )}
                        {post.platforms.includes('facebook') && (
                          <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold">
                            FB
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#666666] font-space">
                        {post.platformCount}
                      </span>
                      <Link
                        href={`/posts/${post.id}`}
                        className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            RIGHT PANEL: Activity & Schedule Stack (5/12 cols or 4/12 cols)
            ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Protruding Tab Header */}
          <div className="flex items-center justify-between">
            <div className="bg-white text-[#111111] font-space font-bold text-xs px-5 py-3 rounded-t-2xl shadow-sm border-t border-x border-black/10 border-b-2 border-b-white -mb-px z-10 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#2563EB]" />
              Activity & Schedule
            </div>
            <span className="text-xs font-bold text-[#666666] font-space px-3 py-1">
              12 Activities
            </span>
          </div>

          {/* Schedule Container */}
          <div className="bg-white rounded-b-3xl rounded-tr-3xl p-6 shadow-sm border border-black/10 space-y-5">
            {/* Quick Action Shortcuts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#E4405F]" />
                + IG
              </button>
              <button className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#0A66C2]" />
                + LI
              </button>
              <button className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#000000]" />
                + TT
              </button>
              <button className="bg-[#F4F3EF] hover:bg-[#EBEADF] text-[#111111] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 font-space transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                + FB
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] font-space">
                Upcoming Dispatch Queue
              </h4>
              <p className="text-[11px] text-[#666666] font-inter">
                Scheduled platform publications & human review approvals.
              </p>
            </div>

            {/* Stacked Wavy Pastel Cards */}
            <div className="space-y-3">
              {/* Lavender Card */}
              <div className="bg-[#EBE5FF] rounded-[20px] p-4 space-y-3 border border-black/5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-space text-[#4F339B] flex items-center gap-1">
                    <Radio className="w-3 h-3" /> 12 Feb @ 9:00 PM
                  </span>
                  <span className="text-[10px] font-bold font-space bg-white/70 px-2 py-0.5 rounded-full text-[#4F339B]">
                    Instagram Reel
                  </span>
                </div>
                <h5 className="text-xs font-bold font-space text-[#111111]">
                  Send Payment & Review Reminder
                </h5>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[9px] font-bold">
                      JJ
                    </div>
                    <span className="text-[11px] font-medium text-[#4F339B]">
                      Jessi Johnson (Editor)
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#4F339B]" />
                </div>
              </div>

              {/* Soft Yellow Card */}
              <div className="bg-[#FFF8D6] rounded-[20px] p-4 space-y-3 border border-black/5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-space text-[#6B5200] flex items-center gap-1">
                    <Radio className="w-3 h-3" /> 13 Feb @ 11:30 AM
                  </span>
                  <span className="text-[10px] font-bold font-space bg-white/70 px-2 py-0.5 rounded-full text-[#6B5200]">
                    LinkedIn
                  </span>
                </div>
                <h5 className="text-xs font-bold font-space text-[#111111]">
                  Call about contract & Q3 Expansion RFC
                </h5>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#EAB308] text-white flex items-center justify-center text-[9px] font-bold">
                      BC
                    </div>
                    <span className="text-[11px] font-medium text-[#6B5200]">
                      Brian Carpenter
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#6B5200]" />
                </div>
              </div>

              {/* Mint Green Card */}
              <div className="bg-[#D8F5E5] rounded-[20px] p-4 space-y-3 border border-black/5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-space text-[#0A522A] flex items-center gap-1">
                    <Radio className="w-3 h-3" /> 14 Feb @ 4:00 PM
                  </span>
                  <span className="text-[10px] font-bold font-space bg-white/70 px-2 py-0.5 rounded-full text-[#0A522A]">
                    TikTok
                  </span>
                </div>
                <h5 className="text-xs font-bold font-space text-[#111111]">
                  Viral Trend Script & AI Audio Overdub
                </h5>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[9px] font-bold">
                      CE
                    </div>
                    <span className="text-[11px] font-medium text-[#0A522A]">
                      Content Engine Bot
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#0A522A]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
