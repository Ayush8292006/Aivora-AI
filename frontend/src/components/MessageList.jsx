import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import { Sparkles, FileText, Presentation, ImageIcon, Code2 } from 'lucide-react'

function MessageList() {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  const messagesEndRef = useRef(null)
  
  const suggestionPrompts = [
    { type: "PDF", icon: FileText, text: "Solar energy par 2 page ka report banao Hindi mein" },
    { type: "PPT", icon: Presentation, text: "AI in healthcare par 8 slide ka presentation banao" },
    { type: "Resume", icon: FileText, text: "Mera resume banao: React developer with 2 projects" },
    { type: "Image", icon: ImageIcon, text: "Ek golden retriever puppy in a lush meadow generate karo" }
  ]

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const hasMessages = messages && messages.length > 0
  const hasSelectedConv = selectedConversation && selectedConversation._id

  return (
    <div className='flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      {!hasSelectedConv || !hasMessages ? (
        <div className='h-full flex flex-col items-center justify-center gap-6 text-center relative py-8 px-4'>
          {/* Subtle Ambient Glow */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#4de370]/5 rounded-full blur-3xl pointer-events-none'></div>
          
          <div className='flex flex-col items-center gap-3.5 relative z-10'>
            <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1c3a25] to-[#0a180f] border border-[#376144] flex items-center justify-center shadow-xl shadow-[#4de370]/15'>
              <span className='text-2xl text-[#4de370] font-bold'>✦</span>
            </div>
            
            <div className='flex flex-col gap-1'>
              <h2 className='text-xl sm:text-2xl font-bold text-[#f5f8f5] tracking-tight'>
                How can I help you today?
              </h2>
              <p className='text-xs sm:text-sm text-[#8ca893] max-w-md leading-relaxed'>
                Next-Gen Multi-Agent Workspace: chat, search, code, generate PDF documents, slides, and photorealistic images.
              </p>
            </div>
          </div>

          {/* Suggestions Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full mt-2 relative z-10'>
            {suggestionPrompts.map((s, index) => {
              const Icon = s.icon
              return (
                <div 
                  key={index}
                  className='group relative flex items-center gap-3 p-3 rounded-xl bg-[#0b1b11]/60 hover:bg-[#12281a]/80 border border-[#23422d]/70 hover:border-[#3d704c] transition-all text-left cursor-pointer'
                >
                  <div className='w-7 h-7 rounded-lg bg-[#142e1d] flex items-center justify-center text-[#4de370] shrink-0 border border-[#2b5438]'>
                    <Icon size={13} />
                  </div>
                  <div className='min-w-0'>
                    <span className='text-[10px] font-bold text-[#dfc499] uppercase tracking-wider block'>
                      {s.type}
                    </span>
                    <span className='text-xs text-[#b8ccbe] group-hover:text-white transition-colors truncate block'>
                      {s.text}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className='space-y-5 pb-4'>
          {messages.map((msg, i) => (
            <div 
              key={msg._id || i} 
              className='animate-in fade-in slide-in-from-bottom-2 duration-300' 
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
