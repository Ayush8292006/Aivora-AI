import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MessageBubble from './MessageBubble'
import WelcomeOnboarding from './WelcomeOnboarding'
import { createConversation } from '../features/createConversation'
import { addConversation, setSelectedConversation } from '../redux/conversationSlice'
import { clearMessages } from '../redux/messageSlice'

function MessageList() {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSelectPrompt = (prompt, agent) => {
    window.dispatchEvent(new CustomEvent('aivora:set-prompt', {
      detail: { prompt, agent }
    }))
  }

  const handleNewChat = async () => {
    try {
      const data = await createConversation()
      if (data && data._id) {
        dispatch(clearMessages())
        dispatch(addConversation(data))
        dispatch(setSelectedConversation(data))
      }
    } catch (err) {
      console.error('Error starting new chat:', err)
    }
  }

  const handleSelectMode = (mode) => {
    window.dispatchEvent(new CustomEvent('aivora:set-prompt', {
      detail: { agent: mode }
    }))
  }

  const hasMessages = messages && messages.length > 0
  const hasSelectedConv = selectedConversation && selectedConversation._id

  return (
    <div className='flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      {!hasSelectedConv || !hasMessages ? (
        <WelcomeOnboarding 
          onSelectPrompt={handleSelectPrompt}
          onNewChat={handleNewChat}
          onSelectMode={handleSelectMode}
        />
      ) : (
        <div className='space-y-4 pb-4'>
          {messages.map((msg, i) => (
            <div 
              key={msg._id || i} 
              className='animate-in fade-in duration-150' 
            >
              <MessageBubble 
                role={msg?.role} 
                content={msg?.content}
                images={msg?.images || []}
                artifacts={msg?.artifacts || []}
                attachments={msg?.attachments || []}
                isError={msg?.isError}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}

export default MessageList
