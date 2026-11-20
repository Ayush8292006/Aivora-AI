// backend/services/agent/agents/search.agent.js
import { searchTool } from "../config/tavily.js"

export const searchAgent = async (state) => {
    try {
        console.log("🔍 Search agent called with state:", state)
        
        if (!state) {
            return {
                searchResults: [],
                images: [],
                aiResponse: "I'm having trouble processing your search. Please try again."
            }
        }

        if (!searchTool) {
            return {
                ...state,
                searchResults: [],
                images: [],
                aiResponse: "Search functionality is currently unavailable. Please try again later."
            }
        }

        if (!state.prompt) {
            return {
                ...state,
                searchResults: [],
                images: [],
                aiResponse: "Please provide a search query."
            }
        }

        console.log("🔍 Searching for:", state.prompt)

        const results = await searchTool.invoke({
            query: state.prompt,
            searchDepth: "basic",
            maxResults: 5,
            topic: "general",
            includeImages: true,
            includeImageDescriptions: true
        })
        
        console.log("✅ Search results received")
        console.log("📊 Full Results:", JSON.stringify(results, null, 2).substring(0, 500))
        
        // ✅ Extract search results
        const searchResults = results?.results || results || []
        
        // ✅ Extract images properly - Try multiple sources
        let images = []
        
        // 1. Check results.images array
        if (results?.images && Array.isArray(results.images)) {
            console.log("📸 Found images in results.images:", results.images.length)
            results.images.forEach(img => {
                if (typeof img === 'string') {
                    images.push(img)
                } else if (typeof img === 'object' && img) {
                    // Try different property names
                    const url = img.url || img.src || img.image || img.thumbnail || img.large || img.medium || img.small || img.original || null
                    if (url) images.push(url)
                }
            })
        }
        
        // 2. If no images, try to extract from results
        if (images.length === 0 && results?.results) {
            console.log("🔍 Trying to extract images from results...")
            results.results.forEach(result => {
                if (result.image) images.push(result.image)
                if (result.thumbnail) images.push(result.thumbnail)
                if (result.image_url) images.push(result.image_url)
                if (result.images && Array.isArray(result.images)) {
                    result.images.forEach(img => {
                        if (typeof img === 'string') images.push(img)
                        if (typeof img === 'object' && img.url) images.push(img.url)
                    })
                }
            })
        }
        
        // 3. Try to get images from content (extract image URLs from text)
        if (images.length === 0 && results?.results) {
            console.log("🔍 Trying to extract images from content...")
            results.results.forEach(result => {
                const content = result.content || result.snippet || ''
                // Find image URLs in content
                const imgRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)/gi
                const matches = content.match(imgRegex)
                if (matches) {
                    matches.forEach(url => images.push(url))
                }
            })
        }
        
        // 4. Remove duplicates and invalid URLs
        images = [...new Set(images)].filter(url => {
            return url && typeof url === 'string' && 
                   (url.startsWith('http://') || url.startsWith('https://'))
        })
        
        console.log("📸 Final images:", images)
        console.log("📸 Images count:", images.length)
        
        // ✅ Return with images
        return {
            ...state,
            searchResults: searchResults,
            images: images,
        }

    } catch (error) {
        console.error("❌ Search agent error:", error)
        console.error("❌ Error stack:", error.stack)
        return {
            ...state,
            searchResults: [],
            images: [],
            aiResponse: `❌ Search error: ${error.message || 'Failed to perform search. Please try again.'}`
        }
    }
}