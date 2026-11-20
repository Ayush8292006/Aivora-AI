// src/components/ChatInput.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  Mic, Paperclip, Send, Loader2, Sparkles, MessageSquare, 
  Code2, FileText, Presentation, ImageIcon, Globe, X, StopCircle 
} from 'lucide-react'
import sendMessage from '../features/sendMessage'
import { uploadFile } from '../features/uploadFile'
import { useSelector, useDispatch } from 'react-redux'
import { addMessage, setArtifacts } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import { openPricingModal, openExhaustedModal, openGuestLimitModal, setWallet, setCurrentChatUsage, setGuestSession } from '../redux/creditSlice'

function ChatInput() {
  const [value, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const { selectedConversation } = useSelector(state => state.conversation)
  const { availableCredits, guestSession } = useSelector(state => state.credit)
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    if (selectedConversation?.title === "New Chat") {
      setValue("")
      setAttachments([])
    }
  }, [selectedConversation?._id, selectedConversation?.title])

  useEffect(() => {
    const handleSetPrompt = (e) => {
      if (e.detail?.prompt) {
        setValue(e.detail.prompt)
      }
      if (e.detail?.agent) {
        const agentMap = {
          chat: "Chat",
          coding: "Coding",
          pdf: "PDF",
          ppt: "PPT",
          image: "Image",
          search: "Search",
          auto: "Auto"
        }
        const mapped = agentMap[e.detail.agent.toLowerCase()] || e.detail.agent
        setSelectedAgent(mapped)
      }
    }

    window.addEventListener('aivora:set-prompt', handleSetPrompt)
    return () => window.removeEventListener('aivora:set-prompt', handleSetPrompt)
  }, [])

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      const isImage = file.type.startsWith("image/")

      if (!isPdf && !isImage) {
        alert("Only PDF and image files (PNG, JPG, WebP) are supported.")
        continue
      }

      const sizeMb = file.size / (1024 * 1024)
      if (isImage && sizeMb > 8) {
        alert(`Image exceeds 8 MB limit (${sizeMb.toFixed(1)} MB).`)
        continue
      }
      if (isPdf && sizeMb > 20) {
        alert(`PDF exceeds 20 MB limit (${sizeMb.toFixed(1)} MB).`)
        continue
      }

      const tempId = Date.now() + Math.random().toString(36).substring(2, 6)
      const previewUrl = isImage ? URL.createObjectURL(file) : null

      const newAttachment = {
        id: tempId,
        name: file.name,
        size: file.size,
        kind: isPdf ? "pdf" : "image",
        mimeType: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
        previewUrl,
        uploading: true,
        progress: 0,
        fileId: null
      }

      setAttachments(prev => [...prev, newAttachment])
      setIsUploading(true)

      try {
        const res = await uploadFile(file, selectedConversation?._id, (progress) => {
          setAttachments(prev => prev.map(a => a.id === tempId ? { ...a, progress } : a))
        })

        if (res && res.file) {
          setAttachments(prev => prev.map(a => a.id === tempId ? {
            ...a,
            uploading: false,
            progress: 100,
            fileId: res.file.fileId || res.file.id,
            url: res.file.url
          } : a))
        } else {
          throw new Error("Upload failed")
        }
      } catch (err) {
        console.error("File upload error:", err)
        alert(`Failed to upload ${file.name}: ${err.message || 'Error'}`)
        setAttachments(prev => prev.filter(a => a.id !== tempId))
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      e.preventDefault()
      handleFileUpload(e.clipboardData.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      setStatusMessage("")
    }
  }

  const handleSendMessage = async () => {
    const trimmedValue = value.trim()
    if ((!trimmedValue && attachments.length === 0) || isLoading || isUploading) return

    const isGuest = !userData || userData.isGuest
    if (isGuest && guestSession?.questionsRemaining <= 0) {
      dispatch(openGuestLimitModal())
      return
    }
    if (!isGuest && availableCredits <= 0) {
      dispatch(openExhaustedModal())
      return
    }

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

    const readyAttachments = attachments
      .filter(a => a.fileId)
      .map(a => ({
        fileId: a.fileId,
        name: a.name,
        kind: a.kind,
        mimeType: a.mimeType,
        size: a.size,
        url: a.url
      }))

    setAttachments([])

    const messagePayload = {
      role: 'user',
      content: trimmedValue || (readyAttachments.length > 0 ? `Uploaded ${readyAttachments.map(a => a.name).join(', ')}` : ""),
      conversationId: conversationId,
      attachments: readyAttachments
    }

    dispatch(addMessage(messagePayload))

    if (isNewConversation || selectedConversation?.title === "New Chat") {
      try {
        const titleText = trimmedValue ? (trimmedValue.length > 25 ? trimmedValue.slice(0, 25) + "..." : trimmedValue) : "New Conversation"
        await updateConversation({
          id: conversationId,
          title: titleText
        })
        dispatch(setConvTitle({
          conversationId: conversationId,
          title: titleText
        }))
      } catch (error) {
        console.error('Error updating conversation title:', error)
      }
    }

    const agentName = selectedAgent.toLowerCase()
    if (agentName === "pdf") setStatusMessage("Designing & compiling PDF document...")
    else if (agentName === "ppt") setStatusMessage("Structuring presentation slides...")
    else if (agentName === "image") setStatusMessage("Synthesizing visual render...")
    else if (agentName === "coding") setStatusMessage("Writing & organizing code...")
    else if (agentName === "search") setStatusMessage("Searching sources & synthesizing...")
    else setStatusMessage("Aivora AI is drafting a response...")

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const payload = {
        prompt: trimmedValue || `Please analyze the attached document: ${readyAttachments.map(a => a.name).join(', ')}`,
        conversationId: conversationId,
        agent: agentName,
        attachments: readyAttachments
      }

      let response = await sendMessage(payload, controller.signal)

      if (response?.canceled) {
        dispatch(addMessage({
          role: 'assistant',
          content: "Generation stopped by user.",
          conversationId: conversationId
        }))
        return
      }

      if (response?.guestLimitReached) {
        dispatch(openGuestLimitModal())
        return
      }

      if (response?.creditExhausted) {
        dispatch(openExhaustedModal())
        return
      }

      if (!response || response.success === false) {
        const errMsg = response?.error || response?.message || ''
        if (errMsg.includes("Forbidden") || errMsg.includes("access to this conversation")) {
          // Auto-heal: If an old conversation was owned by another session, create a fresh chat for this user
          try {
            const freshConv = await createConversation()
            if (freshConv && freshConv._id) {
              dispatch(addConversation(freshConv))
              dispatch(setSelectedConversation(freshConv))
              payload.conversationId = freshConv._id
              conversationId = freshConv._id
              response = await sendMessage(payload, controller.signal)
            }
          } catch (retryErr) {
            console.warn("Auto-heal conversation error:", retryErr.message)
          }
        }
      }

      if (!response || response.success === false) {
        throw new Error(response?.error || response?.message || 'Failed to get response')
      }

      // Update credit balance & usage
      if (response?.usage) {
        dispatch(setCurrentChatUsage({
          totalInputTokens: response.usage.totalInputTokens || response.usage.promptTokens || 0,
          totalOutputTokens: response.usage.totalOutputTokens || response.usage.completionTokens || 0,
          totalTokens: response.usage.totalTokens || 0,
          totalCreditsConsumed: response.usage.totalCreditsConsumed || response.usage.creditsConsumed || 0,
          lastModelUsed: response.usage.lastModelUsed || response.usage.model || "Auto Multi-Agent Graph",
          availableCredits: response.usage.availableCredits
        }))
        if (response.usage.availableCredits !== undefined) {
          dispatch(setWallet({ availableCredits: response.usage.availableCredits }))
        }
      }

      if (response?.guestSession) {
        dispatch(setGuestSession(response.guestSession))
      }

      if (response?.artifacts && response.artifacts.length > 0) {
        dispatch(setArtifacts(response.artifacts))
      }

      const aiResponse = response.response || response.message || response.content || "I have completed your request."

      dispatch(addMessage({
        role: 'assistant',
        content: aiResponse,
        conversationId: response.conversationId || conversationId,
        images: response.images || [],
        artifacts: response.artifacts || []
      }))

    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error('❌ Error sending message:', error)
        dispatch(addMessage({
          role: 'assistant',
          content: `❌ Error: ${error.message || 'Something went wrong'}`,
          conversationId: conversationId,
          isError: true,
          artifacts: []
        }))
      }
    } finally {
      setIsLoading(false)
      setStatusMessage("")
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const agents = [
    { id: "auto", icon: Sparkles, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "PDF" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "search", icon: Globe, label: "Search" }
  ]

  return (
    <div className='w-full px-2 sm:px-4 pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] select-none'>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Chat Input Container: ChatGPT Mobile Style Floating Dock */}
      <div 
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className='bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl sm:rounded-2xl px-3 sm:px-3.5 py-2 sm:py-2.5 flex flex-col gap-1.5 relative shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]'
      >

        {/* Mode Selector Chips Row (Smooth Swipeable Mobile Carousel) */}
        <div className='flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.label)}
                className={`
                  shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border-none active:scale-95
                  ${isActive
                    ? "bg-[#1E2B1F] text-white shadow-xs font-bold"
                    : "bg-[#ECE5D6] hover:bg-[#E4DBC8] text-[#3A3630]"
                  }
                `}
              >
                <Icon size={11} className={isActive ? 'text-white' : 'text-[#3A3630]'} />
                <span>{agent.label}</span>
              </button>
            )
          })}
        </div>

        {/* Attachment Preview Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative flex items-center gap-1.5 bg-[#ECE5D6] border border-[#DDD3C1] rounded-xl px-2.5 py-1 text-xs text-[#1E1B18] shadow-2xs"
              >
                {att.kind === "image" && att.previewUrl ? (
                  <img src={att.previewUrl} alt="thumb" className="w-4 h-4 rounded object-cover" />
                ) : (
                  <FileText size={12} className="text-[#4A653C]" />
                )}
                <span className="max-w-[130px] truncate text-[11px] font-medium">{att.name}</span>

                {att.uploading ? (
                  <Loader2 size={11} className="animate-spin text-[#4A653C] ml-1" />
                ) : (
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-[#696256] hover:text-red-500 transition-colors p-0.5 rounded cursor-pointer border-none bg-transparent"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Textarea (Auto-growth responsive) */}
        <textarea
          placeholder="Message Aivora..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[13.5px] text-[#1E1B18] placeholder:text-[#8E877B] leading-snug [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50 min-h-[28px] max-h-[120px] py-1"
          rows={1}
        />

        {/* Status Bubble while running */}
        {isLoading && statusMessage && (
          <div className="flex items-center justify-between bg-[#ECE5D6] border border-[#DDD3C1] rounded-xl px-2.5 py-1 text-xs text-[#1E1B18]">
            <div className="flex items-center gap-2">
              <Loader2 size={11} className="animate-spin text-[#4A653C]" />
              <span className="text-[11px] font-medium">{statusMessage}</span>
            </div>
            <button
              onClick={handleStop}
              className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded-md border border-red-200 cursor-pointer transition-all"
            >
              <StopCircle size={10} />
              Stop
            </button>
          </div>
        )}

        {/* Bottom Actions Row: Paperclip, Mic, Search on left; Circular Dark Espresso Send Button on right */}
        <div className='flex items-center justify-between pt-0.5'>
          <div className='flex items-center gap-1'>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center justify-center w-8 h-8 rounded-xl text-[#696256] hover:text-[#1E1B18] hover:bg-[#ECE5D6] active:scale-95 transition-all bg-transparent border-none cursor-pointer disabled:opacity-50'
              disabled={isLoading || isUploading}
              title="Attach File or Image"
            >
              <Paperclip size={16}/>
            </button>
            <button 
              type="button"
              className='flex items-center justify-center w-8 h-8 rounded-xl text-[#696256] hover:text-[#1E1B18] hover:bg-[#ECE5D6] active:scale-95 transition-all bg-transparent border-none cursor-pointer disabled:opacity-50'
              disabled={isLoading}
              title="Voice Input"
            >
              <Mic size={16}/>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedAgent("Search")}
              className={`flex items-center justify-center w-8 h-8 rounded-xl active:scale-95 transition-all border-none cursor-pointer ${
                selectedAgent === 'Search' ? 'text-[#1E1B18] bg-[#ECE5D6]' : 'text-[#696256] hover:text-[#1E1B18] hover:bg-[#ECE5D6] bg-transparent'
              }`}
              title="Web Search Mode"
            >
              <Globe size={16}/>
            </button>
          </div>
          
          {/* Circular Dark Espresso Send Button (Touch-Friendly Native Style) */}
          <button
            disabled={(!value.trim() && attachments.length === 0) || isLoading || isUploading}
            onClick={handleSendMessage}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-150 ${
              (value.trim() || attachments.length > 0) && !isLoading && !isUploading
                ? "bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-xs hover:scale-105 active:scale-95" 
                : "bg-[#E2D8C6] text-[#9E9484] cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin text-white" />
            ) : (
              <Send size={13} className="translate-x-[0.5px]" />
            )}
          </button>
        </div>

        {/* Guest Mode Free Usage Indicator */}
        {(!userData || userData.isGuest) && (
          <div className="flex items-center justify-between px-1 pt-1 text-[10.5px] text-[#7D7567] border-t border-[#DDD3C1]/60 mt-0.5">
            <span className="flex items-center gap-1 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shrink-0" />
              <span className="truncate">Guest: {guestSession?.questionsRemaining ?? 4}/4 questions free</span>
            </span>
            <button
              type="button"
              onClick={() => dispatch(openGuestLimitModal())}
              className="text-[#1E2B1F] font-bold hover:underline bg-transparent border-none cursor-pointer p-0 shrink-0 ml-2"
            >
              Sign up &rarr;
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ChatInput
