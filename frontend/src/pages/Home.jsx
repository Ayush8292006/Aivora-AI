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
import { MessageSquare, Compass, BookOpen, User as UserIcon } from 'lucide-react'

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
    <div className='relative h-screen w-screen bg-[#08100B] text-[#F8F7F0] overflow-hidden flex flex-col font-["Plus_Jakarta_Sans",sans-serif]'>
      
      {/* Liquid Glass Ambient Lighting Refraction Pools */}
      <div className='liquid-ambient-bg'>
        <div className='liquid-light-pool-1'></div>
        <div className='liquid-light-pool-2'></div>
      </div>

      {/* Main 3-Panel Dashboard Layout */}
      <div className='relative z-10 flex-1 flex p-2 sm:p-3 lg:p-4 gap-3 lg:gap-4 overflow-hidden max-w-[1800px] w-full mx-auto'>
        <SideBar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <ChatArea 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
        />
        <Artifact />
      </div>

      {/* Mobile Bottom Glass Navigation Bar */}
      <div className='relative z-20 lg:hidden flex items-center justify-around py-2.5 px-6 bg-[#102217]/85 backdrop-blur-2xl border-t border-white/10'>
        <button
          onClick={() => setMobileTab('home')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'home' ? 'text-[#E8DDC8] font-bold' : 'text-[#789477] hover:text-[#F8F7F0]'
          }`}
        >
          <MessageSquare size={17} />
          <span className='text-[10px]'>Chat</span>
        </button>
        <button
          onClick={() => setMobileTab('explore')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'explore' ? 'text-[#E8DDC8] font-bold' : 'text-[#789477] hover:text-[#F8F7F0]'
          }`}
        >
          <Compass size={17} />
          <span className='text-[10px]'>Explore</span>
        </button>
        <button
          onClick={() => setMobileTab('library')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'library' ? 'text-[#E8DDC8] font-bold' : 'text-[#789477] hover:text-[#F8F7F0]'
          }`}
        >
          <BookOpen size={17} />
          <span className='text-[10px]'>Library</span>
        </button>
        <button
          onClick={() => setMobileTab('profile')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            mobileTab === 'profile' ? 'text-[#E8DDC8] font-bold' : 'text-[#789477] hover:text-[#F8F7F0]'
          }`}
        >
          <UserIcon size={17} />
          <span className='text-[10px]'>Account</span>
        </button>
      </div>

      {/* Luxury Frosted Liquid Glass Login Modal */}
      {!userData && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4'>
          <div className='w-full max-w-[380px] glass-panel rounded-3xl p-7 flex flex-col gap-5 relative overflow-hidden shadow-2xl border border-white/15'>
            
            {/* Top Gloss Refraction highlight */}
            <div className='absolute -top-16 -right-16 w-36 h-36 bg-[#C6A46A]/15 rounded-full blur-2xl pointer-events-none'></div>

            {/* Header: Brand Mark + Name + Pro */}
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-2xl bg-gradient-to-br from-[#263B2B] to-[#14291F] border border-white/20 flex items-center justify-center font-bold text-base text-[#E8DDC8] shadow-sm'>
                A
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <h2 className='text-base font-bold text-[#F8F7F0] tracking-tight'>Aivora AI</h2>
                  <span className='bg-gradient-to-r from-[#E8DDC8] to-[#C6A46A] text-[#14291F] font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs'>
                    Pro
                  </span>
                </div>
                <p className='text-xs text-[#789477] font-medium'>Luxury Multi-Agent Workspace</p>
              </div>
            </div>

            {/* Description */}
            <div className='flex flex-col gap-1 text-left'>
              <p className='text-sm font-semibold text-[#F8F7F0]'>Welcome to your workspace</p>
              <p className='text-xs text-[#E8DDC8]/70 leading-relaxed'>
                Sign in to create high-impact documents, presentations, research summaries, and code with multi-agent orchestration.
              </p>
            </div>

            {/* Sign in with Google Button */}
            <button 
              onClick={googleLogin}
              className='w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold btn-liquid-gold border-none cursor-pointer'
            >
              <FcGoogle size={18} />
              <span>Continue with Google</span>
            </button>

            <p className='text-[10.5px] text-center text-[#789477]'>
              Protected by multi-agent security & encrypted cloud storage.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

export default Home
