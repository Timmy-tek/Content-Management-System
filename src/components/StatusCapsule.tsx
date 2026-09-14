import React from 'react';

export type StatusType =
  | 'published'
  | 'positive'
  | 'pending'
  | 'scheduled'
  | 'review'
  | 'draft'
  | 'failed'
  | 'needs_attention'
  | 'connected'
  | 'expiring'
  | 'disconnected';

interface StatusCapsuleProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusCapsule({ status, label, size = 'md', className = '' }: StatusCapsuleProps) {
  let bgClass = '';
  let textClass = '';
  let defaultLabel = label || status;

  switch (status) {
    case 'published':
    case 'positive':
    case 'connected':
    case 'approved':
      bgClass = 'bg-[#A9F5A0]';
      textClass = 'text-[#0B4F07]';
      defaultLabel = label || (status === 'connected' ? 'Connected' : status === 'approved' ? 'Approved' : 'Published');
      break;

    case 'pending':
    case 'scheduled':
    case 'review':
    case 'draft':
    case 'expiring':
    case 'adapting':
    case 'analyzing':
      bgClass = 'bg-[#F5E6A3]';
      textClass = 'text-[#574300]';
      defaultLabel = label || (status === 'expiring' ? 'Expiring soon' : status === 'review' ? 'Pending review' : status === 'scheduled' ? 'Scheduled' : 'Draft');
      break;

    case 'failed':
    case 'needs_attention':
    case 'disconnected':
      bgClass = 'bg-[#F5A9A9]';
      textClass = 'text-[#5C0A0A]';
      defaultLabel = label || (status === 'disconnected' ? 'Disconnected' : status === 'failed' ? 'Publishing failed' : 'Needs attention');
      break;

    default:
      bgClass = 'bg-[#E5E4E0]';
      textClass = 'text-[#222222]';
  }

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px] font-medium tracking-tight',
    md: 'px-3.5 py-1 text-xs font-semibold tracking-tight',
    lg: 'px-4 py-1.5 text-sm font-semibold tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full transition-colors whitespace-nowrap shadow-xs ${bgClass} ${textClass} ${sizeStyles[size]} ${className}`}
    >
      <span className="capitalize">{defaultLabel}</span>
    </span>
  );
}
