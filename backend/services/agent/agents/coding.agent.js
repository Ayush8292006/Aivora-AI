// open router - deepseek

import { getModel } from "../config/llmModels.js"

// ✅ Ye helper function add karo (top par)
const safeJSONParse = (response) => {
    try {
        // Agar response string hai toh parse karo
        if (typeof response === 'string') {
            // Remove markdown code blocks
            let cleaned = response
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();
            
            // JSON object dhoondo
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleaned = jsonMatch[0];
            }
            
            return JSON.parse(cleaned);
        }
        return response;
    } catch (error) {
        console.error('❌ JSON Parse Error:', error);
        // Default fallback
        return {
            files: [
                {
                    name: "index.html",
                    content: `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body><h1>Error loading content</h1><p>Please try again</p></body>
</html>`
                }
            ]
        };
    }
};

export const codingAgent = async (state) => {
    const intentLlm = await getModel("intent")
    const llm = await getModel("coding")
    const intentRes = await intentLlm.invoke(`
      You are an intent classifier.
      
      Return only one of these values.

      CODE_GENERATION
      CODE_REVIEW
      CODE_EXPLANATION
      DEBUGGING
      OPTIMIZATION
      CONVERSION
      DOCUMENTATION

      User Request:
      ${state.prompt}
        
        `)

        const intent = intentRes.content
        if (intent == "CODE_GENERATION") {
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
                const res = await llm.invoke(prompt)
                // ✅ Ye line change karo - safeJSONParse use karo
                const data = safeJSONParse(res.content)

                return {
                    ...state,
                    aiResponse: "Code Generated Successfully.",
                    artifacts: [
                        {
                            id: Date.now(),
                            type: "Project",
                            files: data.files || [],
                            title:state.prompt
                        }
                    ]
                }
            } catch (error) {
                console.error('❌ Coding Agent Error:', error)
                // ✅ Error handle karo
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
                                    content: `<h1>Error: ${error.message || 'Something went wrong'}</h1>`
                                }
                            ]
                        }
                    ]
                }
            }
        }

        const res = await llm.invoke(`
  The user's request is:

${intent}

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
`)

const data = res.content
return {
    ...state,
    aiResponse: data,
    artifacts: []
}
}