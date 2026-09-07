import React from 'react';
import { Platform } from '@/types';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function PlatformBadge({ platform, size = 'md', showLabel = false, className = '' }: PlatformBadgeProps) {
  const sizeMap = {
    sm: { container: 'w-6 h-6 text-[10px]', icon: 'w-3.5 h-3.5', label: 'text-xs' },
    md: { container: 'w-8 h-8 text-xs', icon: 'w-4 h-4', label: 'text-xs font-medium' },
    lg: { container: 'w-10 h-10 text-sm', icon: 'w-5 h-5', label: 'text-sm font-semibold' },
  };

  const selectedSize = sizeMap[size];

  const renderContent = () => {
    switch (platform) {
      case 'instagram':
        return (
          <div
            className={`rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${selectedSize.container}`}
            style={{
              background: 'linear-gradient(45deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)',
            }}
            title="Instagram"
          >
            <svg className={selectedSize.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        );

      case 'linkedin':
        return (
          <div
            className={`rounded-full bg-[#0A66C2] flex items-center justify-center text-white shadow-sm shrink-0 ${selectedSize.container}`}
            title="LinkedIn"
          >
            <svg className={selectedSize.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </div>
        );

      case 'tiktok':
        return (
          <div
            className={`rounded-full bg-[#000000] flex items-center justify-center text-white border border-white/20 shadow-sm shrink-0 relative overflow-hidden ${selectedSize.container}`}
            title="TikTok"
          >
            <svg className={selectedSize.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.3 2.56.01 1.01.55 1.98 1.41 2.49.82.49 1.87.56 2.75.21.96-.38 1.66-1.25 1.83-2.27.08-1.57.03-3.15.03-4.73 0-4.04.01-8.08-.01-12.12z" />
            </svg>
          </div>
        );

      case 'facebook':
        return (
          <div
            className={`rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm shrink-0 ${selectedSize.container}`}
            title="Facebook"
          >
            <svg className={selectedSize.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const platformNames: Record<Platform, string> = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    facebook: 'Facebook',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {renderContent()}
      {showLabel && (
        <span className={`capitalize font-medium text-[#111111] ${selectedSize.label}`}>
          {platformNames[platform]}
        </span>
      )}
    </div>
  );
}
