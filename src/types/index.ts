export type Platform = 'instagram' | 'linkedin' | 'tiktok' | 'facebook';

export type PostStatus =
  | 'draft'
  | 'analyzing'
  | 'adapting'
  | 'review'
  | 'scheduled'
  | 'published'
  | 'failed';

export type PlatformVersionStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed';

export interface AnalyticsSnapshot {
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  clicks: number;
  engagementRate: number; // e.g. 4.8 for 4.8%
  sparkline: number[]; // e.g. 7 data points for mini performance graph
}

export interface PlatformVersion {
  id: string;
  postId: string;
  platform: Platform;
  caption: string;
  hashtags: string[];
  status: PlatformVersionStatus;
  scheduledAt?: string;
  publishedAt?: string;
  platformPostId?: string;
  metrics?: AnalyticsSnapshot;
  mediaUrl?: string;
  previewType?: 'carousel' | 'text' | 'reels' | 'feed';
  approved: boolean;
}

export interface Post {
  id: string;
  title: string;
  contentType: 'article' | 'video' | 'audio' | 'image' | 'text';
  sourceContent: string;
  status: PostStatus;
  createdAt: string;
  owner: {
    name: string;
    avatar: string;
    role: string;
  };
  platforms: Platform[];
  versions: Partial<Record<Platform, PlatformVersion>>;
  goal?: string;
  audience?: string;
}

export interface PlatformConnection {
  platform: Platform;
  connected: boolean;
  accountName: string;
  handle: string;
  followers: number;
  avatar: string;
  tokenExpiresAt: string; // ISO string or relative time text
  status: 'connected' | 'expiring' | 'disconnected';
}

export interface BrandSettings {
  tone: string[];
  wordsToAvoid: string[];
  ctaStyle: string;
  targetAudience: string;
  defaultHashtags: string[];
}

export interface ApiSettings {
  geminiApiKey: string;
  instagramClientId: string;
  instagramClientSecret: string;
  linkedinClientId: string;
  linkedinClientSecret: string;
  tiktokClientKey: string;
  tiktokClientSecret: string;
}

export interface PerformanceInsight {
  id: string;
  platform: Platform | 'all';
  observed: string;
  interpretation: string;
  confidence: 'low' | 'medium' | 'high';
  impactScore: number;
  postReferences?: { title: string; avatar: string; id: string }[];
}
