// backend/services/agent/config/tavily.js
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { TavilySearch } from "@langchain/tavily";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const tavilyApiKey = process.env.TAVILY_API_KEY || "placeholder_tavily_key";

export const searchTool = new TavilySearch({
    apiKey: tavilyApiKey,
    maxResults: 6,
    topic: "general",
    includeImages: true,
    includeImageDescriptions: true,
    searchDepth: "advanced"
});
