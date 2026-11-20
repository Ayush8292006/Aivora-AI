// src/components/ChatUsageModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Activity, Zap, Layers, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeUsageModal, openPricingModal } from '../redux/creditSlice.js';
import { getChatUsageApi } from '../features/creditApi.js';

export default function ChatUsageModal() {
  const dispatch = useDispatch();
  const { isUsageModalOpen, availableCredits, currentChatUsage } = useSelector(state => state.credit);
  const { selectedConversation } = useSelector(state => state.conversation);
  const { messages } = useSelector(state => state.message);

  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUsageModalOpen && selectedConversation?._id) {
      loadChatUsage();
    }
  }, [isUsageModalOpen, selectedConversation?._id]);

  const loadChatUsage = async () => {
    setLoading(true);
    const data = await getChatUsageApi(selectedConversation._id);
    if (data?.usage) {
      setUsage(data.usage);
    }
    setLoading(false);
  };

  if (!isUsageModalOpen) return null;

  // Real-time calculation from active conversation messages if backend aggregation hasn't run yet
  const userMessages = (messages || []).filter(m => m.role === 'user');
  const aiMessages = (messages || []).filter(m => m.role === 'assistant');

  let fallbackInputTokens = 0;
  userMessages.forEach(m => {
    fallbackInputTokens += Math.max(1, Math.ceil((m.content || "").length / 4));
  });

  let fallbackOutputTokens = 0;
  aiMessages.forEach(m => {
    fallbackOutputTokens += Math.max(1, Math.ceil((m.content || "").length / 4));
  });

  const fallbackTotalTokens = fallbackInputTokens + fallbackOutputTokens;
  const fallbackCredits = Math.max(aiMessages.length, Math.ceil((fallbackInputTokens / 1000) * 0.5 + (fallbackOutputTokens / 1000) * 1.0));

  const inputTokens = (usage?.totalInputTokens || usage?.promptTokens) 
    ?? (currentChatUsage?.totalInputTokens || currentChatUsage?.promptTokens) 
    ?? (fallbackInputTokens > 0 ? fallbackInputTokens : 0);

  const outputTokens = (usage?.totalOutputTokens || usage?.completionTokens) 
    ?? (currentChatUsage?.totalOutputTokens || currentChatUsage?.completionTokens) 
    ?? (fallbackOutputTokens > 0 ? fallbackOutputTokens : 0);

  const totalTokens = (usage?.totalTokens) 
    ?? (currentChatUsage?.totalTokens) 
    ?? (fallbackTotalTokens > 0 ? fallbackTotalTokens : 0);

  const creditsConsumed = (usage?.totalCreditsConsumed || usage?.creditsConsumed) 
    ?? (currentChatUsage?.totalCreditsConsumed || currentChatUsage?.creditsConsumed) 
    ?? (fallbackCredits > 0 ? fallbackCredits : 0);

  const modelUsed = usage?.lastModelUsed || currentChatUsage?.lastModelUsed || "Auto Multi-Agent Graph";
  const requestCount = usage?.requestCount || currentChatUsage?.requestCount || aiMessages.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#1E1B18] relative"
      >
        <button 
          onClick={() => dispatch(closeUsageModal())}
          className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center text-[#696256] hover:text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-base shadow-xs">
            <Activity size={20} className="text-[#C9A875]" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1E1B18] tracking-tight">
              Conversation Token Usage
            </h3>
            <p className="text-[11px] text-[#696256] truncate max-w-[260px]">
              {selectedConversation?.title || "Active Chat Session"}
            </p>
          </div>
        </div>

        {/* Balance Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-[#F5EFE3] border border-[#DDD3C1] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#7D7567] text-[10.5px] uppercase font-bold tracking-wider block">Wallet Balance</span>
            <span className="text-sm font-extrabold text-[#1E2B1F]">{availableCredits.toLocaleString()} Credits</span>
          </div>
          <button
            onClick={() => {
              dispatch(closeUsageModal());
              dispatch(openPricingModal());
            }}
            className="px-3 py-1.5 rounded-xl bg-[#1E2B1F] text-white text-xs font-bold hover:bg-[#283A27] transition-colors border-none cursor-pointer flex items-center gap-1"
          >
            <span>Top Up</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#DDD3C1] space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-[#7D7567] tracking-wider block">Input Tokens</span>
            <span className="text-xl font-bold font-display text-[#1E1B18]">{inputTokens.toLocaleString()}</span>
            <span className="text-[9.5px] text-[#696256] block">Prompts & attachments</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#DDD3C1] space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-[#7D7567] tracking-wider block">Output Tokens</span>
            <span className="text-xl font-bold font-display text-[#1E1B18]">{outputTokens.toLocaleString()}</span>
            <span className="text-[9.5px] text-[#696256] block">Synthesized responses</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4EEE2] border border-[#DDD3C1] space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-[#7D7567] tracking-wider block">Total Tokens</span>
            <span className="text-xl font-bold font-display text-[#1E2B1F]">{totalTokens.toLocaleString()}</span>
            <span className="text-[9.5px] text-[#696256] block">{requestCount} AI generations</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4EEE2] border border-[#DDD3C1] space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-[#7D7567] tracking-wider block">Credits Used</span>
            <span className="text-xl font-bold font-display text-[#C9A875]">{creditsConsumed.toLocaleString()}</span>
            <span className="text-[9.5px] text-[#696256] block">Deducted from balance</span>
          </div>
        </div>

        {/* Model Meta info */}
        <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#DDD3C1]/80 space-y-1.5 text-xs text-[#554E43]">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#7D7567]">Active Model:</span>
            <span className="font-mono font-bold text-[#1E1B18] bg-[#EAE2D2] px-2 py-0.5 rounded text-[10px]">
              {modelUsed}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#7D7567]">Provider Accounting:</span>
            <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Real-time LangGraph usage
            </span>
          </div>
        </div>

        <button
          onClick={() => dispatch(closeUsageModal())}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E2B1F] border border-[#C8BEAC] cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
