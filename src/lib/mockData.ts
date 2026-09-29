import { PlatformConnection, BrandSettings, ApiSettings, PerformanceInsight } from '@/types';

export const initialConnections: PlatformConnection[] = [
  {
    platform: 'instagram',
    connected: true,
    accountName: 'Acme Content Studio',
    handle: '@acme_studio',
    followers: 48200,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tokenExpiresAt: 'in 42 days',
    status: 'connected',
  },
  {
    platform: 'linkedin',
    connected: true,
    accountName: 'Acme Technologies',
    handle: 'acme-tech-official',
    followers: 124500,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tokenExpiresAt: 'in 18 days',
    status: 'connected',
  },
  {
    platform: 'tiktok',
    connected: true,
    accountName: 'Acme Engine Lab',
    handle: '@acme_engine',
    followers: 89300,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    tokenExpiresAt: 'in 3 days',
    status: 'expiring',
  },
  {
    platform: 'facebook',
    connected: false,
    accountName: 'Acme Global',
    handle: 'AcmeGlobalPage',
    followers: 32100,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tokenExpiresAt: 'Expired 12 days ago',
    status: 'disconnected',
  },
];

export const initialBrandSettings: BrandSettings = {
  tone: ['Authoritative', 'Punchy', 'Insightful', 'Forward-thinking'],
  wordsToAvoid: ['synergy', 'game-changer', 'unprecedented', 'disruptive'],
  ctaStyle: 'Direct with high-value curiosity hook',
  targetAudience: 'B2B SaaS Founders, VP Engineering & Content Lead Executives',
  defaultHashtags: ['#ContentEngine', '#AIWorkflow', '#GrowthTech', '#B2BSaaS'],
};

export const initialApiSettings: ApiSettings = {
  geminiApiKey: 'sk-gemini-v1-9384729384710293840',
  instagramClientId: 'ig_app_883920192039',
  instagramClientSecret: 'ig_sec_9918237462819382',
  linkedinClientId: 'li_app_771928374',
  linkedinClientSecret: 'li_sec_88273619283',
  tiktokClientKey: 'tt_key_1122334455',
  tiktokClientSecret: 'tt_sec_6677889900',
};


export const initialInsights: PerformanceInsight[] = [
  {
    id: 'ins-1',
    platform: 'linkedin',
    observed: 'Posts with tabular bullet points and numerical benchmark data average 3.4x higher save rates and 2.1x more comments.',
    interpretation: 'B2B audience prioritizes actionable reference data over conceptual storytelling. First-principles breakdowns generate immediate reposts.',
    confidence: 'high',
    impactScore: 94,
    postReferences: [
      { id: 'post-101', title: 'Generative AI Strategy', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 'post-102', title: 'Remote Engineering Culture', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'ins-2',
    platform: 'tiktok',
    observed: 'Visual hooks opening with direct code terminal snippets retain 68% viewer retention past 10 seconds versus 22% for spoken introductions.',
    interpretation: 'Engineers on TikTok skip talking heads and react immediately to visual developer environment proof.',
    confidence: 'high',
    impactScore: 89,
    postReferences: [
      { id: 'post-101', title: 'Generative AI Strategy', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'ins-3',
    platform: 'instagram',
    observed: 'Carousel cards with high-contrast dual-tone pastel layouts perform 42% better on initial impression taps than single image posts.',
    interpretation: 'Visual contrast matches Surface 1 design language, driving organic card saves in feed recommendations.',
    confidence: 'medium',
    impactScore: 78,
    postReferences: [
      { id: 'post-102', title: 'Remote Engineering Culture', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'ins-4',
    platform: 'facebook',
    observed: 'Open questions asking community member opinions receive 3x higher comment density than direct link sharing posts.',
    interpretation: 'Facebook algorithm heavily weighs conversational comment trees over outbound link clickthroughs.',
    confidence: 'medium',
    impactScore: 72,
    postReferences: [
      { id: 'post-101', title: 'Generative AI Strategy', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    ],
  },
];
