// src/components/ChatInput.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Mic, Paperclip, Send, Loader2, Zap, MessageSquare, Code2, FileText, Presentation, ImageIcon, Globe, X, StopCircle } from 'lucide-react'
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

  // Client-side file validation and upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      // Validate type
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      const isImage = file.type.startsWith("image/")

      if (!isPdf && !isImage) {
        alert("Only PDF and image files (PNG, JPG, WebP) are supported.")
        continue
      }

      // Validate size
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

    // Format validated attachments
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

    // Set status message based on selected agent
    const agentName = selectedAgent.toLowerCase()
    if (agentName === "pdf") setStatusMessage("Designing & generating PDF document...")
    else if (agentName === "ppt") setStatusMessage("Structuring presentation & building slides...")
    else if (agentName === "image") setStatusMessage("Synthesizing image graphics...")
    else if (agentName === "coding") setStatusMessage("Writing & organizing project code...")
    else if (agentName === "search") setStatusMessage("Searching web & aggregating sources...")
    else setStatusMessage("Aivora AI is thinking...")

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
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
      />

      <div 
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3 focus-within:border-indigo-500/30 focus-within:shadow-lg focus-within:shadow-indigo-500/5 transition-all duration-300'
      >

        {/* Agent Chips */}
        <div className='flex w-full gap-2 pr-2 flex-wrap'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
                  flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]"
                  }
                `}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-slate-500"} />
                {agent.label}
              </div>
            )
          })}
        </div>

        {/* Attachment Preview Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 shadow-sm"
              >
                {att.kind === "image" && att.previewUrl ? (
                  <img src={att.previewUrl} alt="thumb" className="w-6 h-6 rounded object-cover" />
                ) : (
                  <FileText size={16} className="text-indigo-400" />
                )}
                <span className="max-w-[140px] truncate">{att.name}</span>
                <span className="text-[10px] text-slate-400">({Math.round(att.size / 1024)} KB)</span>

                {att.uploading ? (
                  <Loader2 size={12} className="animate-spin text-indigo-400 ml-1" />
                ) : (
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer border-none bg-transparent"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          placeholder="Ask anything, request a PDF resume, generate slides, create an image..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50 min-h-[50px] max-h-[120px]"
          rows={2}
        />

        {/* Status Bubble while running */}
        {isLoading && statusMessage && (
          <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-indigo-400" />
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={handleStop}
              className="flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-md border border-red-500/20 cursor-pointer transition-all"
            >
              <StopCircle size={12} />
              Stop
            </button>
          </div>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50'
              disabled={isLoading || isUploading}
              title="Attach PDF or Image"
            >
              <Paperclip size={16}/>
            </button>
            <button 
              type="button"
              className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50'
              disabled={isLoading}
              title="Voice Input"
            >
              <Mic size={16}/>
            </button>
          </div>
          
          <button
            disabled={(!value.trim() && attachments.length === 0) || isLoading || isUploading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-200 ${
              (value.trim() || attachments.length > 0) && !isLoading && !isUploading
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
