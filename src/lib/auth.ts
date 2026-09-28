import { createClient } from '@/lib/supabase-server'

// Returns a Supabase client acting as the logged-in user, plus that user (or null).
export async function requireUser() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return { supabase, user }
}