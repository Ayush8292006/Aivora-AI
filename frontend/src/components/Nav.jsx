import React, { useState } from 'react'
import { 
  Download, Maximize2, Menu, Plus, Copy, Check, 
  Sparkles, Home, Settings, PanelLeftClose, PanelLeft, Code2,
  Zap, Activity
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { createConversation } from '../features/createConversation'
import { addConversation, setSelectedConversation } from '../redux/conversationSlice'
import { clearMessages, toggleMaximize, setArtifactOpen } from '../redux/messageSlice'
import { openPricingModal, openUsageModal, openGuestLimitModal } from '../redux/creditSlice'

function Nav({ 
  onOpenMobileMenu, 
  onGoToLanding, 
  onOpenExplore, 
  onOpenSettings,
  sidebarCollapsed,
  onToggleSidebar
}) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { artifacts, activeArtifactId, isOpen } = useSelector(state => state.message)
  const { availableCredits, guestSession } = useSelector(state => state.credit)
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [copiedTitle, setCopiedTitle] = useState(false)

  const isGuest = !userData || userData.isGuest
  const guestRemaining = guestSession?.questionsRemaining ?? 4
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

        {/* Center: Brand Mark + Name + Credit Badge */}
        <div 
          onClick={onGoToLanding}
          className='flex items-center gap-1.5 cursor-pointer'
        >
          <div className='w-6 h-6 rounded-full bg-[#24201C] text-[#E8DDC8] font-bold flex items-center justify-center text-[11px] shadow-xs'>
            A
          </div>
          <span className='text-[14px] font-bold text-[#1E1B18] tracking-tight'>Aivora</span>
          {isGuest ? (
            <span 
              onClick={(e) => { e.stopPropagation(); dispatch(openGuestLimitModal()); }}
              className='bg-[#E8DDC8] text-[#1E2B1F] font-bold text-[9px] px-1.5 py-0.5 rounded-full'
            >
              {guestRemaining}/4 Free
            </span>
          ) : (
            <span 
              onClick={(e) => { e.stopPropagation(); dispatch(openPricingModal()); }}
              className='bg-[#1E2B1F] text-[#C9A875] font-bold text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5'
            >
              <Zap size={9} /> {availableCredits}
            </span>
          )}
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
        
        {/* Left: Sidebar Toggle + Brand Badge + Shortcuts */}
        <div className='flex items-center gap-3'>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className='p-1.5 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer'
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
          )}

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

            {/* Conversation Token Usage Button */}
            <button
              onClick={() => dispatch(openUsageModal())}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer font-medium text-xs"
              title="View Chat Token & Credit Usage"
            >
              <Activity size={13} className="text-[#C9A875]" />
              <span>Usage Details</span>
            </button>
          </div>
        </div>

        {/* Right Action Icons: Wallet Balance Pill + Open Preview button + Copy Link + Settings */}
        <div className='flex items-center gap-2'>
          
          {/* Credit / Guest Balance Pill */}
          {isGuest ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => dispatch(openGuestLimitModal())}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE2D2] hover:bg-[#DDD2BD] text-[#1E1B18] border border-[#DDD3C1] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                title="Guest Usage Status"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                <span>{guestRemaining}/4 Free Questions</span>
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('aivora:open-login', { detail: { mode: 'register' } }))}
                className="px-3 py-1 rounded-full bg-[#1E2B1F] hover:bg-[#283A27] text-[#E8DDC8] text-xs font-bold cursor-pointer transition-colors border-none shadow-2xs"
                title="Sign up for 100 bonus credits & private wallet"
              >
                Sign Up Free
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch(openPricingModal())}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2B1F] hover:bg-[#283A27] text-white border border-[#3E553D] text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              title="Click to Buy AI Credits"
            >
              <Zap size={13} className="text-[#C9A875]" />
              <span className="text-[#E8DDC8] font-mono">{availableCredits.toLocaleString()}</span>
              <span className="text-[10px] text-[#CBD8CA] uppercase font-sans">Credits</span>
            </button>
          )}

          {artifacts && artifacts.length > 0 && !isOpen && (
            <button
              onClick={() => dispatch(setArtifactOpen(true))}
              className='flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#1E2B1F] text-[#E8DDC8] hover:bg-[#283A27] transition-all border-none cursor-pointer shadow-2xs mr-1'
              title="Open Project Preview"
            >
              <Code2 size={13} />
              <span>Preview Artifact</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className='p-1.5 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer'
              title="Settings & Credits"
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
