// src/components/ChatArea.jsx
import React, { useEffect } from 'react'
import Nav from './Nav.jsx'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import { setArtifacts, setMessages } from '../redux/messageSlice.js'
import getMessages from '../features/getMessages.js'

function ChatArea({ onOpenMobileMenu }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  const dispatch = useDispatch()
  
  useEffect(() => {
    const getMesg = async () => {
      if (!selectedConversation) {
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        return
      }

      if (selectedConversation.title === "New Chat") {
        if (messages && messages.length > 0) {
          return
        }
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        return
      }

      try {
        const data = await getMessages(selectedConversation._id)
        if (data && data.length > 0) {
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
    <main className='flex-1 flex flex-col h-full min-w-0 bg-[#FAF8F3] rounded-none sm:rounded-2xl p-2 sm:p-3 relative overflow-hidden border-0 sm:border border-[#DDD3C1] shadow-none sm:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_10px_30px_-8px_rgba(60,50,30,0.08)]'>
      <Nav onOpenMobileMenu={onOpenMobileMenu} />
      <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
        <MessageList />
      </div>
      <ChatInput />
    </main>
  )
}

export default ChatArea
