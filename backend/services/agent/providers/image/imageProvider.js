import axios from "axios";
import { searchTool } from "../../config/tavily.js";

/**
 * Image generation provider abstraction
 */
export const generateImageBuffer = async ({ prompt, aspectRatio = "1:1" }) => {
    // 1. Try Gemini Imagen if GOOGLE_API_KEY is present
    if (process.env.GOOGLE_API_KEY && process.env.IMAGE_PROVIDER === "gemini") {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GOOGLE_API_KEY}`;
            const res = await axios.post(endpoint, {
                instances: [{ prompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: aspectRatio === "16:9" ? "16:9" : "1:1"
                }
            }, { timeout: 45000 });

            const b64 = res.data?.predictions?.[0]?.bytesBase64Encoded;
            if (b64) {
                return {
                    buffer: Buffer.from(b64, "base64"),
                    mimeType: "image/png",
                    model: "imagen-3.0"
                };
            }
        } catch (err) {
            console.warn("⚠️ Gemini Imagen call failed, falling back:", err.message);
        }
    }

    // 2. Try OpenRouter image models if OPENROUTER_API_KEY is configured
    if (process.env.OPENROUTER_API_KEY && process.env.IMAGE_PROVIDER === "openrouter") {
        try {
            const model = process.env.IMAGE_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";
            const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model,
                messages: [{ role: "user", content: prompt }]
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
                },
                timeout: 45000
            });

            const content = res.data?.choices?.[0]?.message?.content;
            const urlMatch = content?.match(/https?:\/\/[^\s\)\"]+/i);
            if (urlMatch) {
                const imgRes = await axios.get(urlMatch[0], { responseType: "arraybuffer", timeout: 20000 });
                return {
                    buffer: Buffer.from(imgRes.data),
                    mimeType: "image/png",
                    model
                };
            }
        } catch (err) {
            console.warn("⚠️ OpenRouter image call failed, falling back:", err.message);
        }
    }

    // 3. Fallback: Search high-resolution image via Tavily tool
    if (searchTool) {
        try {
            console.log("🔍 Fetching image via Tavily search tool...");
            const searchRes = await searchTool.invoke({
                query: prompt,
                searchDepth: "basic",
                maxResults: 5,
                includeImages: true
            });

            const imageUrls = searchRes?.images || [];
            if (Array.isArray(imageUrls) && imageUrls.length > 0) {
                const targetUrl = typeof imageUrls[0] === "string" ? imageUrls[0] : imageUrls[0]?.url;
                if (targetUrl) {
                    const dlRes = await axios.get(targetUrl, {
                        responseType: "arraybuffer",
                        timeout: 20000,
                        headers: { "User-Agent": "Mozilla/5.0" }
                    });
                    const contentType = dlRes.headers["content-type"] || "image/jpeg";
                    return {
                        buffer: Buffer.from(dlRes.data),
                        mimeType: contentType.includes("png") ? "image/png" : "image/jpeg",
                        model: "web-search"
                    };
                }
            }
        } catch (tavilyErr) {
            console.warn("⚠️ Tavily image search fallback failed:", tavilyErr.message);
        }
    }

    // 4. Fallback 2: Generate high-quality SVG graphic converted to buffer
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#grad)" />
  <circle cx="512" cy="450" r="180" fill="white" opacity="0.15" />
  <text x="512" y="470" font-family="'Segoe UI', Arial, sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">Aivora AI Image</text>
  <text x="512" y="540" font-family="'Segoe UI', Arial, sans-serif" font-size="24" fill="#e0e7ff" text-anchor="middle">${prompt.slice(0, 60)}...</text>
</svg>`;

    return {
        buffer: Buffer.from(svg, "utf-8"),
        mimeType: "image/svg+xml",
        model: "svg-synthesizer"
    };
};
