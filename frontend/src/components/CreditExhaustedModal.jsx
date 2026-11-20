// src/components/CreditExhaustedModal.jsx
import React from 'react';
import { X, AlertCircle, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeExhaustedModal, openPricingModal } from '../redux/creditSlice.js';

export default function CreditExhaustedModal() {
  const dispatch = useDispatch();
  const { isExhaustedModalOpen, availableCredits } = useSelector(state => state.credit);

  if (!isExhaustedModalOpen) return null;

  const handleOpenPricing = () => {
    dispatch(closeExhaustedModal());
    dispatch(openPricingModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#1E1B18] relative"
      >
        <button 
          onClick={() => dispatch(closeExhaustedModal())}
          className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center text-[#696256] hover:text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100] flex items-center justify-center shadow-xs">
          <AlertCircle size={26} />
        </div>

        <div className="space-y-1.5 text-left">
          <h3 className="font-display text-lg font-bold tracking-tight text-[#1E1B18]">
            {availableCredits <= 0 ? "Credits Exhausted" : "You're Running Low on Credits"}
          </h3>
          <p className="text-xs text-[#554E43] leading-relaxed">
            {availableCredits <= 0 
              ? "Your AI credit balance has reached zero. Purchase a credit pack to continue chatting and synthesizing artifacts."
              : `Your balance is currently ${availableCredits} credits, which is insufficient for this AI model request. Purchase credits to continue.`}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F4EEE2] border border-[#DDD3C1] flex items-center justify-between text-xs">
          <span className="text-[#696256] font-medium">Available Balance:</span>
          <span className="font-bold font-mono text-[#1E2B1F] bg-[#EAE2D2] px-2.5 py-1 rounded-lg">
            {availableCredits} Credits
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleOpenPricing}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white flex items-center justify-center gap-2 border-none cursor-pointer transition-all shadow-xs"
          >
            <CreditCard size={15} />
            <span>Buy Credits</span>
            <ArrowRight size={14} />
          </button>
          
          <button
            onClick={() => dispatch(closeExhaustedModal())}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-transparent hover:bg-[#EAE2D2] text-[#696256] border-none cursor-pointer transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
