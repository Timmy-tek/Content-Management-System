'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  ImageIcon,
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image upload failed');

    return data.imageUrl;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sourceContent.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const newPostId = await addPost({
        title,
        contentType,
        sourceContent,
        goal,
        audience,
        selectedPlatforms,
        imageUrl,
      });

      router.push(`/posts/${newPostId}/review?animate=true`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong generating this post. Try again.';
      setError(message);
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
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow">
        <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted block">
          AI GENERATION WORKBENCH
        </span>
        <h1 className="text-2xl font-bold font-display text-foreground">
          New Content Engine Adaptation
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Upload or paste source content to trigger multi-channel AI adaptation and human review routing.
        </p>
      </div>

      {/* Surface Diagnostic Card Form */}
      <form onSubmit={handleGenerate} className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-surface-border card-shadow space-y-6">

        {/* Content Type Selector Chips */}
        <div>
          <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
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
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all font-display ${
                    isSelected
                      ? 'bg-header-dark text-white border-header-dark card-shadow'
                      : 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-accent-yellow' : 'text-muted'}`} />
                  <span>{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Title */}
        <div>
          <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
            2. Content Title or Topic Headline
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Scaling Engineering Culture in Remote-First Companies"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-foreground font-sans"
          />
        </div>

        {/* Source Content Drop / Text Area */}
        <div>
          <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
            3. Source Text or Script
          </label>
          <div className="relative">
            <textarea
              required
              rows={6}
              placeholder="Paste master article body, video transcript, audio show notes, or key talking points here..."
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl p-4 text-xs text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-foreground font-sans leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-muted bg-surface-card px-2.5 py-1 rounded-full border border-surface-border font-sans">
              <Upload className="w-3 h-3 text-foreground" />
              <span>Or drag .txt / .md file</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
            Cover Image (required for Instagram)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
            className="w-full text-xs font-sans text-muted file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:font-display file:bg-header-dark file:text-white hover:file:bg-black file:cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-3 relative w-full h-48 rounded-xl overflow-hidden border border-surface-border">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Campaign Goal & Target Audience Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
              Primary Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
              Target Audience Profile
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-sans"
            />
          </div>
        </div>

        {/* Target Platform Selection Chips */}
        <div>
          <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
            4. Target Adaptation Channels
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            {allPlatforms.map((p) => {
              const isSelected = selectedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-display transition-all border ${
                    isSelected
                      ? 'bg-header-dark text-white border-header-dark card-shadow'
                      : 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border'
                  }`}
                >
                  <PlatformBadge platform={p} size="sm" />
                  <span className="capitalize">{p}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent-yellow ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Action */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
          <span className="text-xs text-muted font-sans hidden sm:inline-block">
            Generation speed: ~2.1 seconds via Gemini Pro Engine
          </span>

          <button
            type="submit"
            disabled={isGenerating || !title.trim() || !sourceContent.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black disabled:opacity-50 font-bold text-xs px-7 py-3 rounded-full card-shadow transition-all font-display"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 text-accent-yellow animate-spin" />
                <span>Running Engine & Adapting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-accent-yellow" />
                <span>Generate & Route to Review</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="bg-rose-100 border border-rose-300 rounded-xl px-4 py-3 text-xs text-rose-800 font-sans">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
