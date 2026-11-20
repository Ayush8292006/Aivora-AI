import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import File from "../models/file.model.js";
import GuestSession from "../models/GuestSession.js";
import { checkCreditBalance, settleAIUsage } from "../utils/tokenAccounting.js";

export const agent = async (req, res) => {
    try {
        let userId = req.headers["x-user-id"];
        let isGuestHeader = req.headers["x-is-guest"];

        // Registered user if userId exists and doesn't start with guest_
        const isGuest = isGuestHeader === "true" || !userId || String(userId).startsWith("guest_");

        let guestRecord = null;
        if (isGuest) {
            let guestSessionId = req.headers["x-guest-session-id"] || req.cookies?.guestSessionId;
            if (!guestSessionId) {
                guestSessionId = String(userId).startsWith("guest_") ? userId : `guest_${Date.now()}`;
            }
            guestRecord = await GuestSession.findOne({ sessionId: guestSessionId });
            if (!guestRecord) {
                guestRecord = await GuestSession.create({
                    sessionId: guestSessionId,
                    ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
                    userAgent: req.headers["user-agent"] || "",
                    questionsUsed: 0,
                    maxQuestions: 4
                });
            }

            // GUEST LIMIT ENFORCEMENT: Max 4 free questions
            if (guestRecord.questionsUsed >= (guestRecord.maxQuestions || 4)) {
                return res.status(403).json({
                    success: false,
                    guestLimitReached: true,
                    questionsUsed: guestRecord.questionsUsed,
                    maxQuestions: guestRecord.maxQuestions || 4,
                    message: "You've used all 4 free guest questions. Create an account to continue exploring AI features and get access to your personal credit balance."
                });
            }
        } else {
            // REGISTERED USER: Check Credit Balance before processing (Auto-initializes 100 free bonus credits if needed)
            const creditCheck = await checkCreditBalance(userId, 1);
            if (!creditCheck.allowed) {
                return res.status(402).json({
                    success: false,
                    creditExhausted: true,
                    availableCredits: creditCheck.availableCredits,
                    message: "You're running low on credits. Please purchase a credit pack to continue chatting."
                });
            }
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

        // Verify conversation ownership if not a guest
        if (!isGuest) {
            try {
                const chatServiceUrl = process.env.CHAT_SERVICE || "http://localhost:8002";
                const convRes = await axios.get(`${chatServiceUrl}/conversation/${conversationId}`, {
                    headers: { "x-user-id": String(userId) },
                    timeout: 5000
                });
                const conv = convRes.data;
                if (conv) {
                    const convUserId = conv.userId ? String(conv.userId) : "";
                    const currentUserId = String(userId);

                    // If conversation was created in guest mode or is unowned, auto-adopt it for this logged-in user!
                    if (!convUserId || convUserId.startsWith("guest_") || convUserId === "undefined") {
                        try {
                            await axios.post(`${chatServiceUrl}/conversation/adopt`, {
                                conversationId,
                                userId: currentUserId
                            });
                        } catch (adoptErr) {
                            console.warn("⚠️ Could not adopt guest conversation:", adoptErr.message);
                        }
                    } else if (convUserId !== currentUserId) {
                        return res.status(403).json({
                            success: false,
                            message: "Forbidden: You do not have access to this conversation"
                        });
                    }
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
        }

        // Validate attachments against ownership
        let validatedAttachments = [];
        if (Array.isArray(attachments) && attachments.length > 0) {
            const fileIds = attachments.map(a => a.fileId || a.id).filter(Boolean);
            if (fileIds.length > 0) {
                const query = isGuest
                    ? { _id: { $in: fileIds } }
                    : { _id: { $in: fileIds }, userId: String(userId) };

                const ownedFiles = await File.find(query);
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
            userId: String(userId || guestSessionId),
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

        // POST-GENERATION ACCOUNTING:
        let usageData = null;
        let guestInfo = null;

        if (isGuest && guestRecord) {
            guestRecord.questionsUsed = (guestRecord.questionsUsed || 0) + 1;
            await guestRecord.save();
            guestInfo = {
                questionsUsed: guestRecord.questionsUsed,
                maxQuestions: guestRecord.maxQuestions || 4,
                questionsRemaining: Math.max(0, (guestRecord.maxQuestions || 4) - guestRecord.questionsUsed)
            };
        } else if (!isGuest && userId) {
            usageData = await settleAIUsage({
                userId,
                conversationId,
                model: result.model || "openai/gpt-oss-120b",
                agentMode: agent || "auto",
                promptText: trimmedPrompt,
                responseText: response,
                usageMetadata: result.usageMetadata || null,
                isImage: agent === "image"
            });
        }

        return res.status(200).json({
            success: true,
            response: response,
            conversationId: conversationId,
            images: images,
            searchResults: searchResults,
            artifacts: artifacts,
            usage: usageData,
            guestSession: guestInfo
        });

    } catch (error) {
        console.error('❌ Agent controller error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to process request"
        });
    }
};
