'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Platform, Post } from '@/types';
import { PlatformBadge } from '@/components/PlatformBadge';
import { checkPool, maxPoolItems } from '@/lib/mediaRules';
import type { MediaKind } from '@/lib/mediaRules';
import {
  Upload,
  Sparkles,
  Check,
  FileText,
  Video,
  Headphones,
  Image as ImageIcon,
  ArrowRight,
  X,
  GripVertical,
  Film,
  AlertTriangle
} from 'lucide-react';

interface MediaDraft {
  id: number;
  file: File;
  kind: MediaKind;
  previewUrl: string;
}

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
  const [generatingStage, setGeneratingStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [mediaItems, setMediaItems] = useState<MediaDraft[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const nextId = useRef(1);

  const allPlatforms: Platform[] = ['instagram', 'linkedin', 'tiktok', 'facebook'];
  const hasInstagram = selectedPlatforms.includes('instagram');
  const poolMax = maxPoolItems(selectedPlatforms);
  const poolError = checkPool(selectedPlatforms, mediaItems.map((i) => i.kind));

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const addFiles = (incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    setError(null);

    const added: MediaDraft[] = [];
    let rejection: string | null = null

    for (const file of files) {
      const kind: MediaKind | null = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
              ? 'video'
              : null;

      if (!kind) {
        rejection = `${file.name} isn't an image or a video.`;
        continue;
      }

      const kindsSoFar = [...mediaItems, ...added].map((i) => i.kind);
      const problem = checkPool(selectedPlatforms, [...kindsSoFar, kind]);
      if (problem) {
        rejection = problem;
        continue;
      }

      added.push({ id: nextId.current++, file, kind, previewUrl: URL.createObjectURL(file) });
    }

    if (added.length > 0) setMediaItems((prev) => [...prev, ...added]);
    if (rejection) setError(rejection);
  };

  const removeItem = (id: number) => {
    setMediaItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const reorderItems = (fromIndex: number, toIndex: number) => {
    setMediaItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('files', file);
    const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image upload failed');
    return data.imageUrls[0];
  }

  async function uploadVideo(file: File, onProgress: (pct: number) => void): Promise<string> {
    const signRes = await fetch('/api/videos/sign-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    });
    const signData = await signRes.json();
    if (!signRes.ok) throw new Error(signData.error || 'Could not prepare video upload');

    const { path, token, publicUrl } = signData;
    const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/post-videos/${path}?token=${token}`;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Video upload failed')));
      xhr.onerror = () => reject(new Error('Video upload failed. Check your connection and try again'));
      xhr.send(file);
    });

    return publicUrl;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sourceContent.trim() || poolError) return;

    setIsGenerating(true);
    setError(null);
    setGeneratingStage('');

    try {
      // Upload one at a time, in the user's order, so the order is kept exactly
      const uploaded: { url: string; mediaType: MediaKind }[] = [];
      const total = mediaItems.length;

      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        if (item.kind === 'image') {
          setGeneratingStage(`Uploading ${i + 1} of ${total}...`);
          uploaded.push({ url: await uploadImage(item.file), mediaType: 'image' });
        } else {
          const url = await uploadVideo(item.file, (pct) =>
              setGeneratingStage(`Uploading video ${i + 1} of ${total} (${pct}%)`)
          );
          uploaded.push({ url, mediaType: 'video' });
        }
      }

      setGeneratingStage('Running AI pipeline...');
      const newPostId = await addPost({
        title,
        contentType,
        sourceContent,
        goal,
        audience,
        selectedPlatforms,
        media: uploaded.length > 0 ? uploaded : undefined,
      });

      router.push(`/posts/${newPostId}/review?animate=true`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong generating this post. Try again.';
      setError(message);
      setIsGenerating(false);
      setGeneratingStage('');
    }
  };

  const contentTypes: { id: Post['contentType']; label: string; icon: React.ElementType }[] = [
    { id: 'article', label: 'Article / Blog', icon: FileText },
    { id: 'video', label: 'Video Transcript', icon: Video },
    { id: 'audio', label: 'Podcast Episode', icon: Headphones },
    { id: 'image', label: 'Visual Graphic', icon: ImageIcon },
  ];

  return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <div>
          <h1 className="text-3xl font-bold font-space text-[#111111]">
            New Content Engine Adaptation
          </h1>
          <p className="text-sm text-[#555555] font-inter mt-1">
            Upload or paste source content to trigger multi-channel AI adaptation and human review routing.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 space-y-6">

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

          <div>
            <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
              3. Source Text or Script
            </label>
            <textarea
                required
                rows={6}
                placeholder="Paste master article body, video transcript, audio show notes, or key talking points here..."
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl p-4 text-sm text-[#111111] placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all font-inter leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider">
                4. Attached Media
              </label>
              <span className="text-[11px] text-[#666666] font-inter">
              {mediaItems.length} / {poolMax}
            </span>
            </div>

            <p className="text-[11px] text-[#666666] font-inter mb-3">
              {hasInstagram
                  ? 'Instagram can mix images and videos in one carousel (up to 10). Facebook, LinkedIn and TikTok use either images or a single video, and you can adjust each platform in Review.'
                  : 'Add images, or a single video. Select Instagram to combine several videos or mix images with video.'}
            </p>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
                }}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                    isDraggingOver ? 'border-[#111111] bg-black/5' : 'border-black/15'
                }`}
            >
              <Upload className="w-5 h-5 text-[#666666] mx-auto mb-2" />
              <p className="text-xs text-[#555555] font-inter">
                Drag images and videos here, or{' '}
                <label className="text-[#111111] font-bold underline cursor-pointer">
                  browse
                  <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) addFiles(e.target.files);
                        e.target.value = '';
                      }}
                  />
                </label>
              </p>
            </div>

            {mediaItems.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {mediaItems.map((item, index) => (
                      <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragIndex !== null && dragIndex !== index) reorderItems(dragIndex, index);
                            setDragIndex(null);
                          }}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 cursor-move bg-[#F2F1EF]"
                      >
                        {item.kind === 'video' ? (
                            <>
                              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                              <video src={item.previewUrl} muted className="w-full h-full object-cover bg-black pointer-events-none" />
                              <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-0.5">
                                <Film className="w-3 h-3 text-white" />
                              </div>
                            </>
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.previewUrl} alt="" className="w-full h-full object-cover pointer-events-none" />
                        )}
                        <div className="absolute top-1 left-1 bg-black/50 rounded-full p-0.5">
                          <GripVertical className="w-3 h-3 text-white" />
                        </div>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {index + 1}
                  </span>
                        <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                  ))}
                </div>
            )}

            {poolError && (
                <div className="flex items-start gap-2 text-xs text-[#574300] bg-[#F5E6A3]/40 p-3 rounded-2xl border border-[#F5E6A3] mt-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{poolError}</span>
                </div>
            )}
          </div>

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

          <div>
            <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
              5. Target Adaptation Channels
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

          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
          <span className="text-xs text-[#666666] font-inter hidden sm:inline-block">
            {isGenerating && generatingStage ? generatingStage : 'Takes about 15-20 seconds once uploads finish'}
          </span>

            <button
                type="submit"
                disabled={isGenerating || !title.trim() || !sourceContent.trim() || !!poolError}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] disabled:opacity-50 font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer font-space"
            >
              {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E5F23A] animate-spin" />
                    <span>{generatingStage || 'Running Pipeline...'}</span>
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