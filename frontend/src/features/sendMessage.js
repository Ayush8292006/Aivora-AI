// src/features/sendMessage.js
import api from '../../utils/axios.js'

async function sendMessage(payload, signal) {
  try {
    const { data } = await api.post("/api/agent/chat", payload, {
      timeout: 120000, // 120s timeout
      signal
    })
    return data
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return {
        success: false,
        canceled: true,
        error: "Request canceled by user"
      }
    }
    console.error('❌ Error sending message:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send message'
    }
  }
}

export default sendMessage
