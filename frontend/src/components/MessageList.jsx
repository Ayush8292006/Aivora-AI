import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import { FileText, Presentation, ImageIcon, ArrowUpRight } from 'lucide-react'

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
        <div className='h-full flex flex-col items-center justify-center gap-6 text-center py-8 px-4 relative'>
          
          {/* Subtle Ambient Light Glow behind welcome icon */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C9AD7C]/12 rounded-full blur-3xl pointer-events-none'></div>
          
          <div className='flex flex-col items-center gap-3.5 relative z-10'>
            <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-[#30271F] to-[#211C16] border border-white/20 flex items-center justify-center shadow-xl shadow-black/40'>
              <span className='text-2xl text-[#E9DDC8] font-bold'>A</span>
            </div>
            
            <div className='flex flex-col gap-1'>
              <h2 className='text-xl sm:text-2xl font-bold text-[#F5F0E6] tracking-tight'>
                How can I help you today?
              </h2>
              <p className='text-xs sm:text-sm text-[#89977B] max-w-md leading-relaxed'>
                Multi-agent workspace: chat, search, code, generate PDF documents, presentation decks & graphics.
              </p>
            </div>
          </div>

          {/* Liquid Glass Suggestion Cards Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full mt-2 relative z-10'>
            {suggestionPrompts.map((s, index) => {
              const Icon = s.icon
              return (
                <div 
                  key={index}
                  className='glass-card-interactive p-3 rounded-xl flex items-center justify-between gap-3 text-left cursor-pointer group'
                >
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <div className='w-7 h-7 rounded-lg bg-[#343B29]/70 flex items-center justify-center text-[#E9DDC8] shrink-0 border border-white/10'>
                      <Icon size={13} />
                    </div>
                    <div className='min-w-0'>
                      <span className='text-[10px] font-bold text-[#C9AD7C] uppercase tracking-wider block'>
                        {s.type}
                      </span>
                      <span className='text-xs text-[#E9DDC8]/85 group-hover:text-white transition-colors truncate block'>
                        {s.text}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight size={13} className='text-[#89977B] group-hover:text-[#E9DDC8] shrink-0 transition-colors' />
                </div>
              )
            })}
          </div>

        </div>
      ) : (
        <div className='space-y-4 pb-4'>
          {messages.map((msg, i) => (
            <div 
              key={msg._id || i} 
              className='animate-in fade-in slide-in-from-bottom-2 duration-200' 
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
