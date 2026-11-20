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
    // PPT keywords (explicit requests for presentation / slides)
    if (/\b(ppt|powerpoint|slides?|presentation|slide\s*deck|slides?\s*banao|presentation\s*banao|deck)\b/i.test(lowerPrompt)) {
      console.log("🎯 Keyword match -> Routing to ppt agent");
      return { ...state, agent: "ppt" };
    }

    // PDF keywords (explicit requests for PDF, resume, invoice, document)
    if (/\b(pdf|resume|cv|biodata|invoice|report\s*banao|document\s*banao|bill\s*banao|pdf\s*banao|pdf\s*bana\s*do)\b/i.test(lowerPrompt)) {
      console.log("🎯 Keyword match -> Routing to pdf agent");
      return { ...state, agent: "pdf" };
    }

    // Image keywords (explicit requests for visual image generation)
    if (/\b(generate\s*image|draw|wallpaper|tasveer|create\s*image|draw\s*karo|chitra|photo\s*banao|logo\s*banao|illustration\s*banao)\b/i.test(lowerPrompt)) {
      console.log("🎯 Keyword match -> Routing to image agent");
      return { ...state, agent: "image" };
    }

    // Conceptual / Informational questions (e.g. "what is javascript", "explain closure", "what is an api")
    // Should ALWAYS go to chat agent unless user explicitly asks to generate/code a project.
    const isConceptualQuestion = /\b(what\s+is|what\s+are|explain|samjhao|kya\s+hai|kya\s+hota\s+hai|tell\s+me\s+about|difference\s+between|how\s+does|why\s+use|meaning\s+of)\b/i.test(lowerPrompt);
    const isExplicitBuildRequest = /\b(build|create\s+a|make\s+a|banao|develop|generate\s+code|write\s+a\s+program|write\s+code)\b/i.test(lowerPrompt);

    if (isConceptualQuestion && !isExplicitBuildRequest) {
      console.log("🎯 Conceptual / QA question detected -> Routing to chat agent");
      return { ...state, agent: "chat" };
    }

    // Explicit coding / project generation keywords
    if (/\b(create\s+(a\s+)?(website|webpage|calculator|landing\s*page|portfolio|todo|game|component)|build\s+(a\s+)?(website|app)|write\s+(code|function|script)|fix\s+(this\s+)?(bug|error|code)|debug|refactor)\b/i.test(lowerPrompt)) {
      console.log("🎯 Explicit coding project match -> Routing to coding agent");
      return { ...state, agent: "coding" };
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
- chat: Conceptual questions, definitions, explanations (e.g. "what is javascript", "what is an API", "explain react"), general discussion, greetings, writing advice.
- coding: ONLY when the user explicitly asks to generate code, build a website/application, implement a programming task, or debug/fix code.
- search: Current real-time events, live weather, today's news, current stock prices, live sports scores.
- pdf: Creating or editing formal PDF documents, resumes, CVs, invoices, or reports.
- ppt: Creating or editing presentation slides, slide decks, or PowerPoint files.
- image: Creating, generating, or designing images, illustrations, or wallpapers.

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
