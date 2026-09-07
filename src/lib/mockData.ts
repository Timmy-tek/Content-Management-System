import { Post, PlatformConnection, BrandSettings, ApiSettings, PerformanceInsight } from '@/types';

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

export const initialPosts: Post[] = [
  {
    id: 'post-101',
    title: 'How Generative AI Changes Social Media Strategy in 2025',
    contentType: 'article',
    sourceContent: `Generative AI is shifting social media strategy from manual distribution to hyper-contextual adaptation.
Instead of publishing identical messages across channels, successful brands adapt narrative structure for each medium.
Instagram demands high-contrast visual hooks with carousel storytelling. LinkedIn demands first-principles engineering teardowns.
TikTok prioritizes 3-second visual hooks and audio pacing, while Facebook favors community discussions and structured long-form value.`,
    status: 'published',
    createdAt: '2025-02-28T10:00:00Z',
    goal: 'Drive thought leadership and product signups',
    audience: 'Product managers and content creators',
    owner: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Head of Content',
    },
    platforms: ['instagram', 'linkedin', 'tiktok', 'facebook'],
    versions: {
      instagram: {
        id: 'ver-101-ig',
        postId: 'post-101',
        platform: 'instagram',
        caption: 'Stop cross-posting the exact same caption everywhere. 🛑 Here is how high-performing teams adapt AI narratives per channel in 2025. Swipe through the breakdown. ➡️',
        hashtags: ['#ContentStrategy', '#AITools', '#GrowthMarketing', '#CreatorEconomy'],
        status: 'published',
        publishedAt: '2025-02-28T14:30:00Z',
        platformPostId: 'ig_p_98231',
        approved: true,
        previewType: 'carousel',
        metrics: {
          reach: 28400,
          likes: 2150,
          comments: 184,
          saves: 940,
          shares: 312,
          clicks: 420,
          engagementRate: 5.8,
          sparkline: [12, 28, 45, 68, 85, 92, 100],
        },
      },
      linkedin: {
        id: 'ver-101-li',
        postId: 'post-101',
        platform: 'linkedin',
        caption: `Cross-posting the same text across LinkedIn, Instagram, and TikTok is dead.

We analyzed 1,200 social campaigns last quarter. Here is what separates high-velocity teams from everyone else:

1. Instagram = Visual Hooks + Carousel Storytelling
2. LinkedIn = First-principles breakdowns with tabular data
3. TikTok = Fast visual pacing & clear takeaway in 15 seconds
4. Facebook = Community discussion triggers

Here is the full architectural breakdown of our content engine system 👇`,
        hashtags: ['#B2BSaaS', '#EngineeringLeadership', '#ArtificialIntelligence', '#GrowthOps'],
        status: 'published',
        publishedAt: '2025-02-28T12:00:00Z',
        platformPostId: 'li_p_44821',
        approved: true,
        previewType: 'text',
        metrics: {
          reach: 41200,
          likes: 3410,
          comments: 295,
          saves: 1200,
          shares: 510,
          clicks: 890,
          engagementRate: 7.2,
          sparkline: [18, 42, 65, 78, 88, 95, 100],
        },
      },
      tiktok: {
        id: 'ver-101-tt',
        postId: 'post-101',
        platform: 'tiktok',
        caption: 'If you are still copying & pasting your LinkedIn post into TikTok captions... watch this right now. ⚡️ #techtok #aiworkflow #growthhacks',
        hashtags: ['#techtok', '#aiworkflow', '#growthhacks'],
        status: 'published',
        publishedAt: '2025-02-28T16:00:00Z',
        platformPostId: 'tt_p_00192',
        approved: true,
        previewType: 'reels',
        metrics: {
          reach: 67300,
          likes: 5820,
          comments: 412,
          saves: 2100,
          shares: 890,
          clicks: 650,
          engagementRate: 8.1,
          sparkline: [25, 50, 75, 82, 90, 96, 100],
        },
      },
      facebook: {
        id: 'ver-101-fb',
        postId: 'post-101',
        platform: 'facebook',
        caption: 'Generative AI is changing how engineering & marketing teams co-author content. What tools is your team using to scale social output this year? Let us know in the comments below!',
        hashtags: ['#MarketingTech', '#SoftwareEngineering'],
        status: 'published',
        publishedAt: '2025-02-28T15:00:00Z',
        platformPostId: 'fb_p_88291',
        approved: true,
        previewType: 'feed',
        metrics: {
          reach: 12400,
          likes: 640,
          comments: 82,
          saves: 110,
          shares: 45,
          clicks: 180,
          engagementRate: 3.2,
          sparkline: [10, 20, 35, 50, 65, 80, 85],
        },
      },
    },
  },
  {
    id: 'post-102',
    title: 'Scaling Engineering Culture in Remote-First Companies',
    contentType: 'article',
    sourceContent: `Building a strong engineering culture without a physical office requires deliberate asynchronous architecture.
Key pillars include: 1. RFC-driven decision making, 2. Automated dev environment setup in < 5 mins, 3. Transparent metric dashboards, 4. Blameless post-mortems with recorded video teardowns.`,
    status: 'published',
    createdAt: '2025-02-25T09:15:00Z',
    goal: 'Employer branding and talent attraction',
    audience: 'Senior developers and engineering managers',
    owner: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'VP Engineering',
    },
    platforms: ['linkedin', 'instagram'],
    versions: {
      linkedin: {
        id: 'ver-102-li',
        postId: 'post-102',
        platform: 'linkedin',
        caption: `4 non-negotiable systems we built to keep a remote engineering team of 80+ devs aligned without synchronous meetings:

1. RFC-first decision logs
2. 5-minute automated dev environment bootstraps
3. Public engineering velocity scorecards
4. Asynchronous post-mortems with Loom recordings

What is your team’s #1 remote rule?`,
        hashtags: ['#EngineeringCulture', '#RemoteWork', '#DevOps', '#SoftwareArchitecture'],
        status: 'published',
        publishedAt: '2025-02-25T11:00:00Z',
        platformPostId: 'li_p_99302',
        approved: true,
        previewType: 'text',
        metrics: {
          reach: 52100,
          likes: 4290,
          comments: 380,
          saves: 1890,
          shares: 720,
          clicks: 1150,
          engagementRate: 9.4,
          sparkline: [20, 48, 70, 85, 92, 98, 100],
        },
      },
      instagram: {
        id: 'ver-102-ig',
        postId: 'post-102',
        platform: 'instagram',
        caption: 'How to scale remote engineering culture without endless Zoom calls 💻 Swipe through the 4 rules we live by.',
        hashtags: ['#DevLife', '#TechCompany', '#RemoteJobs', '#SoftwareDeveloper'],
        status: 'published',
        publishedAt: '2025-02-25T13:30:00Z',
        platformPostId: 'ig_p_77310',
        approved: true,
        previewType: 'carousel',
        metrics: {
          reach: 19800,
          likes: 1420,
          comments: 98,
          saves: 610,
          shares: 190,
          clicks: 210,
          engagementRate: 4.9,
          sparkline: [15, 30, 50, 70, 80, 90, 95],
        },
      },
    },
  },
  {
    id: 'post-103',
    title: 'The Design System Playbook: From Figma Tokens to Tailwind UI',
    contentType: 'video',
    sourceContent: `Connecting design tokens in Figma directly to Tailwind CSS configuration automates UI consistency and saves hundreds of frontend hours.
We walk through automated GitHub actions that sync design variable tokens with code release pipelines.`,
    status: 'scheduled',
    createdAt: '2025-03-01T14:00:00Z',
    goal: 'Promote design system webinar',
    audience: 'Frontend engineers and UI designers',
    owner: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Lead UI/UX Designer',
    },
    platforms: ['instagram', 'linkedin', 'tiktok'],
    versions: {
      instagram: {
        id: 'ver-103-ig',
        postId: 'post-103',
        platform: 'instagram',
        caption: 'Syncing Figma design tokens straight into Tailwind CSS config. ✨ No more manual color copy-pasting. Full workflow drops tomorrow! 🎨',
        hashtags: ['#DesignSystems', '#FigmaToCode', '#TailwindCSS', '#FrontendDev'],
        status: 'scheduled',
        scheduledAt: '2025-03-05T15:00:00Z',
        approved: true,
        previewType: 'carousel',
      },
      linkedin: {
        id: 'ver-103-li',
        postId: 'post-103',
        platform: 'linkedin',
        caption: 'How we eliminated Figma-to-code design drift using automated GitHub token syncs. A 5-step breakdown for UI engineers and design leads.',
        hashtags: ['#DesignTokens', '#FrontendEngineering', '#WebDev', '#ProductDesign'],
        status: 'scheduled',
        scheduledAt: '2025-03-05T14:00:00Z',
        approved: true,
        previewType: 'text',
      },
      tiktok: {
        id: 'ver-103-tt',
        postId: 'post-103',
        platform: 'tiktok',
        caption: 'Figma tokens -> Tailwind CSS in 60 seconds! Watch this sync script in action 🚀 #uidesign #webdev #coding',
        hashtags: ['#uidesign', '#webdev', '#coding'],
        status: 'scheduled',
        scheduledAt: '2025-03-05T16:00:00Z',
        approved: true,
        previewType: 'reels',
      },
    },
  },
  {
    id: 'post-104',
    title: 'Why Next.js 14 App Router + Server Actions are Revolutionizing Fullstack',
    contentType: 'text',
    sourceContent: `Server Actions bring RPC-like simplicity back to web applications.
By running server code directly alongside client interactive primitives, we eliminate API boilerplate, simplify form state management, and achieve instantaneous page transitions.`,
    status: 'review',
    createdAt: '2025-03-02T11:20:00Z',
    goal: 'Drive developer community engagement',
    audience: 'Fullstack Next.js developers',
    owner: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Head of Content',
    },
    platforms: ['linkedin', 'instagram', 'tiktok', 'facebook'],
    versions: {
      linkedin: {
        id: 'ver-104-li',
        postId: 'post-104',
        platform: 'linkedin',
        caption: `Are Next.js 14 Server Actions ready for mission-critical enterprise apps?

Here is our team's performance benchmarks after migrating 3 fullstack SaaS portals:

- 40% reduction in API route boilerplate
- 25% faster time-to-interactive on form submissions
- Zero client-side API secret leakage risk

Here is what you need to watch out for before migrating 👇`,
        hashtags: ['#NextJS', '#ReactJS', '#WebDevelopment', '#FullStack'],
        status: 'review',
        approved: false,
        previewType: 'text',
      },
      instagram: {
        id: 'ver-104-ig',
        postId: 'post-104',
        platform: 'instagram',
        caption: 'Next.js 14 Server Actions changed how we build web apps forever. 🔥 Here is the high-level teardown in 5 slides.',
        hashtags: ['#Nextjs', '#React', '#CodingLife', '#WebDeveloper'],
        status: 'review',
        approved: false,
        previewType: 'carousel',
      },
      tiktok: {
        id: 'ver-104-tt',
        postId: 'post-104',
        platform: 'tiktok',
        caption: 'Stop writing standard API routes for basic forms in Next.js! Do this instead 🤯 #nextjs #react #javascript',
        hashtags: ['#nextjs', '#react', '#javascript'],
        status: 'review',
        approved: false,
        previewType: 'reels',
      },
      facebook: {
        id: 'ver-104-fb',
        postId: 'post-104',
        platform: 'facebook',
        caption: 'Server Actions vs Traditional REST API routes in Next.js 14: Which architecture are you adopting for new projects in 2025?',
        hashtags: ['#WebDev', '#Programming'],
        status: 'review',
        approved: false,
        previewType: 'feed',
      },
    },
  },
  {
    id: 'post-105',
    title: 'Building AI Agent Frameworks with Zero Latency Overhead',
    contentType: 'article',
    sourceContent: `LLM latency is the bottleneck of modern AI agent UX. By implementing streaming response buffers, parallel tool calls, and local spec decoding, agents respond in under 300ms.`,
    status: 'draft',
    createdAt: '2025-03-03T08:45:00Z',
    goal: 'Technical thought leadership',
    audience: 'AI Engineers and CTOs',
    owner: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'VP Engineering',
    },
    platforms: ['linkedin', 'instagram'],
    versions: {
      linkedin: {
        id: 'ver-105-li',
        postId: 'post-105',
        platform: 'linkedin',
        caption: 'Sub-300ms AI Agent response times are now possible. Here is the exact streaming architecture & tool-calling loop we used.',
        hashtags: ['#AIArchitecture', '#LLM', '#MachineLearning', '#TechLeadership'],
        status: 'draft',
        approved: false,
        previewType: 'text',
      },
      instagram: {
        id: 'ver-105-ig',
        postId: 'post-105',
        platform: 'instagram',
        caption: 'How to fix slow AI agent responses in your web app ⚡️ 3 latency optimization tricks every dev needs.',
        hashtags: ['#AIEngineering', '#CodingTips', '#TechTrends'],
        status: 'draft',
        approved: false,
        previewType: 'carousel',
      },
    },
  },
];

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
