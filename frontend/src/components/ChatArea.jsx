// src/components/ChatArea.jsx
import React from 'react'
import Nav from './Nav.jsx'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setArtifacts, setMessages } from '../redux/messageSlice.js'
import getMessages from '../features/getMessages.js'

function ChatArea() {
    const { selectedConversation } = useSelector(state => state.conversation)
    const { messages } = useSelector(state => state.message)
    const dispatch = useDispatch()
    
    useEffect(() => {
        const getMesg = async () => {
            if (!selectedConversation) {
                dispatch(setMessages([]))
                dispatch(setArtifacts([])) // ✅ Clear artifacts too
                return
            }

            // ✅ Agar "New Chat" hai aur messages already hain, toh clear mat karo
            if (selectedConversation.title === "New Chat") {
                if (messages && messages.length > 0) {
                    console.log('📝 New Chat with messages already present:', messages.length)
                    return
                }
                dispatch(setMessages([]))
                dispatch(setArtifacts([])) // ✅ Clear artifacts
                return
            }

            // ✅ Agar "New Chat" nahi hai, toh fetch karo
            try {
                const data = await getMessages(selectedConversation._id)
                console.log('📥 Fetched messages:', data)
                
                if (data && data.length > 0) {
                    // ✅ Set messages
                    dispatch(setMessages(data))
                    
                    
                    const allArtifacts = data
                        .filter(msg => msg.role === 'assistant' && msg.artifacts)
                        .flatMap(msg => msg.artifacts || [])
                    
                   
                    if (allArtifacts.length > 0) {
                        dispatch(setArtifacts(allArtifacts))
                    } else {
                        dispatch(setArtifacts([]))
                    }
                } else {
                    dispatch(setMessages([]))
                    dispatch(setArtifacts([]))
                }
            } catch (error) {
                console.error('Error fetching messages:', error)
                dispatch(setMessages([]))
                dispatch(setArtifacts([]))
            }
        }
        
        getMesg()
    }, [selectedConversation?._id, selectedConversation?.title])

    return (
        <div className='flex-1 flex flex-col'>
            <Nav/>
            <MessageList />
            <ChatInput />
        </div>
    )
}

export default ChatArea