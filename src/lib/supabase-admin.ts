import { createClient } from '@supabase/supabase-js'

// SERVER ONLY. Bypasses all row-level security, so every query made with this
// client MUST filter by user_id by hand. Use it only for OAuth tokens and cron jobs.
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )
}