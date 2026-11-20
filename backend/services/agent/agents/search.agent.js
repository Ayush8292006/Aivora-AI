// backend/services/agent/agents/search.agent.js
import axios from "axios";
import { searchTool } from "../config/tavily.js";
import { checkAgentScope } from "../utils/agentScopeGuard.js";

/**
 * Clean and optimize the user's prompt for search engines
 */
const cleanSearchQuery = (prompt = "") => {
  let q = prompt.trim();
  // Strip common conversational chat prefixes
  q = q.replace(/^(please\s+)?(search\s+for|search|google|find\s+me|find|look\s+up|tell\s+me\s+about|batao|kya\s+hai|search\s+karke\s+batao|can\s+you\s+search)\s+/i, "");
  // Strip trailing punctuation
  q = q.replace(/[?!.]+$/, "").trim();
  return q || prompt.trim();
};

export const searchAgent = async (state) => {
  try {
    console.log("🔍 Search agent invoked for:", state.prompt);

    if (!state || !state.prompt) {
      return {
        ...state,
        searchResults: [],
        searchAnswer: "",
        images: [],
        aiResponse: "Please provide a query or topic to search."
      };
    }

    // 1. Domain Scope Guard
    const redirection = checkAgentScope("search", state.prompt, state.attachments || []);
    if (redirection) {
      return {
        ...state,
        searchResults: [],
        searchAnswer: "",
        images: [],
        aiResponse: redirection
      };
    }

    const searchQuery = cleanSearchQuery(state.prompt);
    console.log("🔍 Optimized Search Query:", searchQuery);

    const apiKey = process.env.TAVILY_API_KEY;
    let tavilyData = null;

    // 2. Primary: Direct Tavily Advanced Search API for maximum factual accuracy & instant ground-truth answer
    if (apiKey && !apiKey.includes("placeholder")) {
      try {
        const response = await axios.post(
          "https://api.tavily.com/search",
          {
            api_key: apiKey,
            query: searchQuery,
            search_depth: "advanced",
            include_answer: true,
            include_images: true,
            max_results: 6
          },
          { timeout: 12000 }
        );

        if (response.data) {
          tavilyData = response.data;
          console.log("✅ Tavily Advanced Search responded successfully");
        }
      } catch (directErr) {
        console.warn("⚠️ Direct Tavily API warning, falling back to searchTool:", directErr.response?.data || directErr.message);
      }
    }

    // 3. Fallback: searchTool from @langchain/tavily if direct API did not respond
    if (!tavilyData && searchTool) {
      try {
        const toolRes = await searchTool.invoke({
          query: searchQuery,
          searchDepth: "advanced",
          maxResults: 6,
          topic: "general",
          includeImages: true,
          includeImageDescriptions: true
        });
        tavilyData = toolRes;
      } catch (toolErr) {
        console.warn("⚠️ Tavily searchTool error:", toolErr.message);
      }
    }

    // 4. Extract verified Ground Truth Answer and Web Sources
    const searchAnswer = tavilyData?.answer || "";
    let rawResults = tavilyData?.results || (Array.isArray(tavilyData) ? tavilyData : []);
    
    // Ensure clean array of results
    const searchResults = (Array.isArray(rawResults) ? rawResults : [])
      .filter(r => r && (r.title || r.url || r.content))
      .map(r => ({
        title: r.title || "Web Source",
        url: r.url || "",
        content: (r.content || r.snippet || "").trim(),
        score: r.score || null
      }));

    // 5. Extract Images
    let images = [];
    if (Array.isArray(tavilyData?.images)) {
      images = tavilyData.images
        .map(img => (typeof img === "string" ? img : img?.url || img?.src || null))
        .filter(url => url && typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://")));
    }

    console.log(`📊 Found ${searchResults.length} verified web sources & direct ground-truth answer: ${Boolean(searchAnswer)}`);

    return {
      ...state,
      searchResults,
      searchAnswer,
      searchQuery,
      images: [...new Set(images)].slice(0, 4)
    };

  } catch (error) {
    console.error("❌ Search agent error:", error.message);
    return {
      ...state,
      searchResults: [],
      searchAnswer: "",
      images: [],
      aiResponse: `Search error: ${error.message || "Failed to fetch real-time search results."}`
    };
  }
};
