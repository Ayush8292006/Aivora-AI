// src/features/getMessages.js
import api from '../../utils/axios'

async function getMessages(id) {
    try {
        console.log('📤 Fetching messages for conversation:', id)
        const { data } = await api.get(`/api/chat/get-messages/${id}`)
        console.log('📥 Messages response:', data)
        return data
    } catch (error) {
        console.error('❌ Get messages error:', error)
        return { success: false, data: [] }
    }
}

export default getMessages