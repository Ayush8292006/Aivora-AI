// src/components/GuestLimitModal.jsx
import React from 'react';
import { X, Sparkles, UserPlus, LogIn, Shield, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeGuestLimitModal } from '../redux/creditSlice.js';

export default function GuestLimitModal({ onOpenLogin, onOpenRegister }) {
  const dispatch = useDispatch();
  const { isGuestLimitModalOpen } = useSelector(state => state.credit);

  if (!isGuestLimitModalOpen) return null;

  const handleRegister = () => {
    dispatch(closeGuestLimitModal());
    if (onOpenRegister) onOpenRegister();
    else if (onOpenLogin) onOpenLogin('register');
  };

  const handleLogin = () => {
    dispatch(closeGuestLimitModal());
    if (onOpenLogin) onOpenLogin('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#1E1B18] relative"
      >
        <button 
          onClick={() => dispatch(closeGuestLimitModal())}
          className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center text-[#696256] hover:text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-lg shadow-xs">
            <Sparkles size={20} className="text-[#C9A875]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#1E1B18] tracking-tight">
              Enjoying Aivora AI?
            </h3>
            <span className="text-[11px] font-semibold text-[#4A653C] bg-[#E8DDC8] px-2 py-0.5 rounded-full uppercase tracking-wider">
              4/4 Free Prompts Used
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#554E43] leading-relaxed text-left">
          You've used all 4 free guest questions. Create an account to continue exploring AI features and get access to your personal credit balance.
        </p>

        <div className="space-y-2 p-3.5 rounded-2xl bg-[#F4EEE2] border border-[#DDD3C1] text-xs">
          <div className="flex items-center gap-2 text-[#1E1B18] font-medium">
            <CheckCircle2 size={14} className="text-[#4A653C]" />
            <span>Instant 100 free signup bonus credits</span>
          </div>
          <div className="flex items-center gap-2 text-[#1E1B18] font-medium">
            <CheckCircle2 size={14} className="text-[#4A653C]" />
            <span>Save and sync your conversation history</span>
          </div>
          <div className="flex items-center gap-2 text-[#1E1B18] font-medium">
            <CheckCircle2 size={14} className="text-[#4A653C]" />
            <span>Export code sandboxes, PDFs and PPT slides</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={handleRegister}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white flex items-center justify-center gap-2 border-none cursor-pointer transition-all shadow-xs"
          >
            <UserPlus size={15} />
            <span>Create Free Account</span>
          </button>
          
          <button
            onClick={handleLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E2B1F] border border-[#C8BEAC] cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={14} />
            <span>Login to Existing Account</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#696256]">
          <Shield size={12} className="text-[#4A653C]" />
          <span>No credit card required for registration</span>
        </div>
      </div>
    </div>
  );
}
