import { signInWithPopup } from 'firebase/auth'
import React, { useState } from 'react'
import api from '../../utils/axios.js'
import { auth, googleProvider } from '../../utils/firebase.js'
import { FcGoogle } from "react-icons/fc"
import { useDispatch, useSelector } from 'react-redux'
import { setUserdata } from '../redux/userSlice.js'
import SideBar from '../components/SideBar.jsx'
import ChatArea from '../components/ChatArea.jsx'
import Artifact from '../components/Artifact.jsx'
import { Home as HomeIcon, Compass, BookOpen, User as UserIcon, Sparkles } from 'lucide-react'

function Home() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState('home')

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token })
      dispatch(setUserdata(data))
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const googleLogin = async () => {
    try {
      const data = await signInWithPopup(auth, googleProvider)
      const token = await data.user.getIdToken()
      await handleLogin(token)
    } catch (err) {
      console.error('Google login popup error:', err)
    }
  }

  return (
    <div className='relative h-screen w-screen bg-[#040805] text-[#e8f0e9] overflow-hidden flex flex-col font-["Plus_Jakarta_Sans",sans-serif]'>
      
      {/* Ambient Silk Ribbon Background Waves */}
      <div className='aurora-ambient-bg'>
        <div className='aurora-ribbon-1'></div>
        <div className='aurora-ribbon-2'></div>
        <div className='aurora-ribbon-3'></div>
      </div>

      {/* Main App Desktop / Tablet Layout Container */}
      <div className='relative z-10 flex-1 flex p-2 sm:p-3 lg:p-4 gap-3 lg:gap-4 overflow-hidden max-w-[1780px] w-full mx-auto'>
        <SideBar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <ChatArea 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
        />
        <Artifact />
      </div>

      {/* Mobile Bottom Navigation Bar (as shown in reference image) */}
      <div className='relative z-20 lg:hidden flex items-center justify-around py-2.5 px-6 bg-[#08130b]/90 backdrop-blur-2xl border-t border-[#1e3825]/60'>
        <button
          onClick={() => setMobileTab('home')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'home' ? 'text-[#4de370]' : 'text-[#6e8a74] hover:text-[#c4d6c7]'
          }`}
        >
          <HomeIcon size={18} />
          <span className='text-[10px] font-medium'>Home</span>
        </button>
        <button
          onClick={() => setMobileTab('explore')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'explore' ? 'text-[#4de370]' : 'text-[#6e8a74] hover:text-[#c4d6c7]'
          }`}
        >
          <Compass size={18} />
          <span className='text-[10px] font-medium'>Explore</span>
        </button>
        <button
          onClick={() => setMobileTab('library')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'library' ? 'text-[#4de370]' : 'text-[#6e8a74] hover:text-[#c4d6c7]'
          }`}
        >
          <BookOpen size={18} />
          <span className='text-[10px] font-medium'>Library</span>
        </button>
        <button
          onClick={() => setMobileTab('profile')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'profile' ? 'text-[#4de370]' : 'text-[#6e8a74] hover:text-[#c4d6c7]'
          }`}
        >
          <UserIcon size={18} />
          <span className='text-[10px] font-medium'>Profile</span>
        </button>
      </div>

      {/* Luxury Forest-Green & Champagne Gold Login Modal */}
      {!userData && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4'>
          <div className='w-full max-w-[360px] aurora-glass-panel rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl border border-[#2b4d36]'>
            <div className='absolute -top-12 -right-12 w-32 h-32 bg-[#4de370]/15 rounded-full blur-2xl pointer-events-none'></div>
            <div className='absolute -bottom-12 -left-12 w-32 h-32 bg-[#dfc499]/15 rounded-full blur-2xl pointer-events-none'></div>

            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1b3523] to-[#0c1f13] border border-[#3e6b4b] flex items-center justify-center shadow-lg shadow-[#4de370]/10'>
                <span className='text-lg text-[#4de370]'>✦</span>
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <h2 className='text-lg font-bold text-[#f5f8f5] tracking-tight'>Aurora AI</h2>
                  <span className='bg-gradient-to-r from-[#ebd6b6] to-[#cca670] text-[#1b160e] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm'>
                    Pro
                  </span>
                </div>
                <p className='text-xs text-[#7d9983]'>Next-Gen Multi-Agent Workspace</p>
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <p className='text-sm text-[#c7d9cb]'>Welcome to your intelligent workspace.</p>
              <p className='text-xs text-[#7d9983] leading-relaxed'>
                Sign in with Google to access your chats, documents, slides, and generated images.
              </p>
            </div>

            <button 
              onClick={googleLogin}
              className='w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-semibold aurora-gold-btn border-none cursor-pointer'
            >
              <FcGoogle size={18} />
              Continue With Google
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Home
