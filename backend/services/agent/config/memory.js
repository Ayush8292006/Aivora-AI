import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"

export const getMemory = async (conversationId) => {
    try {
        const key = `messages-${conversationId}`
        const cached = await redis.get(key)
        if (cached) {
            try {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed)) {
                    return parsed
                }
            } catch (_) {}
        }

        const rawMessages = await getMessages(conversationId)
        const messages = Array.isArray(rawMessages)
            ? rawMessages
                .filter(m => m && (m.role === "user" || m.role === "assistant") && m.content)
                .map(m => ({ role: m.role, content: m.content }))
                .slice(-20)
            : []

        if (messages.length > 0) {
            await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60)
        }
        return messages
    } catch (err) {
        console.error("getMemory error:", err.message)
        return []
    }
}

export const addMessage = async (conversationId, role, content) => {
    try {
        const key = `messages-${conversationId}`
        const rawMessages = await redis.get(key)
        let messages = []
        if (rawMessages) {
            try {
                const parsed = JSON.parse(rawMessages)
                if (Array.isArray(parsed)) {
                    messages = parsed
                }
            } catch (_) {
                messages = []
            }
        }
        messages.push({ role, content })
        if (messages.length > 20) {
            messages = messages.slice(-20)
        }
        await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60)
    } catch (err) {
        console.error("addMessage error:", err.message)
    }
}
