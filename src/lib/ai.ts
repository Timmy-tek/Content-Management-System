import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

export async function analyzeContent(post: { title: string; sourceText: string; primaryGoal?: string; targetAudience?: string }) {
    const prompt = `ROLE: You are a content analyzer. You do NOT rewrite or improve content — you extract its structure.
RULES: Extract the core idea in one sentence. Identify the existing hook. List key points in order of importance. Put every factual claim, statistic, name and quote into facts_to_preserve — these must survive every rewrite unchanged. Never add facts not in the source.
OUTPUT FORMAT: Return ONLY valid JSON, no markdown fences: { "core_idea": "", "hook": "", "key_points": [], "facts_to_preserve": [], "tone": "" }

CONTENT:
${JSON.stringify(post)}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json|```/g, '').trim()
    return JSON.parse(text)
}

export async function adaptForPlatform(platform: string, analysis: unknown, goal?: string, audience?: string) {
    const prompt = `ROLE: You adapt one piece of content into a platform-native version for ${platform}.
RULES: Preserve the core idea and every item in facts_to_preserve unchanged. Adapt hook, length, structure, tone and format for ${platform}. Write like someone who actually uses ${platform}. Goal: ${goal}. Audience: ${audience}.
OUTPUT FORMAT: Return ONLY valid JSON, no markdown fences: { "caption": "", "hashtags": [], "notes": "" }

ANALYSIS:
${JSON.stringify(analysis)}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json|```/g, '').trim()
    return JSON.parse(text)
}