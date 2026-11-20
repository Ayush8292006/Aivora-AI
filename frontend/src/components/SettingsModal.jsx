// src/components/SettingsModal.jsx
import React, { useState } from 'react'
import { 
  X, User, Shield, Sparkles, Sliders, Moon, Sun, 
  Trash2, LogOut, Check, Laptop, Key, Database, Info
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import logOut from '../features/logOut'
import { setUserdata } from '../redux/userSlice'

export default function SettingsModal({ isOpen, onClose, onOpenLogin }) {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const { conversations } = useSelector(state => state.conversation)
  
  const [activeTab, setActiveTab] = useState('profile')
  const [defaultAgent, setDefaultAgent] = useState('auto')
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)

  if (!isOpen) return null

  const handleSavePreferences = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2000)
  }

  const handleSignOut = async () => {
    try {
      await logOut()
      dispatch(setUserdata(null))
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#1E1B18]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD3C1] bg-[#F2ECE0]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#1E1B18]">Aivora AI Settings</h2>
              <p className="text-[11px] text-[#696256]">Manage preferences, profile & workspace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#696256] hover:text-[#1E1B18] hover:bg-[#E5DDCF] transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body with Sidebar Tabs */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tab Navigation */}
          <div className="w-44 bg-[#F5EFE3] border-r border-[#DDD3C1] p-3 flex flex-col gap-1 text-xs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-all border-none cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <User size={14} />
              <span>User Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-all border-none cursor-pointer ${
                activeTab === 'preferences' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <Sliders size={14} />
              <span>Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-all border-none cursor-pointer ${
                activeTab === 'workspace' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <Database size={14} />
              <span>Workspace</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-all border-none cursor-pointer ${
                activeTab === 'about' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <Info size={14} />
              <span>About</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5 p-3.5 bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl">
                  {userData?.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-[#C5BBAA]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-lg">
                      {userData?.name?.charAt(0) || 'G'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1E1B18] truncate">
                        {userData?.name || 'Guest User'}
                      </h3>
                      <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase">
                        PRO TIER
                      </span>
                    </div>
                    <p className="text-xs text-[#696256] truncate mt-0.5">
                      {userData?.email || 'Logged in via guest session'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1E1B18] block">Session Status</label>
                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDD3C1] rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                      <span className="text-[#1E1B18] font-medium">
                        {userData ? 'Connected via Google Cloud' : 'Guest Mode Active'}
                      </span>
                    </div>
                    {userData ? (
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1 text-xs text-[#A84B4B] hover:text-[#8B3A3A] font-medium bg-transparent border-none cursor-pointer"
                      >
                        <LogOut size={12} />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => { onClose(); onOpenLogin && onOpenLogin(); }}
                        className="text-xs font-bold text-[#1E2B1F] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Sign In Now
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#EAE2D2]/60 border border-[#DDD3C1] rounded-xl text-xs text-[#696256] leading-relaxed">
                  💡 Tip: Signing in securely syncs your conversations, PDF files, generated presentations, and coding artifacts across devices.
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E1B18] block">Default AI Agent Mode</label>
                  <p className="text-[11px] text-[#696256]">Choose the default mode for new conversations</p>
                  <select
                    value={defaultAgent}
                    onChange={(e) => setDefaultAgent(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DDD3C1] bg-white text-[#1E1B18] outline-none"
                  >
                    <option value="auto">Auto (Intelligent Intent Router)</option>
                    <option value="chat">Chat (Polymath Knowledge & Consultation)</option>
                    <option value="coding">Coding (Full-Stack Architecture)</option>
                    <option value="pdf">PDF Tools (Documents, Resumes & Reports)</option>
                    <option value="ppt">Presentation (Slide Decks)</option>
                    <option value="image">Image Generation (Cinematic Art)</option>
                    <option value="search">Search (Real-time Live Intelligence)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDD3C1] rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-[#1E1B18]">Speech Recognition & Voice Input</p>
                      <p className="text-[11px] text-[#696256]">Enable microphone dictation in composer</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={speechEnabled} 
                      onChange={(e) => setSpeechEnabled(e.target.checked)}
                      className="cursor-pointer accent-[#1E2B1F]" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDD3C1] rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-[#1E1B18]">High Contrast Editorial Mode</p>
                      <p className="text-[11px] text-[#696256]">Deepen text contrast for reading long documents</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={highContrast} 
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="cursor-pointer accent-[#1E2B1F]" 
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#1E2B1F] text-white hover:bg-[#283A27] transition-all border-none cursor-pointer"
                >
                  {savedNotice ? <Check size={14} className="text-[#4ADE80]" /> : null}
                  <span>{savedNotice ? 'Preferences Saved!' : 'Save Preferences'}</span>
                </button>
              </div>
            )}

            {/* WORKSPACE TAB */}
            {activeTab === 'workspace' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                    <p className="text-[#696256] text-[11px]">Total Conversations</p>
                    <p className="text-lg font-bold text-[#1E1B18] mt-1">{conversations?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                    <p className="text-[#696256] text-[11px]">Storage Status</p>
                    <p className="text-lg font-bold text-[#4A653C] mt-1">Unlimited</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#DDD3C1] rounded-xl text-xs space-y-2">
                  <p className="font-bold text-[#1E1B18]">Artifacts & Export Hub</p>
                  <p className="text-[11px] text-[#696256] leading-relaxed">
                    Aivora AI automatically parses code projects into interactive sandboxes, reports into print-ready A4 PDFs, and presentations into editable PPTX decks.
                  </p>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="p-3.5 bg-white border border-[#DDD3C1] rounded-xl space-y-1.5">
                  <p className="font-bold text-sm text-[#1E1B18]">Aivora AI Platform</p>
                  <p className="text-[#696256] text-[11px]">Version 2.4.0 (Enterprise Editorial Release)</p>
                  <p className="text-[#696256] text-[11px]">Multi-Agent Orchestration Engine powered by LangGraph</p>
                </div>

                <div className="p-3.5 bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl space-y-1 text-[11px] text-[#696256]">
                  <p className="font-semibold text-[#1E1B18]">Engineered for Productivity</p>
                  <p>Designed with a luxury liquid glassmorphism identity, Warm Champagne aesthetic, and authoritative domain-expert intelligence.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#DDD3C1] bg-[#F2ECE0]/80 flex items-center justify-between text-xs">
          <span className="text-[#696256] text-[11px]">Aivora AI • All systems operational</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E2B1F] border border-[#C8BEAC] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
