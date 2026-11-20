import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Plus, PenSquare, Sparkles, X, 
  Crown, Settings, LogOut, User as UserIcon
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
    <div className='flex flex-col h-full w-full aurora-glass-panel rounded-[26px] p-3.5 relative overflow-hidden border border-[#2b4d36]/70 shadow-2xl'>
      
      {/* Top Header: Logo + Pro Badge + Action */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded-lg bg-gradient-to-br from-[#1d3b26] to-[#0c1c11] border border-[#3e6b4b] flex items-center justify-center shadow-sm shadow-[#4de370]/20'>
            <span className='text-[#4de370] text-sm font-bold'>✦</span>
          </div>
          <span className='text-[16px] font-bold tracking-tight text-[#f5f8f5] font-["Plus_Jakarta_Sans",sans-serif]'>
            Aurora AI
          </span>
          <span className='bg-gradient-to-r from-[#ebd6b6] to-[#cca670] text-[#1b160e] font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm tracking-wide uppercase'>
            Pro
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <button 
            onClick={handleCreateConversation}
            className='flex items-center justify-center w-7 h-7 rounded-lg text-[#9ab5a0] hover:text-[#f4e5cb] hover:bg-[#163020]/60 transition-all border-none bg-transparent cursor-pointer'
            title="New Chat"
          >
            <PenSquare size={15} />
          </button>
          {setMobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className='lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[#9ab5a0] hover:text-white hover:bg-[#163020]/60 transition-all border-none bg-transparent cursor-pointer'
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Button: + New Chat (Champagne Gold Gradient) */}
      <div className='px-1 py-1.5'>
        <button 
          onClick={handleCreateConversation}
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold aurora-gold-btn border-none cursor-pointer tracking-wide'
        >
          <span className='text-xs'>✦</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Recents Header */}
      <div className='flex items-center justify-between px-2.5 pt-4 pb-1.5'>
        <span className='text-[11px] font-semibold text-[#8ca893] tracking-wider uppercase'>
          Recents
        </span>
        <button 
          onClick={handleCreateConversation}
          className='text-[11px] text-[#cca670] hover:text-[#ebd6b6] transition-colors bg-transparent border-none cursor-pointer font-medium'
        >
          See all →
        </button>
      </div>

      {/* Conversation List */}
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
                    ? "aurora-active-chat shadow-md shadow-[#34d399]/10" 
                    : "bg-transparent hover:bg-[#122619]/60 text-[#9bb0a0] hover:text-[#e4efe6]"
                }`}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? "text-[#4de370]" : "text-[#7a9681] group-hover:text-[#a8c2ae]"
                  }`}>
                    <MessageSquare size={14} />
                  </div>
                  <span className={`text-[13px] truncate font-medium ${
                    isActive ? "text-[#ffffff] font-semibold" : "text-[#a3b8a8] group-hover:text-[#e4ede6]"
                  }`}>
                    {conv?.title || "New Chat"}
                  </span>
                </div>

                {/* Glowing Green Dot Indicator for Active Chat */}
                {isActive && (
                  <span className='w-2 h-2 rounded-full bg-[#34d399] shrink-0 shadow-[0_0_8px_#34d399]' />
                )}
              </div>
            )
          })
        ) : (
          <div className='flex flex-col items-center justify-center h-36 text-center px-4'>
            <MessageSquare size={22} className='text-[#45634e] mb-2' />
            <p className='text-xs text-[#7d9984]'>No recent chats</p>
          </div>
        )}
      </div>

      {/* Bottom User Profile Section */}
      <div className='pt-2 mt-auto border-t border-[#23422d]/70'>
        {userData ? (
          <div className='aurora-glass-card rounded-2xl p-2.5 flex items-center justify-between gap-2 border border-[#2b4d36]/70'>
            <div className='flex items-center gap-2.5 min-w-0'>
              <div className='relative shrink-0'>
                {userData?.avatar && !imageError ? (
                  <img 
                    src={userData.avatar} 
                    alt="avatar" 
                    onError={() => setImageError(true)}
                    className='w-9 h-9 rounded-xl object-cover border border-[#4de370]/40'
                  />
                ) : (
                  <div className='w-9 h-9 rounded-xl bg-[#173321] border border-[#376144] flex items-center justify-center text-[#9dfcb1]'>
                    <UserIcon size={16} />
                  </div>
                )}
                {/* Active online dot */}
                <span className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4de370] border-2 border-[#09150d]'></span>
              </div>

              <div className='min-w-0'>
                <p className='text-xs font-semibold text-[#f5f8f5] truncate'>
                  {userData?.name || "Ayush Kumar"}
                </p>
                <div className='flex items-center gap-1.5 mt-0.5'>
                  <span className='text-[10px] text-[#7d9984] truncate max-w-[80px]'>
                    {userData?.email?.split('@')[0] || "ayush8292006"}
                  </span>
                  <span className='text-[9px] font-semibold text-[#4de370] bg-[#14301e] px-1.5 py-0.2 rounded-full border border-[#2e5c3c]'>
                    + Online
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-1 shrink-0'>
              <span className='text-amber-400 p-1 text-sm' title="Pro Member">
                <Crown size={15} className='text-[#dfc499]' />
              </span>
              <button 
                onClick={() => {
                  logOut()
                  dispatch(setUserdata(null))
                }}
                className='p-1 rounded-lg text-[#7d9984] hover:text-red-400 hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer'
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className='p-2 text-center'>
            <p className='text-xs text-[#7d9984]'>Guest Mode</p>
          </div>
        )}
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className='hidden lg:flex w-[260px] xl:w-[280px] shrink-0 h-full flex-col'>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 z-50 lg:hidden flex'>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm'
          />
          <div className='relative z-10 w-[290px] h-full p-2 animate-in slide-in-from-left duration-200'>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default SideBar
