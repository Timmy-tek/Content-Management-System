'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  Post,
  PlatformVersion,
  PlatformConnection,
  BrandSettings,
  ApiSettings,
  Platform
} from '@/types';
import {
  initialPosts,
  initialConnections,
  initialBrandSettings,
  initialApiSettings
} from '@/lib/mockData';

interface AppContextType {
  posts: Post[];
  connections: PlatformConnection[];
  brandSettings: BrandSettings;
  apiSettings: ApiSettings;
  addPost: (postData: { title: string; contentType: Post['contentType']; sourceContent: string; goal?: string; audience?: string; selectedPlatforms: Platform[] }) => string;
  updatePlatformVersion: (postId: string, platform: Platform, updates: Partial<PlatformVersion>) => void;
  approvePlatformVersion: (postId: string, platform: Platform) => void;
  approveAllPlatformVersions: (postId: string) => void;
  publishPostNow: (postId: string) => void;
  schedulePost: (postId: string, platformSchedules: Record<Platform, string>) => void;
  updateConnection: (platform: Platform, updates: Partial<PlatformConnection>) => void;
  updateBrandSettings: (settings: Partial<BrandSettings>) => void;
  updateApiSettings: (settings: Partial<ApiSettings>) => void;
  deletePost: (postId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [connections, setConnections] = useState<PlatformConnection[]>(initialConnections);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(initialBrandSettings);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(initialApiSettings);

  const addPost: AppContextType['addPost'] = ({
    title,
    contentType,
    sourceContent,
    goal,
    audience,
    selectedPlatforms,
  }) => {
    const newId = `post-${Date.now().toString().slice(-4)}`;

    // Generate AI adaptations mock versions
    const versions: Post['versions'] = {};
    selectedPlatforms.forEach((platform) => {
      let caption = '';
      let hashtags: string[] = [];
      let previewType: PlatformVersion['previewType'] = 'text';

      if (platform === 'instagram') {
        caption = `${title} ✨ Here is the complete breakdown adapted for your visual feed. Swipe through for the step-by-step summary!`;
        hashtags = ['#ContentEngine', '#Growth', '#TechTrends', '#Productivity'];
        previewType = 'carousel';
      } else if (platform === 'linkedin') {
        caption = `Deep dive on ${title}:\n\nKey takeaways for engineering and growth leaders:\n1. Strategic focus alignment\n2. Measurable benchmark outputs\n3. Scalable process execution\n\nHow is your team tackling this in 2025?`;
        hashtags = ['#Strategy', '#Leadership', '#Innovation', '#TechStrategy'];
        previewType = 'text';
      } else if (platform === 'tiktok') {
        caption = `Quick breakdown: ${title} in 60 seconds! ⚡️ Watch this before launching your next campaign #techtok #growth #viral`;
        hashtags = ['#techtok', '#growth', '#viral'];
        previewType = 'reels';
      } else {
        caption = `${title}: Read our latest engineering update and join the discussion with product teams worldwide.`;
        hashtags = ['#TechCommunity', '#SoftwareOps'];
        previewType = 'feed';
      }

      versions[platform] = {
        id: `ver-${newId}-${platform}`,
        postId: newId,
        platform,
        caption,
        hashtags,
        status: 'review',
        approved: false,
        previewType,
      };
    });

    const newPost: Post = {
      id: newId,
      title,
      contentType,
      sourceContent,
      status: 'review',
      createdAt: new Date().toISOString(),
      goal,
      audience,
      owner: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Head of Content',
      },
      platforms: selectedPlatforms,
      versions,
    };

    setPosts((prev) => [newPost, ...prev]);
    return newId;
  };

  const updatePlatformVersion: AppContextType['updatePlatformVersion'] = (postId, platform, updates) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentVer = post.versions[platform];
        if (!currentVer) return post;

        const updatedVer = { ...currentVer, ...updates };
        const updatedVersions = { ...post.versions, [platform]: updatedVer };

        return {
          ...post,
          versions: updatedVersions,
        };
      })
    );
  };

  const approvePlatformVersion: AppContextType['approvePlatformVersion'] = (postId, platform) => {
    updatePlatformVersion(postId, platform, { approved: true, status: 'approved' });
  };

  const approveAllPlatformVersions: AppContextType['approveAllPlatformVersions'] = (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedVersions = { ...post.versions };

        Object.keys(updatedVersions).forEach((pKey) => {
          const plat = pKey as Platform;
          if (updatedVersions[plat]) {
            updatedVersions[plat] = {
              ...updatedVersions[plat]!,
              approved: true,
              status: 'approved',
            };
          }
        });

        return {
          ...post,
          status: 'review',
          versions: updatedVersions,
        };
      })
    );
  };

  const publishPostNow: AppContextType['publishPostNow'] = (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedVersions = { ...post.versions };

        Object.keys(updatedVersions).forEach((pKey) => {
          const plat = pKey as Platform;
          const ver = updatedVersions[plat];
          if (ver) {
            updatedVersions[plat] = {
              ...ver,
              status: 'published',
              publishedAt: new Date().toISOString(),
              platformPostId: `${plat}_live_${Date.now().toString().slice(-5)}`,
              metrics: ver.metrics || {
                reach: Math.floor(Math.random() * 15000) + 3000,
                likes: Math.floor(Math.random() * 800) + 150,
                comments: Math.floor(Math.random() * 90) + 10,
                saves: Math.floor(Math.random() * 200) + 20,
                shares: Math.floor(Math.random() * 80) + 5,
                clicks: Math.floor(Math.random() * 300) + 40,
                engagementRate: Number((Math.random() * 4 + 3).toFixed(1)),
                sparkline: [10, 25, 45, 60, 78, 89, 100],
              },
            };
          }
        });

        return {
          ...post,
          status: 'published',
          versions: updatedVersions,
        };
      })
    );
  };

  const schedulePost: AppContextType['schedulePost'] = (postId, platformSchedules) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedVersions = { ...post.versions };

        Object.keys(updatedVersions).forEach((pKey) => {
          const plat = pKey as Platform;
          const ver = updatedVersions[plat];
          if (ver) {
            const scheduledAt = platformSchedules[plat] || new Date(Date.now() + 86400000).toISOString();
            updatedVersions[plat] = {
              ...ver,
              status: 'scheduled',
              scheduledAt,
            };
          }
        });

        return {
          ...post,
          status: 'scheduled',
          versions: updatedVersions,
        };
      })
    );
  };

  const updateConnection: AppContextType['updateConnection'] = (platform, updates) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.platform === platform ? { ...conn, ...updates } : conn))
    );
  };

  const updateBrandSettings: AppContextType['updateBrandSettings'] = (updates) => {
    setBrandSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateApiSettings: AppContextType['updateApiSettings'] = (updates) => {
    setApiSettings((prev) => ({ ...prev, ...updates }));
  };

  const deletePost: AppContextType['deletePost'] = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <AppContext.Provider
      value={{
        posts,
        connections,
        brandSettings,
        apiSettings,
        addPost,
        updatePlatformVersion,
        approvePlatformVersion,
        approveAllPlatformVersions,
        publishPostNow,
        schedulePost,
        updateConnection,
        updateBrandSettings,
        updateApiSettings,
        deletePost,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
