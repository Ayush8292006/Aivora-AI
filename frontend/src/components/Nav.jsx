import React, { useState } from 'react'
import { 
  Download, Maximize2, Menu, Plus, Copy, Check, 
  Sparkles, Home, Settings 
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { createConversation } from '../features/createConversation'
import { addConversation, setSelectedConversation } from '../redux/conversationSlice'
import { clearMessages, toggleMaximize } from '../redux/messageSlice'

function Nav({ onOpenMobileMenu, onGoToLanding, onOpenExplore, onOpenSettings }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { artifacts, activeArtifactId } = useSelector(state => state.message)
  const dispatch = useDispatch()
  const [copiedTitle, setCopiedTitle] = useState(false)

  const activeArtifact = artifacts?.find(a => a.id === activeArtifactId) || artifacts?.[artifacts.length - 1]

  const handleDownload = () => {
    if (!activeArtifact) return

    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
    if (activeArtifact.url) {
      const fullUrl = activeArtifact.url.startsWith('http') 
        ? `${activeArtifact.url}?download=1` 
        : `${serverUrl}${activeArtifact.url}?download=1`
      const a = document.createElement('a')
      a.href = fullUrl
      a.download = activeArtifact.title || 'aivora-export'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleNewChat = async () => {
    try {
      const data = await createConversation()
      if (data && data._id) {
        dispatch(clearMessages())
        dispatch(addConversation(data))
        dispatch(setSelectedConversation(data))
      }
    } catch (err) {
      console.error('Error creating chat:', err)
    }
  }

  const copyConversationLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedTitle(true)
      setTimeout(() => setCopiedTitle(false), 2000)
    } catch (err) {
      console.error('Copy link error:', err)
    }
  }

  return (
    <header className='flex flex-col gap-2 pb-2 select-none'>
      
      {/* Mobile Top Navigation: Clean Native App Bar */}
      <div className='lg:hidden flex items-center justify-between px-3 py-2 border-b border-[#E8DEC9] bg-[#FAF8F3]/95 backdrop-blur-md sticky top-0 z-30'>
        {/* Left: Open Conversations Drawer */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenMobileMenu}
            className='flex items-center justify-center w-8 h-8 rounded-xl text-[#1E1B18] bg-[#F2ECE0] border border-[#DDD3C1] active:scale-95 transition-all cursor-pointer'
            title="Open Conversations"
          >
            <Menu size={16} />
          </button>
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className='flex items-center justify-center w-8 h-8 rounded-xl text-[#696256] hover:text-[#1E1B18] bg-transparent border-none active:scale-95 transition-all cursor-pointer'
              title="Landing Page"
            >
              <Home size={15} />
            </button>
          )}
        </div>

        {/* Center: Brand Mark + Name + Pro */}
        <div 
          onClick={onGoToLanding}
          className='flex items-center gap-2 cursor-pointer'
        >
          <div className='w-6 h-6 rounded-full bg-[#24201C] text-[#E8DDC8] font-bold flex items-center justify-center text-[11px] shadow-xs'>
            A
          </div>
          <span className='text-[14.5px] font-bold text-[#1E1B18] tracking-tight'>Aivora AI</span>
          <span className='bg-[#24201C] text-[#E8DDC8] font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider'>
            PRO
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {onOpenExplore && (
            <button
              onClick={onOpenExplore}
              className='flex items-center justify-center w-8 h-8 rounded-xl text-[#4A653C] bg-[#F2ECE0] border border-[#DDD3C1] active:scale-95 transition-all cursor-pointer'
              title="Explore AI Modes"
            >
              <Sparkles size={14} />
            </button>
          )}
          <button
            onClick={handleNewChat}
            className='flex items-center justify-center w-8 h-8 rounded-xl bg-[#243223] text-white active:scale-95 transition-all border-none cursor-pointer shadow-xs'
            title="New Chat"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Desktop Workspace Top Bar */}
      <div className='hidden lg:flex items-center justify-between px-3 py-1.5 border-b border-[#E8DEC9]'>
        
        {/* Left: Brand Badge + Aivora AI + PRO Pill + Navigation Shortcuts */}
        <div className='flex items-center gap-3'>
          <div 
            onClick={onGoToLanding}
            className='flex items-center gap-2 cursor-pointer group' 
            title="Return to Landing Page"
          >
            <div className='w-7 h-7 rounded-full bg-[#24201C] text-[#E8DDC8] font-bold flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform'>
              A
            </div>
            <span className='text-sm font-bold tracking-tight text-[#1E1B18] group-hover:text-[#4A653C] transition-colors'>
              Aivora AI
            </span>
            <span className='bg-[#24201C] text-[#E8DDC8] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider'>
              PRO
            </span>
          </div>

          <div className="h-4 w-px bg-[#DDD3C1]" />

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 text-xs">
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer font-medium"
              >
                <Home size={13} />
                <span>Landing</span>
              </button>
            )}

            {onOpenExplore && (
              <button
                onClick={onOpenExplore}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#4A653C] hover:text-[#1E2B1F] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer font-semibold"
              >
                <Sparkles size={13} />
                <span>Explore Modes</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons: Copy Link, Settings, Fullscreen */}
        <div className='flex items-center gap-1.5'>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className='p-1.5 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer'
              title="Settings & Profile"
            >
              <Settings size={14} />
            </button>
          )}

          <button
            onClick={copyConversationLink}
            className='p-1.5 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer'
            title="Share Workspace Link"
          >
            {copiedTitle ? <Check size={14} className='text-[#243223]' /> : <Copy size={14} />}
          </button>

          <button
            onClick={() => dispatch(toggleMaximize())}
            className='p-1.5 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer'
            title="Toggle Expanded View"
          >
            <Maximize2 size={14} />
          </button>
        </div>

      </div>

    </header>
  )
}

export default Nav
