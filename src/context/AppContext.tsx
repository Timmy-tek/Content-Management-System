'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
    Post,
    PlatformVersion,
    PlatformVersionStatus,
    PlatformConnection,
    BrandSettings,
    ApiSettings,
    Platform
} from '@/types';
import { initialBrandSettings, initialApiSettings } from '@/lib/mockData';
import { syncPostStatus } from '@/lib/postStatus';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

export interface PublishResult {
    platform: Platform;
    success: boolean;
    error?: string;
}

// Shape returned by /api/connections (no tokens, ever)
interface ConnectionApiRow {
    platform: string;
    account_name: string | null;
    handle: string | null;
    follower_count: number | null;
    connected: boolean;
    token_expires_at: string | null;
}

interface AnalyticsSnapshotRow {
    id: string;
    platform_version_id: string;
    reach: number;
    likes: number;
    comments: number;
    saves: number;
    fetched_at: string;
}

interface PlatformVersionRow {
    id: string;
    post_id: string;
    platform: string;
    caption: string;
    hashtags: string[];
    status: PlatformVersionStatus;
    published_at: string;
    platform_post_id: string;
    analytics_snapshots: AnalyticsSnapshotRow[];
    scheduled_at: string | null;
}

const PLATFORMS: Platform[] = ['instagram', 'linkedin', 'tiktok', 'facebook'];

const blankConnections: PlatformConnection[] = PLATFORMS.map((platform): PlatformConnection => ({
    platform,
    connected: false,
    accountName: '',
    handle: '',
    followers: 0,
    tokenExpiresAt: 'Not connected',
    status: 'disconnected',
}));

const previewTypeFor = (platform: Platform): PlatformVersion['previewType'] => {
    if (platform === 'instagram') return 'carousel';
    if (platform === 'tiktok') return 'reels';
    if (platform === 'facebook') return 'feed';
    return 'text';
};

const ownerFromUser = (user: User | null): Post['owner'] => {
    const name =
        (user?.user_metadata?.full_name as string | undefined) ||
        user?.email?.split('@')[0] ||
        'You';
    return { name, avatar: '', role: '' };
};

interface AppContextType {
    posts: Post[];
    connections: PlatformConnection[];
    connectionsLoading: boolean;
    reloadConnections: () => Promise<void>;
    brandSettings: BrandSettings;
    apiSettings: ApiSettings;
    addPost: (postData: { title: string; contentType: Post['contentType']; sourceContent: string; goal?: string; audience?: string; selectedPlatforms: Platform[]; imageUrl?: string }) => Promise<string>;
    updatePlatformVersion: (postId: string, platform: Platform, updates: Partial<PlatformVersion>) => void;
    approvePlatformVersion: (postId: string, platform: Platform) => void;
    approveAllPlatformVersions: (postId: string) => void;
    publishPostNow: (postId: string, platforms?: Platform[]) => Promise<PublishResult[]>;
    schedulePost: (postId: string, platformSchedules: Record<Platform, string>, platforms?: Platform[]) => void;
    updateBrandSettings: (settings: Partial<BrandSettings>) => void;
    updateApiSettings: (settings: Partial<ApiSettings>) => void;
    deletePost: (postId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [owner, setOwner] = useState<Post['owner']>(ownerFromUser(null));
    const [connections, setConnections] = useState<PlatformConnection[]>(blankConnections);
    const [connectionsLoading, setConnectionsLoading] = useState(true);
    const [brandSettings, setBrandSettings] = useState<BrandSettings>(initialBrandSettings);
    const [apiSettings, setApiSettings] = useState<ApiSettings>(initialApiSettings);

    // NOTE: the queries below deliberately have no "where user_id = ..." filter.
    // Row Level Security in the database does the filtering, which is what the two-account test verifies.
    useEffect(() => {
        async function loadPosts() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            const currentOwner = ownerFromUser(user);
            setOwner(currentOwner);

            const { data, error } = await supabase
                .from('posts')
                .select('*, platform_versions(*, analytics_snapshots(*))')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to load posts:', error);
                return;
            }

            const mapped: Post[] = data.map((row) => {
                const versions: Post['versions'] = {};
                (row.platform_versions || []).forEach((v: PlatformVersionRow) => {
                    const snapshots: AnalyticsSnapshotRow[] = v.analytics_snapshots || [];
                    const latest = snapshots.sort(
                        (a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
                    )[0];

                    versions[v.platform as Platform] = {
                        id: v.id,
                        postId: v.post_id,
                        platform: v.platform as Platform,
                        caption: v.caption,
                        hashtags: v.hashtags || [],
                        status: v.status,
                        approved: v.status !== 'review',
                        previewType: previewTypeFor(v.platform as Platform),
                        scheduledAt: v.scheduled_at ?? undefined,
                        publishedAt: v.published_at,
                        platformPostId: v.platform_post_id,
                        metrics: latest
                            ? {
                                reach: latest.reach,
                                likes: latest.likes,
                                comments: latest.comments,
                                saves: latest.saves,
                                shares: 0,
                                clicks: 0,
                                engagementRate:
                                    latest.reach > 0
                                        ? Number((((latest.likes + latest.comments) / latest.reach) * 100).toFixed(1))
                                        : 0,
                                sparkline: [],
                            }
                            : undefined,
                    };
                });

                return {
                    id: row.id,
                    title: row.title,
                    contentType: row.content_type,
                    sourceContent: row.source_text,
                    imageUrl: row.image_url,
                    status: row.status,
                    createdAt: row.created_at,
                    goal: row.primary_goal,
                    audience: row.target_audience,
                    owner: currentOwner,
                    platforms: Object.keys(versions) as Platform[],
                    versions,
                };
            });

            setPosts(mapped);
        }

        loadPosts();
    }, []);

