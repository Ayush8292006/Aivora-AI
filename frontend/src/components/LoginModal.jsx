// src/components/LoginModal.jsx
import React, { useState } from 'react'
import { X, Sparkles, Shield, ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react'
import { FcGoogle } from "react-icons/fc"
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../utils/firebase.js'
import api from '../../utils/axios.js'
import { useDispatch, useSelector } from 'react-redux'
import { setUserdata } from '../redux/userSlice.js'
import { setWallet } from '../redux/creditSlice.js'
import { getWalletApi, convertGuestApi } from '../features/creditApi.js'

export default function LoginModal({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const dispatch = useDispatch()
  const { guestSession } = useSelector(state => state.credit)

  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  if (!isOpen) return null

  const handlePostAuth = async (userData) => {
    try {
      dispatch(setUserdata(userData))

      // Link any prior guest conversation to the newly signed in user
      if (guestSession?.sessionId) {
        await convertGuestApi(guestSession.sessionId)
        await api.post('/api/chat/link-guest', { guestUserId: guestSession.sessionId }).catch(() => {})
      }

      // Fetch personal wallet & 100 signup bonus credits
      const walletRes = await getWalletApi()
      if (walletRes?.wallet) {
        dispatch(setWallet(walletRes.wallet))
      }

      if (onSuccess) onSuccess(userData)
      if (onClose) onClose()
    } catch (err) {
      console.error('Post auth error:', err)
      if (onSuccess) onSuccess(userData)
      if (onClose) onClose()
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const res = await signInWithPopup(auth, googleProvider)
      const token = await res.user.getIdToken()
      const { data } = await api.post("/api/auth/login", { token })
      await handlePostAuth(data)
    } catch (err) {
      console.error('Google login error:', err)
      setErrorMsg(err.response?.data?.message || err.message || "Failed to sign in with Google.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error("Please enter your name.")
        if (!email.trim() || !password) throw new Error("Please enter your email and password.")
        if (password.length < 6) throw new Error("Password must be at least 6 characters.")

        const { data } = await api.post('/api/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password
        })
        await handlePostAuth(data)
      } else {
        if (!email.trim() || !password) throw new Error("Please enter your email and password.")

        const { data } = await api.post('/api/auth/login-password', {
          email: email.trim(),
          password
        })
        await handlePostAuth(data)
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  const continueAsGuest = () => {
    const guestId = guestSession?.sessionId || `guest_${Date.now()}`
    dispatch(setUserdata({
      _id: guestId,
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
        className="w-full max-w-[420px] bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-6 sm:p-7 flex flex-col gap-4 relative overflow-hidden shadow-2xl text-[#1E1B18]"
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
              <span className="bg-[#1E2B1F] text-[#E8DDC8] font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#696256] font-medium">One AI Workspace. Endless Possibilities.</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#EAE2D2] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all border-none cursor-pointer ${
              mode === 'login' 
                ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                : 'bg-transparent text-[#696256] hover:text-[#1E1B18]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all border-none cursor-pointer ${
              mode === 'register' 
                ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                : 'bg-transparent text-[#696256] hover:text-[#1E1B18]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Quick Button */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FAF8F3] hover:bg-[#F2ECE0] text-[#1E1B18] border border-[#DDD3C1] cursor-pointer transition-all shadow-2xs"
        >
          <FcGoogle size={18} />
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] text-[#8E8779] uppercase font-bold tracking-wider">
          <div className="h-px bg-[#DDD3C1] flex-1" />
          <span>or with email</span>
          <div className="h-px bg-[#DDD3C1] flex-1" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-2.5 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-[#696256] block text-[11px]">Full Name</label>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-3 text-[#8E8779]" />
                <input
                  type="text"
                  required
                  placeholder="Ayush Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDD3C1] bg-white text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E2B1F]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-[#696256] block text-[11px]">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3 text-[#8E8779]" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDD3C1] bg-white text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E2B1F]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#696256] block text-[11px]">Password</label>
            <div className="relative flex items-center">
              <Lock size={14} className="absolute left-3 text-[#8E8779]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDD3C1] bg-white text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E2B1F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white flex items-center justify-center gap-2 border-none cursor-pointer transition-all shadow-xs mt-1"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              <span>{mode === 'register' ? 'Create Account & Get 100 Credits' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Continue as Guest */}
        <div className="pt-1 border-t border-[#DDD3C1]">
          <button 
            type="button"
            onClick={continueAsGuest}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E2B1F] border border-[#C8BEAC] cursor-pointer transition-all"
          >
            <span>Continue as Guest (4 Free Questions)</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#696256]">
          <Shield size={12} className="text-[#4A653C]" />
          <span>Encrypted storage & auto 100 signup bonus credits</span>
        </div>
      </div>
    </div>
  )
}
