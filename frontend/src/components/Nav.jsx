import React, { useState } from 'react'
import { 
  Download, Maximize2, Menu, ChevronDown, Plus, Copy, Check 
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { createConversation } from '../features/createConversation'
import { addConversation, setSelectedConversation } from '../redux/conversationSlice'
import { clearMessages, toggleMaximize } from '../redux/messageSlice'

function Nav({ onOpenMobileMenu }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { artifacts, activeArtifactId } = useSelector(state => state.message)
  const dispatch = useDispatch()
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
        <button
          onClick={onOpenMobileMenu}
          className='flex items-center justify-center w-8 h-8 rounded-xl text-[#1E1B18] bg-[#F2ECE0] border border-[#DDD3C1] active:scale-95 transition-all cursor-pointer'
          title="Open Conversations"
        >
          <Menu size={16} />
        </button>

        {/* Center: Brand Mark + Name + Pro */}
        <div className='flex items-center gap-2'>
          <div className='w-6 h-6 rounded-full bg-[#24201C] text-[#E8DDC8] font-bold flex items-center justify-center text-[11px] shadow-xs'>
            A
          </div>
          <span className='text-[14.5px] font-bold text-[#1E1B18] tracking-tight'>Aivora AI</span>
          <span className='bg-[#24201C] text-[#E8DDC8] font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider'>
            PRO
          </span>
        </div>

        {/* Right: Start New Chat */}
        <button
          onClick={handleNewChat}
          className='flex items-center justify-center w-8 h-8 rounded-xl bg-[#243223] text-white active:scale-95 transition-all border-none cursor-pointer shadow-xs'
          title="New Chat"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Desktop Workspace Top Bar */}
      <div className='hidden lg:flex items-center justify-between px-3 py-1.5 border-b border-[#E8DEC9]'>
        
        {/* Left: Brand Badge + Aivora AI + PRO Pill */}
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-full bg-[#24201C] text-[#E8DDC8] font-bold flex items-center justify-center text-xs shadow-xs'>
            A
          </div>
          <span className='text-sm font-semibold tracking-tight text-[#1E1B18]'>
            Aivora AI
          </span>
          <span className='bg-[#24201C] text-[#E8DDC8] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider'>
            PRO
          </span>
        </div>

        {/* Right Action Icons: Copy, Artifact Format, Fullscreen */}
        <div className='flex items-center gap-2'>
          {activeArtifact && (
            <div className='relative'>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className='flex items-center gap-1.5 bg-[#F2ECE0] border border-[#DDD3C1] hover:border-[#9BB091] rounded-lg px-2.5 py-1 text-xs font-medium text-[#1E1B18] transition-all cursor-pointer'
              >
                <span>Format ({aspectRatio})</span>
                <ChevronDown size={12} className='text-[#696256]' />
              </button>

              {dropdownOpen && (
                <div className='absolute right-0 top-full mt-1.5 z-50 w-40 bg-[#FAF8F3] border border-[#DDD3C1] rounded-xl py-1 shadow-md'>
                  {['1:1 (Square)', '16:9 (Landscape)', '9:16 (Portrait)', '4:3 (Classic)'].map(ratio => {
                    const val = ratio.split(' ')[0]
                    return (
                      <button
                        key={ratio}
                        onClick={() => {
                          setAspectRatio(val)
                          setDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-none ${
                          aspectRatio === val 
                            ? 'bg-[#F2ECE0] text-[#243223] font-bold' 
                            : 'bg-transparent text-[#1E1B18] hover:bg-[#F2ECE0]'
                        }`}
                      >
                        {ratio}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
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
