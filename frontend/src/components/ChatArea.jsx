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
    <main className='flex-1 flex flex-col h-full min-w-0 glass-panel rounded-[24px] p-2.5 sm:p-3.5 relative overflow-hidden'>
      <Nav onOpenMobileMenu={onOpenMobileMenu} />
      <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
        <MessageList />
      </div>
      <ChatInput />
    </main>
  )
}

export default ChatArea
