import { getModel, gemini } from "../config/llmModels.js";
import { generateImageBuffer } from "../providers/image/imageProvider.js";
import storage from "../storage/storage.js";
import File from "../models/file.model.js";
import { checkAgentScope } from "../utils/agentScopeGuard.js";
import fs from "fs";
import { HumanMessage } from "@langchain/core/messages";

const getLatestImageArtifact = async (conversationId) => {
    try {
        const file = await File.findOne({
            conversationId,
            kind: "image",
            origin: "generated"
        }).sort({ createdAt: -1 });
        return file;
    } catch (_) {
        return null;
    }
};

export const imageAgent = async (state) => {
    try {
        const { prompt, conversationId, userId, attachments = [] } = state;

        // 0. Domain Scope Guard: Check if user asks for code, PPT, PDF, etc.
        const redirection = checkAgentScope("image", prompt, attachments);
        if (redirection) {
            return {
                ...state,
                aiResponse: redirection,
                artifacts: [],
                images: []
            };
        }

        const lowerPrompt = (prompt || "").toLowerCase();

        // 1. Identify image attachment
        const imageAttachment = attachments.find(
            a => a.kind === "image" || a.mimeType?.startsWith("image/")
        );

        // UNDERSTAND mode if image attached and not explicitly requesting to draw a new one
        const isUnderstand = imageAttachment && !/\b(generate|banao|nayi|draw|create another)\b/i.test(lowerPrompt);

        if (isUnderstand) {
            console.log("👁️ Image Agent in UNDERSTAND mode for:", imageAttachment.name);

            let imageBase64 = "";
            let mimeType = imageAttachment.mimeType || "image/jpeg";

            if (imageAttachment.path && fs.existsSync(imageAttachment.path)) {
                const buf = await fs.promises.readFile(imageAttachment.path);
                imageBase64 = buf.toString("base64");
            }

            if (!imageBase64) {
                return {
                    ...state,
                    aiResponse: "Image upload padhne mein dikkat aayi. Kripya image dobara upload karein."
                };
            }

            const message = new HumanMessage({
                content: [
                    {
                        type: "text",
                        text: prompt || "Describe this image in detail and answer any questions about it. Reply in the user's language."
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${imageBase64}`
                        }
                    }
                ]
            });

            const reply = await gemini.invoke([message]);
            return {
                ...state,
                aiResponse: (reply.content || "").toString()
            };
        }

        // 2. GENERATE or REGENERATE mode
        console.log("🎨 Image Agent in GENERATE mode");

        // Check for variation / regeneration of previous image
        const isRegen = /\b(dusra|dusri|another|aur|dark|bright|variations?|dobara|again)\b/i.test(lowerPrompt);
        let basePrompt = prompt;

        if (isRegen && conversationId) {
            const prevImage = await getLatestImageArtifact(conversationId);
            if (prevImage && prevImage.meta?.prompt) {
                basePrompt = `${prevImage.meta.prompt}, variation with ${prompt}`;
            }
        }

        // Refine prompt into a detailed English prompt using LLM
        const chatLlm = await getModel("chat");
        const enhancePrompt = `You are a prompt engineer for image generation models.
Convert the user request into an expanded, high-detail English image prompt describing subject, composition, lighting, style, colors, and atmosphere.
Do not include negative prompt words or preamble. Output ONLY the refined prompt text.

User Request:
${basePrompt}
`;

        const enhancedRes = await chatLlm.invoke(enhancePrompt);
        const detailedPrompt = (enhancedRes.content || "").toString().trim() || basePrompt;

        // Determine aspect ratio
        let aspectRatio = "1:1";
        if (/\b(wallpaper|16:9|desktop|horizontal|wide|landscape)\b/i.test(lowerPrompt)) {
            aspectRatio = "16:9";
        } else if (/\b(story|phone|vertical|poster|9:16)\b/i.test(lowerPrompt)) {
            aspectRatio = "9:16";
        }

        // Call image generation provider
        const { buffer, mimeType, model } = await generateImageBuffer({
            prompt: detailedPrompt,
            aspectRatio
        });

        const ext = mimeType.includes("svg") ? "svg" : mimeType.includes("webp") ? "webp" : "png";

        // Save image file
        const saved = await storage.save({
            userId: userId || "anonymous",
            buffer,
            ext
        });

        // Save File record
        const fileDoc = await File.create({
            userId: String(userId || "anonymous"),
            conversationId: conversationId || null,
            origin: "generated",
            kind: "image",
            name: `image_${Date.now()}.${ext}`,
            mimeType,
            size: saved.size,
            path: saved.path,
            meta: {
                prompt: detailedPrompt,
                model,
                aspectRatio
            }
        });

        const fileUrl = `/api/files/${fileDoc._id}`;

        const artifact = {
            id: Date.now(),
            type: "image",
            title: `Generated Image (${aspectRatio})`,
            fileId: String(fileDoc._id),
            url: fileUrl,
            mimeType,
            size: fileDoc.size,
            meta: {
                prompt: detailedPrompt,
                model,
                aspectRatio
            },
            version: 1
        };

        const friendlySummary = `Maine aapki request par image generate kar di hai ("${detailedPrompt.slice(0, 80)}..."). Aap ise chat mein aur Artifact panel mein dekh sakte hain.`;

        return {
            ...state,
            aiResponse: friendlySummary,
            images: [fileUrl],
            artifacts: [artifact]
        };

    } catch (error) {
        console.error("❌ Image Agent Error:", error);
        return {
            ...state,
            aiResponse: `Image generate karne mein dikkat aayi: ${error.message || "Kripya thodi der baad try karein."}`
        };
    }
};

export const visionAgent = imageAgent;
