import { supabase } from '@/lib/supabase'
import { publishToInstagram, publishToLinkedIn, publishToFacebook, publishToTikTok } from '@/lib/publishers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: dueVersions } = await supabase
        .from('platform_versions')
        .select('*, posts(image_url)')
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date().toISOString())

    const results = []

    for (const version of dueVersions || []) {
        try {
            const { data: connection } = await supabase
                .from('platform_connections')
                .select('*')
                .eq('platform', version.platform)
                .single()

            if (!connection?.access_token) throw new Error(`No connected ${version.platform} account`)

            const content = version.hashtags?.length > 0
                ? `${version.caption}\n\n${version.hashtags.join(' ')}`
                : version.caption

            const imageUrl = version.posts?.image_url

            let platformPostId: string | null = null

            if (version.platform === 'instagram') {
                if (!imageUrl) throw new Error('Instagram requires an image')
                platformPostId = await publishToInstagram(connection.account_id, connection.access_token, content, imageUrl)
            } else if (version.platform === 'linkedin') {
                platformPostId = await publishToLinkedIn(connection.account_id, connection.access_token, content, imageUrl)
            } else if (version.platform === 'facebook') {
                platformPostId = await publishToFacebook(connection.account_id, connection.access_token, content, imageUrl)
            } else if (version.platform === 'tiktok') {
                if (!imageUrl) throw new Error('TikTok requires an image')
                platformPostId = await publishToTikTok(connection.access_token, content, imageUrl)
            }

            await supabase
                .from('platform_versions')
                .update({ status: 'published', published_at: new Date().toISOString(), platform_post_id: platformPostId })
                .eq('id', version.id)

            results.push({ versionId: version.id, platform: version.platform, success: true })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Scheduled publish failed'
            results.push({ versionId: version.id, platform: version.platform, success: false, error: message })
        }
    }

    return NextResponse.json({ processed: results.length, results })
}