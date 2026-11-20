import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Plus, PenSquare, X, 
  Settings, LogOut, User as UserIcon, Search,
  Pin, Trash2, Edit3, Check, Globe, Sparkles, Home
} from 'lucide-react'
import { getConversation } from '../features/getConversations.js'
import { useDispatch, useSelector } from 'react-redux'
import { 
  addConversation, setConversations, setSelectedConversation, 
  setConvTitle, deleteConversationAction, togglePinConversation 
} from '../redux/conversationSlice.js'
import { createConversation } from '../features/createConversation'
import { updateConversation } from '../features/updateConversation'
import { deleteConversation } from '../features/deleteConversation'
import { clearMessages } from '../redux/messageSlice.js'
import logOut from '../features/logOut.js'
import { setUserdata } from '../redux/userSlice.js'

function SideBar({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onOpenSettings, 
  onOpenExplore, 
  onGoToLanding 
}) {
  const dispatch = useDispatch()
  const [imageError, setImageError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [deletingId, setDeletingId] = useState(null)

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

  const handleStartRename = (e, conv) => {
    e.stopPropagation()
    setEditingId(conv._id)
    setEditTitle(conv.title || "New Chat")
  }

  const handleSaveRename = async (e, convId) => {
    e.stopPropagation()
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }
    try {
      await updateConversation({ id: convId, title: editTitle.trim() })
      dispatch(setConvTitle({ conversationId: convId, title: editTitle.trim() }))
    } catch (err) {
      console.error("Error renaming conversation:", err)
    } finally {
      setEditingId(null)
    }
  }

  const handleTogglePin = (e, convId) => {
    e.stopPropagation()
    dispatch(togglePinConversation(convId))
  }

  const handleDelete = async (e, convId) => {
    e.stopPropagation()
    if (deletingId === convId) {
      // confirmed
      try {
        await deleteConversation(convId)
        dispatch(deleteConversationAction(convId))
      } catch (err) {
        console.error("Error deleting conversation:", err)
      } finally {
        setDeletingId(null)
      }
    } else {
      setDeletingId(convId)
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  // Filter conversations by search query
  const filteredConversations = (conversations || []).filter(c => 
    !searchQuery.trim() || (c.title || "New Chat").toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const pinnedConversations = filteredConversations.filter(c => c.pinned)
  const regularConversations = filteredConversations.filter(c => !c.pinned)

  const renderConvItem = (conv) => {
    const isActive = selectedConversation?._id === conv?._id
    const isEditing = editingId === conv?._id
    const isDeleting = deletingId === conv?._id

    return (
      <div
        key={conv?._id}
        onClick={() => !isEditing && handleSelectConv(conv)}
        className={`group relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
          isActive 
            ? "bg-[#2D402C]/90 border border-[#435E41]/80 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.15)]" 
            : "bg-transparent hover:bg-[#283A27]/70 text-[#CBD8CA] hover:text-white border border-transparent"
        }`}
      >
        <div className='flex items-center gap-2 min-w-0 flex-1'>
          <MessageSquare 
            size={13} 
            className={`shrink-0 ${isActive ? 'text-[#E8DDC8]' : 'text-[#8EA58C] group-hover:text-white'}`} 
          />
          
          {isEditing ? (
            <input 
              type="text"
              value={editTitle}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(e, conv._id)
                if (e.key === 'Escape') setEditingId(null)
              }}
              className="bg-[#1B271C] text-white text-xs px-1.5 py-0.5 rounded border border-[#435E41] outline-none w-full"
            />
          ) : (
            <span className='text-xs truncate'>
              {conv?.title || "New Chat"}
            </span>
          )}
        </div>

        {/* Action Controls on Hover / Edit */}
        {isEditing ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => handleSaveRename(e, conv._id)}
              className="p-1 text-[#4ADE80] hover:text-white bg-transparent border-none cursor-pointer"
              title="Save"
            >
              <Check size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditingId(null) }}
              className="p-1 text-[#8EA58C] hover:text-white bg-transparent border-none cursor-pointer"
              title="Cancel"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            {/* Hover Actions: Pin, Rename, Delete */}
            <div className="hidden group-hover:flex items-center gap-0.5">
              <button
                onClick={(e) => handleTogglePin(e, conv._id)}
                className={`p-1 rounded hover:bg-[#1E2B1F] ${conv.pinned ? 'text-[#E8DDC8]' : 'text-[#8EA58C] hover:text-white'} bg-transparent border-none cursor-pointer`}
                title={conv.pinned ? "Unpin chat" : "Pin chat"}
              >
                <Pin size={11} className={conv.pinned ? "fill-[#E8DDC8]" : ""} />
              </button>
              <button
                onClick={(e) => handleStartRename(e, conv)}
                className="p-1 rounded hover:bg-[#1E2B1F] text-[#8EA58C] hover:text-white bg-transparent border-none cursor-pointer"
                title="Rename"
              >
                <Edit3 size={11} />
              </button>
              <button
                onClick={(e) => handleDelete(e, conv._id)}
                className={`p-1 rounded hover:bg-[#1E2B1F] ${isDeleting ? 'text-[#F87171] font-bold' : 'text-[#8EA58C] hover:text-[#F87171]'} bg-transparent border-none cursor-pointer`}
                title={isDeleting ? "Click again to confirm delete" : "Delete"}
              >
                <Trash2 size={11} />
              </button>
            </div>

            {/* Pinned Icon or Active Dot */}
            {conv.pinned && !isDeleting && (
              <Pin size={10} className="text-[#E8DDC8] fill-[#E8DDC8] shrink-0" />
            )}
            {isActive && !isDeleting && (
              <span className='w-2 h-2 rounded-full bg-[#4ADE80] shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.4)]' />
            )}
            {isDeleting && (
              <span className="text-[9px] text-[#F87171] font-bold shrink-0">Confirm?</span>
            )}
          </div>
        )}
      </div>
    )
  }

  const sidebarContent = (
    <div className='flex flex-col h-full w-full bg-[#1E2B1F]/95 backdrop-blur-xl rounded-none sm:rounded-2xl p-3.5 relative overflow-hidden border border-white/10 select-none text-[#CBD8CA] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_10px_25px_-5px_rgba(15,28,17,0.3)]'>
      
      {/* Top Header: Brand Mark + Pro Badge + Actions */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3 border-b border-[#2C3E2B]/80'>
        <div 
          onClick={onGoToLanding}
          className='flex items-center gap-2.5 cursor-pointer group' 
          title="Return to Landing Page"
        >
          <div className='w-7 h-7 rounded-full bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform'>
            A
          </div>
          <span className='text-[15px] font-bold tracking-tight text-white group-hover:text-[#E8DDC8] transition-colors'>
            Aivora AI
          </span>
          <span className='bg-[#2B3C2A]/90 text-[#E8DDC8] border border-[#3E553D]/70 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider'>
            PRO
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <button 
            onClick={onGoToLanding}
            className='flex items-center justify-center w-7 h-7 rounded-lg text-[#8EA58C] hover:text-white hover:bg-[#283A27]/80 transition-all border-none bg-transparent cursor-pointer'
            title="Landing Page"
          >
            <Home size={13} />
          </button>
          <button 
            onClick={handleCreateConversation}
            className='flex items-center justify-center w-7 h-7 rounded-lg text-[#8EA58C] hover:text-white hover:bg-[#283A27]/80 transition-all border-none bg-transparent cursor-pointer'
            title="New Chat"
          >
            <PenSquare size={13} />
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
      <div className='py-2.5 px-1'>
        <button 
          onClick={handleCreateConversation}
          className='w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F] border-none cursor-pointer tracking-wide shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all'
        >
          <Plus size={14} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Real-Time Search Conversations Input */}
      <div className="px-1 pb-2">
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-2.5 text-[#8EA58C]" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[#182319] text-[#CBD8CA] placeholder-[#6C846B] text-[11px] rounded-xl pl-7 pr-7 py-1.5 border border-[#2B3C2A] outline-none focus:border-[#435E41]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#8EA58C] hover:text-white bg-transparent border-none cursor-pointer p-0.5"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Conversations Section */}
      <div className='flex-1 overflow-y-auto px-1 py-1 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-[#E8DDC8] uppercase tracking-wider">
              <Pin size={10} className="fill-[#E8DDC8]" />
              <span>PINNED</span>
            </div>
            {pinnedConversations.map(renderConvItem)}
          </div>
        )}

        {/* Regular Recents Section */}
        <div className="space-y-1">
          <div className='flex items-center justify-between px-2 pt-1 pb-1'>
            <span className='text-[10px] font-bold text-[#8EA58C] tracking-wider uppercase'>
              RECENTS
            </span>
            <span className='text-[10px] text-[#8EA58C]'>
              {filteredConversations.length}
            </span>
          </div>

          {regularConversations.length > 0 ? (
            regularConversations.map(renderConvItem)
          ) : (
            <div className='flex flex-col items-center justify-center h-24 text-center px-4'>
              <MessageSquare size={16} className='text-[#8EA58C]/40 mb-1.5' />
              <p className='text-xs text-[#8EA58C]'>
                {searchQuery ? "No matching chats" : "No conversations yet"}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Explore Capabilities Shortcut */}
      <div className="px-1 py-2 border-t border-[#2C3E2B]/80">
        <button
          onClick={onOpenExplore}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-[#253626]/80 hover:bg-[#2C402E] text-[#E8DDC8] border border-[#3E553D]/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#C9A875]" />
            <span>Explore 8 AI Modes</span>
          </div>
          <span className="text-[10px] bg-[#162117] text-[#8EA58C] px-1.5 py-0.5 rounded font-bold">
            PRO
          </span>
        </button>
      </div>

      {/* Bottom User Profile & Settings Section */}
      <div className='pt-2 border-t border-[#2C3E2B]/80'>
        {userData ? (
          <div className='bg-[#162117]/85 backdrop-blur-md border border-[#2B3C2A]/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'>
            <div 
              onClick={onOpenSettings}
              className='flex items-center gap-2.5 min-w-0 cursor-pointer flex-1'
              title="Open Settings"
            >
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
              <button
                onClick={onOpenSettings}
                className='p-1 rounded-lg text-[#8EA58C] hover:text-white hover:bg-[#283A27]/80 transition-colors border-none bg-transparent cursor-pointer'
                title="Settings"
              >
                <Settings size={13} />
              </button>
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
          <div className='p-2 flex items-center justify-between text-xs text-[#8EA58C] bg-[#162117]/60 rounded-xl'>
            <span>Guest Session</span>
            <button
              onClick={onOpenSettings}
              className="text-[#E8DDC8] hover:underline bg-transparent border-none cursor-pointer text-xs"
            >
              Settings
            </button>
          </div>
        )}
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className='hidden lg:flex w-[265px] xl:w-[280px] shrink-0 h-full flex-col'>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 z-50 lg:hidden flex'>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'
          />
          <div className='relative z-10 w-[84vw] max-w-[320px] h-full p-2 animate-in slide-in-from-left duration-250'>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default SideBar
