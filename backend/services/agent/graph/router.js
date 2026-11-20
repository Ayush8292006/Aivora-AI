// backend/services/agent/graph/router.js
import { getModel } from "../config/llmModels.js"

export const router = async (state) => {
  try {
    console.log("🔄 Router received state:", state)
    
    const userPrompt = state.prompt
    
    if (!userPrompt) {
      console.warn("⚠️ No prompt found in state, defaulting to chat")
      return {
        ...state,
        agent: "chat"
      }
    }

    // ✅ If agent is specified and not "auto", use it directly
    if (state.agent && state.agent !== "auto") {
      console.log(`🎯 Using selected agent: ${state.agent}`)
      return {
        ...state,
        agent: state.agent
      }
    }

    // ✅ If agent is "auto" or not specified, use router
    const llm = await getModel("router")
    
    const prompt = `You are an agent router.

Available agents:

- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General conversation,
explanations,
learning,
questions.
ANY question about:
- "what is", "who is", "why", "how" (general knowledge)
- definitions, concepts, ideas

search:
Current events,
latest information,
news,
recent developments,
internet lookup.
ANY question about:
- time, date, current time, today, now
- weather, temperature, forecast
- news, headlines, latest updates
- sports, match scores, cricket, football
- stock prices, market, crypto
- "what is the current...", "what is today's..."
- real-time information

coding:
Generate code,
debug code,
build projects,
architecture,
API design.
ANY question about:
- code, function, class, programming
- react, javascript, python, html, css
- "write a function", "create a component"
- "how to code", "debug this"

pdf:
Questions about generate PDFs
or document context.

ppt:
Questions about generate ppts
or ppt context.

vision:
Generate image,
create image
ANY question about:
- "generate image", "create image", "draw"
- "picture of", "photo of"

Return ONLY one word:

chat
search
coding
pdf
ppt
vision

User Query:
${userPrompt}
`

    console.log("📝 Router prompt:", prompt)

    const response = await llm.invoke(prompt)
    
    console.log("✅ Router response:", response)
    
    let agent = response.content.trim().toLowerCase()
    
    // ✅ Validate the agent
    const validAgents = ["chat", "search", "coding", "pdf", "ppt", "vision"]
    const selectedAgent = validAgents.includes(agent) ? agent : "chat"
    
    console.log(`🎯 Router selected agent: ${selectedAgent}`)

    return {
      ...state,
      agent: selectedAgent
    }

  } catch (error) {
    console.error("❌ Router error:", error)
    return {
      ...state,
      agent: "chat"
    }
  }
}