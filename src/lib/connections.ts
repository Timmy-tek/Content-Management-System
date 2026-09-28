import { createAdminClient } from '@/lib/supabase-admin'

// Saves (or updates) one user's connection to one platform. Returns an error message or null.
export async function saveConnection(userId: string, platform: string, fields: Record<string, unknown>) {
    const { error } = await createAdminClient()
        .from('platform_connections')
        .upsert(
            { user_id: userId, platform, connected: true, ...fields },
            { onConflict: 'user_id,platform' }
        )
    return error ? error.message : null
}