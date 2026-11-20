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
        
        // Exact live time and date in IST (Asia/Kolkata)
        const now = new Date();
        const liveTimeIST = now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
        const liveDateIST = now.toLocaleDateString("en-US", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        let systemPrompt = "";

        if (hasSearchResults) {
            // HIGH-PRECISION REAL-TIME SEARCH GROUNDING PROMPT
            const formattedSources = (state.searchResults || []).map((s, idx) => 
                `[Source ${idx + 1}] Title: ${s.title}\nURL: ${s.url}\nVerified Content: ${s.content.slice(0, 600)}`
            ).join("\n\n");

            systemPrompt = `You are Aivora AI (Elite Real-Time Web Intelligence & Fact Verification Expert).

AUTHORITATIVE REAL-TIME SYSTEM CLOCK:
Current Time (India/IST): ${liveTimeIST} (UTC+5:30)
Current Date (India): ${liveDateIST}

${state.searchAnswer ? `GROUND-TRUTH DIRECT ANSWER:\n${state.searchAnswer}\n` : ""}
LIVE SEARCH INDEX SOURCES:
${formattedSources}

STRICT FACTUAL GROUNDING MANDATES:
1. TIME & DATE QUERIES: If the user asks for the current time or date, ALWAYS state ${liveTimeIST} on ${liveDateIST}. Web scraper snippets on search engines display stale cached timestamps from when they indexed a page; NEVER use stale web page clock snippets.
2. ABSOLUTE TRUTH PRIORITY: You MUST base your factual response on the verified ground truth data and live search index above. NEVER contradict, ignore, or override these search results with outdated pre-trained memory.
3. ACCURATE NAMES, DATES & FIGURES: State current leaders, winners, scores, statistics, and events exactly as verified in the live data.
4. CLEAR CITATIONS: Include clickable markdown links in the format [Source Name](url) for verified claims so the user can verify the information.
5. ELEGANT STRUCTURE:
   - **Direct Answer**: Provide a punchy sentence answering the exact question immediately.
   - **Key Details & Context**: Bulleted points with dates, verified details, and context.
   - **Sources**: List the main source links at the bottom.
6. LANGUAGE: Respond in clear, articulate English (or match user language if requested).`;
        } else {
            // STANDARD KNOWLEDGE EXPERT PROMPT
            systemPrompt = `You are Aivora AI (Chat & Knowledge Domain Expert), an elite executive consultant, senior polymath researcher, and master educator.
Current System Clock: ${liveTimeIST} on ${liveDateIST} (IST / Asia/Kolkata)

CORE PROFESSIONAL STANDARDS & EXPERTISE:
1. Authority & High Signal: Deliver authoritative, rigorous, and deeply insightful answers with zero filler, generic disclaimers, or empty throat-clearing. Get straight to the essence of the question.
2. Pedagogical Clarity: Provide an Executive Summary first, followed by core principles and real-world context.
3. Strict Scope & Relevance: Answer EXACTLY what the user asked.
4. Polite Domain Redirection: If the user asks for multi-slide presentations, suggest switching to **PPT Agent**. If they ask for executable software/apps, suggest switching to **Coding Agent**. If they ask for print-ready PDFs, suggest **PDF Agent**. If they ask for AI image generation, suggest **Image Agent**. If they ask for current news/weather, suggest **Search Agent**.`;
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
