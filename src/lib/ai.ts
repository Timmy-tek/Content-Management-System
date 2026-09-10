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

export async function generatePerformanceInsight(
    platform: string,
    postsData: { title: string; caption: string; hashtags: string[]; reach: number; likes: number; comments: number; saves: number }[]
) {
    const prompt = `ROLE: You are a performance analyst. You find real patterns across a set of published social posts and their metrics.
RULES:
- Separate what the data literally shows (observed) from your interpretation of why (interpretation). Never blur the two.
- Never claim causation from correlation. If posts sharing a trait performed well, describe the shared trait — do not claim the trait caused the performance.
- Do not draw conclusions from fewer than 5 posts. If there are fewer than 5 posts in the data, set confidence to "low" and keep the interpretation appropriately tentative.
- Assign confidence based on sample size and consistency of the pattern: "high" only for a clear, consistent pattern across many posts; "medium" for a plausible but smaller-sample pattern; "low" for a weak or early signal.
- impactScore is 0-100, representing how strong/clear the pattern is, not how "good" the results were.
OUTPUT FORMAT: Return ONLY valid JSON, no markdown fences:
{ "observed": "", "interpretation": "", "confidence": "low"|"medium"|"high", "impactScore": 0 }

PLATFORM: ${platform}
POSTS DATA:
${JSON.stringify(postsData)}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json|```/g, '').trim()
    return JSON.parse(text)
}