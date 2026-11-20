import React from 'react';
import { Coins, LogOut, MessageSquare, PanelLeftIcon, PenSquare, Plus, User, Sparkles, PanelRightIcon, PanelRight } from "lucide-react"
import { useState } from 'react';
import { useEffect } from 'react';
import { getConversation } from '../features/getConversations.js';
import { useDispatch, useSelector } from 'react-redux';
import { addConversation, setConversations, setSelectedConversation } from '../redux/conversationSlice.js';
import { createConversation } from '../features/createConversation';
import { clearMessages } from '../redux/messageSlice.js'; // ✅ Import clearMessages
import logOut from '../features/logOut.js';
import { setUserdata } from '../redux/userSlice.js';

function SideBar() {

    const [collapsed, setCollapsed] = useState(false)
    const dispatch = useDispatch()
    const [imageError, setImageError] = useState(false)
    const { conversations, selectedConversation } = useSelector(state => state.conversation)
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        const getConv = async () => {
            try {
                const data = await getConversation()
                if (data && data.length > 0) {
                    dispatch(setConversations(data))
                    // ✅ Agar koi conversation select nahi hai, toh first wala select karo
                    if (!selectedConversation) {
                        dispatch(setSelectedConversation(data[0]))
                    }
                }
            } catch (error) {
                console.error("Error fetching conversations:", error)
            }
        }
        getConv()
    }, [userData?._id])

    const handleCreateConversation = async () => {
        try {
            const data = await createConversation()
            if (data && data._id) {
                // ✅ Clear messages first
                dispatch(clearMessages())
                // ✅ Then add new conversation
                dispatch(addConversation(data))
                // ✅ Then select it
                dispatch(setSelectedConversation(data))
            }
        } catch (error) {
            console.error("Error creating conversation:", error)
        }
    }

     if(collapsed){
        return(
            <div className='hidden lg:flex flex-col items-center w-[56px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-4 gap-1 shrink-0'>
                <button className='flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-1'
                onClick={()=>setCollapsed(false)}
                >
                    <PanelRight />
                </button>

                <button className='flex items-center w-9 h-9 rounxl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer'
                onClick={handleCreateConversation}>
                    <Plus />
                </button>

                 {/* Conversations List */}
                <div className='flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-5'>
                    {conversations?.map((conv, i) => {
                        const isActive = selectedConversation?._id === conv?._id
                        return (
                            <div
                                key={conv?._id || i}
                                onClick={() => dispatch(setSelectedConversation(conv))}
                                className={`group relative flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-all duration-300 ${
                                    isActive 
                                        ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 border-indigo-500/[0.25] shadow-lg shadow-indigo-500/5" 
                                        : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                                }`}>

                                {/* Active indicator line */}
                                {isActive && (
                                    <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-full shadow-lg shadow-indigo-500/50'></div>
                                )}

                                <div className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg transition-all duration-300 ${
                                    isActive 
                                        ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10" 
                                        : "bg-white/[0.05] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300"
                                }`}>
                                    <MessageSquare size={13} />
                                </div>
                                
                                
                            </div>
                        )
                    })}
                </div>

                 <div className='relative shrink-0'>
                                {
                                    (userData?.avatar && !imageError) ?
                                        <>
                                            <img
                                                className='w-10 h-10 rounded-xl object-cover border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-all duration-300 shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/20 group-hover:scale-105'
                                                src={userData?.avatar} 
                                                alt="User avatar" 
                                                onError={() => setImageError(true)} />
                                            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0f14] shadow-lg shadow-emerald-500/20'>
                                                <div className='absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-40'></div>
                                            </div>
                                        </>
                                        :
                                        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-all duration-300'>
                                            <User size={18} className='text-indigo-400' />
                                        </div>
                                }
                            </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-y-0 left-0 z-50 h-screen w-[270px] shrink-0 border-r border-white/[0.06] bg-gradient-to-b from-[#0a0c10] to-[#0d0f14] lg:static shadow-2xl shadow-indigo-500/5">

            <div className='flex flex-col h-full'>

                {/* Header */}
                <div className='flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06] bg-gradient-to-r from-[#0a0c10]/50 to-transparent'>
                    <div className='hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] transition-all duration-200 hover:scale-110 bg-transparent border-none cursor-pointer'
                        onClick={() => setCollapsed(true)}
                    >
                        <PanelLeftIcon size={18} />
                    </div>
                    
                    <div className='flex items-center gap-2 flex-1'>
                        <div className='relative'>
                            <div className='absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg blur opacity-40 animate-pulse'></div>
                            <div className='relative w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20'>
                                <Sparkles size={14} className='text-white' />
                            </div>
                        </div>
                        <span className='text-[16px] font-semibold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight'>
                            Aivora AI
                        </span>
                    </div>
                    
                    <span className='text-[10px] font-medium text-indigo-400 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full tracking-wide shadow-lg shadow-indigo-500/5'>
                        ● free
                    </span>
                    
                    <button className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] transition-all duration-200 hover:scale-110 bg-transparent border-none cursor-pointer'
                        onClick={handleCreateConversation}>
                        <PenSquare size={14} />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className='px-4 pt-4 pb-1'>
                    <button className='w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl py-[10px] border-none cursor-pointer hover:from-indigo-600 hover:to-violet-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] group' 
                        onClick={handleCreateConversation}>
                        <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
                        New Chat
                        <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>

                {/* Recents Label */}
                {conversations?.length == 0 ? (
                    <div className='flex flex-col items-center justify-center flex-1 px-6'>
                        <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center mb-3 border border-white/[0.06]'>
                            <MessageSquare size={24} className='text-indigo-400/30' />
                        </div>
                        <p className='text-[11px] font-medium text-slate-500'>No conversations yet</p>
                        <p className='text-[10px] text-slate-600 mt-1'>Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className='px-5 pt-4 pb-1.5 flex items-center justify-between'>
                        <span className='text-[10.5px] font-semibold uppercase tracking-widest text-slate-500'>
                            Recents
                        </span>
                        <span className='text-[9px] text-slate-600'>
                            {conversations?.length} chats
                        </span>
                    </div>
                )}

                {/* Conversations List */}
                <div className='flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    {conversations?.map((conv, i) => {
                        const isActive = selectedConversation?._id === conv?._id
                        return (
                            <div
                                key={conv?._id || i}
                                onClick={() => dispatch(setSelectedConversation(conv))}
                                className={`group relative flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-all duration-300 ${
                                    isActive 
                                        ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 border-indigo-500/[0.25] shadow-lg shadow-indigo-500/5" 
                                        : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                                }`}>

                                {/* Active indicator line */}
                                {isActive && (
                                    <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-full shadow-lg shadow-indigo-500/50'></div>
                                )}

                                <div className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg transition-all duration-300 ${
                                    isActive 
                                        ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10" 
                                        : "bg-white/[0.05] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300"
                                }`}>
                                    <MessageSquare size={13} />
                                </div>
                                
                                <span className={`text-[13px] font-medium truncate transition-colors duration-200 ${
                                    isActive ? "text-slate-100" : "text-slate-400 group-hover:text-slate-200"
                                }`}>
                                    {conv?.title || "New Chat"}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className='mx-2.5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent' />

                {/* User Profile */}
                <div className='px-3.5 py-3.5'>
                    {userData ? (
                        <div className='relative flex items-center gap-3 cursor-pointer rounded-2xl px-3.5 py-3 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] hover:border-indigo-500/20 transition-all duration-300 group overflow-hidden'>
                            
                            {/* Hover glow effect */}
                            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                            
                            <div className='relative shrink-0'>
                                {
                                    (userData?.avatar && !imageError) ?
                                        <>
                                            <img
                                                className='w-10 h-10 rounded-xl object-cover border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-all duration-300 shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/20 group-hover:scale-105'
                                                src={userData?.avatar} 
                                                alt="User avatar" 
                                                onError={() => setImageError(true)} />
                                            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0f14] shadow-lg shadow-emerald-500/20'>
                                                <div className='absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-40'></div>
                                            </div>
                                        </>
                                        :
                                        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-all duration-300'>
                                            <User size={18} className='text-indigo-400' />
                                        </div>
                                }
                            </div>

                            <div className='flex-1 min-w-0 relative z-10'>
                                <p className='text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors duration-200'>
                                    {userData?.name || "User"}
                                </p>
                                <p className='text-[11px] text-slate-400 truncate group-hover:text-slate-300 transition-colors duration-200'>
                                    {userData?.email || ""}
                                </p>
                                <div className='flex items-center gap-1.5 mt-1'>
                                    <span className='text-[9px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1'>
                                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'></span>
                                        Free Plan
                                    </span>
                                </div>
                            </div>

                            <div className='flex gap-1 opacity-60 group-hover:opacity-100 transition-all duration-300 relative z-10'>
                                <button className='flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-amber-400/60 hover:text-amber-400 hover:bg-white/[0.08] transition-all duration-200 hover:scale-110 hover:rotate-12'>
                                    <Coins size={16}/>
                                </button>
                                <button className='flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 hover:scale-110'
                                onClick={()=>{
                                    logOut();
                                    dispatch(setUserdata(null))
                                }}
                                >
                                    <LogOut size={16}/>
                                </button>
                            </div>
                        </div>)
                        :
                        <button className='w-full flex items-center justify-center gap-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-2xl py-3 px-4 border-none cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group'>
                            <User size={16} className="opacity-80 group-hover:scale-110 transition-transform duration-300" />
                            Login
                            <span className="text-xs opacity-60 group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </button>
                    }
                </div>

            </div>
        </div>
    );

}

export default SideBar;