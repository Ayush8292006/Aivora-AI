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
    <div className='flex flex-col h-full w-full bg-[#F3EFE6] rounded-2xl p-3.5 relative overflow-hidden border border-[#DFD9CC] select-none'>
      
      {/* Top Header: Brand Mark + Pro Badge + Action */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3 border-b border-[#DFD9CC]'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-full bg-[#24201C] text-[#F3EFE6] flex items-center justify-center font-bold text-xs shadow-xs'>
            A
          </div>
          <span className='text-[15px] font-bold tracking-tight text-[#23211E]'>
            Aivora AI
          </span>
          <span className='bg-[#24201C] text-[#F3EFE6] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider'>
            PRO
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <button 
            onClick={handleCreateConversation}
            className='flex items-center justify-center w-7 h-7 rounded-lg text-[#7A7469] hover:text-[#23211E] hover:bg-[#EAE4D8] transition-all border-none bg-transparent cursor-pointer'
            title="New Chat"
          >
            <PenSquare size={14} />
          </button>
          {setMobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className='lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[#7A7469] hover:text-[#23211E] hover:bg-[#EAE4D8] transition-all border-none bg-transparent cursor-pointer'
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Button: + New Chat in Deep Matte Olive Green */}
      <div className='py-3 px-1'>
        <button 
          onClick={handleCreateConversation}
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2F3D2E] hover:bg-[#253124] text-white border-none cursor-pointer tracking-wide shadow-xs transition-colors'
        >
          <Plus size={14} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Recents Section Header */}
      <div className='flex items-center justify-between px-2 pt-2 pb-1.5'>
        <span className='text-[10.5px] font-bold text-[#7A7469] tracking-wider uppercase'>
          RECENTS
        </span>
        <button 
          onClick={handleCreateConversation}
          className='text-[10.5px] text-[#7A7469] hover:text-[#23211E] transition-colors bg-transparent border-none cursor-pointer font-medium'
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
                    ? "bg-[#D8DFD2] border border-[#BAC6B1] text-[#23211E] font-semibold" 
                    : "bg-transparent hover:bg-[#EAE4D8] text-[#23211E] border border-transparent"
                }`}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <MessageSquare 
                    size={14} 
                    className={`shrink-0 ${isActive ? 'text-[#23211E]' : 'text-[#7A7469] group-hover:text-[#23211E]'}`} 
                  />
                  <span className='text-xs truncate'>
                    {conv?.title || "New Chat"}
                  </span>
                </div>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className='w-2 h-2 rounded-full bg-[#6C8461] shrink-0' />
                )}
              </div>
            )
          })
        ) : (
          <div className='flex flex-col items-center justify-center h-32 text-center px-4'>
            <MessageSquare size={18} className='text-[#7A7469]/50 mb-2' />
            <p className='text-xs text-[#7A7469]'>No conversations yet</p>
          </div>
        )}
      </div>

      {/* Bottom User Profile Section */}
      <div className='pt-2 mt-auto border-t border-[#DFD9CC]'>
        {userData ? (
          <div className='bg-[#E7E1D5] border border-[#D8D1C3] rounded-2xl p-2.5 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2.5 min-w-0'>
              <div className='relative shrink-0'>
                {userData?.avatar && !imageError ? (
                  <img 
                    src={userData.avatar} 
                    alt="avatar" 
                    onError={() => setImageError(true)}
                    className='w-8 h-8 rounded-full object-cover border border-[#DFD9CC]'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-[#DFD9CC] flex items-center justify-center text-[#23211E]'>
                    <UserIcon size={14} />
                  </div>
                )}
              </div>

              <div className='min-w-0'>
                <p className='text-xs font-semibold text-[#23211E] truncate leading-tight'>
                  {userData?.name || "Ayush Kumar"}
                </p>
                <p className='text-[10px] text-[#7A7469] truncate max-w-[85px] leading-tight mt-0.5'>
                  {userData?.email?.split('@')[0] || "viterkerkaai0475"}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1 shrink-0'>
              <span className='w-2 h-2 rounded-full bg-[#6C8461] mr-1' />
              <button 
                onClick={() => {
                  logOut()
                  dispatch(setUserdata(null))
                }}
                className='p-1 rounded-lg text-[#7A7469] hover:text-[#23211E] hover:bg-[#DFD9CC] transition-colors border-none bg-transparent cursor-pointer'
                title="Log Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className='p-2 text-center text-xs text-[#7A7469]'>
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
            className='fixed inset-0 bg-black/30 backdrop-blur-xs'
          />
          <div className='relative z-10 w-[285px] h-full p-2.5 animate-in slide-in-from-left duration-200'>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default SideBar
