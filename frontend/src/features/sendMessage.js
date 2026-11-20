// src/features/sendMessage.js
import React from 'react'
import api from '../../utils/axios.js'

async function sendMessage(payload) {
  try {
    const { data } = await api.post("/api/agent/chat", payload)
    return data
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
    // Always return an object with success: false
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send message'
    }
  }
}

export default sendMessage