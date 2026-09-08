import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
// const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

async function analyze(post: { title: string; sourceText: string; primaryGoal: string; targetAudience: string }) {
    const prompt = `ROLE: You are a content analyzer. You do NOT rewrite or improve content — you extract its structure.
RULES: Extract the core idea in one sentence. Identify the existing hook. List key points in order of importance. Put every factual claim, statistic, name and quote into facts_to_preserve — these must survive every rewrite unchanged. Never add facts not in the source.
OUTPUT FORMAT: Return ONLY valid JSON, no markdown fences: { "core_idea": "", "hook": "", "key_points": [], "facts_to_preserve": [], "tone": "" }

CONTENT:
${JSON.stringify(post)}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json|```/g, '').trim()
    return JSON.parse(text)
}

async function adaptForPlatform(platform: string, analysis: { core_idea: string; hook: string; key_points: string[]; facts_to_preserve: string[]; tone: string }, goal: string, audience: string) {
    const prompt = `ROLE: You adapt one piece of content into a platform-native version for ${platform}.
RULES: Preserve the core idea and every item in facts_to_preserve unchanged. Adapt hook, length, structure, tone and format for ${platform}. Write like someone who actually uses ${platform}. Goal: ${goal}. Audience: ${audience}.
OUTPUT FORMAT: Return ONLY valid JSON, no markdown fences: { "caption": "", "hashtags": [], "notes": "" }

ANALYSIS:
${JSON.stringify(analysis)}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json|```/g, '').trim()
    return JSON.parse(text)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { title, contentType, sourceText, primaryGoal, targetAudience, platforms } = body

        // 1. save the post as pending_review
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                title,
                content_type: contentType,
                source_text: sourceText,
                primary_goal: primaryGoal,
                target_audience: targetAudience,
                status: 'review',
            })
            .select()
            .single()

        if (postError) throw postError

        // 2. analyze once
        const analysis = await analyze({ title, sourceText, primaryGoal, targetAudience })

        // 3. adapt per platform, save each
        const platformVersions = []
        for (const platform of platforms) {
            const adapted = await adaptForPlatform(platform, analysis, primaryGoal, targetAudience)

            const { data: version, error: versionError } = await supabase
                .from('platform_versions')
                .insert({
                    post_id: post.id,
                    platform,
                    caption: adapted.caption,
                    hashtags: adapted.hashtags,
                    status: 'review',
                })
                .select()
                .single()

            if (versionError) throw versionError
            platformVersions.push(version)
        }

        return NextResponse.json({ post, platformVersions })
    } catch (err: unknown) {
        console.error(err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}