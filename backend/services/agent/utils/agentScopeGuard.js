// backend/services/agent/utils/agentScopeGuard.js

/**
 * Checks if a user's prompt is outside the chosen agent's domain of expertise.
 * If out of domain, returns a polite, authoritative redirection message.
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
      return `Main Aivora AI ka **Coding Expert Agent** hoon. Mera primary expertise software development, programming architecture, web apps aur debugging me hai.\n\nPresentation slides aur pitch decks create karne ke liye kripya **PPT Agent** (mode bar me **PPT**) select karein. Wahan aapko interactive 16:9 widescreen slides, visual layouts aur speaker notes ke sath ready presentation mil jayegi.`;
    }
    // Out of scope: PDF Document / Resume
    if (/\b(pdf|resume|cv|biodata|invoice|formal\s*document)\b/i.test(p) && 
        !/\b(code|css|html|generator|react|script)\b/i.test(p)) {
      return `Main Aivora AI ka **Coding Expert Agent** hoon.\n\nPrint-ready vector PDF documents, executive resumes ya formal invoices compile karne ke liye kripya **PDF Agent** (mode bar me **PDF**) ka upyog karein.`;
    }
    // Out of scope: Pure Image Art Generation
    if (/\b(generate\s*image|draw|wallpaper|tasveer|create\s*image|photo\s*banao|painting)\b/i.test(p) && 
        !/\b(code|canvas|svg|css|html)\b/i.test(p)) {
      return `Main Aivora AI ka **Coding Expert Agent** hoon.\n\nPhotorealistic images, cinematic artwork ya digital wallpapers generate karne ke liye kripya **Image Agent** (mode bar me **Image**) select karein.`;
    }
    // Out of scope: Real-time Weather / Live News Search
    if (/\b(today'?s\s*weather|current\s*news|live\s*score|aaj\s*ka\s*mausam|stock\s*price\s*today)\b/i.test(p)) {
      return `Main Aivora AI ka **Coding Expert Agent** hoon.\n\nLive real-time web search, current news aur live data facts ke liye kripya **Search Agent** (mode bar me **Search**) select karein.`;
    }
  }

  // 2. PPT AGENT
  if (agentName === "ppt") {
    // Out of scope: Coding / Web Application
    if (/\b(build|develop|create|write)\b/i.test(p) && 
        /\b(code|website|webpage|calculator|landing\s*page|todo|game|component|api|function|javascript|python|html\s*css)\b/i.test(p) && 
        !/\b(slide|presentation|deck)\b/i.test(p)) {
      return `Main Aivora AI ka **Presentation (PPT) Expert Agent** hoon — mera core expertise professional slide decks, pitch decks aur executive visual narratives create karna hai.\n\nSoftware code likhne, interactive web applications banane ya coding debugging ke liye kripya **Coding Agent** (mode bar me **Coding**) select karein. Wahan aapko live code editor aur full interactive project preview sandbox milega.`;
    }
    // Out of scope: PDF Resume / Contract
    if (/\b(pdf|resume|cv|biodata|invoice)\b/i.test(p) && !/\b(slide|presentation|deck)\b/i.test(p)) {
      return `Main Aivora AI ka **Presentation (PPT) Agent** hoon.\n\nATS-friendly executive resumes aur printable vector PDF documents compile karne ke liye kripya **PDF Agent** (mode bar me **PDF**) ka upyog karein.`;
    }
    // Out of scope: Standalone Image Art
    if (/\b(generate\s*image|draw\s*a|wallpaper|photo\s*banao)\b/i.test(p) && !/\b(slide|presentation)\b/i.test(p)) {
      return `Main Aivora AI ka **Presentation (PPT) Agent** hoon.\n\nDigital artwork aur photorealistic images generate karne ke liye kripya **Image Agent** (mode bar me **Image**) select karein.`;
    }
  }

  // 3. PDF AGENT
  if (agentName === "pdf") {
    // Out of scope: Software / Web Apps
    if (/\b(build|develop|create|write)\b/i.test(p) && 
        /\b(website|webpage|calculator|landing\s*page|app|game|code|script)\b/i.test(p) && 
        !/\b(pdf|resume|document|report)\b/i.test(p)) {
      return `Main Aivora AI ka **PDF Document Specialist** hoon — mera primary focus printable documents, executive resumes aur vector reports compile karna hai.\n\nInteractive web applications develop karne aur code likhne ke liye kripya **Coding Agent** (mode bar me **Coding**) select karein.`;
    }
    // Out of scope: PPT / Slides
    if (/\b(ppt|presentation|slides?|slide\s*deck|powerpoint)\b/i.test(p) && !/\b(pdf|resume|document)\b/i.test(p)) {
      return `Main Aivora AI ka **PDF Specialist** hoon.\n\nMulti-slide presentations aur pitch decks create karne ke liye kripya **PPT Agent** (mode bar me **PPT**) select karein.`;
    }
    // Out of scope: Standalone Image Art
    if (/\b(generate\s*image|draw|wallpaper|photo\s*banao)\b/i.test(p) && !/\b(pdf|document)\b/i.test(p)) {
      return `Main Aivora AI ka **PDF Specialist** hoon.\n\nAI image synthesis aur artwork ke liye kripya **Image Agent** ka upyog karein.`;
    }
  }

  // 4. IMAGE AGENT
  if (agentName === "image") {
    if (!hasImage) {
      // Out of scope: Coding / Web Apps
      if (/\b(build|develop|create|write)\b/i.test(p) && 
          /\b(website|calculator|app|code|script|function|program)\b/i.test(p) && 
          !/\b(image|picture|photo|wallpaper|logo|art)\b/i.test(p)) {
        return `Main Aivora AI ka **Vision & Creative Image Agent** hoon — mera core expertise photorealistic visual synthesis, wallpapers aur image analysis me hai.\n\nSoftware development aur code generation ke liye kripya **Coding Agent** (mode bar me **Coding**) select karein.`;
      }
      // Out of scope: PPT Slides
      if (/\b(ppt|presentation|slides?|slide\s*deck)\b/i.test(p)) {
        return `Main Aivora AI ka **Image Agent** hoon.\n\nPresentation slide decks create karne ke liye kripya **PPT Agent** (mode bar me **PPT**) select karein.`;
      }
      // Out of scope: PDF Document
      if (/\b(pdf|resume|cv|biodata)\b/i.test(p)) {
        return `Main Aivora AI ka **Image Agent** hoon.\n\nPrintable documents aur executive resumes ke liye kripya **PDF Agent** (mode bar me **PDF**) select karein.`;
      }
    }
  }

  // 5. SEARCH AGENT
  if (agentName === "search") {
    // Out of scope: Explicit PPT generation
    if (/\b(create|make|build|banao)\b/i.test(p) && 
        /\b(ppt|presentation|slides?|slide\s*deck)\b/i.test(p) && 
        !/\b(search|info|facts|research)\b/i.test(p)) {
      return `Main Aivora AI ka **Real-Time Search Agent** hoon — mera focus live web facts, current news aur real-time data provide karna hai.\n\nPresentation slide decks create karne ke liye kripya **PPT Agent** (mode bar me **PPT**) select karein.`;
    }
    // Out of scope: Full application coding
    if (/\b(create|make|build|banao)\b/i.test(p) && 
        /\b(calculator|website|game|todo\s*app)\b/i.test(p) && 
        !/\b(search|research|lookup|info)\b/i.test(p)) {
      return `Main Aivora AI ka **Real-Time Search Agent** hoon.\n\nCode likhne aur complete web application develop karne ke liye kripya **Coding Agent** (mode bar me **Coding**) select karein.`;
    }
  }

  return null;
}
