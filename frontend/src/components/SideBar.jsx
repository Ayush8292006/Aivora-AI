import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Plus, PenSquare, X, 
  Settings, LogOut, User as UserIcon, Sparkles
} from 'lucide-react'
import { getConversation } from '../features/getConversations.js'
import { useDispatch, useSelector } from 'react-redux'
import { addConversation, setConversations, setSelectedConversation } from '../redux/conversationSlice.js'
import { createConversation } from '../features/createConversation'
import { clearMessages } from '../redux/messageSlice.js'
import logOut from '../features/logOut.js'
import { setUserdata } from '../redux/userSlice.js'

function SideBar({ mobileMenuOpen, setMobileMenuOpen }) {
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
        dispatch(clearMessages())
        dispatch(addConversation(data))
        dispatch(setSelectedConversation(data))
        if (setMobileMenuOpen) setMobileMenuOpen(false)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const handleSelectConv = (conv) => {
    dispatch(setSelectedConversation(conv))
    if (setMobileMenuOpen) setMobileMenuOpen(false)
  }

  const sidebarContent = (
    <div className='flex flex-col h-full w-full glass-panel rounded-[24px] p-3.5 relative overflow-hidden select-none'>
      
      {/* Top Header: Brand Mark + Pro Badge + Action */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3 border-b border-white/10'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-xl bg-gradient-to-br from-[#263B2B] to-[#14291F] border border-white/20 flex items-center justify-center font-bold text-xs text-[#E8DDC8] shadow-xs'>
            A
          </div>
          <span className='text-[15px] font-bold tracking-tight text-[#F8F7F0]'>
            Aivora AI
          </span>
          <span className='bg-gradient-to-r from-[#E8DDC8] to-[#C6A46A] text-[#14291F] font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs tracking-wider uppercase'>
            Pro
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <button 
            onClick={handleCreateConversation}
            className='flex items-center justify-center w-7 h-7 rounded-lg text-[#E8DDC8]/80 hover:text-white hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer'
            title="New Chat"
          >
            <PenSquare size={14} />
          </button>
          {setMobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className='lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[#789477] hover:text-white hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer'
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Button: + New Chat (Liquid Champagne Gold) */}
      <div className='py-3 px-1'>
        <button 
          onClick={handleCreateConversation}
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold btn-liquid-gold border-none cursor-pointer tracking-wide shadow-md'
        >
          <Plus size={14} className='stroke-[2.5]' />
          <span>New Chat</span>
        </button>
      </div>

      {/* Recents Section Header */}
      <div className='flex items-center justify-between px-2 pt-2 pb-1.5'>
        <span className='text-[10.5px] font-bold text-[#789477] tracking-wider uppercase'>
          Recents
        </span>
        <button 
          onClick={handleCreateConversation}
          className='text-[10px] text-[#C6A46A] hover:text-[#E8DDC8] transition-colors bg-transparent border-none cursor-pointer font-medium'
        >
          {conversations?.length || 0} chats
        </button>
      </div>

      {/* Conversations List with Liquid Glass Hover / Active States */}
      <div className='flex-1 overflow-y-auto px-1 py-1 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {conversations && conversations.length > 0 ? (
          conversations.map((conv, i) => {
            const isActive = selectedConversation?._id === conv?._id
            return (
              <div
                key={conv?._id || i}
                onClick={() => handleSelectConv(conv)}
                className={`group relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? "glass-active-chat text-[#F8F7F0] font-semibold" 
                    : "bg-transparent hover:bg-white/5 text-[#E8DDC8]/70 hover:text-[#F8F7F0]"
                }`}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <MessageSquare 
                    size={14} 
                    className={`shrink-0 ${isActive ? 'text-[#C6A46A]' : 'text-[#789477] group-hover:text-[#E8DDC8]'}`} 
                  />
                  <span className='text-xs truncate'>
                    {conv?.title || "New Chat"}
                  </span>
                </div>

                {/* Glowing Active Dot */}
                {isActive && (
                  <span className='w-1.5 h-1.5 rounded-full bg-[#789477] shrink-0 shadow-[0_0_6px_#789477]' />
                )}
              </div>
            )
          })
        ) : (
          <div className='flex flex-col items-center justify-center h-32 text-center px-4'>
            <MessageSquare size={18} className='text-[#789477]/60 mb-2' />
            <p className='text-xs text-[#789477]'>No conversations yet</p>
          </div>
        )}
      </div>

      {/* Bottom User Profile Section in Liquid Glass Card */}
      <div className='pt-2.5 mt-auto border-t border-white/10'>
        {userData ? (
          <div className='glass-card rounded-2xl p-2.5 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2.5 min-w-0'>
              <div className='relative shrink-0'>
                {userData?.avatar && !imageError ? (
                  <img 
                    src={userData.avatar} 
                    alt="avatar" 
                    onError={() => setImageError(true)}
                    className='w-8 h-8 rounded-xl object-cover border border-white/20'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-xl bg-[#263B2B] border border-white/20 flex items-center justify-center text-[#E8DDC8]'>
                    <UserIcon size={14} />
                  </div>
                )}
                {/* Active online dot */}
                <span className='absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#789477] border border-[#14291F] shadow-[0_0_4px_#789477]'></span>
              </div>

              <div className='min-w-0'>
                <p className='text-xs font-semibold text-[#F8F7F0] truncate leading-tight'>
                  {userData?.name || "User"}
                </p>
                <div className='flex items-center gap-1.5 mt-0.5'>
                  <span className='text-[10px] text-[#789477] truncate max-w-[80px] leading-tight'>
                    {userData?.email?.split('@')[0] || "Pro Workspace"}
                  </span>
                  <span className='text-[9px] font-semibold text-[#C6A46A] bg-[#263B2B]/60 px-1.5 py-0.2 rounded-full border border-white/10'>
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-1 shrink-0'>
              <button 
                onClick={() => {
                  logOut()
                  dispatch(setUserdata(null))
                }}
                className='p-1.5 rounded-lg text-[#789477] hover:text-red-400 hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer'
                title="Log Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className='p-2 text-center text-xs text-[#789477]'>
            Guest Session
          </div>
        )}
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className='hidden lg:flex w-[260px] xl:w-[280px] shrink-0 h-full flex-col'>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 z-50 lg:hidden flex'>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className='fixed inset-0 bg-black/60 backdrop-blur-md'
          />
          <div className='relative z-10 w-[285px] h-full p-2 animate-in slide-in-from-left duration-200'>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default SideBar