    const reloadConnections = useCallback(async () => {
        try {
            const res = await fetch('/api/connections', { cache: 'no-store' });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const { connections: rows } = (await res.json()) as { connections: ConnectionApiRow[] };

            setConnections(
                PLATFORMS.map((platform): PlatformConnection => {
                    const row = rows.find((r) => r.platform === platform);
                    if (!row || !row.connected) return { ...blankConnections.find((c) => c.platform === platform)! };

                    const expiresAt = row.token_expires_at ? new Date(row.token_expires_at) : null;
                    const daysUntilExpiry = expiresAt ? (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24) : null;

                    return {
                        platform,
                        connected: true,
                        status: daysUntilExpiry !== null && daysUntilExpiry < 5 ? 'expiring' : 'connected',
                        accountName: row.account_name ?? '',
                        handle: row.handle ?? '',
                        followers: row.follower_count ?? 0,
                        tokenExpiresAt: expiresAt ? expiresAt.toLocaleDateString() : 'No expiry set',
                    };
                })
            );
        } catch (err) {
            console.error('Failed to load connections:', err);
        } finally {
            setConnectionsLoading(false);
        }
    }, []);

    useEffect(() => {
        reloadConnections();
    }, [reloadConnections]);

    // Recomputes a post's overall status in the database, then mirrors it on screen
    const refreshPostStatus = async (postId: string) => {
        const overall = await syncPostStatus(supabase, postId);
        if (overall) {
            setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: overall as Post['status'] } : p)));
        }
    };

    const addPost: AppContextType['addPost'] = async ({
                                                          title,
                                                          contentType,
                                                          sourceContent,
                                                          goal,
                                                          audience,
                                                          selectedPlatforms,
                                                          imageUrl,
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
                imageUrl,
            }),
        });

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || 'Failed to generate post');
        }

        const { post: dbPost, platformVersions: dbVersions } = await res.json();

        const versions: Post['versions'] = {};
        dbVersions.forEach((v: { id: string; post_id: string; platform: string; caption: string; hashtags: string[]; status: PlatformVersionStatus }) => {
            versions[v.platform as Platform] = {
                id: v.id,
                postId: v.post_id,
                platform: v.platform as Platform,
                caption: v.caption,
                hashtags: v.hashtags || [],
                status: v.status,
                approved: false,
                previewType: previewTypeFor(v.platform as Platform),
            };
        });

        const newPost: Post = {
            id: dbPost.id,
            title: dbPost.title,
            contentType: dbPost.content_type,
            sourceContent: dbPost.source_text,
            imageUrl: dbPost.image_url,
            status: dbPost.status,
            createdAt: dbPost.created_at,
            goal: dbPost.primary_goal,
            audience: dbPost.target_audience,
            owner,
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

                return {
                    ...post,
                    versions: { ...post.versions, [platform]: { ...currentVer, ...updates } },
                };
            })
        );
    };

    const approvePlatformVersion: AppContextType['approvePlatformVersion'] = async (postId, platform) => {
        const version = posts.find((p) => p.id === postId)?.versions[platform];
        if (!version) return;
        // never demote something that is already queued or live
        if (version.status === 'published' || version.status === 'scheduled') return;

        updatePlatformVersion(postId, platform, { approved: true, status: 'approved' });

        const { error } = await supabase
            .from('platform_versions')
            .update({ status: 'approved', caption: version.caption, hashtags: version.hashtags })
            .eq('id', version.id);
        if (error) {
            console.error('Failed to persist approval:', error);
            return;
        }

        await refreshPostStatus(postId);
    };

    const approveAllPlatformVersions: AppContextType['approveAllPlatformVersions'] = async (postId) => {
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const toApprove = (Object.values(post.versions) as (PlatformVersion | undefined)[]).filter(
            (v): v is PlatformVersion => !!v && v.status !== 'published' && v.status !== 'scheduled'
        );
        const approvingIds = new Set(toApprove.map((v) => v.id));

        setPosts((prev) =>
            prev.map((p) => {
                if (p.id !== postId) return p;
                const updatedVersions = { ...p.versions };
                (Object.keys(updatedVersions) as Platform[]).forEach((plat) => {
                    const v = updatedVersions[plat];
                    if (v && approvingIds.has(v.id)) updatedVersions[plat] = { ...v, approved: true, status: 'approved' };
                });
                return { ...p, status: 'approved', versions: updatedVersions };
            })
        );

        await Promise.all(
            toApprove.map(async (v) => {
                const { error } = await supabase
                    .from('platform_versions')
                    .update({ status: 'approved', caption: v.caption, hashtags: v.hashtags })
                    .eq('id', v.id);
                if (error) console.error('Failed to persist approval:', error);
            })
        );

        await refreshPostStatus(postId);
    };

    const publishPostNow: AppContextType['publishPostNow'] = async (postId, platformsOverride) => {
        const post = posts.find((p) => p.id === postId);
        if (!post) return [];

        const targetPlatforms = platformsOverride ?? (Object.keys(post.versions) as Platform[]);
        const results: PublishResult[] = [];

        for (const plat of targetPlatforms) {
            const ver = post.versions[plat];
            if (!ver) continue;

            try {
                const res = await fetch('/api/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        platformVersionId: ver.id,
                        caption: ver.caption,
                        hashtags: ver.hashtags,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Publish failed');

                results.push({ platform: plat, success: true });

                setPosts((prev) =>
                    prev.map((p) => {
                        if (p.id !== postId) return p;
                        const updatedVersions = { ...p.versions };
                        const v = updatedVersions[plat];
                        if (v) {
                            updatedVersions[plat] = {
                                ...v,
                                status: 'published',
                                publishedAt: new Date().toISOString(),
                                platformPostId: data.platformPostId,
                            };
                        }
                        return { ...p, versions: updatedVersions };
                    })
                );
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Publish failed';
                results.push({ platform: plat, success: false, error: message });
            }
        }

        await refreshPostStatus(postId);
        return results;
    };

    const schedulePost: AppContextType['schedulePost'] = (postId, platformSchedules, platformsOverride) => {
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const targetPlatforms = platformsOverride ?? (Object.keys(platformSchedules) as Platform[]);
        const defaultTime = new Date(Date.now() + 86400000).toISOString();

        setPosts((prev) =>
            prev.map((p) => {
                if (p.id !== postId) return p;
                const updatedVersions = { ...p.versions };
                targetPlatforms.forEach((plat) => {
                    const ver = updatedVersions[plat];
                    if (ver) {
                        updatedVersions[plat] = { ...ver, status: 'scheduled', scheduledAt: platformSchedules[plat] || defaultTime };
                    }
                });
                return { ...p, versions: updatedVersions };
            })
        );

        void (async () => {
            await Promise.all(
                targetPlatforms.map(async (plat) => {
                    const ver = post.versions[plat];
                    if (!ver) return;
                    const { error } = await supabase
                        .from('platform_versions')
                        .update({ status: 'scheduled', scheduled_at: platformSchedules[plat] || defaultTime })
                        .eq('id', ver.id);
                    if (error) console.error('Failed to persist schedule:', error);
                })
            );
            await refreshPostStatus(postId);
        })();
    };

    const updateBrandSettings: AppContextType['updateBrandSettings'] = (updates) => {
        setBrandSettings((prev) => ({ ...prev, ...updates }));
    };

    const updateApiSettings: AppContextType['updateApiSettings'] = (updates) => {
        setApiSettings((prev) => ({ ...prev, ...updates }));
    };

    const deletePost: AppContextType['deletePost'] = (postId) => {
        const removed = posts.find((p) => p.id === postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));

        supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .then(({ error }) => {
                if (!error) return;
                console.error('Failed to delete post:', error);
                // put it back so the screen doesn't lie about what's in the database
                if (removed) {
                    setPosts((prev) =>
                        [...prev, removed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    );
                }
            });
    };

    return (
        <AppContext.Provider
            value={{
                posts,
                connections,
                connectionsLoading,
                reloadConnections,
                brandSettings,
                apiSettings,
                addPost,
                updatePlatformVersion,
                approvePlatformVersion,
                approveAllPlatformVersions,
                publishPostNow,
                schedulePost,
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