// backend/services/agent/utils/agentScopeGuard.js

/**
 * Checks if a user's prompt is outside the chosen agent's domain of expertise.
 * If out of domain, returns a polite, authoritative redirection message in professional English.
 * If within domain, returns null.
 */
export function checkAgentScope(agentName, prompt = "", attachments = []) {
  if (!agentName || agentName === "auto" || agentName === "chat") {
    return null;
  }

  const p = prompt.trim().toLowerCase();
  const hasPdf = Array.isArray(attachments) && attachments.some(a => a.kind === "pdf" || a.mimeType === "application/pdf");
  const hasImage = Array.isArray(attachments) && attachments.some(a => a.kind === "image" || a.mimeType?.startsWith("image/"));

  // 1. CODING AGENT
  if (agentName === "coding") {
    // Out of scope: PPT / Slide Deck
    if (/\b(ppt|presentation|slides?|slide\s*deck|keynote|powerpoint|slid)\b/i.test(p) && 
        !/\b(code|react|component|html|library|script|api|function|css)\b/i.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**. My domain of expertise is software engineering, code generation, full-stack web applications, and debugging.\n\nTo create presentation slides or pitch decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above). The PPT Agent will generate an interactive 16:9 widescreen presentation complete with visual layouts, speaker notes, and a downloadable \`.pptx\` file.`;
    }
    // Out of scope: PDF Document / Resume
    if (/\b(pdf|resume|cv|biodata|invoice|formal\s*document)\b/i.test(p) && 
        !/\b(code|css|html|generator|react|script)\b/i.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**.\n\nTo compile print-ready vector PDF documents, executive resumes, or formal invoices, please switch to the **PDF Agent** (select **PDF** in the mode selector above).`;
    }
    // Out of scope: Pure Image Art Generation
    if (/\b(generate\s*image|draw|wallpaper|tasveer|create\s*image|photo\s*banao|painting)\b/i.test(p) && 
        !/\b(code|canvas|svg|css|html)\b/i.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**.\n\nTo generate cinematic artwork, photorealistic images, or digital wallpapers, please switch to the **Image Agent** (select **Image** in the mode selector above).`;
    }
    // Out of scope: Real-time Weather / Live News Search
    if (/\b(today'?s\s*weather|current\s*news|live\s*score|aaj\s*ka\s*mausam|stock\s*price\s*today)\b/i.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**.\n\nFor real-time internet searches, current events, live scores, and verified web facts, please switch to the **Search Agent** (select **Search** in the mode selector above).`;
    }
  }

  // 2. PPT AGENT
  if (agentName === "ppt") {
    // Out of scope: Coding / Web Application
    if (/\b(build|develop|create|write)\b/i.test(p) && 
        /\b(code|website|webpage|calculator|landing\s*page|todo|game|component|api|function|javascript|python|html\s*css)\b/i.test(p) && 
        !/\b(slide|presentation|deck)\b/i.test(p)) {
      return `I am Aivora AI's **Presentation (PPT) Expert Agent**. My domain of expertise is designing high-impact slide decks, pitch decks, and visual keynote narratives.\n\nTo build software applications, write executable code, or debug scripts, please switch to the **Coding Agent** (select **Coding** in the mode selector above). The Coding Agent provides a live code editor and an interactive preview sandbox.`;
    }
    // Out of scope: PDF Resume / Contract
    if (/\b(pdf|resume|cv|biodata|invoice)\b/i.test(p) && !/\b(slide|presentation|deck)\b/i.test(p)) {
      return `I am Aivora AI's **Presentation (PPT) Agent**.\n\nTo generate ATS-friendly executive resumes or formal PDF documents, please switch to the **PDF Agent** (select **PDF** in the mode selector above).`;
    }
    // Out of scope: Standalone Image Art
    if (/\b(generate\s*image|draw\s*a|wallpaper|photo\s*banao)\b/i.test(p) && !/\b(slide|presentation)\b/i.test(p)) {
      return `I am Aivora AI's **Presentation (PPT) Agent**.\n\nTo synthesize digital artwork or photorealistic images, please switch to the **Image Agent** (select **Image** in the mode selector above).`;
    }
  }

  // 3. PDF AGENT
  if (agentName === "pdf") {
    // Out of scope: Software / Web Apps
    if (/\b(build|develop|create|write)\b/i.test(p) && 
        /\b(website|webpage|calculator|landing\s*page|app|game|code|script)\b/i.test(p) && 
        !/\b(pdf|resume|document|report)\b/i.test(p)) {
      return `I am Aivora AI's **PDF Document Specialist**. My primary focus is compiling print-ready documents, executive resumes, whitepapers, and vector reports.\n\nTo build web applications or write software code, please switch to the **Coding Agent** (select **Coding** in the mode selector above).`;
    }
    // Out of scope: PPT / Slides
    if (/\b(ppt|presentation|slides?|slide\s*deck|powerpoint)\b/i.test(p) && !/\b(pdf|resume|document)\b/i.test(p)) {
      return `I am Aivora AI's **PDF Specialist**.\n\nTo create multi-slide presentations and pitch decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above).`;
    }
    // Out of scope: Standalone Image Art
    if (/\b(generate\s*image|draw|wallpaper|photo\s*banao)\b/i.test(p) && !/\b(pdf|document)\b/i.test(p)) {
      return `I am Aivora AI's **PDF Specialist**.\n\nFor AI visual artwork and image generation, please switch to the **Image Agent** (select **Image** in the mode selector above).`;
    }
  }

  // 4. IMAGE AGENT
  if (agentName === "image") {
    if (!hasImage) {
      // Out of scope: Coding / Web Apps
      if (/\b(build|develop|create|write)\b/i.test(p) && 
          /\b(website|calculator|app|code|script|function|program)\b/i.test(p) && 
          !/\b(image|picture|photo|wallpaper|logo|art)\b/i.test(p)) {
        return `I am Aivora AI's **Vision & Creative Image Agent**. My core specialty is cinematic visual synthesis, wallpaper design, and image analysis.\n\nTo develop web applications or write software code, please switch to the **Coding Agent** (select **Coding** in the mode selector above).`;
      }
      // Out of scope: PPT Slides
      if (/\b(ppt|presentation|slides?|slide\s*deck)\b/i.test(p)) {
        return `I am Aivora AI's **Image Agent**.\n\nTo generate presentation slide decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above).`;
      }
      // Out of scope: PDF Document
      if (/\b(pdf|resume|cv|biodata)\b/i.test(p)) {
        return `I am Aivora AI's **Image Agent**.\n\nTo generate printable documents and executive resumes, please switch to the **PDF Agent** (select **PDF** in the mode selector above).`;
      }
    }
  }

  // 5. SEARCH AGENT
  if (agentName === "search") {
    // Out of scope: Explicit PPT generation
    if (/\b(create|make|build|banao)\b/i.test(p) && 
        /\b(ppt|presentation|slides?|slide\s*deck)\b/i.test(p) && 
        !/\b(search|info|facts|research)\b/i.test(p)) {
      return `I am Aivora AI's **Real-Time Search Agent**. My focus is providing live web facts, current events, and verified data citations.\n\nTo create multi-slide presentations or pitch decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above).`;
    }
    // Out of scope: Full application coding
    if (/\b(create|make|build|banao)\b/i.test(p) && 
        /\b(calculator|website|game|todo\s*app)\b/i.test(p) && 
        !/\b(search|research|lookup|info)\b/i.test(p)) {
      return `I am Aivora AI's **Real-Time Search Agent**.\n\nTo write application code and build interactive projects, please switch to the **Coding Agent** (select **Coding** in the mode selector above).`;
    }
  }

  return null;
}
