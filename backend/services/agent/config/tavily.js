// backend/services/agent/config/tavily.js
import { TavilySearch } from "@langchain/tavily";
import dotenv from 'dotenv';

dotenv.config();

// ✅ Check if API key exists
if (!process.env.TAVILY_API_KEY) {
    console.error('❌ TAVILY_API_KEY is not set in environment variables');
    console.error('Please add TAVILY_API_KEY to your .env file');
}

console.log('🔑 TAVILY_API_KEY:', process.env.TAVILY_API_KEY ? '✅ Set' : '❌ Not set');

export const searchTool = new TavilySearch({
    apiKey: process.env.TAVILY_API_KEY, // ✅ Add this - Required!
    maxResults: 5,
    topic: "general",
    includeImages: true,
    includeImageDescriptions: true,
    searchDepth: "basic"
});

console.log('✅ Tavily search tool initialized');