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

  // Routing State: 'landing' or 'app' (Default to 'landing' for stunning SaaS first impression)
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#app' || hash === '#chat' || hash === '#workspace') {
        return 'app'
      }
    }
    return 'landing'
  })

  // Workspace layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [exploreModalOpen, setExploreModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // Listen to hash changes for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#app' || hash === '#chat' || hash === '#workspace') {
        setCurrentView('app')
      } else {
        setCurrentView('landing')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateToApp = (agentMode) => {
    setCurrentView('app')
    window.location.hash = 'app'
    window.scrollTo({ top: 0, behavior: 'instant' })
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
    window.location.hash = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLaunchCapability = (prompt, agent) => {
    navigateToApp(agent)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('aivora:set-prompt', {
        detail: { prompt, agent }
      }))
    }, 150)
  }

  // 1. LANDING PAGE VIEW (Full window document flow, perfectly smooth natural scroll)
  if (currentView === 'landing') {
    return (
      <div className="w-full min-h-screen text-[#1E1B18] font-['Plus_Jakarta_Sans',sans-serif]">
        <LandingPage
          onStartChat={navigateToApp}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenExplore={() => setExploreModalOpen(true)}
        />

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

  // 2. MAIN AI CHAT WORKSPACE (Spacious 2-column or 3-column when artifact is open)
  return (
    <div className='relative h-screen w-screen bg-[#D8CDBA] bg-[radial-gradient(circle_at_15%_20%,#E6D9C4_0%,transparent_45%),radial-gradient(circle_at_85%_15%,#E2D4BF_0%,transparent_50%),radial-gradient(circle_at_50%_85%,#CFC1AA_0%,transparent_60%),linear-gradient(135deg,#D8CDBA_0%,#CFC1AA_50%,#D5C8B4_100%)] text-[#1E1B18] overflow-hidden flex flex-col font-["Plus_Jakarta_Sans",sans-serif]'>
      
      <div className='relative z-10 flex-1 flex h-screen p-0 sm:p-2 lg:p-3 gap-0 lg:gap-3 overflow-hidden max-w-[1920px] w-full mx-auto animate-in fade-in duration-200'>
        <SideBar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenExplore={() => setExploreModalOpen(true)}
          onGoToLanding={navigateToLanding}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <ChatArea 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
          onGoToLanding={navigateToLanding}
          onOpenExplore={() => setExploreModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Artifact />
      </div>

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
