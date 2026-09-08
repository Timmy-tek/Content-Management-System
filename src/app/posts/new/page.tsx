'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Platform, Post } from '@/types';
import { PlatformBadge } from '@/components/PlatformBadge';
import {
  Upload,
  Sparkles,
  Check,
  FileText,
  Video,
  Headphones,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';

export default function NewPostPage() {
  const router = useRouter();
  const { addPost } = useApp();

  const [title, setTitle] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [contentType, setContentType] = useState<Post['contentType']>('article');
  const [goal, setGoal] = useState('Thought leadership & brand engagement');
  const [audience, setAudience] = useState('B2B Tech Leaders & Product Engineers');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'instagram',
    'linkedin',
    'tiktok',
    'facebook',
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sourceContent.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const newPostId = await addPost({
        title,
        contentType,
        sourceContent,
        goal,
        audience,
        selectedPlatforms,
      });

      router.push(`/posts/${newPostId}/review?animate=true`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating this post. Try again.');
      setIsGenerating(false);
    }
  };

  const contentTypes: { id: Post['contentType']; label: string; icon: React.ElementType }[] = [
    { id: 'article', label: 'Article / Blog', icon: FileText },
    { id: 'video', label: 'Video Transcript', icon: Video },
    { id: 'audio', label: 'Podcast Episode', icon: Headphones },
    { id: 'image', label: 'Visual Graphic', icon: ImageIcon },
  ];

  const allPlatforms: Platform[] = ['instagram', 'linkedin', 'tiktok', 'facebook'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-space text-[#111111]">
          New Content Engine Adaptation
        </h1>
        <p className="text-sm text-[#555555] font-inter mt-1">
          Upload or paste source content to trigger multi-channel AI adaptation and human review routing.
        </p>
      </div>

      {/* Surface 1 White Rounded Card Form */}
      <form onSubmit={handleGenerate} className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 space-y-6">

        {/* Content Type Selector Chips */}
        <div>
          <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
            1. Source Content Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {contentTypes.map((ct) => {
              const Icon = ct.icon;
              const isSelected = contentType === ct.id;
              return (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => setContentType(ct.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer font-space ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                      : 'bg-[#F2F1EF] text-[#222222] border-black/5 hover:bg-[#EAE8E4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E5F23A]' : 'text-[#666666]'}`} />
                  <span>{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Title */}
        <div>
          <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
            2. Content Title or Topic Headline
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Scaling Engineering Culture in Remote-First Companies"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#111111] placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all font-inter"
          />
        </div>

        {/* Source Content Drop / Text Area */}
        <div>
          <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
            3. Source Text or Script
          </label>
          <div className="relative">
            <textarea
              required
              rows={6}
              placeholder="Paste master article body, video transcript, audio show notes, or key talking points here..."
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl p-4 text-sm text-[#111111] placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all font-inter leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[11px] text-[#666666] bg-white/80 px-2.5 py-1 rounded-full border border-black/10 font-inter">
              <Upload className="w-3 h-3 text-[#111111]" />
              <span>Or drag .txt / .md file</span>
            </div>
          </div>
        </div>

        {/* Campaign Goal & Target Audience Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
              Primary Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] font-inter"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
              Target Audience Profile
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] font-inter"
            />
          </div>
        </div>

        {/* Target Platform Selection Chips */}
        <div>
          <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
            4. Target Adaptation Channels
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {allPlatforms.map((p) => {
              const isSelected = selectedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer font-space border ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                      : 'bg-[#F2F1EF] text-[#555555] border-black/5 hover:bg-[#EAE8E4]'
                  }`}
                >
                  <PlatformBadge platform={p} size="sm" />
                  <span className="capitalize">{p}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E5F23A] ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Action: Single Black Pill CTA */}
        <div className="pt-4 border-t border-black/5 flex items-center justify-between">
          <span className="text-xs text-[#666666] font-inter hidden sm:inline-block">
            Takes about 15-20 seconds — analyzing, then adapting per platform
          </span>

          <button
            type="submit"
            disabled={isGenerating || !title.trim() || !sourceContent.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] disabled:opacity-50 font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer font-space"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 text-[#E5F23A] animate-spin" />
                <span>Running Pipeline & Adapting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E5F23A]" />
                <span>Generate & Route to Review</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
        {error && (
            <div className="bg-[#F5A9A9]/20 border border-[#F5A9A9] rounded-2xl px-4 py-3 text-sm text-[#8B2C2C] font-inter">
              {error}
            </div>
        )}
      </form>
    </div>
  );
}
