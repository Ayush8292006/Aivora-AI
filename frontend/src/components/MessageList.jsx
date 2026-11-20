import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MessageBubble from './MessageBubble'
import { Zap, Code2, Globe, FileText, Presentation, ImageIcon } from 'lucide-react'

function MessageList() {
    const { selectedConversation } = useSelector(state => state.conversation)
    const { messages } = useSelector(state => state.message)
    const messagesEndRef = useRef(null)
    
    const suggestionPrompts = [
        "Solar energy par 2 page ka report banao Hindi mein",
        "AI in healthcare par 8 slide ka presentation banao",
        "Mera resume banao: React developer with 2 projects",
        "Ek futuristic city ka sunset wallpaper generate karo"
    ]

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const hasMessages = messages && messages.length > 0
    const hasSelectedConv = selectedConversation && selectedConversation._id

    return (
        <div className='flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-gradient-to-b from-[#0a0c10] via-[#0d0f14] to-[#0a0c10]'>
            {!hasSelectedConv || !hasMessages ? (
                <div className='h-full flex flex-col items-center justify-center gap-6 text-center relative py-12'>
                    {/* Background Glow Effects */}
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none'></div>
                    
                    <div className='flex flex-col items-center gap-4 relative z-10'>
                        <div className='relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40'>
                            <Zap className='w-10 h-10 text-white' />
                        </div>
                        
                        <div className='flex flex-col gap-1.5'>
                            <h2 className='text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent'>
                                How can I help you today?
                            </h2>
                            <p className='text-sm text-slate-400 max-w-md'>
                                Multi-agent workspace: chat, search, code, generate PDF documents, presentation decks & graphics.
                            </p>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mt-4 relative z-10'>
                        {suggestionPrompts.map((s, index) => (
                            <div 
                                key={index}
                                className='group relative flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-indigo-500/30 transition-all text-left cursor-pointer'
                            >
                                <span className='text-indigo-400 font-medium text-xs'>
                                    {index === 0 ? "📄 PDF" : index === 1 ? "📊 PPT" : index === 2 ? "📝 Resume" : "🎨 Image"}
                                </span>
                                <span className='text-xs text-slate-300 group-hover:text-white transition-colors truncate'>
                                    {s}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className='space-y-6 pb-6'>
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
