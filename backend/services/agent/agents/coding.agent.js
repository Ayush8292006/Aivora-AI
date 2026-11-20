// open router - deepseek
import { getModel } from "../config/llmModels.js"

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
    const intentLlm = await getModel("intent")
    const llm = await getModel("coding")

    const intentRes = await Promise.race([
        intentLlm.invoke(`
      You are an intent classifier.
      
      Return only one of these values:
      CODE_GENERATION
      CODE_REVIEW
      CODE_EXPLANATION
      DEBUGGING
      OPTIMIZATION
      CONVERSION
      DOCUMENTATION

      User Request:
      ${state.prompt}
        `),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Intent LLM timeout')), 20000))
    ])

    const rawIntent = (intentRes.content || "").toString().trim().toUpperCase()

    if (rawIntent.includes("CODE_GENERATION")) {
        const prompt = `
  You are CortexAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

IMAGES 
=======================
Always use real unsplash images,
Never use placeholders.

Return ONLY valid JSON.

Schema:
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
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

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

    const res = await Promise.race([
        llm.invoke(`
  The user's request is:

${rawIntent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:

${state.prompt}
`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout')), 45000))
    ])

    const data = res.content
    return {
        ...state,
        aiResponse: data,
        artifacts: []
    }
}
