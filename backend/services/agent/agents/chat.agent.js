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

        const systemPrompt = `You are Aivora AI, a friendly, helpful, and intelligent multi-agent AI assistant.
Current Date & Time: ${currentTimeString} (Timezone: Asia/Kolkata)

${searchContext}

General Guidelines:
1. Use the current date and time context when asked about the time, date, today, or recent context.
2. If search results are provided above, use them to give an accurate, up-to-date answer.
3. If search results are not available and you cannot answer a real-time question with certainty, explain politely what you know and suggest checking live sources.
4. For technical questions or code, use clean Markdown formatting with language fences.
5. Keep answers direct, friendly, and structured.
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
