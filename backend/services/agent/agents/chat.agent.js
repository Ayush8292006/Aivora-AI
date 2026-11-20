// backend/services/agent/agents/chat.agent.js
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"

export const chatAgent = async (state) => {
    try {
        console.log('💬 Chat agent called with state:', state)
        
        const llm = await getModel("chat")
        const history = await getMemory(state.conversationId) || []

        // ✅ Check if search results exist
        const hasSearchResults = state.searchResults && state.searchResults.length > 0
        
        // ✅ Detect if it's a real-time question
        const realTimeKeywords = [
            'time', 'current time', 'what time', 'date', 'today', 'now', 'clock',
            'weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy',
            'news', 'headlines', 'latest', 'breaking', 'update',
            'stock', 'price', 'market', 'crypto', 'bitcoin', 'ethereum',
            'score', 'match', 'game', 'sports', 'football', 'cricket',
            'traffic', 'flight', 'delay', 'schedule',
            'president', 'prime minister', 'election', 'result',
            'earthquake', 'flood', 'cyclone', 'disaster'
        ]
        
        const isRealTimeQuestion = realTimeKeywords.some(keyword => 
            state.prompt?.toLowerCase().includes(keyword)
        )

        // ✅ Build search context
        let searchContext = ""
        if (hasSearchResults) {
            // ✅ Extract information from search results
            let extractedInfo = []
            let images = state.images || []
            
            state.searchResults.forEach((result, index) => {
                const title = result.title || ''
                const content = result.content || result.snippet || ''
                const url = result.url || ''
                
                // Try to extract key information
                let info = {
                    title: title,
                    content: content.substring(0, 500), // Limit content
                    url: url
                }
                
                // Extract time if present
                const timeMatch = content.match(/(\d{1,2}:\d{2})\s*(?:AM|PM|am|pm)?/)
                if (timeMatch) {
                    info.time = timeMatch[0]
                }
                
                // Extract date if present
                const dateMatch = content.match(/(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i)
                if (dateMatch) {
                    info.date = dateMatch[0]
                }
                
                // Extract temperature if present
                const tempMatch = content.match(/(\d{1,3}°[CF]|\d{1,3}\s*degrees)/i)
                if (tempMatch) {
                    info.temperature = tempMatch[0]
                }
                
                extractedInfo.push(info)
            })
            
            searchContext = `
REAL-TIME SEARCH RESULTS:

${JSON.stringify(extractedInfo, null, 2)}

${images.length > 0 ? `\n📸 Images found: ${images.length}` : ''}

${isRealTimeQuestion ? '⚠️ This is a REAL-TIME question. You MUST use the search results above to answer.' : ''}

Instructions:
1. ALWAYS use the search results to answer the user's question.
2. Give a DIRECT, CONCISE answer.
3. For time/date: Give the time/date directly from search results.
4. For weather: Give temperature and conditions from search results.
5. For news: Give the latest headlines from search results.
6. NEVER say "I don't have access to real-time information" - you have search results!
7. Be conversational and helpful.
`
        }

        const systemPrompt = `
You are Aivora AI, an intelligent AI assistant with access to real-time search results.

${searchContext}

${!hasSearchResults ? `
You don't have any search results. Answer based on your knowledge.

IMPORTANT: If the user asks a real-time question (time, date, weather, news, etc.) and you don't have search results, say:
"I don't have access to real-time information. Please check a reliable source or try again with a more specific question."
` : `
✅ You have search results. USE THEM to answer the user's question.
✅ DO NOT say you don't have access to real-time information.
✅ If the user asks about time/date, give it directly from the search results.
✅ If the user asks about weather, give temperature and conditions from search results.
✅ If the user asks about news, give the latest headlines from search results.
`}

IMPORTANT RULES:
1. If you have search results, ALWAYS use them.
2. If you don't know the answer, say "I don't have enough information to answer that. Could you please rephrase your question?"
3. Never make up information. If you don't know, admit it.
4. Give direct, concise answers - don't list all search results.

Response Rules:
- For simple questions, respond naturally in plain text.
- For technical topics, use clean Markdown.

Formatting:
- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
`

        const messages = [
            new SystemMessage(systemPrompt)
        ]

        // Add conversation history
        if (history && history.length > 0) {
            history.forEach((msg) => {
                try {
                    if (msg.role === "user") {
                        messages.push(new HumanMessage(msg.content))
                    } else if (msg.role === "assistant") {
                        messages.push(new AIMessage(msg.content))
                    }
                } catch (err) {
                    console.error('❌ Error processing message:', err)
                }
            })
        }

        // Add current message with emphasis for real-time questions
        let userMessage = state.prompt
        if (isRealTimeQuestion && hasSearchResults) {
            userMessage = `[REAL-TIME QUERY] ${state.prompt}`
        }
        messages.push(new HumanMessage(userMessage))

        console.log(`📤 Sending ${messages.length} messages to AI`)
        console.log(`📝 Real-time question: ${isRealTimeQuestion}`)
        console.log(`📝 Has search results: ${hasSearchResults}`)

        const response = await Promise.race([
            llm.invoke(messages),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
        ])

        let aiResponse = response.content?.toString() || ""

        // ✅ If no response, use fallback
        if (!aiResponse || aiResponse.trim().length === 0) {
            console.warn('⚠️ Empty response from AI, using fallback')
            aiResponse = "I don't have enough information to answer that. Could you please rephrase your question?"
        }

        // ✅ If response is too short
        if (aiResponse.trim().length < 5) {
            aiResponse = "I don't have enough information to answer that. Could you please ask something else?"
        }

        // ✅ If AI says "no access" but we have search results, override
        const noAccessPhrases = [
            'no access', 'real-time', 'check your device', 
            "don't have access", "cannot access", "not able to",
            "don't have real-time", "no real-time"
        ]
        const hasNoAccess = noAccessPhrases.some(phrase => 
            aiResponse.toLowerCase().includes(phrase)
        )

        if (hasNoAccess && hasSearchResults) {
            console.warn('⚠️ AI said no access but we have search results. Using server time...')
            
            // ✅ Use server time as fallback
            const now = new Date()
            const hours12 = (now.getHours() % 12 || 12).toString().padStart(2, '0')
            const minutes = now.getMinutes().toString().padStart(2, '0')
            const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            
            const dayName = days[now.getDay()]
            const monthName = months[now.getMonth()]
            const date = now.getDate()
            const year = now.getFullYear()
            
            // ✅ Try to extract time from search results first
            let extractedTime = null
            let extractedDate = null
            
            for (const result of state.searchResults) {
                const content = result.content || result.snippet || ''
                const timeMatch = content.match(/(\d{1,2}:\d{2})\s*(?:AM|PM|am|pm)?/)
                if (timeMatch) {
                    extractedTime = timeMatch[0]
                    break
                }
            }
            
            if (extractedTime) {
                aiResponse = `The current time is approximately ${extractedTime} IST.`
            } else {
                aiResponse = `The current time in India is ${hours12}:${minutes} ${ampm} IST, ${dayName}, ${monthName} ${date}, ${year}.`
            }
        }

        return {
            ...state,
            aiResponse: aiResponse
        }

    } catch (error) {
        console.error('❌ Chat agent error:', error)
        
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