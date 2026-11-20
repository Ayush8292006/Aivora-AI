export const imageAgent = async (state) => {
    return {
        ...state,
        aiResponse: "This feature is coming soon."
    }
}

export const visionAgent = imageAgent
