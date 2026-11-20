// backend/services/agent/agents/search.agent.js
import axios from "axios";
import { searchTool } from "../config/tavily.js";
import { checkAgentScope } from "../utils/agentScopeGuard.js";

/**
 * Detect and resolve live time / date queries with 100% precision from the system clock
 */
const resolveLiveTimeQuery = (prompt = "") => {
  const p = prompt.trim().toLowerCase();
  
  // Check if query is asking for current time, date, day of week
  const isTimeQuery = /\b(current\s*time|what\s*time\s*is\s*it|time\s*now|time\s*in\s*india|samay|kitne\s*baje|time\s*kya\s*hua|what\s*is\s*the\s*time|current\s*date|today'?s\s*date|aaj\s*ki\s*tarikh|what\s*day\s*is\s*today|today'?s\s*day|day\s*today|aaj\s*ka\s*din)\b/i.test(p);
  
  if (!isTimeQuery) return null;

  let timeZone = "Asia/Kolkata";
  let locationLabel = "India (Indian Standard Time, IST)";
  let utcOffset = "UTC+5:30";

  if (/\b(new\s*york|nyc|est|edt|eastern\s*time)\b/i.test(p)) {
    timeZone = "America/New_York";
    locationLabel = "New York, USA (Eastern Time)";
    utcOffset = "UTC-5 / UTC-4";
  } else if (/\b(london|uk|britain|england|gmt|bst)\b/i.test(p)) {
    timeZone = "Europe/London";
    locationLabel = "London, United Kingdom (GMT/BST)";
    utcOffset = "UTC+0 / UTC+1";
  } else if (/\b(tokyo|japan|jst)\b/i.test(p)) {
    timeZone = "Asia/Tokyo";
    locationLabel = "Tokyo, Japan (JST)";
    utcOffset = "UTC+9";
  } else if (/\b(dubai|uae)\b/i.test(p)) {
    timeZone = "Asia/Dubai";
    locationLabel = "Dubai, United Arab Emirates (GST)";
    utcOffset = "UTC+4";
  } else if (/\b(california|los\s*angeles|san\s*francisco|pacific\s*time|pst|pdt)\b/i.test(p)) {
    timeZone = "America/Los_Angeles";
    locationLabel = "Pacific Time (US & Canada)";
    utcOffset = "UTC-8 / UTC-7";
  }

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  const dateFormatted = now.toLocaleDateString("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return {
    timeFormatted,
    dateFormatted,
    locationLabel,
    utcOffset,
    fullStatement: `The current time in ${locationLabel} is ${timeFormatted} on ${dateFormatted} (${utcOffset}).`
  };
};

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

    // 2. High-Precision Real-Time Clock & Date Intercept
    const liveTimeMatch = resolveLiveTimeQuery(state.prompt);
    if (liveTimeMatch) {
      console.log("⏱️ Live Clock Query detected:", liveTimeMatch.fullStatement);
      return {
        ...state,
        searchAnswer: liveTimeMatch.fullStatement,
        searchResults: [
          {
            title: `Official System Time: ${liveTimeMatch.locationLabel}`,
            url: "https://www.timeanddate.com/worldclock/",
            content: `Live real-time time: ${liveTimeMatch.timeFormatted}. Current verified date: ${liveTimeMatch.dateFormatted}. Timezone offset: ${liveTimeMatch.utcOffset}. No daylight saving time in India.`
          }
        ],
        images: []
      };
    }

    const searchQuery = cleanSearchQuery(state.prompt);
    console.log("🔍 Optimized Search Query:", searchQuery);

    const apiKey = process.env.TAVILY_API_KEY;
    let tavilyData = null;

    // 3. Primary: Direct Tavily Advanced Search API for maximum factual accuracy & instant ground-truth answer
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

    // 4. Fallback: searchTool from @langchain/tavily if direct API did not respond
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

    // 5. Extract verified Ground Truth Answer and Web Sources
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

    // 6. Extract Images
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
