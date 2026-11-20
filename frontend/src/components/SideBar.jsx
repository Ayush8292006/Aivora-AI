import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Plus, PenSquare, X, 
  Settings, LogOut, User as UserIcon
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
    <div className='flex flex-col h-full w-full bg-[#1E2B1F]/92 backdrop-blur-xl rounded-2xl p-3.5 relative overflow-hidden border border-white/10 select-none text-[#CBD8CA] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_10px_25px_-5px_rgba(15,28,17,0.3)]'>
      
      {/* Top Header: Brand Mark + Pro Badge + Action */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3 border-b border-[#2C3E2B]/80'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-full bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-xs shadow-xs'>
            A
          </div>
          <span className='text-[15px] font-bold tracking-tight text-white'>
            Aivora AI
          </span>
          <span className='bg-[#2B3C2A]/90 text-[#E8DDC8] border border-[#3E553D]/70 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider'>
            PRO
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <button 
            onClick={handleCreateConversation}
            className='flex items-center justify-center w-7 h-7 rounded-lg text-[#8EA58C] hover:text-white hover:bg-[#283A27]/80 transition-all border-none bg-transparent cursor-pointer'
            title="New Chat"
          >
            <PenSquare size={14} />
          </button>
          {setMobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className='lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[#8EA58C] hover:text-white hover:bg-[#283A27]/80 transition-all border-none bg-transparent cursor-pointer'
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Button: + New Chat in Warm Champagne Contrast */}
      <div className='py-3 px-1'>
        <button 
          onClick={handleCreateConversation}
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F] border-none cursor-pointer tracking-wide shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all'
        >
          <Plus size={14} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Recents Section Header */}
      <div className='flex items-center justify-between px-2 pt-2 pb-1.5'>
        <span className='text-[10.5px] font-bold text-[#8EA58C] tracking-wider uppercase'>
          RECENTS
        </span>
        <button 
          onClick={handleCreateConversation}
          className='text-[10.5px] text-[#8EA58C] hover:text-white transition-colors bg-transparent border-none cursor-pointer font-medium'
        >
          {conversations?.length || 0} chats
        </button>
      </div>

      {/* Conversations List */}
      <div className='flex-1 overflow-y-auto px-1 py-1 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {conversations && conversations.length > 0 ? (
          conversations.map((conv, i) => {
            const isActive = selectedConversation?._id === conv?._id
            return (
              <div
                key={conv?._id || i}
                onClick={() => handleSelectConv(conv)}
                className={`group relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive 
                    ? "bg-[#2D402C]/90 border border-[#435E41]/80 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.15)]" 
                    : "bg-transparent hover:bg-[#283A27]/70 text-[#CBD8CA] hover:text-white border border-transparent"
                }`}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <MessageSquare 
                    size={14} 
                    className={`shrink-0 ${isActive ? 'text-[#E8DDC8]' : 'text-[#8EA58C] group-hover:text-white'}`} 
                  />
                  <span className='text-xs truncate'>
                    {conv?.title || "New Chat"}
                  </span>
                </div>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className='w-2 h-2 rounded-full bg-[#4ADE80] shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.4)]' />
                )}
              </div>
            )
          })
        ) : (
          <div className='flex flex-col items-center justify-center h-32 text-center px-4'>
            <MessageSquare size={18} className='text-[#8EA58C]/50 mb-2' />
            <p className='text-xs text-[#8EA58C]'>No conversations yet</p>
          </div>
        )}
      </div>

      {/* Bottom User Profile Section */}
      <div className='pt-2 mt-auto border-t border-[#2C3E2B]/80'>
        {userData ? (
          <div className='bg-[#162117]/85 backdrop-blur-md border border-[#2B3C2A]/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'>
            <div className='flex items-center gap-2.5 min-w-0'>
              <div className='relative shrink-0'>
                {userData?.avatar && !imageError ? (
                  <img 
                    src={userData.avatar} 
                    alt="avatar" 
                    onError={() => setImageError(true)}
                    className='w-8 h-8 rounded-full object-cover border border-[#3E553D]/70'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-[#2B3C2A] flex items-center justify-center text-[#E8DDC8]'>
                    <UserIcon size={14} />
                  </div>
                )}
              </div>

              <div className='min-w-0'>
                <p className='text-xs font-semibold text-white truncate leading-tight'>
                  {userData?.name || "Ayush Kumar"}
                </p>
                <p className='text-[10px] text-[#8EA58C] truncate max-w-[85px] leading-tight mt-0.5'>
                  {userData?.email?.split('@')[0] || "viterkerkaai0475"}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1 shrink-0'>
              <span className='w-2 h-2 rounded-full bg-[#4ADE80] mr-1' />
              <button 
                onClick={() => {
                  logOut()
                  dispatch(setUserdata(null))
                }}
                className='p-1 rounded-lg text-[#8EA58C] hover:text-white hover:bg-[#283A27]/80 transition-colors border-none bg-transparent cursor-pointer'
                title="Log Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className='p-2 text-center text-xs text-[#8EA58C]'>
            Guest Session
          </div>
        )}
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className='hidden lg:flex w-[260px] xl:w-[275px] shrink-0 h-full flex-col'>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 z-50 lg:hidden flex'>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'
          />
          <div className='relative z-10 w-[84vw] max-w-[320px] h-full p-2.5 animate-in slide-in-from-left duration-250'>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default SideBar
