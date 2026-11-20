import { getModel } from "../config/llmModels.js";
import { buildPptxDeck } from "../utils/pptxBuilder.js";
import storage from "../storage/storage.js";
import File from "../models/file.model.js";
import { checkAgentScope } from "../utils/agentScopeGuard.js";

/**
 * Fetch latest generated PPT in conversation
 */
const getLatestPptArtifact = async (conversationId) => {
    try {
        const file = await File.findOne({
            conversationId,
            kind: "ppt",
            origin: "generated"
        }).sort({ createdAt: -1 });

        return file;
    } catch (_) {
        return null;
    }
};

const parsePptJson = (rawContent) => {
    if (!rawContent || typeof rawContent !== "string") {
        throw new Error("Empty model response");
    }
    let cleaned = rawContent.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
};

export const pptAgent = async (state) => {
    try {
        const { prompt, conversationId, userId, attachments = [] } = state;
        const lowerPrompt = (prompt || "").toLowerCase();

        // 0. Domain Scope Guard: Check if user asks for code, PDF, image, etc.
        const redirection = checkAgentScope("ppt", prompt, attachments);
        if (redirection) {
            return {
                ...state,
                aiResponse: redirection,
                artifacts: []
            };
        }

        console.log("📊 PPT Agent processing request");

        // Check for follow-up edit on existing presentation
        const isEditRequest = /\b(edit|change|update|add|dark|theme|pricing|slide|nayi slide|ek slide|badlo)\b/i.test(lowerPrompt);
        let previousPpt = null;
        let previousSlides = null;
        let previousTheme = "modern";
        let version = 1;

        if (isEditRequest && conversationId) {
            previousPpt = await getLatestPptArtifact(conversationId);
            if (previousPpt && previousPpt.meta?.slides) {
                previousSlides = previousPpt.meta.slides;
                previousTheme = previousPpt.meta.theme || "modern";
                version = (previousPpt.meta.version || 1) + 1;
            }
        }

        // Detect requested slide count or default 8
        const countMatch = lowerPrompt.match(/(\d+)\s*(?:slides?|pages?|slid)/i);
        const requestedCount = countMatch ? Math.min(Math.max(parseInt(countMatch[1], 10), 3), 15) : 8;

        // Detect theme preference
        let chosenTheme = previousTheme;
        if (/\b(dark|kaala|night)\b/i.test(lowerPrompt)) chosenTheme = "dark";
        else if (/\b(vibrant|purple|colorful)\b/i.test(lowerPrompt)) chosenTheme = "vibrant";
        else if (/\b(corporate|blue|business)\b/i.test(lowerPrompt)) chosenTheme = "corporate";
        else if (/\b(minimal|clean|simple)\b/i.test(lowerPrompt)) chosenTheme = "minimal";

        const llm = await getModel("ppt");

        const systemPrompt = `You are an expert presentation designer. Create a high-impact, professional slide deck in JSON format.

JSON Schema to return:
{
  "title": "Short Deck Title",
  "theme": "${chosenTheme}",
  "slides": [
    {
      "layout": "title" | "section" | "bullets" | "two-column" | "comparison-table" | "stats" | "closing",
      "title": "Slide Title (max 8 words)",
      "subtitle": "Optional Subtitle",
      "bullets": ["Bullet 1 (max 14 words)", "Bullet 2"],
      "left": ["Left column point"],
      "right": ["Right column point"],
      "table": {
        "headers": ["Col 1", "Col 2"],
        "rows": [["Val A", "Val B"]]
      },
      "stats": [
        { "label": "Growth Rate", "value": "+85%" },
        { "label": "Active Users", "value": "10M+" }
      ],
      "notes": "Speaker notes for this slide"
    }
  ]
}

Constraints:
1. Target exactly ${requestedCount} slides.
2. Slide 1 MUST have layout "title", and the final slide MUST have layout "closing".
3. Keep bullets punchy: maximum 6 bullets per slide, maximum 14 words per bullet.
4. Provide realistic, concise speaker notes for every slide.
5. If the user writes in Hindi or Hinglish, keep the slide text and speaker notes in that same language.
6. Return ONLY valid JSON, with NO surrounding markdown fences, NO extra dialogue.

${previousSlides ? `THIS IS AN EDIT REQUEST. Update the following existing presentation slides based on the user prompt:\n\n${JSON.stringify({ title: previousPpt.name, theme: chosenTheme, slides: previousSlides }, null, 2)}\n\n` : ''}

USER PROMPT:
${prompt}
`;

        const response = await Promise.race([
            llm.invoke(systemPrompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error("PPT generation timed out")), 90000))
        ]);

        let deckData;
        try {
            deckData = parsePptJson(response.content);
        } catch (firstParseErr) {
            console.warn("⚠️ Initial PPT JSON parse failed, retrying once with fix prompt:", firstParseErr.message);
            const retryRes = await llm.invoke(
                `The following was not valid JSON. Fix it and return valid JSON only:\n\n${(response.content || "").slice(0, 4000)}`
            );
            deckData = parsePptJson(retryRes.content);
        }

        // Fallback title and theme
        deckData.title = deckData.title || "Presentation";
        deckData.theme = deckData.theme || chosenTheme;
        if (!Array.isArray(deckData.slides) || deckData.slides.length === 0) {
            throw new Error("Model failed to generate slide array");
        }

        // Build .pptx presentation
        const pptxBuffer = await buildPptxDeck(deckData);

        // Save to disk
        const saved = await storage.save({
            userId: userId || "anonymous",
            buffer: pptxBuffer,
            ext: "pptx"
        });

        // Save File record
        const fileDoc = await File.create({
            userId: String(userId || "anonymous"),
            conversationId: conversationId || null,
            origin: "generated",
            kind: "ppt",
            name: `${deckData.title.toLowerCase().replace(/\s+/g, "_")}_v${version}.pptx`,
            mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            size: saved.size,
            path: saved.path,
            pages: deckData.slides.length,
            meta: {
                slides: deckData.slides,
                theme: deckData.theme,
                version,
                parentId: previousPpt?._id || null
            }
        });

        const artifact = {
            id: Date.now(),
            type: "ppt",
            title: `${deckData.title} (v${version})`,
            fileId: String(fileDoc._id),
            url: `/api/files/${fileDoc._id}`,
            mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            size: fileDoc.size,
            meta: {
                slides: deckData.slides,
                theme: deckData.theme,
                version
            },
            version,
            parentId: previousPpt?._id || null
        };

        const friendlySummary = version > 1
            ? `Maine aapka updated PPT (v${version}, ${deckData.slides.length} slides) taiyaar kar diya hai. Aap ise Artifact panel mein dekh sakte hain aur download kar sakte hain.`
            : `Maine "${deckData.title}" par ${deckData.slides.length} slides ka presentation taiyaar kar diya hai. Iska preview aap Artifact panel mein dekh sakte hain aur .pptx file download kar sakte hain.`;

        return {
            ...state,
            aiResponse: friendlySummary,
            artifacts: [artifact]
        };

    } catch (error) {
        console.error("❌ PPT Agent Error:", error);
        return {
            ...state,
            aiResponse: `PPT generate karte samay problem aayi: ${error.message || "Kripya dobara koshish karein."}`
        };
    }
};
