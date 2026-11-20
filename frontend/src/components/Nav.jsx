import React, { useState } from 'react'
import { 
  Search, Download, Maximize2, Menu, Sparkles, ChevronDown, Plus 
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

  const activeArtifact = artifacts?.find(a => a.id === activeArtifactId) || artifacts?.[artifacts.length - 1]

  const handleDownload = () => {
    if (!activeArtifact) {
      alert("No artifact or generated image available to download yet.")
      return
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
    if (activeArtifact.url) {
      const fullUrl = activeArtifact.url.startsWith('http') 
        ? `${activeArtifact.url}?download=1` 
        : `${serverUrl}${activeArtifact.url}?download=1`
      const a = document.createElement('a')
      a.href = fullUrl
      a.download = activeArtifact.title || 'aivora-image.png'
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

  return (
    <div className='flex flex-col gap-2 pb-2'>
      
      {/* Mobile Top Navigation (shown on mobile devices, matching reference image) */}
      <div className='lg:hidden flex items-center justify-between px-2 py-2'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded-lg bg-gradient-to-br from-[#1d3b26] to-[#0c1c11] border border-[#3e6b4b] flex items-center justify-center'>
            <span className='text-[#4de370] text-sm font-bold'>✦</span>
          </div>
          <span className='text-base font-bold text-[#f5f8f5]'>Aurora AI</span>
          <span className='bg-gradient-to-r from-[#ebd6b6] to-[#cca670] text-[#1b160e] font-extrabold text-[10px] px-2 py-0.5 rounded-full'>
            Pro
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleNewChat}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold aurora-gold-btn border-none cursor-pointer'
          >
            <Plus size={13} />
            <span>New Chat</span>
          </button>
          
          <button
            onClick={onOpenMobileMenu}
            className='p-2 rounded-xl text-[#9ab5a0] hover:text-white bg-[#122619]/60 border border-[#23422d] cursor-pointer'
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Desktop Navigation Bar (Center + Right matching reference image) */}
      <div className='hidden lg:flex items-center justify-between px-2 py-1 gap-3'>
        
        {/* Left: Search Bar Pill with Ctrl + K */}
        <div className='flex items-center gap-2.5 bg-[#09150d]/80 border border-[#23422d]/80 rounded-full px-4 py-2 text-xs text-[#8ca893] w-72 max-w-sm hover:border-[#386b47] transition-all cursor-text'>
          <Search size={14} className='text-[#7a9681]' />
          <span className='flex-1 truncate'>Search anything...</span>
          <span className='text-[10px] font-mono bg-[#142e1d] text-[#9db5a3] px-2 py-0.5 rounded-md border border-[#284f33]'>
            Ctrl + K
          </span>
        </div>

        {/* Right Controls: Dimension Selector + Champagne Download + Fullscreen */}
        <div className='flex items-center gap-2.5'>
          
          {/* Dimension Selector Pill */}
          <div className='relative'>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className='flex items-center gap-1.5 bg-[#09150d]/80 border border-[#23422d]/80 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#c4d6c7] hover:text-white hover:border-[#386b47] transition-all cursor-pointer'
            >
              <span>Generated Image ({aspectRatio})</span>
              <ChevronDown size={13} className='text-[#8ca893]' />
            </button>

            {dropdownOpen && (
              <div className='absolute right-0 top-full mt-1.5 z-50 w-44 bg-[#0a180f] border border-[#2b4d36] rounded-xl py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95'>
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
                          ? 'bg-[#1b3d27] text-[#4de370] font-semibold' 
                          : 'bg-transparent text-[#a3b8a8] hover:bg-[#12291a] hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Champagne Gold Download Button */}
          <button
            onClick={handleDownload}
            className='flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold aurora-gold-btn border-none cursor-pointer tracking-wide shadow-md shadow-[#c7a168]/20'
            title="Download Artifact or Image"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          {/* Fullscreen Expand Button */}
          <button
            onClick={() => dispatch(toggleMaximize())}
            className='flex items-center justify-center w-8 h-8 rounded-full bg-[#09150d]/80 border border-[#23422d]/80 text-[#8ca893] hover:text-white hover:border-[#386b47] transition-all cursor-pointer'
            title="Toggle Expanded View"
          >
            <Maximize2 size={13} />
          </button>

        </div>

      </div>

    </div>
  )
}

export default Nav
