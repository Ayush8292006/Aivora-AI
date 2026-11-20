import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SideBar from '../components/SideBar.jsx'
import ChatArea from '../components/ChatArea.jsx'
import Artifact from '../components/Artifact.jsx'
import LandingPage from './LandingPage.jsx'
import SettingsModal from '../components/SettingsModal.jsx'
import ExploreModal from '../components/ExploreModal.jsx'
import LoginModal from '../components/LoginModal.jsx'

function Home() {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()

  // Routing State: 'landing' or 'app'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#app' || hash === '#chat' || hash === '#workspace') {
        return 'app'
      }
      const saved = localStorage.getItem('aivora_last_view')
      if (saved === 'app') return 'app'
    }
    return 'landing'
  })

  // Modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [exploreModalOpen, setExploreModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // Listen to hash changes for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#app' || hash === '#chat' || hash === '#workspace') {
        setCurrentView('app')
      } else if (hash === '#landing' || hash === '#home' || !hash) {
        // keep current view unless explicitly #landing
        if (hash === '#landing' || hash === '#home') {
          setCurrentView('landing')
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateToApp = (agentMode) => {
    setCurrentView('app')
    localStorage.setItem('aivora_last_view', 'app')
    window.location.hash = 'app'
    if (agentMode && typeof agentMode === 'string') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('aivora:set-prompt', {
          detail: { agent: agentMode }
        }))
      }, 100)
    }
  }

  const navigateToLanding = () => {
    setCurrentView('landing')
    localStorage.setItem('aivora_last_view', 'landing')
    window.location.hash = 'landing'
  }

  const handleLaunchCapability = (prompt, agent) => {
    navigateToApp(agent)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('aivora:set-prompt', {
        detail: { prompt, agent }
      }))
    }, 150)
  }

  return (
    <div className='relative min-h-screen w-screen bg-[#D8CDBA] bg-[radial-gradient(circle_at_15%_20%,#E6D9C4_0%,transparent_45%),radial-gradient(circle_at_85%_15%,#E2D4BF_0%,transparent_50%),radial-gradient(circle_at_50%_85%,#CFC1AA_0%,transparent_60%),linear-gradient(135deg,#D8CDBA_0%,#CFC1AA_50%,#D5C8B4_100%)] text-[#1E1B18] overflow-hidden flex flex-col font-["Plus_Jakarta_Sans",sans-serif]'>
      
      {/* VIEW 1: LANDING PAGE */}
      {currentView === 'landing' ? (
        <div className="flex-1 w-full overflow-y-auto">
          <LandingPage
            onStartChat={navigateToApp}
            onOpenLogin={() => setLoginModalOpen(true)}
            onOpenExplore={() => setExploreModalOpen(true)}
          />
        </div>
      ) : (
        /* VIEW 2: MAIN AI CHAT WORKSPACE (3-Panel Desktop Layout, Full Native View on Mobile) */
        <div className='relative z-10 flex-1 flex h-screen p-0 sm:p-2 lg:p-4 gap-0 lg:gap-4 overflow-hidden max-w-[1850px] w-full mx-auto animate-in fade-in duration-200'>
          <SideBar 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen}
            onOpenSettings={() => setSettingsModalOpen(true)}
            onOpenExplore={() => setExploreModalOpen(true)}
            onGoToLanding={navigateToLanding}
          />
          <ChatArea 
            onOpenMobileMenu={() => setMobileMenuOpen(true)} 
            onGoToLanding={navigateToLanding}
            onOpenExplore={() => setExploreModalOpen(true)}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
          <Artifact />
        </div>
      )}

      {/* MODAL 1: Settings & User Profile */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* MODAL 2: Explore 8 AI Modes */}
      <ExploreModal
        isOpen={exploreModalOpen}
        onClose={() => setExploreModalOpen(false)}
        onSelectCapability={handleLaunchCapability}
      />

      {/* MODAL 3: Login & Signup Authentication */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setLoginModalOpen(false)
          navigateToApp()
        }}
      />

    </div>
  )
}

export default Home
