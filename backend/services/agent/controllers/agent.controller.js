import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import File from "../models/file.model.js";

export const agent = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Missing user identity"
            });
        }

        const { prompt, conversationId, agent, attachments } = req.body;

        // Check if prompt exists
        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }

        // Check if conversationId exists
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required"
            });
        }

        // Verify conversation ownership
        try {
            const chatServiceUrl = process.env.CHAT_SERVICE || "http://localhost:8002";
            const convRes = await axios.get(`${chatServiceUrl}/conversation/${conversationId}`, {
                timeout: 5000
            });
            const conv = convRes.data;
            if (conv && conv.userId && String(conv.userId) !== String(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: You do not have access to this conversation"
                });
            }
        } catch (convErr) {
            if (convErr.response?.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: "Conversation not found"
                });
            }
            console.warn("⚠️ Conversation ownership check warning:", convErr.message);
        }

        // Validate attachments against ownership
        let validatedAttachments = [];
        if (Array.isArray(attachments) && attachments.length > 0) {
            const fileIds = attachments.map(a => a.fileId || a.id).filter(Boolean);
            if (fileIds.length > 0) {
                const ownedFiles = await File.find({
                    _id: { $in: fileIds },
                    userId: String(userId)
                });

                const ownedMap = new Map(ownedFiles.map(f => [String(f._id), f]));
                validatedAttachments = fileIds
                    .map(id => ownedMap.get(String(id)))
                    .filter(Boolean)
                    .map(f => ({
                        fileId: String(f._id),
                        name: f.name,
                        kind: f.kind,
                        mimeType: f.mimeType,
                        size: f.size,
                        path: f.path,
                        text: f.text || "",
                        pages: f.pages || 1,
                        url: `/api/files/${f._id}`
                    }));
            }
        }

        const trimmedPrompt = prompt.trim();

        // Save user message in DB with attachments
        try {
            const chatServiceUrl = process.env.CHAT_SERVICE || "http://localhost:8002";
            await axios.post(`${chatServiceUrl}/save-message`, {
                conversationId,
                role: "user",
                content: trimmedPrompt,
                attachments: validatedAttachments.map(a => ({
                    fileId: a.fileId,
                    name: a.name,
                    kind: a.kind,
                    mimeType: a.mimeType,
                    size: a.size
                }))
            });
        } catch (saveError) {
            console.warn('⚠️ Save message error:', saveError.message);
        }

        // Prepare LangGraph state
        const state = {
            prompt: trimmedPrompt,
            conversationId: conversationId,
            userId: String(userId),
            agent: agent || "auto",
            attachments: validatedAttachments,
            searchResults: [],
            images: [],
            artifacts: []
        };

        let result;
        try {
            // 120s timeout for generation calls
            result = await Promise.race([
                graph.invoke(state),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Agent generation timed out after 120 seconds')), 120000)
                )
            ]);
        } catch (graphError) {
            console.error('❌ Graph error:', graphError.message);
            return res.status(500).json({
                success: false,
                message: "AI service error: " + (graphError.message || 'Unknown error')
            });
        }

        // Extract response details
        let response = result.aiResponse || result.response || "";
        const images = result.images || [];
        const searchResults = result.searchResults || [];
        const artifacts = result.artifacts || [];

        if (!response || response.trim().length === 0) {
            response = "I've processed your request.";
        }

        // Save AI response in DB and update memory cache
        try {
            const chatServiceUrl = process.env.CHAT_SERVICE || "http://localhost:8002";
            await axios.post(`${chatServiceUrl}/save-message`, {
                conversationId,
                role: "assistant",
                content: response,
                images: images,
                artifacts: artifacts
            });

            await addMessage(conversationId, "user", trimmedPrompt);
            await addMessage(conversationId, "assistant", response);
        } catch (saveError) {
            console.warn('⚠️ Save AI response error:', saveError.message);
        }

        return res.status(200).json({
            success: true,
            response: response,
            conversationId: conversationId,
            images: images,
            searchResults: searchResults,
            artifacts: artifacts
        });

    } catch (error) {
        console.error('❌ Agent controller error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to process request"
        });
    }
};
