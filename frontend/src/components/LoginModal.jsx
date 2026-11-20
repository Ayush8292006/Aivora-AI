// src/components/LoginModal.jsx
import React, { useState } from 'react'
import { X, Sparkles, Shield, ArrowRight, Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react'
import api from '../../utils/axios.js'
import { useDispatch, useSelector } from 'react-redux'
import { setUserdata } from '../redux/userSlice.js'
import { setWallet } from '../redux/creditSlice.js'
import { setConversations, setSelectedConversation } from '../redux/conversationSlice.js'
import { getWalletApi, convertGuestApi } from '../features/creditApi.js'
import { getConversation } from '../features/getConversations.js'

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
      // Store token & user data locally for persistent authorization headers
      if (userData?.token) {
        localStorage.setItem("aivora_token", userData.token)
      }
      localStorage.setItem("aivora_user", JSON.stringify(userData))
      dispatch(setUserdata(userData))

      // Link any prior guest conversation to the newly signed in user
      if (guestSession?.sessionId) {
        try {
          await convertGuestApi(guestSession.sessionId)
          await api.post('/api/chat/link-guest', { guestUserId: guestSession.sessionId })
        } catch (linkErr) {
          console.warn("Guest link warning:", linkErr.message)
        }
      }

      // Fetch personal wallet & 100 signup bonus credits strictly for this user
      const walletRes = await getWalletApi()
      if (walletRes?.wallet) {
        dispatch(setWallet(walletRes.wallet))
      }

      // Fetch strictly this user's conversations
      const convList = await getConversation()
      if (Array.isArray(convList)) {
        dispatch(setConversations(convList))
        if (convList.length > 0) {
          dispatch(setSelectedConversation(convList[0]))
        }
      }

      if (onSuccess) onSuccess(userData)
      if (onClose) onClose()
    } catch (err) {
      console.error('Post auth error:', err)
      if (onSuccess) onSuccess(userData)
      if (onClose) onClose()
    }
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error("Please enter your full name.")
        if (!email.trim() || !password) throw new Error("Please enter your email and password.")
        if (password.length < 6) throw new Error("Password must be at least 6 characters.")

        const { data } = await api.post('/api/auth/register', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        })

        await handlePostAuth(data)
      } else {
        if (!email.trim() || !password) throw new Error("Please enter your email and password.")

        const { data } = await api.post('/api/auth/login', {
          email: email.trim().toLowerCase(),
          password
        })

        await handlePostAuth(data)
      }
    } catch (err) {
      console.error("Auth error:", err)
      setErrorMsg(err.response?.data?.message || err.message || "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  const continueAsGuest = () => {
    const guestId = guestSession?.sessionId || `guest_${Date.now()}`
    const guestObj = {
      _id: guestId,
      userId: guestId,
      name: 'Guest User',
      email: 'guest@aivora.ai',
      isGuest: true
    }
    dispatch(setUserdata(guestObj))
    if (onSuccess) onSuccess(guestObj)
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

        {/* Mode Selector Tabs (Sign In vs Create Account) */}
        <div className="grid grid-cols-2 p-1 bg-[#EAE2D2] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all border-none cursor-pointer text-center ${
              mode === 'login' 
                ? 'bg-[#1E2B1F] text-white shadow-2xs font-bold' 
                : 'bg-transparent text-[#696256] hover:text-[#1E1B18]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all border-none cursor-pointer text-center ${
              mode === 'register' 
                ? 'bg-[#1E2B1F] text-white shadow-2xs font-bold' 
                : 'bg-transparent text-[#696256] hover:text-[#1E1B18]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Value Prop Banner for New Accounts */}
        {mode === 'register' && (
          <div className="p-3 rounded-2xl bg-[#F0EBE1] border border-[#DDD3C1] text-xs text-[#1E2B1F] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#1E2B1F]">
              <Sparkles size={13} className="text-[#C9A875]" />
              <span>Instant 100 Free Bonus Credits</span>
            </div>
            <p className="text-[11px] text-[#696256]">
              Private encrypted conversation history, personalized wallet, and full access to all 8 AI modes.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-[#696256] block text-[11px]">Full Name</label>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-3 text-[#8E8779]" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDD3C1] bg-white text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E2B1F]"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDD3C1] bg-white text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E2B1F]"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDD3C1] bg-white text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E2B1F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white flex items-center justify-center gap-2 border-none cursor-pointer transition-all shadow-xs mt-2"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              <span>{mode === 'register' ? 'Create Account & Get 100 Credits' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Continue as Guest */}
        <div className="pt-2 border-t border-[#DDD3C1]">
          <button 
            type="button"
            onClick={continueAsGuest}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E1B18] border border-[#C8BEAC] cursor-pointer transition-all"
          >
            <span>Continue as Guest (4 Free Questions)</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Security & Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#696256]">
          <Shield size={12} className="text-[#4A653C]" />
          <span>Strict per-user data isolation & encrypted storage</span>
        </div>
      </div>
    </div>
  )
}
