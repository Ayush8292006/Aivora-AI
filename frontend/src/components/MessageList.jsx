import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'

function MessageList() {
    const { selectedConversation } = useSelector(state => state.conversation)
    const { messages } = useSelector(state => state.message)
    const messagesEndRef = useRef(null)
    
    const suggestionPrompts = [
        "make a Youtube clone",
        "Build a portfolio",
        "Explain Javascript"
    ]

    // ✅ Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // ✅ Debug logs
    console.log('📋 MessageList - Messages:', messages)
    console.log('📋 MessageList - Messages length:', messages.length)
    console.log('📋 MessageList - Selected Conversation:', selectedConversation)

    // ✅ Check if we should show messages
    const hasMessages = messages && messages.length > 0
    const hasSelectedConv = selectedConversation && selectedConversation._id

    return (
        <div className='flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-gradient-to-b from-[#0a0c10] via-[#0d0f14] to-[#0a0c10]'>
      
            {!hasSelectedConv || !hasMessages ? (
                <div className='h-full flex flex-col items-center justify-center gap-8 text-center relative'>
                    {/* Background Glow Effects */}
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl'></div>
                    <div className='absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-400/5 rounded-full blur-2xl animate-pulse'></div>
                    
                    <div className='flex flex-col items-center gap-4 relative z-10'>
                        {/* Animated Logo with Ring */}
                        <div className='relative'>
                            <div className='absolute -inset-8 bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-indigo-500/30 rounded-full blur-2xl animate-pulse'></div>
                            <div className='absolute -inset-4 border-2 border-indigo-500/20 rounded-full animate-spin-slow'></div>
                            <div className='absolute -inset-8 border border-indigo-400/10 rounded-full animate-spin-slow' style={{ animationDuration: '8s' }}></div>
                            <div className='relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40'>
                                <svg className='w-12 h-12 text-white drop-shadow-lg' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Brand Name with Gradient */}
                        <div className='space-y-3'>
                            <h1 className='text-[32px] font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 bg-clip-text text-transparent tracking-tight'>
                                Aivora AI
                            </h1>
                            <div className='flex items-center justify-center gap-2'>
                                <div className='h-px w-8 bg-gradient-to-r from-transparent to-indigo-400/30'></div>
                                <span className='text-[11px] font-medium text-indigo-400/60 tracking-widest uppercase'>Assistant</span>
                                <div className='h-px w-8 bg-gradient-to-l from-transparent to-indigo-400/30'></div>
                            </div>
                        </div>
                        
                        {/* Welcome Message */}
                        <div className='space-y-2 mt-2'>
                            <p className='text-[18px] font-semibold text-slate-100 tracking-tight'>
                                How can I help you today?
                            </p>
                            <p className='text-[14px] text-slate-500 max-w-sm mx-auto leading-relaxed'>
                                Ask me anything - code, ideas, explanations, or just a quick question.
                            </p>
                        </div>
                    </div>

                    {/* Suggestion Chips with Icons */}
                    <div className='flex flex-wrap justify-center gap-3 mt-4 relative z-10 max-w-lg'>
                        {suggestionPrompts.map((s, index) => {
                            const icons = ['💻', '🎨', '⚡']
                            return (
                                <button 
                                    key={index}
                                    className='group relative text-[13px] text-slate-300 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] px-4 py-2.5 rounded-xl hover:bg-white/[0.08] hover:text-white hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer overflow-hidden'
                                >
                                    {/* Hover Glow Effect */}
                                    <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                    
                                    <span className='flex items-center gap-2.5 relative'>
                                        <span className='text-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300'>
                                            {icons[index]}
                                        </span>
                                        {s}
                                        <span className='absolute -right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 text-indigo-400'>
                                            →
                                        </span>
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                    
                    {/* Status Indicator */}
                    <div className='flex items-center gap-3 mt-6 relative z-10'>
                        <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10'>
                            <span className='relative flex h-2 w-2'>
                                <span className='absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping'></span>
                                <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-400'></span>
                            </span>
                            <span className='text-[11px] font-medium text-emerald-400/70 tracking-wide'>Ready</span>
                        </div>
                        
                    </div>
                </div>
            ) : (
                <div className='space-y-6 pb-6'>
                   
{messages.map((msg, i) => (
    <div 
        key={i} 
        className='animate-in fade-in slide-in-from-bottom-3 duration-400' 
        style={{ animationDelay: `${i * 100}ms` }}
    >
        <MessageBubble 
            role={msg?.role} 
            content={msg?.content}
            images={msg?.images || []}  // ✅ Ensure images are passed
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