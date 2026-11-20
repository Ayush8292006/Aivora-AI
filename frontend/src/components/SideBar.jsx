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
    <div className='flex flex-col h-full w-full bg-[#D8D0BF] rounded-2xl p-3.5 relative overflow-hidden border border-[#BEB49F] select-none'>
      
      {/* Top Header: Brand Mark + Pro Badge + Action */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3 border-b border-[#BEB49F]'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-full bg-[#24201C] text-[#D8D0BF] flex items-center justify-center font-bold text-xs shadow-xs'>
            A
          </div>
          <span className='text-[15px] font-bold tracking-tight text-[#1E1B18]'>
            Aivora AI
          </span>
          <span className='bg-[#24201C] text-[#D8D0BF] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider'>
            PRO
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <button 
            onClick={handleCreateConversation}
            className='flex items-center justify-center w-7 h-7 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#CCC3B0] transition-all border-none bg-transparent cursor-pointer'
            title="New Chat"
          >
            <PenSquare size={14} />
          </button>
          {setMobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className='lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#CCC3B0] transition-all border-none bg-transparent cursor-pointer'
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
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#243223] hover:bg-[#1A2619] text-white border-none cursor-pointer tracking-wide shadow-xs transition-colors'
        >
          <Plus size={14} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Recents Section Header */}
      <div className='flex items-center justify-between px-2 pt-2 pb-1.5'>
        <span className='text-[10.5px] font-bold text-[#696256] tracking-wider uppercase'>
          RECENTS
        </span>
        <button 
          onClick={handleCreateConversation}
          className='text-[10.5px] text-[#696256] hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer font-medium'
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
                    ? "bg-[#B6C6AE] border border-[#9BB091] text-[#1E1B18] font-semibold" 
                    : "bg-transparent hover:bg-[#CCC3B0] text-[#1E1B18] border border-transparent"
                }`}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <MessageSquare 
                    size={14} 
                    className={`shrink-0 ${isActive ? 'text-[#1E1B18]' : 'text-[#696256] group-hover:text-[#1E1B18]'}`} 
                  />
                  <span className='text-xs truncate'>
                    {conv?.title || "New Chat"}
                  </span>
                </div>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className='w-2 h-2 rounded-full bg-[#4A653C] shrink-0' />
                )}
              </div>
            )
          })
        ) : (
          <div className='flex flex-col items-center justify-center h-32 text-center px-4'>
            <MessageSquare size={18} className='text-[#696256]/50 mb-2' />
            <p className='text-xs text-[#696256]'>No conversations yet</p>
          </div>
        )}
      </div>

      {/* Bottom User Profile Section */}
      <div className='pt-2 mt-auto border-t border-[#BEB49F]'>
        {userData ? (
          <div className='bg-[#C9BFAC] border border-[#B3A894] rounded-2xl p-2.5 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2.5 min-w-0'>
              <div className='relative shrink-0'>
                {userData?.avatar && !imageError ? (
                  <img 
                    src={userData.avatar} 
                    alt="avatar" 
                    onError={() => setImageError(true)}
                    className='w-8 h-8 rounded-full object-cover border border-[#BEB49F]'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-[#B3A894] flex items-center justify-center text-[#1E1B18]'>
                    <UserIcon size={14} />
                  </div>
                )}
              </div>

              <div className='min-w-0'>
                <p className='text-xs font-semibold text-[#1E1B18] truncate leading-tight'>
                  {userData?.name || "Ayush Kumar"}
                </p>
                <p className='text-[10px] text-[#696256] truncate max-w-[85px] leading-tight mt-0.5'>
                  {userData?.email?.split('@')[0] || "viterkerkaai0475"}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1 shrink-0'>
              <span className='w-2 h-2 rounded-full bg-[#4A653C] mr-1' />
              <button 
                onClick={() => {
                  logOut()
                  dispatch(setUserdata(null))
                }}
                className='p-1 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#B3A894] transition-colors border-none bg-transparent cursor-pointer'
                title="Log Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className='p-2 text-center text-xs text-[#696256]'>
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
