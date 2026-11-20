// src/components/LoginModal.jsx
import React from 'react'
import { X, Sparkles, Shield, ArrowRight } from 'lucide-react'
import { FcGoogle } from "react-icons/fc"
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../utils/firebase.js'
import api from '../../utils/axios.js'
import { useDispatch } from 'react-redux'
import { setUserdata } from '../redux/userSlice.js'

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch()

  if (!isOpen) return null

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token })
      dispatch(setUserdata(data))
      if (onSuccess) onSuccess(data)
      if (onClose) onClose()
    } catch (error) {
      console.error('Login error:', error)
      alert("Failed to complete login. Please try again.")
    }
  }

  const googleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider)
      const token = await res.user.getIdToken()
      await handleLogin(token)
    } catch (err) {
      console.error('Google login popup error:', err)
    }
  }

  const continueAsGuest = () => {
    dispatch(setUserdata({
      _id: 'guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@aivora.ai',
      isGuest: true
    }))
    if (onSuccess) onSuccess({ isGuest: true })
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden shadow-2xl text-[#1E1B18]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-base shadow-xs">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1E1B18] tracking-tight">Aivora AI</h2>
              <span className="bg-[#1E2B1F] text-[#E8DDC8] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#696256] font-medium">One AI Workspace. Endless Possibilities.</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1 text-left">
          <p className="text-sm font-semibold text-[#1E1B18]">Sign in to your workspace</p>
          <p className="text-xs text-[#696256] leading-relaxed">
            Access your synchronized conversations, interactive sandboxes, presentations, and exportable PDF publications.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button 
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold bg-[#241F1A] hover:bg-[#181410] text-white border-none cursor-pointer transition-all shadow-xs"
          >
            <FcGoogle size={18} />
            <span>Continue with Google</span>
          </button>

          <button 
            onClick={continueAsGuest}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E2B1F] border border-[#C8BEAC] cursor-pointer transition-all"
          >
            <span>Explore as Guest</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#696256]">
          <Shield size={12} className="text-[#4A653C]" />
          <span>Encrypted cloud storage & secure session management</span>
        </div>
      </div>
    </div>
  )
}
