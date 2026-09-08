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

import { supabase } from '@/lib/supabase';

const previewTypeFor = (platform: Platform): PlatformVersion['previewType'] => {
    if (platform === 'instagram') return 'carousel';
    if (platform === 'tiktok') return 'reels';
    if (platform === 'facebook') return 'feed';
    return 'text';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextType {
  posts: Post[];
  connections: PlatformConnection[];
  brandSettings: BrandSettings;
  apiSettings: ApiSettings;
  addPost: (postData: { title: string; contentType: Post['contentType']; sourceContent: string; goal?: string; audience?: string; selectedPlatforms: Platform[] }) => Promise<string>;
  updatePlatformVersion: (postId: string, platform: Platform, updates: Partial<PlatformVersion>) => void;
  approvePlatformVersion: (postId: string, platform: Platform) => void;
  approveAllPlatformVersions: (postId: string) => void;
  // publishPostNow: (postId: string) => void;
  // schedulePost: (postId: string, platformSchedules: Record<Platform, string>) => void;
    publishPostNow: (postId: string, platforms?: Platform[]) => void;
    schedulePost: (postId: string, platformSchedules: Record<Platform, string>, platforms?: Platform[]) => void;
  updateConnection: (platform: Platform, updates: Partial<PlatformConnection>) => void;
  updateBrandSettings: (settings: Partial<BrandSettings>) => void;
  updateApiSettings: (settings: Partial<ApiSettings>) => void;
  deletePost: (postId: string) => void;
}


export function AppProvider({ children }: { children: React.ReactNode }) {
  // const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [posts, setPosts] = useState<Post[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>(initialConnections);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(initialBrandSettings);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(initialApiSettings);

    React.useEffect(() => {
        async function loadPosts() {
            const { data, error } = await supabase
                .from('posts')
                .select('*, platform_versions(*)')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to load posts:', error);
                return;
            }

            const mapped: Post[] = data.map((row: any) => {
                const versions: Post['versions'] = {};
                (row.platform_versions || []).forEach((v: any) => {
                    versions[v.platform as Platform] = {
                        id: v.id,
                        postId: v.post_id,
                        platform: v.platform,
                        caption: v.caption,
                        hashtags: v.hashtags || [],
                        status: v.status,
                        approved: v.status !== 'review',
                        previewType: previewTypeFor(v.platform),
                        publishedAt: v.published_at,
                        platformPostId: v.platform_post_id,
                    };
                });

                return {
                    id: row.id,
                    title: row.title,
                    contentType: row.content_type,
                    sourceContent: row.source_text,
                    status: row.status,
                    createdAt: row.created_at,
                    goal: row.primary_goal,
                    audience: row.target_audience,
                    owner: {
                        name: 'Sarah Chen',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                        role: 'Head of Content',
                    },
                    platforms: Object.keys(versions) as Platform[],
                    versions,
                };
            });

            setPosts(mapped);
        }

        loadPosts();
    }, []);

    React.useEffect(() => {
        async function loadConnections() {
            const { data, error } = await supabase.from('platform_connections').select('*');
            if (error) {
                console.error('Failed to load connections:', error);
                return;
            }

            if (data.length > 0) {
                setConnections((prev) =>
                    prev.map((mockConn) => {
                        const dbConn = data.find((d: any) => d.platform === mockConn.platform);
                        if (!dbConn) return mockConn;
                        return {
                            ...mockConn,
                            connected: dbConn.connected,
                            status: dbConn.connected ? 'connected' : 'disconnected',
                            accountId: dbConn.account_id,
                            accessToken: dbConn.access_token,
                            tokenExpiresAt: dbConn.token_expires_at
                                ? new Date(dbConn.token_expires_at).toLocaleDateString()
                                : 'Not connected',
                        };
                    })
                );
            }
        }

        loadConnections();
    }, []);

  const addPost: AppContextType['addPost'] = async ({
                                                      title,
                                                      contentType,
                                                      sourceContent,
                                                      goal,
                                                      audience,
                                                      selectedPlatforms,
                                                    }) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        contentType,
        sourceText: sourceContent,
        primaryGoal: goal,
        targetAudience: audience,
        platforms: selectedPlatforms,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to generate post');
    }

    const { post: dbPost, platformVersions: dbVersions } = await res.json();



    const versions: Post['versions'] = {};
    dbVersions.forEach((v: any) => {
      versions[v.platform as Platform] = {
        id: v.id,
        postId: v.post_id,
        platform: v.platform,
        caption: v.caption,
        hashtags: v.hashtags || [],
        status: v.status,
        approved: false,
        previewType: previewTypeFor(v.platform),
      };
    });

    const newPost: Post = {
      id: dbPost.id,
      title: dbPost.title,
      contentType: dbPost.content_type,
      sourceContent: dbPost.source_text,
      status: dbPost.status,
      createdAt: dbPost.created_at,
      goal: dbPost.primary_goal,
      audience: dbPost.target_audience,
      owner: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Head of Content',
      },
      platforms: selectedPlatforms,
      versions,
    };

    setPosts((prev) => [newPost, ...prev]);
    return newPost.id;
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

        const versionId = posts.find((p) => p.id === postId)?.versions[platform]?.id;
        if (versionId) {
            supabase
                .from('platform_versions')
                .update({ status: 'approved' })
                .eq('id', versionId)
                .then(({ error }) => {
                    if (error) console.error('Failed to persist approval:', error);
                });
        }
    };

    const approveAllPlatformVersions: AppContextType['approveAllPlatformVersions'] = (postId) => {
        const versionIds: string[] = [];

        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const updatedVersions = { ...post.versions };

                Object.keys(updatedVersions).forEach((pKey) => {
                    const plat = pKey as Platform;
                    if (updatedVersions[plat]) {
                        versionIds.push(updatedVersions[plat]!.id);
                        updatedVersions[plat] = {
                            ...updatedVersions[plat]!,
                            approved: true,
                            status: 'approved',
                        };
                    }
                });

                return {
                    ...post,
                    status: 'approved', // was hardcoded to 'review' before — this was the bug
                    versions: updatedVersions,
                };
            })
        );

        if (versionIds.length > 0) {
            supabase.from('platform_versions').update({ status: 'approved' }).in('id', versionIds)
                .then(({ error }) => { if (error) console.error('Failed to persist approvals:', error); });
            supabase.from('posts').update({ status: 'approved' }).eq('id', postId)
                .then(({ error }) => { if (error) console.error('Failed to persist post status:', error); });
        }
    };

    const publishPostNow: AppContextType['publishPostNow'] = (postId, platformsOverride) => {
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const targetPlatforms = platformsOverride ?? (Object.keys(post.versions) as Platform[]);
                const updatedVersions = { ...post.versions };

                targetPlatforms.forEach((plat) => {
                    const ver = updatedVersions[plat];
                    if (ver) {
                        const platformPostId = `${plat}_live_${Date.now().toString().slice(-5)}`;
                        const publishedAt = new Date().toISOString();

                        updatedVersions[plat] = {
                            ...ver,
                            status: 'published',
                            publishedAt,
                            platformPostId,
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

                        supabase
                            .from('platform_versions')
                            .update({ status: 'published', published_at: publishedAt, platform_post_id: platformPostId })
                            .eq('id', ver.id)
                            .then(({ error }) => { if (error) console.error('Failed to persist publish:', error); });
                    }
                });

                const allVersions = Object.values(updatedVersions);
                const overallStatus = allVersions.every((v) => v?.status === 'published') ? 'published' : post.status;

                supabase.from('posts').update({ status: overallStatus }).eq('id', postId)
                    .then(({ error }) => { if (error) console.error('Failed to persist post status:', error); });

                return { ...post, status: overallStatus, versions: updatedVersions };
            })
        );
    };

    const schedulePost: AppContextType['schedulePost'] = (postId, platformSchedules, platformsOverride) => {
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const targetPlatforms = platformsOverride ?? (Object.keys(platformSchedules) as Platform[]);
                const updatedVersions = { ...post.versions };

                targetPlatforms.forEach((plat) => {
                    const ver = updatedVersions[plat];
                    if (ver) {
                        const scheduledAt = platformSchedules[plat] || new Date(Date.now() + 86400000).toISOString();
                        updatedVersions[plat] = { ...ver, status: 'scheduled', scheduledAt };

                        supabase
                            .from('platform_versions')
                            .update({ status: 'scheduled' })
                            .eq('id', ver.id)
                            .then(({ error }) => { if (error) console.error('Failed to persist schedule:', error); });
                    }
                });

                const allVersions = Object.values(updatedVersions);
                const overallStatus = allVersions.every((v) => v?.status === 'published')
                    ? 'published'
                    : allVersions.every((v) => v?.status === 'scheduled' || v?.status === 'published')
                        ? 'scheduled'
                        : post.status;

                supabase.from('posts').update({ status: overallStatus }).eq('id', postId)
                    .then(({ error }) => { if (error) console.error('Failed to persist post schedule status:', error); });

                return { ...post, status: overallStatus, versions: updatedVersions };
            })
        );
    };

    const updateConnection: AppContextType['updateConnection'] = (platform, updates) => {
        setConnections((prev) =>
            prev.map((conn) => (conn.platform === platform ? { ...conn, ...updates } : conn))
        );

        supabase
            .from('platform_connections')
            .upsert(
                {
                    platform,
                    connected: updates.connected,
                    account_id: updates.accountId,
                    access_token: updates.accessToken,
                    token_expires_at: updates.tokenExpiresAt && updates.tokenExpiresAt !== 'Disconnected'
                        ? new Date(updates.tokenExpiresAt).toISOString()
                        : null,
                },
                { onConflict: 'platform' }
            )
            .then(({ error }) => { if (error) console.error('Failed to persist connection:', error); });
    };

  const updateBrandSettings: AppContextType['updateBrandSettings'] = (updates) => {
    setBrandSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateApiSettings: AppContextType['updateApiSettings'] = (updates) => {
    setApiSettings((prev) => ({ ...prev, ...updates }));
  };

    const deletePost: AppContextType['deletePost'] = (postId) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));

        supabase.from('posts').delete().eq('id', postId)
            .then(({ error }) => { if (error) console.error('Failed to delete post:', error); });
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
