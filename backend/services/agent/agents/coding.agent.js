// open router - deepseek
import { getFallbackModel, getModel } from "../config/llmModels.js"
import { checkAgentScope } from "../utils/agentScopeGuard.js"

const parseProjectJSON = (text) => {
    if (!text || typeof text !== 'string') {
        throw new Error("Empty or non-string response received from model");
    }

    let cleaned = text.trim();
    // Remove markdown code fences like ```json ... ```
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Find outermost JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned);
};

export const codingAgent = async (state) => {
    // 0. Domain Scope Guard: If user asks for PPT, PDF, Image, etc., politely redirect
    const redirection = checkAgentScope("coding", state.prompt, state.attachments || []);
    if (redirection) {
        return {
            ...state,
            aiResponse: redirection,
            artifacts: []
        };
    }

    const intentLlm = await getModel("intent")
    const llm = await getModel("coding")
    const lowerPrompt = (state.prompt || "").toLowerCase()

    let rawIntent = "CODE_EXPLANATION"

    // 1. Fast deterministic check for project generation requests
    const isExplicitProjectRequest = /\b(build|create|make|generate|develop|banao)\b/i.test(lowerPrompt) &&
        /\b(website|webpage|page|app|calculator|landing\s*page|portfolio|todo|game|project|ui|component|tool|script|html)\b/i.test(lowerPrompt)

    if (isExplicitProjectRequest) {
        rawIntent = "CODE_GENERATION"
    } else if (/\b(what\s+is|what\s+are|explain|how\s+to|why|difference|guide|tutorial|kya\s+hai)\b/i.test(lowerPrompt)) {
        rawIntent = "CODE_EXPLANATION"
    } else {
        // Fallback to LLM intent classification with safe error handling
        try {
            const intentRes = await Promise.race([
                intentLlm.invoke(`
You are an intent classifier for coding requests.
Return only one:
CODE_GENERATION
CODE_EXPLANATION
DEBUGGING
CODE_REVIEW
OPTIMIZATION

User Request:
${state.prompt}
                `),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Intent LLM timeout')), 10000))
            ])
            rawIntent = (intentRes.content || "").toString().trim().toUpperCase()
        } catch (err) {
            console.warn('⚠️ Intent classification fallback to CODE_EXPLANATION:', err.message)
            rawIntent = "CODE_EXPLANATION"
        }
    }

    if (rawIntent.includes("CODE_GENERATION")) {
        const prompt = `
You are Aivora AI Staff Software Architect & Lead UI/UX Engineer.

Build a world-class, production-grade software project for the user request with exceptional visual design, rock-solid logic, and flawless polish.

Technical Standards:
- HTML5: Clean, modern semantic tags (header, nav, main, section, footer), accessible ARIA labels, meta viewport.
- CSS3: High-end design system aesthetic (glassmorphism/subtle shadows, modern CSS variables, fluid responsive clamp/flex/grid, smooth cubic-bezier transitions, polished hover/active micro-interactions).
- JavaScript: Clean, modular ES6+ vanilla code with strict error handling, event delegation, and instant feedback.
- Imagery: Always use curated, real Unsplash CDN images with descriptive keywords (never broken placeholder links).

Return ONLY valid JSON matching this schema:
{
  "files":[
    {
      "name":"index.html",
      "content":"..."
    },
    {
      "name":"style.css",
      "content":"..."
    },
    {
      "name":"script.js",
      "content":"..."
    }
  ]
}

Rules:
- Output must start with {
- Output must end with }
- No markdown wrappers outside the JSON
- No conversational text or preamble
- Never mention intent or routing

User Request:
${state.prompt}
`

        try {
            const res = await Promise.race([
                llm.invoke(prompt),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Coding LLM timeout')), 60000))
            ])

            let data
            try {
                data = parseProjectJSON(res.content)
            } catch (firstParseErr) {
                console.warn('⚠️ Initial JSON parse failed, retrying once with fix prompt:', firstParseErr.message)
                const retryPrompt = `The following output was not valid JSON. Please fix it and return ONLY valid JSON matching the schema with no explanations or markdown:\n\n${(res.content || "").slice(0, 4000)}`
                const retryRes = await Promise.race([
                    llm.invoke(retryPrompt),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Retry LLM timeout')), 30000))
                ])
                data = parseProjectJSON(retryRes.content)
            }

            return {
                ...state,
                aiResponse: "Code Generated Successfully.",
                artifacts: [
                    {
                        id: Date.now(),
                        type: "Project",
                        files: Array.isArray(data?.files) ? data.files : [],
                        title: state.prompt
                    }
                ]
            }
        } catch (error) {
            console.error('❌ Coding Agent Error:', error.message)
            return {
                ...state,
                aiResponse: "Sorry, I encountered an error generating the code. Please try again.",
                artifacts: [
                    {
                        id: Date.now(),
                        type: "Project",
                        files: [
                            {
                                name: "index.html",
                                content: `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Error generating project</h1><p>${error.message || 'Please try again'}</p></body></html>`
                            }
                        ],
                        title: state.prompt
                    }
                ]
            }
        }
    }

    try {
        const res = await Promise.race([
            llm.invoke(`You are Aivora AI Technical & Code Specialist.
The user's query intent is: ${rawIntent}

Answer the user's technical or programming question directly, accurately, and professionally.

Guidelines:
1. Focus strictly on what was asked. Never generate unrequested project templates, unasked calculators, or random sample apps.
2. If explaining a language, technology, or concept, explain its core definition, where it is used, key features, and provide small, minimal code snippets only to illustrate the concept.
3. If debugging or reviewing code, identify the root cause clearly, explain the solution, and provide the fixed code snippet.
4. Use clean, modern Markdown with language-tagged code blocks (e.g. \`\`\`javascript).
5. Structure your response with clean headings and bullet points for readability.

User Request:
${state.prompt}`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout')), 45000))
        ])

        const data = res.content
        return {
            ...state,
            aiResponse: data,
            artifacts: []
        }
    } catch (err) {
        console.warn('⚠️ Coding Agent LLM failed or timed out, trying fallback model:', err.message)
        try {
            const fallbackLlm = await getFallbackModel()
            const fallbackRes = await fallbackLlm.invoke(`You are Aivora AI Technical Specialist. Answer the user directly and professionally without unrequested projects:\n\n${state.prompt}`)
            return {
                ...state,
                aiResponse: fallbackRes.content,
                artifacts: []
            }
        } catch (fbErr) {
            console.error('❌ Coding fallback also failed:', fbErr.message)
            return {
                ...state,
                aiResponse: "I'm having trouble processing this code request right now. Please try again in a moment.",
                artifacts: []
            }
        }
    }
}
