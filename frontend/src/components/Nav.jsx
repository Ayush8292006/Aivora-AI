import React, { useState, useEffect, useRef } from 'react'
import { 
  Download, Maximize2, Menu, Plus, Copy, Check, 
  Sparkles, Home, Settings, PanelLeftClose, PanelLeft, Code2,
  Zap, Activity, ChevronDown, MessageSquare, FileText, 
  Presentation, ImageIcon, Globe, PenSquare, X
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
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState("Auto")
  const dropdownRef = useRef(null)

  const isGuest = !userData || userData.isGuest
  const guestRemaining = guestSession?.questionsRemaining ?? 4
  const activeArtifact = artifacts?.find(a => a.id === activeArtifactId) || artifacts?.[artifacts.length - 1]

  const availableModes = [
    { id: "Auto", label: "Auto", desc: "Intelligent routing across all domains", icon: Sparkles, color: "text-[#4A653C] bg-[#EAE2D2]" },
    { id: "Coding", label: "Full-Stack Code", desc: "Interactive HTML5/CSS/JS sandbox", icon: Code2, color: "text-[#4ADE80] bg-[#1E2B1F]" },
    { id: "PDF", label: "Executive PDF", desc: "ATS resumes, whitepapers & reports", icon: FileText, color: "text-[#F87171] bg-[#3A1E1E]" },
    { id: "PPT", label: "Pitch Decks", desc: "16:9 executive presentation slides", icon: Presentation, color: "text-[#FBBF24] bg-[#372E15]" },
    { id: "Image", label: "Cinematic Visuals", desc: "Photorealistic 4K visual synthesis", icon: ImageIcon, color: "text-[#F3C474] bg-[#3D2D1E]" },
    { id: "Search", label: "Web Intelligence", desc: "Live web synthesis with citations", icon: Globe, color: "text-[#60A5FA] bg-[#1E2C3A]" },
    { id: "Chat", label: "Polymath Chat", desc: "Deep reasoning & conceptual models", icon: MessageSquare, color: "text-[#E8DDC8] bg-[#243223]" }
  ]

  useEffect(() => {
    const handleSetPrompt = (e) => {
      if (e.detail?.agent) {
        const agentMap = {
          auto: "Auto",
          coding: "Full-Stack Code",
          code: "Full-Stack Code",
          pdf: "Executive PDF",
          ppt: "Pitch Decks",
          image: "Cinematic Visuals",
          search: "Web Intelligence",
          chat: "Polymath Chat"
        }
        const mapped = agentMap[e.detail.agent.toLowerCase()] || e.detail.agent
        setCurrentMode(mapped)
      }
    }
    window.addEventListener('aivora:set-prompt', handleSetPrompt)
    return () => window.removeEventListener('aivora:set-prompt', handleSetPrompt)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setModelDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectMode = (mode) => {
    setCurrentMode(mode.label)
    setModelDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('aivora:set-prompt', {
      detail: { agent: mode.id }
    }))
  }

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
    <header className='flex flex-col gap-0 select-none'>
      
      {/* Mobile Top Navigation: Clean ChatGPT Mobile App Header */}
      <div className='lg:hidden flex items-center justify-between px-3 h-14 border-b border-[#E8DEC9] bg-[#FAF8F3]/95 backdrop-blur-md sticky top-0 z-30'>
        
        {/* Left: Hamburger Drawer + Home */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenMobileMenu}
            className='flex items-center justify-center w-9 h-9 rounded-xl text-[#1E1B18] bg-[#F2ECE0] border border-[#DDD3C1] active:scale-95 transition-all cursor-pointer shadow-2xs'
            title="Open Conversations"
          >
            <Menu size={17} />
          </button>
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className='flex items-center justify-center w-8 h-8 rounded-xl text-[#696256] hover:text-[#1E1B18] bg-transparent border-none active:scale-95 transition-all cursor-pointer'
              title="Landing Page"
            >
              <Home size={16} />
            </button>
          )}
        </div>

        {/* Center: Model Selector Dropdown Button (Like ChatGPT 4o ▾) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2ECE0] hover:bg-[#EAE2D2] border border-[#DDD3C1] text-[#1E1B18] text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            <span className="max-w-[120px] truncate">{currentMode === "Auto" ? "Aivora 2.0" : currentMode}</span>
            <ChevronDown size={13} className={`text-[#7A7469] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Model Selector Menu Dropdown */}
          {modelDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 border-b border-[#DDD3C1]/80 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#7A7469] uppercase tracking-wider">Select Engine</span>
                <span className="text-[9.5px] font-mono text-[#4A653C] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-bold">Aivora 2.0</span>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {availableModes.map((mode) => {
                  const Icon = mode.icon
                  const isSelected = currentMode === mode.label || (mode.id === "Auto" && currentMode === "Auto")
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleSelectMode(mode)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all border cursor-pointer ${
                        isSelected 
                          ? 'bg-[#1E2B1F] text-white border-[#1E2B1F] shadow-xs' 
                          : 'bg-[#F4EEE2] hover:bg-[#EAE2D2] text-[#1E1B18] border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/15 text-white' : mode.color}`}>
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#1E1B18]'}`}>
                            {mode.label}
                          </p>
                          {isSelected && <Check size={13} className="text-[#4ADE80] shrink-0" />}
                        </div>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-[#CBD8CA]' : 'text-[#7A7469]'}`}>
                          {mode.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Balance / Free Badge + New Chat (+) */}
        <div className="flex items-center gap-1.5">
          {isGuest ? (
            <button
              onClick={() => dispatch(openGuestLimitModal())}
              className='bg-[#E8DDC8] text-[#1E2B1F] font-bold text-[10px] px-2 py-1 rounded-full border border-[#DDD3C1] active:scale-95 transition-all cursor-pointer'
              title="Guest Usage"
            >
              {guestRemaining}/4 Free
            </button>
          ) : (
            <button
              onClick={() => dispatch(openPricingModal())}
              className='bg-[#1E2B1F] text-[#C9A875] font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#3E553D]/50 active:scale-95 transition-all cursor-pointer shadow-2xs'
              title="Wallet Balance"
            >
              <Zap size={10} className="fill-[#C9A875]" />
              <span>{availableCredits}</span>
            </button>
          )}

          <button
            onClick={handleNewChat}
            className='flex items-center justify-center w-9 h-9 rounded-xl bg-[#1E2B1F] hover:bg-[#283A27] text-white active:scale-95 transition-all border-none cursor-pointer shadow-xs'
            title="New Chat"
          >
            <Plus size={16} />
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
          </div>

          <div className="h-4 w-px bg-[#DDD3C1]" />

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 text-xs">
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
