import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
import redis from "../../../shared/redis/redis.js"

export const agent = async (req, res) => {
    try {
        const { prompt, conversationId, agent } = req.body

        console.log('📥 Request:', { prompt, conversationId, agent })

        // ✅ Check if prompt exists
        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            })
        }

        // ✅ Check if conversationId exists
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required"
            })
        }

        // ✅ Try to delete redis cache
        try {
            await redis.del(`messages-${conversationId}`)
        } catch (redisError) {
            console.warn('⚠️ Redis delete error:', redisError.message)
        }

        // ✅ Save user message
        try {
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId,
                role: "user",
                content: prompt
            })
        } catch (saveError) {
            console.warn('⚠️ Save message error:', saveError.message)
        }

        // ✅ Invoke graph with proper state
        const state = {
            prompt: prompt,
            conversationId: conversationId,
            agent: agent || "auto",
            searchResults: [],
            images: []
        }

        console.log('📤 State to graph:', state)

        let result
        try {
            result = await graph.invoke(state)
        } catch (graphError) {
            console.error('❌ Graph error:', graphError)
            console.error('❌ Graph error stack:', graphError.stack)
            return res.status(500).json({
                success: false,
                message: "AI service error: " + (graphError.message || 'Unknown error'),
                error: graphError.message
            })
        }

        console.log('📥 Graph result:', result)

        // ✅ Get response from result
        let response = result.aiResponse || result.response || ""

        // ✅ Get images and search results
        const images = result.images || []
        const searchResults = result.searchResults || []

        // ✅ If response is empty, use fallback
        if (!response || response.trim().length === 0 || response.trim().length < 5) {
            console.warn('⚠️ Empty response, using fallback')
            response = "I don't have enough information to answer that. Could you please rephrase your question?"
        }

        // ✅ Save AI response
        try {
            await addMessage(conversationId, "user", prompt)
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId,
                role: "assistant",
                content: response,
                images: images,
                artifacts:result?.artifacts
            })
        } catch (saveError) {
            console.warn('⚠️ Save AI response error:', saveError.message)
        }

        // ✅ Return proper response
        return res.status(200).json({
            success: true,
            response: response,
            conversationId: conversationId,
            images: images,
            searchResults: searchResults,
            artifacts:result.artifacts
        })

    } catch (error) {
        console.error('❌ Agent error:', error)
        console.error('❌ Agent error stack:', error.stack)
        
        // ✅ User-friendly error response
        let errorMessage = "I'm having trouble processing your request. Please try again."
        let errorDetail = error.message
        
        if (error.message?.includes('timeout')) {
            errorMessage = "The AI is taking too long to respond. Please try again."
        } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
            errorMessage = "I'm having connection issues. Please check your internet and try again."
        } else if (error.message?.includes('TAVILY_API_KEY')) {
            errorMessage = "Search service is not configured. Please contact support."
        } else if (error.message?.includes('API key')) {
            errorMessage = "API key issue. Please contact support."
        }
        
        return res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorDetail
        })
    }
}