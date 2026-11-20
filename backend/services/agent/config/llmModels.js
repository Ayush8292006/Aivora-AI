import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config(); // fallback to current cwd .env

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

const groqApiKey = process.env.GROQ_API_KEY || "placeholder_groq_key";
const googleApiKey = process.env.GOOGLE_API_KEY || "placeholder_google_key";
const openrouterApiKey = process.env.OPENROUTER_API_KEY || "placeholder_openrouter_key";

// Groq instance
export const groq = new ChatGroq({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    apiKey: groqApiKey
});

// Groq fallback instance
export const groqFallback = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: groqApiKey
});

// Gemini multimodal instance (for OCR, image understanding, vision)
export const gemini = new ChatGoogleGenerativeAI({
    model: process.env.VISION_MODEL || "gemini-2.5-flash",
    apiKey: googleApiKey,
    temperature: 0.2
});

// OpenRouter instance for coding / structured documents
export const openrouter = new ChatOpenRouter({
    model: process.env.CODING_MODEL || "deepseek/deepseek-chat",
    temperature: 0.1,
    maxTokens: 16384,
    apiKey: openrouterApiKey
});

export const getModel = async (agent) => {
    switch (agent) {
        case "chat":
        case "search":
        case "router":
        case "intent":
            return groq;

        case "coding":
            return openrouter;

        case "pdf":
            return process.env.PDF_MODEL && process.env.PDF_MODEL.startsWith("gemini") 
                ? gemini 
                : openrouter;

        case "ppt":
            return process.env.PPT_MODEL && process.env.PPT_MODEL.startsWith("gemini")
                ? gemini
                : openrouter;

        case "vision":
        case "image":
            return gemini;

        default:
            return groq;
    }
};

export const getFallbackModel = async () => {
    return groqFallback;
};
