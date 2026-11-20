// src/components/ChatInput.jsx
import React, { useState, useEffect } from 'react'
import { Mic, Paperclip, Send, Loader2, Zap, MessageSquare, Code2, FileText, Presentation, ImageIcon, Globe } from 'lucide-react'
import sendMessage from '../features/sendMessage'
import { useSelector, useDispatch } from 'react-redux'
import { addMessage, setArtifacts } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'

function ChatInput() {
  const [value, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const [isLoading, setIsLoading] = useState(false)
  const { selectedConversation } = useSelector(state => state.conversation)
  const dispatch = useDispatch()

  useEffect(() => {
    if (selectedConversation?.title === "New Chat") {
      setValue("")
    }
  }, [selectedConversation?._id, selectedConversation?.title])

  const handleSendMessage = async () => {
    const trimmedValue = value.trim()
    if (!trimmedValue || isLoading) return

    let conversationId = selectedConversation?._id
    let isNewConversation = false

    if (!conversationId) {
      setIsLoading(true)
      try {
        const newConversation = await createConversation()
        if (newConversation && newConversation._id) {
          dispatch(addConversation(newConversation))
          dispatch(setSelectedConversation(newConversation))
          conversationId = newConversation._id
          isNewConversation = true
          await new Promise(resolve => setTimeout(resolve, 50))
        } else {
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error('Error creating conversation:', error)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setValue("")

    const messagePayload = {
      role: 'user',
      content: trimmedValue,
      conversationId: conversationId
    }
    console.log('📤 Adding user message:', messagePayload)
    dispatch(addMessage(messagePayload))

    if (isNewConversation || selectedConversation?.title === "New Chat") {
      try {
        await updateConversation({
          id: conversationId,
          title: trimmedValue
        })
        dispatch(setConvTitle({
          conversationId: conversationId,
          title: trimmedValue
        }))
      } catch (error) {
        console.error('Error updating conversation title:', error)
      }
    }

    try {
      const payload = {
        prompt: trimmedValue,
        conversationId: conversationId,
        agent: selectedAgent.toLowerCase()
      }

      const response = await sendMessage(payload)
      
      console.log('📥 Response:', response)
      console.log('📥 Artifacts in response:', response?.artifacts)
      
      // ✅ Check if response is empty
      if (!response || Object.keys(response).length === 0) {
        throw new Error('Empty response received from server')
      }
      
      // ✅ Check for success false
      if (response.success === false) {
        throw new Error(response.message || response.error || 'Failed to get response')
      }
      
      // ✅ FIX: Set artifacts in Redux store (response se artifacts lo)
      if (response?.artifacts && response.artifacts.length > 0) {
        dispatch(setArtifacts(response.artifacts))
        console.log('✅ Artifacts set in store:', response.artifacts)
      }
      
      let aiResponse = null
      
      // ✅ Try different response formats
      if (response.response) {
        aiResponse = response.response
      } else if (response.message) {
        aiResponse = response.message
      } else if (response.answer) {
        aiResponse = response.answer
      } else if (response.data && response.data.message) {
        aiResponse = response.data.message
      } else if (response.data && response.data.response) {
        aiResponse = response.data.response
      } else if (typeof response === 'string') {
        aiResponse = response
      } else if (response.content) {
        aiResponse = response.content
      } else if (response.text) {
        aiResponse = response.text
      } else if (response.result) {
        aiResponse = response.result
      }
      
      // ✅ If still no response, check if any string property exists
      if (!aiResponse && typeof response === 'object') {
        for (const key of Object.keys(response)) {
          if (typeof response[key] === 'string' && response[key].length > 0) {
            aiResponse = response[key]
            break
          }
        }
      }
      
      // ✅ If we have a response, add it
      if (aiResponse) {
        const aiPayload = {
          role: 'assistant',
          content: aiResponse,
          conversationId: response.conversationId || conversationId,
          images: response.images || [],
          artifacts: response.artifacts || []
        }
        console.log('📤 Adding AI response with artifacts:', aiPayload)
        dispatch(addMessage(aiPayload))
      } else if (response.success === true) {
        const defaultMsg = "I've received your message! How can I help you further?"
        dispatch(addMessage({
          role: 'assistant',
          content: defaultMsg,
          conversationId: response.conversationId || conversationId,
          artifacts: []
        }))
      } else {
        console.error('❌ Unknown response format:', response)
        throw new Error(`Invalid response format. Please check the response structure.`)
      }

    } catch (error) {
      console.error('❌ Error sending message:', error)
      
      dispatch(addMessage({
        role: 'assistant',
        content: `❌ Error: ${error.message || 'Something went wrong'}`,
        conversationId: conversationId,
        isError: true,
        artifacts: []
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const agents = [
    { id: "auto", icon: Zap, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "PDF" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "search", icon: Globe, label: "Search" }
  ]

  return (
    <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]'>
      <div className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3 focus-within:border-indigo-500/30 focus-within:shadow-lg focus-within:shadow-indigo-500/5 transition-all duration-300'>

        <div className='flex w-[80%] gap-2 pr-2 flex-wrap'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
                  flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]"
                  }
                `}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-slate-500"} />
                {agent.label}
              </div>
            )
          })}
        </div>
        
        <textarea
          placeholder="Ask Anything..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50 min-h-[60px] max-h-[120px]"
          rows={2}
        />

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <button 
              className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isLoading}
            >
              <Paperclip size={16}/>
            </button>
            <button 
              className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isLoading}
            >
              <Mic size={16}/>
            </button>
          </div>
          
          <button
            disabled={!value.trim() || isLoading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-200 ${
              value.trim() && !isLoading
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 hover:shadow-lg hover:shadow-indigo-500/20 text-white hover:scale-105 active:scale-95" 
                : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput