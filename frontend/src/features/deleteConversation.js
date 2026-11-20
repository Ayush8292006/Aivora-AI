// src/features/deleteConversation.js
import api from "../../utils/axios.js";

export const deleteConversation = async (conversationId) => {
  try {
    const { data } = await api.delete(`/api/chat/conversation/${conversationId}`);
    return data;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};
