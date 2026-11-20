// src/features/updateConversation.js
import api from "../../utils/axios.js";

export const updateConversation = async (payload) => {
    try {
        const { data } = await api.post("/api/chat/update-conversation", payload);
        return data;
    } catch (error) {
        console.error("Error updating conversation:", error);
        throw error;
    }
};