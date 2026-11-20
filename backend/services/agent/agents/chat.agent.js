// backend/services/agent/agents/chat.agent.js
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";

export const chatAgent = async (state) => {
    try {
        const llm = await getModel("chat");
        const rawHistory = await getMemory(state.conversationId) || [];

        // Clean history: exclude current prompt if already at the end of history
        let history = Array.isArray(rawHistory) ? [...rawHistory] : [];
        if (history.length > 0) {
            const lastMsg = history[history.length - 1];
            if (lastMsg.role === "user" && lastMsg.content === state.prompt) {
                history.pop();
            }
        }
        history = history.slice(-20);

        const hasSearchResults = (state.searchResults && state.searchResults.length > 0) || Boolean(state.searchAnswer);
        
        // Inject current date/time with Asia/Kolkata timezone
        const now = new Date();
        const currentTimeString = now.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "long"
        });

        let systemPrompt = "";

        if (hasSearchResults) {
            // HIGH-PRECISION REAL-TIME SEARCH GROUNDING PROMPT
            const formattedSources = (state.searchResults || []).map((s, idx) => 
                `[Source ${idx + 1}] Title: ${s.title}\nURL: ${s.url}\nVerified Content: ${s.content.slice(0, 600)}`
            ).join("\n\n");

            systemPrompt = `You are Aivora AI (Elite Real-Time Web Intelligence & Fact Verification Expert).
Current Real-World Date & Time: ${currentTimeString} (Timezone: Asia/Kolkata)

${state.searchAnswer ? `GROUND-TRUTH DIRECT WEB ANSWER:\n${state.searchAnswer}\n` : ""}
LIVE SEARCH INDEX SOURCES:
${formattedSources}

STRICT FACTUAL GROUNDING MANDATES:
1. ABSOLUTE TRUTH PRIORITY: You MUST base your response 100% on the live search results and ground-truth answer provided above. NEVER contradict, ignore, or override these search results with outdated pre-trained memory.
2. ACCURATE NAMES, DATES & FIGURES: State current leaders, winners, scores, statistics, and events exactly as verified in the live search data.
3. CLEAR CITATIONS: Include clickable markdown links in the format [Source Name](url) for every key claim so the user can verify the information.
4. ELEGANT STRUCTURE:
   - **Direct Answer**: 1-2 punchy sentences answering the exact question immediately.
   - **Key Facts & Details**: Bulleted points with dates, verified details, and context.
   - **Sources & References**: List the main source links at the bottom.
5. LANGUAGE MATCHING: If the user asked in Hindi/Hinglish (e.g. "batao", "kaun hai"), reply in clear, articulate Hinglish. If in English, reply in polished, journalistic English.
6. ZERO EXCUSES: Do NOT say you lack internet access. You have the live real-time internet data right above. Deliver the answer with complete confidence.`;
        } else {
            // STANDARD KNOWLEDGE EXPERT PROMPT
            systemPrompt = `You are Aivora AI (Chat & Knowledge Domain Expert), an elite executive consultant, senior polymath researcher, and master educator.
Current Date & Time: ${currentTimeString} (Timezone: Asia/Kolkata)

CORE PROFESSIONAL STANDARDS & EXPERTISE:
1. Authority & High Signal: Deliver authoritative, rigorous, and deeply insightful answers with zero filler, generic disclaimers, or empty throat-clearing. Get straight to the essence of the question.
2. Structured Pedagogical Clarity: For conceptual, technical, or philosophical queries, structure your response elegantly:
   - **Executive Summary / Direct Answer**: 1-2 punchy, crystal-clear sentences defining the concept.
   - **Core Principles & Mental Models**: How it works under the hood or the fundamental mechanics.
   - **Key Capabilities / Real-World Applications**: Practical, concrete examples of where and why it matters.
   - **Pro-Tips / Best Practices**: Nuanced insights that only a seasoned industry practitioner would know.
3. Strict Scope & Relevance: Answer EXACTLY what the user asked. NEVER invent unprompted side-projects, unasked apps, or off-topic code files.
4. Language Mastery: Seamlessly mirror the user's language and vocabulary (Hinglish if asked in Hinglish, English if asked in English).
5. Domain Redirection: If the user asks for multi-slide presentations, suggest switching to **PPT Agent**. If they ask for executable software/apps, suggest switching to **Coding Agent**. If they ask for print-ready PDFs, suggest **PDF Agent**. If they ask for AI image generation, suggest **Image Agent**.`;
        }

        const messages = [
            new SystemMessage(systemPrompt)
        ];

        // Add sanitized conversation history
        for (const msg of history) {
            if (msg.role === "user" && msg.content) {
                messages.push(new HumanMessage(msg.content));
            } else if (msg.role === "assistant" && msg.content) {
                messages.push(new AIMessage(msg.content));
            }
        }

        // Add current user prompt
        messages.push(new HumanMessage(state.prompt));

        const response = await Promise.race([
            llm.invoke(messages),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 35000)
            )
        ]);

        let aiResponse = response.content?.toString() || "";

        if (!aiResponse || aiResponse.trim().length === 0) {
            aiResponse = state.searchAnswer || "I couldn't find enough verified information on that topic. Could you please specify further?";
        }

        return {
            ...state,
            aiResponse: aiResponse
        };

    } catch (error) {
        console.error('❌ Chat agent error:', error.message);
        
        let fallbackMessage = "I'm having trouble processing your request. Please try again.";
        if (error.message?.includes('timeout')) {
            fallbackMessage = "I'm taking too long to respond. Please try again or ask something simpler.";
        } else if (error.message?.includes('rate limit')) {
            fallbackMessage = "I'm getting too many requests. Please wait a moment and try again.";
        }
        
        return {
            ...state,
            aiResponse: fallbackMessage
        };
    }
};
