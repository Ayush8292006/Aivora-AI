import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"

export const agent = async (req, res) => {
    try {
        const { prompt, conversationId, agent } = req.body

        // ✅ Check if prompt exists
        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
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

        const trimmedPrompt = prompt.trim()

        // ✅ Save user message in DB
        try {
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId,
                role: "user",
                content: trimmedPrompt
            })
        } catch (saveError) {
            console.warn('⚠️ Save message error:', saveError.message)
        }

        // ✅ Invoke graph with proper state
        const state = {
            prompt: trimmedPrompt,
            conversationId: conversationId,
            agent: agent || "auto",
            searchResults: [],
            images: [],
            artifacts: []
        }

        let result
        try {
            result = await graph.invoke(state)
        } catch (graphError) {
            console.error('❌ Graph error:', graphError.message)
            return res.status(500).json({
                success: false,
                message: "AI service error: " + (graphError.message || 'Unknown error')
            })
        }

        // ✅ Get response from result
        let response = result.aiResponse || result.response || ""
        const images = result.images || []
        const searchResults = result.searchResults || []
        const artifacts = result.artifacts || []

        if (!response || response.trim().length === 0) {
            response = "I don't have enough information to answer that. Could you please rephrase your question?"
        }

        // ✅ Save AI response in DB and update memory cache with both user + assistant turns
        try {
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId,
                role: "assistant",
                content: response,
                images: images,
                artifacts: artifacts
            })

            await addMessage(conversationId, "user", trimmedPrompt)
            await addMessage(conversationId, "assistant", response)
        } catch (saveError) {
            console.warn('⚠️ Save AI response error:', saveError.message)
        }

        return res.status(200).json({
            success: true,
            response: response,
            conversationId: conversationId,
            images: images,
            searchResults: searchResults,
            artifacts: artifacts
        })

    } catch (error) {
        console.error('❌ Agent controller error:', error.message)
        
        let errorMessage = "I'm having trouble processing your request. Please try again."
        if (error.message?.includes('timeout')) {
            errorMessage = "The AI is taking too long to respond. Please try again."
        } else if (error.message?.includes('ECONNREFUSED')) {
            errorMessage = "I'm having connection issues. Please check your connection and try again."
        }

        return res.status(500).json({
            success: false,
            message: errorMessage
        })
    }
}
