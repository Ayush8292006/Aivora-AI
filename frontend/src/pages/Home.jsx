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
import { User as UserIcon } from 'lucide-react'

function Home() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className='relative h-screen w-screen bg-[#D8CDBA] bg-[radial-gradient(circle_at_15%_20%,#E6D9C4_0%,transparent_45%),radial-gradient(circle_at_85%_15%,#E2D4BF_0%,transparent_50%),radial-gradient(circle_at_50%_85%,#CFC1AA_0%,transparent_60%),linear-gradient(135deg,#D8CDBA_0%,#CFC1AA_50%,#D5C8B4_100%)] text-[#1E1B18] overflow-hidden flex flex-col font-["Plus_Jakarta_Sans",sans-serif]'>
      
      {/* Main 3-Column Desktop Layout (Full Native View on Mobile, 3-Column on Desktop) */}
      <div className='relative z-10 flex-1 flex p-0 sm:p-2 lg:p-4 gap-0 lg:gap-4 overflow-hidden max-w-[1850px] w-full mx-auto'>
        <SideBar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <ChatArea 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
        />
        <Artifact />
      </div>

      {/* Editorial Login Modal */}
      {!userData && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4'>
          <div className='w-full max-w-[380px] bg-[#FAF8F3] rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden shadow-2xl border border-[#DDD3C1]'>
            
            {/* Header: Brand Mark + Name + Pro */}
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-[#24201C] text-[#E8DDC8] flex items-center justify-center font-bold text-sm shadow-xs'>
                A
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <h2 className='text-base font-bold text-[#1E1B18] tracking-tight'>Aivora AI</h2>
                  <span className='bg-[#24201C] text-[#E8DDC8] font-bold text-[10px] px-2 py-0.5 rounded-full'>
                    PRO
                  </span>
                </div>
                <p className='text-xs text-[#696256] font-medium'>Multi-Agent Workspace</p>
              </div>
            </div>

            {/* Description */}
            <div className='flex flex-col gap-1 text-left'>
              <p className='text-sm font-semibold text-[#1E1B18]'>Sign in to your workspace</p>
              <p className='text-xs text-[#696256] leading-relaxed'>
                Access your conversations, documents, slide decks, and code synthesis.
              </p>
            </div>

            {/* Sign in with Google Button */}
            <button 
              onClick={googleLogin}
              className='w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#241F1A] hover:bg-[#181410] text-white border-none cursor-pointer transition-all shadow-xs'
            >
              <FcGoogle size={18} />
              <span>Continue with Google</span>
            </button>

            <p className='text-[10.5px] text-center text-[#696256]'>
              Encrypted cloud storage & secure session management.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

export default Home
