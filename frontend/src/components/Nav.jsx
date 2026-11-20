import React, { useState } from 'react'
import { 
  Search, Download, Maximize2, Menu, ChevronDown, Plus 
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
      alert("No artifact or file available to download yet.")
      return
    }

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

  return (
    <header className='flex flex-col gap-2 pb-2 select-none'>
      
      {/* Mobile Top Navigation */}
      <div className='lg:hidden flex items-center justify-between px-2 py-1.5'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded-xl bg-gradient-to-br from-[#30271F] to-[#211C16] border border-white/20 text-[#E9DDC8] font-bold flex items-center justify-center text-xs shadow-xs'>
            A
          </div>
          <span className='text-sm font-bold text-[#F5F0E6]'>Aivora AI</span>
          <span className='bg-gradient-to-r from-[#E9DDC8] to-[#C9AD7C] text-[#211C16] font-extrabold text-[10px] px-2 py-0.5 rounded-full'>
            Pro
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleNewChat}
            className='flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold btn-liquid-gold border-none cursor-pointer'
          >
            <Plus size={13} />
            <span>New</span>
          </button>
          
          <button
            onClick={onOpenMobileMenu}
            className='p-2 rounded-xl text-[#E9DDC8] hover:text-white glass-card border border-white/10 cursor-pointer'
            title="Open Conversations"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* Desktop Workspace Top Bar */}
      <div className='hidden lg:flex items-center justify-between px-2 py-1 gap-3'>
        
        {/* Left: Minimal Search Bar Pill with Ctrl + K */}
        <div className='flex items-center gap-2.5 glass-card rounded-full px-4 py-1.5 text-xs text-[#89977B] w-72 hover:border-white/25 transition-all cursor-text'>
          <Search size={13} className='text-[#89977B]' />
          <span className='flex-1 truncate text-[#E9DDC8]/70 text-[11px]'>Search anything...</span>
          <span className='text-[10px] font-mono bg-white/5 text-[#E9DDC8]/90 px-1.5 py-0.2 rounded border border-white/10'>
            Ctrl+K
          </span>
        </div>

        {/* Right Controls: Dimension Selector + Liquid Gold Download + Fullscreen */}
        <div className='flex items-center gap-2.5'>
          
          {/* Dimension Selector Pill */}
          <div className='relative'>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className='flex items-center gap-1.5 glass-card rounded-full px-3.5 py-1.5 text-xs font-medium text-[#E9DDC8] hover:text-white hover:border-white/25 transition-all cursor-pointer'
            >
              <span>Generated Image ({aspectRatio})</span>
              <ChevronDown size={12} className='text-[#89977B]' />
            </button>

            {dropdownOpen && (
              <div className='absolute right-0 top-full mt-1.5 z-50 w-44 glass-panel rounded-xl py-1 shadow-2xl backdrop-blur-2xl animate-fade-in'>
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
                          ? 'bg-[#343B29] text-[#E9DDC8] font-bold' 
                          : 'bg-transparent text-[#F5F0E6]/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Liquid Champagne Gold Download Button */}
          <button
            onClick={handleDownload}
            className='flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold btn-liquid-gold border-none cursor-pointer tracking-wide shadow-md'
            title="Download Generated Asset"
          >
            <Download size={13} className='stroke-[2.5]' />
            <span>Download</span>
          </button>

          {/* Fullscreen Expand Button */}
          <button
            onClick={() => dispatch(toggleMaximize())}
            className='flex items-center justify-center w-8 h-8 rounded-full glass-card text-[#89977B] hover:text-white hover:border-white/25 transition-all cursor-pointer'
            title="Toggle Expanded View"
          >
            <Maximize2 size={13} />
          </button>

        </div>

      </div>

    </header>
  )
}

export default Nav
