// backend/services/agent/graph/router.js
import { getModel } from "../config/llmModels.js";

export const router = async (state) => {
  try {
    const userPrompt = (state.prompt || "").trim();
    const lowerPrompt = userPrompt.toLowerCase();
    const attachments = state.attachments || [];

    // 1. If agent is explicitly picked by user (not "auto")
    if (state.agent && state.agent.toLowerCase() !== "auto") {
      let mappedAgent = state.agent.toLowerCase().trim();
      if (mappedAgent === "vision") mappedAgent = "image";
      console.log(`🎯 Explicitly selected agent: ${mappedAgent}`);
      return {
        ...state,
        agent: mappedAgent
      };
    }

    // 2. Deterministic routing by attachments
    if (attachments.length > 0) {
      const hasPdf = attachments.some(a => a.kind === "pdf" || a.mimeType === "application/pdf");
      const hasImage = attachments.some(a => a.kind === "image" || a.mimeType?.startsWith("image/"));

      if (hasPdf && !/\b(image|draw|ppt|slides)\b/i.test(lowerPrompt)) {
        console.log("🎯 Attachment detected (PDF) -> Routing to pdf agent");
        return { ...state, agent: "pdf" };
      }

      if (hasImage && !/\b(pdf|resume|ppt|slides)\b/i.test(lowerPrompt)) {
        console.log("🎯 Attachment detected (Image) -> Routing to image agent");
        return { ...state, agent: "image" };
      }
    }

    // 3. Keyword rules (English + Hindi / Hinglish)
    // PPT keywords
    if (/\b(ppt|powerpoint|slides?|presentation|slide\s*deck|slides?\s*banao|presentation\s*banao|deck)\b/i.test(lowerPrompt)) {
      console.log("🎯 Keyword match -> Routing to ppt agent");
      return { ...state, agent: "ppt" };
    }

    // PDF keywords
    if (/\b(pdf|resume|cv|biodata|invoice|report\s*banao|document\s*banao|bill\s*banao|pdf\s*banao|pdf\s*bana\s*do)\b/i.test(lowerPrompt)) {
      console.log("🎯 Keyword match -> Routing to pdf agent");
      return { ...state, agent: "pdf" };
    }

    // Image keywords
    if (/\b(image|photo|picture|draw|logo|poster|wallpaper|tasveer|generate\s*image|draw\s*karo|chitra|photo\s*banao)\b/i.test(lowerPrompt)) {
      console.log("🎯 Keyword match -> Routing to image agent");
      return { ...state, agent: "image" };
    }

    // 4. Fallback to LLM classification
    const llm = await getModel("router");
    const prompt = `You are an agent router. Classify the user query into ONE of these agents:

chat
search
coding
pdf
ppt
image

Rules:
- ppt: Presentations, slides, deck, slide summaries.
- pdf: Reports, resumes, documents, invoices, letters to download as PDF.
- image: Generating images, photos, illustrations, wallpapers, logos, drawings.
- coding: Web projects, HTML/CSS/JS, algorithms, software development.
- search: Real-time news, current weather, scores, live stock prices.
- chat: General discussions, advice, questions, greetings.

User Query:
${userPrompt}

Return ONLY the single agent word:`;

    const response = await Promise.race([
      llm.invoke(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Router LLM timeout")), 10000))
    ]);

    let agent = (response.content || "").toString().trim().toLowerCase();
    if (agent === "vision") agent = "image";

    const validAgents = ["chat", "search", "coding", "pdf", "ppt", "image"];
    const selectedAgent = validAgents.includes(agent) ? agent : "chat";

    console.log(`🎯 Router classified agent: ${selectedAgent}`);

    return {
      ...state,
      agent: selectedAgent
    };

  } catch (error) {
    console.error("❌ Router error, defaulting to chat:", error.message);
    return {
      ...state,
      agent: "chat"
    };
  }
};
