'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Platform } from '@/types';
import { PLATFORM_IMAGE_LIMITS } from '@/lib/mediaLimits';
import { Plus, X, GripVertical, Image as ImageIcon } from 'lucide-react';

export function PlatformMediaEditor({ postId, platform }: { postId: string; platform: Platform }) {
    const { posts, uploadMediaToVersion, setVersionMedia } = useApp();
    const post = posts.find((p) => p.id === postId);
    const version = post?.versions[platform];

    const [showPicker, setShowPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!post || !version) return null;

    const limit = PLATFORM_IMAGE_LIMITS[platform];
    const selected = version.media;
    const atLimit = selected.length >= limit;

    const handleUpload = async (file: File) => {
        if (atLimit) {
            setError(`${platform} allows at most ${limit} images`);
            return;
        }
        setIsUploading(true);
        setError(null);
        try {
            await uploadMediaToVersion(postId, platform, file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
        setIsUploading(false);
    };

    const handleRemove = async (mediaId: string) => {
        const nextIds = selected.filter((m) => m.id !== mediaId).map((m) => m.id);
        try {
            await setVersionMedia(postId, platform, nextIds);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove image');
        }
    };

    const handleReorder = async (fromIndex: number, toIndex: number) => {
        const reordered = [...selected];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        try {
            await setVersionMedia(postId, platform, reordered.map((m) => m.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder images');
        }
    };

    const togglePoolItem = async (mediaId: string) => {
        const isSelected = selected.some((m) => m.id === mediaId);
        if (isSelected) {
            await handleRemove(mediaId);
            return;
        }
        if (atLimit) {
            setError(`${platform} allows at most ${limit} images`);
            return;
        }
        try {
            await setVersionMedia(postId, platform, [...selected.map((m) => m.id), mediaId]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add image');
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold font-space uppercase tracking-wider text-[#444444]">
                    Attached Images
                </label>
                <span className={`text-[11px] font-inter ${atLimit ? 'text-[#8B2C2C] font-bold' : 'text-[#666666]'}`}>
          {selected.length} / {limit} for {platform}
        </span>
            </div>

            <div className="flex flex-wrap gap-3">
                {selected.map((m, index) => (
                    <div
                        key={m.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                            if (dragIndex !== null && dragIndex !== index) handleReorder(dragIndex, index);
                            setDragIndex(null);
                        }}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 group cursor-move bg-[#F2F1EF]"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-black/50 rounded-full p-0.5">
                            <GripVertical className="w-3 h-3 text-white" />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemove(m.id)}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
                            title="Remove from this platform"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={atLimit || isUploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-black/15 flex flex-col items-center justify-center gap-1 text-[#666666] hover:border-black/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={atLimit ? `${platform} is at its ${limit}-image limit` : 'Upload a new image'}
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] font-inter">{isUploading ? 'Uploading...' : 'Upload'}</span>
                </button>

                {post.postMedia.length > selected.length && (
                    <button
                        type="button"
                        onClick={() => setShowPicker((v) => !v)}
                        className="w-20 h-20 rounded-xl border border-black/10 flex flex-col items-center justify-center gap-1 text-[#666666] hover:bg-black/5"
                        title="Choose from images already uploaded to this post"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-[9px] font-inter text-center">From post</span>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = '';
                    }}
                />
            </div>

            {showPicker && (
                <div className="bg-white/60 rounded-2xl p-3 border border-black/10 flex flex-wrap gap-2">
                    {post.postMedia.map((m) => {
                        const isSelected = selected.some((s) => s.id === m.id);
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => togglePoolItem(m.id)}
                                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 ${
                                    isSelected ? 'border-[#111111]' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                            </button>
                        );
                    })}
                </div>
            )}

            {error && <p className="text-[11px] text-[#8B2C2C] font-inter">{error}</p>}
        </div>
    );
}