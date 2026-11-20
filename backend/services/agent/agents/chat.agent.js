// backend/services/agent/agents/chat.agent.js
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"

export const chatAgent = async (state) => {
    try {
        const llm = await getModel("chat")
        const rawHistory = await getMemory(state.conversationId) || []

        // ✅ Clean history: exclude current prompt if already at the end of history
        let history = Array.isArray(rawHistory) ? [...rawHistory] : []
        if (history.length > 0) {
            const lastMsg = history[history.length - 1]
            if (lastMsg.role === "user" && lastMsg.content === state.prompt) {
                history.pop()
            }
        }
        // Limit history to last 20 messages
        history = history.slice(-20)

        const hasSearchResults = state.searchResults && state.searchResults.length > 0
        
        // Inject current date/time with Asia/Kolkata timezone
        const now = new Date()
        const currentTimeString = now.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "long"
        })

        // Build search context if present
        let searchContext = ""
        if (hasSearchResults) {
            const extractedInfo = state.searchResults.map((result) => ({
                title: result.title || '',
                content: (result.content || result.snippet || '').substring(0, 500),
                url: result.url || ''
            }))

            searchContext = `
REAL-TIME SEARCH RESULTS:
${JSON.stringify(extractedInfo, null, 2)}
${state.images && state.images.length > 0 ? `\n📸 Images found: ${state.images.length}` : ''}

Instructions for Search Results:
1. ALWAYS synthesize the search results to answer the user's question directly.
2. Provide a concise, helpful, and natural answer.
3. Cite key facts from the search results without dumping raw JSON.
4. Do NOT say you lack real-time access when search results are provided.
`
        }

        const systemPrompt = `You are Aivora AI (Chat & Knowledge Domain Expert), an elite executive consultant, senior polymath researcher, and master educator.
Current Date & Time: ${currentTimeString} (Timezone: Asia/Kolkata)

${searchContext}

CORE PROFESSIONAL STANDARDS & EXPERTISE:
1. Authority & High Signal: Deliver authoritative, rigorous, and deeply insightful answers with zero filler, generic disclaimers, or empty throat-clearing. Get straight to the essence of the question.
2. Structured Pedagogical Clarity: For conceptual, technical, or philosophical queries, structure your response elegantly:
   - **Executive Summary / Direct Answer**: 1-2 punchy, crystal-clear sentences defining the concept.
   - **Core Principles & Mental Models**: How it works under the hood or the fundamental mechanics.
   - **Key Capabilities / Real-World Applications**: Practical, concrete examples of where and why it matters.
   - **Pro-Tips / Best Practices**: Nuanced insights that only a seasoned industry practitioner would know.
3. Strict Scope & Relevance: Answer EXACTLY what the user asked. NEVER invent unprompted side-projects, unasked apps, or off-topic code files. (e.g. if the user asks "what is javascript", masterfully explain JavaScript—do NOT write an unsolicited calculator or website template).
4. Language Mastery: Seamlessly mirror the user's language and vocabulary:
   - If they ask in Hindi/Hinglish (e.g. "samjhao", "kya hota hai"), respond in natural, articulate, modern Hinglish.
   - If they ask in English, respond in polished, publication-grade English.
5. Markdown Craftsmanship: Utilize clean Markdown hierarchy (h2/h3 headers, bold focal points, bulleted takeaways, and concise inline code tags \`code\` or syntax-highlighted blocks where appropriate).
6. Real-Time Data Synthesis: If live search results are provided above, synthesize them with journalistic rigor into your response without dumping raw JSON snippets.
`

        const messages = [
            new SystemMessage(systemPrompt)
        ]

        // Add sanitized conversation history
        for (const msg of history) {
            if (msg.role === "user" && msg.content) {
                messages.push(new HumanMessage(msg.content))
            } else if (msg.role === "assistant" && msg.content) {
                messages.push(new AIMessage(msg.content))
            }
        }

        // Add current user prompt
        messages.push(new HumanMessage(state.prompt))

        const response = await Promise.race([
            llm.invoke(messages),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
        ])

        let aiResponse = response.content?.toString() || ""

        if (!aiResponse || aiResponse.trim().length === 0) {
            aiResponse = "I don't have enough information to answer that. Could you please rephrase your question?"
        }

        return {
            ...state,
            aiResponse: aiResponse
        }

    } catch (error) {
        console.error('❌ Chat agent error:', error.message)
        
        let fallbackMessage = "I'm having trouble processing your request. Please try again."
        if (error.message?.includes('timeout')) {
            fallbackMessage = "I'm taking too long to respond. Please try again or ask something simpler."
        } else if (error.message?.includes('rate limit')) {
            fallbackMessage = "I'm getting too many requests. Please wait a moment and try again."
        }
        
        return {
            ...state,
            aiResponse: fallbackMessage
        }
    }
}
