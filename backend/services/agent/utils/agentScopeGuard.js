// backend/services/agent/utils/agentScopeGuard.js

const CODING_TOPIC_REGEX = /\b(code|coding|program|programming|developer|software|script|function|algorithm|debug|debugging|bug|error|exception|class|method|api|rest|sql|database|html|css|javascript|typescript|python|java|c\+\+|c#|golang|rust|php|react|angular|vue|node|express|frontend|backend|fullstack|variable|loop|array|object|git|docker|json|regex|async|promise|component|ui|calculator|website|webpage|app|sdk|framework|library|terminal|bash|shell|compiler|runtime|syntax|refactor|test|unit\s*test|mock|query|crud|orm|jwt|auth|endpoint|server|client|state|props|hook|redux|tailwind|bootstrap|flexbox|grid|dom|event|pointer|memory|stack|heap|queue|tree|graph|hash\s*map|binary\s*search|sort|recursion|lambda|closure|decorator|generator|package|module|import|export|npm|pip|yarn)\b/i;

const PPT_TOPIC_REGEX = /\b(ppt|presentation|slides?|slide\s*deck|keynote|powerpoint|deck)\b/i;
const PDF_TOPIC_REGEX = /\b(pdf|resume|cv|biodata|invoice|document|contract|report|whitepaper|agreement)\b/i;
const IMAGE_TOPIC_REGEX = /\b(image|picture|photo|wallpaper|illustration|draw|drawing|art|logo|portrait|render|sketch|graphic|tasveer|painting)\b/i;
const SEARCH_TOPIC_REGEX = /\b(today'?s\s*weather|current\s*news|live\s*score|stock\s*price|who\s*won\s*today|latest\s*news|current\s*time|time\s*in|weather\s*in)\b/i;

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
    // If asking for PPT / Slides
    if (PPT_TOPIC_REGEX.test(p) && !CODING_TOPIC_REGEX.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**. My domain of expertise is software engineering, code synthesis, algorithms, and debugging.\n\nTo generate presentation slides or pitch decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above). The PPT Agent will generate an interactive 16:9 widescreen presentation with downloadable \`.pptx\` format.`;
    }
    // If asking for PDF Document / Resume
    if (PDF_TOPIC_REGEX.test(p) && !CODING_TOPIC_REGEX.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**.\n\nTo compile print-ready vector PDF documents, executive resumes, or formal invoices, please switch to the **PDF Agent** (select **PDF** in the mode selector above).`;
    }
    // If asking for pure Image Art Generation
    if (IMAGE_TOPIC_REGEX.test(p) && !CODING_TOPIC_REGEX.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**.\n\nTo generate photorealistic images, digital artwork, or wallpapers, please switch to the **Image Agent** (select **Image** in the mode selector above).`;
    }
    // If asking for Live News / Weather
    if (SEARCH_TOPIC_REGEX.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**.\n\nFor real-time internet searches, breaking news, live scores, and verified facts, please switch to the **Search Agent** (select **Search** in the mode selector above).`;
    }
    // If NOT asking for coding / software at all (e.g. general knowledge, biography, history, trivia)
    if (!CODING_TOPIC_REGEX.test(p)) {
      return `I am Aivora AI's **Coding Expert Agent**. My domain of expertise is software engineering, code generation, programming architecture, and technical debugging.\n\nYour question is about a general knowledge, biographical, or non-programming topic. Please switch to the **Chat Agent** (select **Chat** in the mode selector above) for a comprehensive explanation, or use the **Search Agent** for live web intelligence.`;
    }
  }

  // 2. PPT AGENT
  if (agentName === "ppt") {
    if (!PPT_TOPIC_REGEX.test(p)) {
      if (CODING_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **Presentation (PPT) Expert Agent**. My domain of expertise is designing high-impact slide decks, pitch decks, and visual keynote narratives.\n\nTo build software applications, write executable code, or debug scripts, please switch to the **Coding Agent** (select **Coding** in the mode selector above). The Coding Agent provides a live code editor and an interactive preview sandbox.`;
      }
      if (PDF_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **Presentation (PPT) Agent**.\n\nTo compile ATS-friendly executive resumes or formal PDF documents, please switch to the **PDF Agent** (select **PDF** in the mode selector above).`;
      }
      if (IMAGE_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **Presentation (PPT) Agent**.\n\nTo synthesize digital artwork or photorealistic images, please switch to the **Image Agent** (select **Image** in the mode selector above).`;
      }
      // General QA / Biography
      return `I am Aivora AI's **Presentation (PPT) Expert Agent**. My domain of expertise is creating presentation slide decks and visual pitch decks.\n\nFor general knowledge, biographies, or conceptual discussions, please switch to the **Chat Agent** (select **Chat** in the mode selector above), or ask me to **create a presentation on this topic**.`;
    }
  }

  // 3. PDF AGENT
  if (agentName === "pdf") {
    if (!hasPdf && !PDF_TOPIC_REGEX.test(p)) {
      if (CODING_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **PDF Document Specialist**. My primary focus is compiling print-ready vector documents, executive resumes, and formal reports.\n\nTo build web applications or write software code, please switch to the **Coding Agent** (select **Coding** in the mode selector above).`;
      }
      if (PPT_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **PDF Specialist**.\n\nTo create multi-slide presentations and pitch decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above).`;
      }
      if (IMAGE_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **PDF Specialist**.\n\nFor AI visual artwork and image generation, please switch to the **Image Agent** (select **Image** in the mode selector above).`;
      }
      // General QA / Biography
      return `I am Aivora AI's **PDF Document Specialist**. My domain of expertise is compiling print-ready documents, executive resumes, and formal reports.\n\nFor general knowledge or conceptual questions, please switch to the **Chat Agent** (select **Chat** in the mode selector above), or ask me to **create an executive summary document on this topic**.`;
    }
  }

  // 4. IMAGE AGENT
  if (agentName === "image") {
    if (!hasImage && !IMAGE_TOPIC_REGEX.test(p)) {
      if (CODING_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **Vision & Creative Image Agent**. My core specialty is cinematic visual synthesis, wallpaper design, and image analysis.\n\nTo develop web applications or write software code, please switch to the **Coding Agent** (select **Coding** in the mode selector above).`;
      }
      if (PPT_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **Image Agent**.\n\nTo generate presentation slide decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above).`;
      }
      if (PDF_TOPIC_REGEX.test(p)) {
        return `I am Aivora AI's **Image Agent**.\n\nTo generate printable documents and executive resumes, please switch to the **PDF Agent** (select **PDF** in the mode selector above).`;
      }
      // General QA / Biography
      return `I am Aivora AI's **Vision & Creative Image Agent**. My domain of expertise is cinematic visual synthesis, wallpaper design, and image analysis.\n\nFor general knowledge or biographical questions, please switch to the **Chat Agent** (select **Chat** in the mode selector above), or ask me to **generate a portrait image of this subject**.`;
    }
  }

  // 5. SEARCH AGENT
  if (agentName === "search") {
    if (CODING_TOPIC_REGEX.test(p) && /\b(build|develop|create|write|code\s*for|make\s*a\s*calculator|make\s*a\s*website)\b/i.test(p)) {
      return `I am Aivora AI's **Real-Time Search Agent**. My focus is providing live web facts, current events, and verified data citations.\n\nTo write application code and build interactive projects, please switch to the **Coding Agent** (select **Coding** in the mode selector above).`;
    }
    if (PPT_TOPIC_REGEX.test(p) && /\b(create|make|build|banao)\b/i.test(p)) {
      return `I am Aivora AI's **Real-Time Search Agent**.\n\nTo create multi-slide presentations or pitch decks, please switch to the **Presentation (PPT) Agent** (select **PPT** in the mode selector above).`;
    }
    if (PDF_TOPIC_REGEX.test(p) && /\b(create|make|generate|compile)\b/i.test(p)) {
      return `I am Aivora AI's **Real-Time Search Agent**.\n\nTo compile formal documents and executive resumes, please switch to the **PDF Agent** (select **PDF** in the mode selector above).`;
    }
    if (IMAGE_TOPIC_REGEX.test(p) && /\b(generate|draw|create)\b/i.test(p)) {
      return `I am Aivora AI's **Real-Time Search Agent**.\n\nTo generate digital artwork or photorealistic images, please switch to the **Image Agent** (select **Image** in the mode selector above).`;
    }
  }

  return null;
}
