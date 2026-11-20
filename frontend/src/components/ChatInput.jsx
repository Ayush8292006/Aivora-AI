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
  const dispatch = useDispatch()

  useEffect(() => {
    if (selectedConversation?.title === "New Chat") {
      setValue("")
      setAttachments([])
    }
  }, [selectedConversation?._id, selectedConversation?.title])

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

      const response = await sendMessage(payload, controller.signal)

      if (response?.canceled) {
        dispatch(addMessage({
          role: 'assistant',
          content: "Generation stopped by user.",
          conversationId: conversationId
        }))
        return
      }

      if (!response || response.success === false) {
        throw new Error(response?.error || response?.message || 'Failed to get response')
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
    <div className='w-full pt-1 pb-1 select-none'>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Floating Liquid Glass Composer Dock */}
      <div 
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className='glass-composer rounded-[24px] p-3 sm:p-3.5 flex flex-col gap-2.5 relative'
      >

        {/* Mode Selector Chips */}
        <div className='flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.label)}
                className={`
                  shrink-0 cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border-none
                  ${isActive
                    ? "btn-liquid-gold shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-[#E8DDC8]/70 hover:text-white"
                  }
                `}
              >
                <Icon size={12} className={isActive ? 'text-[#14291F]' : 'text-[#789477]'} />
                <span>{agent.label}</span>
              </button>
            )
          })}
        </div>

        {/* Attachment Preview Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative flex items-center gap-2 bg-[#263B2B]/60 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-[#E8DDC8] shadow-sm backdrop-blur-md"
              >
                {att.kind === "image" && att.previewUrl ? (
                  <img src={att.previewUrl} alt="thumb" className="w-5 h-5 rounded object-cover" />
                ) : (
                  <FileText size={13} className="text-[#C6A46A]" />
                )}
                <span className="max-w-[130px] truncate text-[11px]">{att.name}</span>

                {att.uploading ? (
                  <Loader2 size={12} className="animate-spin text-[#789477] ml-1" />
                ) : (
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-[#789477] hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer border-none bg-transparent"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Textarea */}
        <textarea
          placeholder="Ask anything, request a PDF resume, generate slides, create an image..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[13.5px] text-[#F8F7F0] placeholder:text-[#789477]/80 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50 min-h-[38px] max-h-[120px]"
          rows={1}
        />

        {/* Status Bubble while running */}
        {isLoading && statusMessage && (
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#E8DDC8] backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-[#C6A46A]" />
              <span className="text-[11.5px] font-medium">{statusMessage}</span>
            </div>
            <button
              onClick={handleStop}
              className="flex items-center gap-1 text-[10.5px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-md border border-red-500/20 cursor-pointer transition-all"
            >
              <StopCircle size={11} />
              Stop
            </button>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className='flex items-center justify-between pt-0.5'>
          <div className='flex items-center gap-1'>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center justify-center w-7 h-7 rounded-lg text-[#789477] hover:text-[#E8DDC8] hover:bg-white/10 transition-all bg-transparent border-none cursor-pointer disabled:opacity-50'
              disabled={isLoading || isUploading}
              title="Attach File or Image"
            >
              <Paperclip size={15}/>
            </button>
            <button 
              type="button"
              className='flex items-center justify-center w-7 h-7 rounded-lg text-[#789477] hover:text-[#E8DDC8] hover:bg-white/10 transition-all bg-transparent border-none cursor-pointer disabled:opacity-50'
              disabled={isLoading}
              title="Voice Input"
            >
              <Mic size={15}/>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedAgent("Search")}
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all bg-transparent border-none cursor-pointer ${
                selectedAgent === 'Search' ? 'text-[#E8DDC8] bg-white/15' : 'text-[#789477] hover:text-[#E8DDC8] hover:bg-white/10'
              }`}
              title="Web Search Mode"
            >
              <Globe size={15}/>
            </button>
          </div>
          
          {/* Circular Liquid Champagne Gold Send Button */}
          <button
            disabled={(!value.trim() && attachments.length === 0) || isLoading || isUploading}
            onClick={handleSendMessage}
            className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 ${
              (value.trim() || attachments.length > 0) && !isLoading && !isUploading
                ? "btn-liquid-gold shadow-lg hover:scale-105 active:scale-95" 
                : "bg-white/5 text-[#789477]/50 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin text-[#14291F]" />
            ) : (
              <Send size={14} className="translate-x-[1px]" />
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ChatInput
