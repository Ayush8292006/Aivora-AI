// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react'
import { 
  X, User, Shield, Sparkles, Sliders, Moon, Sun, 
  Trash2, LogOut, Check, Laptop, Key, Database, Info,
  CreditCard, Activity, ArrowUpRight, Award, History,
  ChevronLeft, ChevronRight, Loader2, Layers, Cpu, Search
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import logOut from '../features/logOut'
import { setUserdata } from '../redux/userSlice'
import { openPricingModal, setWallet } from '../redux/creditSlice.js'
import { 
  getWalletApi, 
  getUsageOverviewApi, 
  getUsageByModelApi, 
  getConversationUsageListApi, 
  getTransactionsApi,
  getAdminAnalyticsApi,
  getAdminUsersApi,
  adjustUserCreditsApi
} from '../features/creditApi.js'

export default function SettingsModal({ isOpen, onClose, onOpenLogin }) {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const { conversations } = useSelector(state => state.conversation)
  const { availableCredits, totalPurchasedCredits, totalBonusCredits, totalConsumedCredits } = useSelector(state => state.credit)
  
  const [activeTab, setActiveTab] = useState('credits') // Default to credits tab for instant accessibility
  const [defaultAgent, setDefaultAgent] = useState('auto')
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)

  // Credit Tab States
  const [loadingCredits, setLoadingCredits] = useState(false)
  const [usageStats, setUsageStats] = useState(null)
  const [modelStats, setModelStats] = useState([])
  const [conversationStats, setConversationStats] = useState([])
  const [transactions, setTransactions] = useState([])
  const [txPage, setTxPage] = useState(1)
  const [txTotalPages, setTxTotalPages] = useState(1)

  // Admin Tab States
  const [adminAnalytics, setAdminAnalytics] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [adminTargetId, setAdminTargetId] = useState('')
  const [adminAmount, setAdminAmount] = useState('')
  const [adminReason, setAdminReason] = useState('')
  const [adminMsg, setAdminMsg] = useState(null)
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'credits') {
        loadCreditData(txPage)
      } else if (activeTab === 'admin') {
        loadAdminData()
      }
    }
  }, [isOpen, activeTab, txPage])

  const loadCreditData = async (page = 1) => {
    setLoadingCredits(true)
    try {
      const [walletData, overviewData, modelsData, convsData, txData] = await Promise.all([
        getWalletApi(),
        getUsageOverviewApi(),
        getUsageByModelApi(),
        getConversationUsageListApi(),
        getTransactionsApi(page, 5)
      ])

      if (walletData?.wallet) {
        dispatch(setWallet(walletData.wallet))
      }
      if (overviewData?.usage) {
        setUsageStats(overviewData.usage)
      }
      if (modelsData) {
        setModelStats(modelsData)
      }
      if (convsData) {
        setConversationStats(convsData)
      }
      if (txData) {
        setTransactions(txData.transactions || [])
        setTxTotalPages(txData.pagination?.totalPages || 1)
      }
    } catch (err) {
      console.error("Error loading credit data:", err)
    } finally {
      setLoadingCredits(false)
    }
  }

  const loadAdminData = async () => {
    setAdminLoading(true)
    try {
      const [analyticsData, usersData] = await Promise.all([
        getAdminAnalyticsApi(),
        getAdminUsersApi(1, 10)
      ])
      if (analyticsData) setAdminAnalytics(analyticsData)
      if (usersData?.users) setAdminUsers(usersData.users)
    } catch (err) {
      console.error("Error loading admin data:", err)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleAdminAdjustment = async (e) => {
    e.preventDefault()
    if (!adminTargetId || !adminAmount || !adminReason) return
    try {
      const res = await adjustUserCreditsApi(adminTargetId, parseFloat(adminAmount), adminReason)
      if (res?.success) {
        setAdminMsg({ type: 'success', text: res.message })
        setAdminAmount('')
        setAdminReason('')
        loadAdminData()
      }
    } catch (err) {
      setAdminMsg({ type: 'error', text: err.message })
    }
  }

  if (!isOpen) return null

  const handleSavePreferences = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2000)
  }

  const handleSignOut = async () => {
    try {
      await logOut()
      dispatch(setUserdata(null))
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  const isAdmin = userData?.role === 'admin'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-[#1E1B18]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD3C1] bg-[#F5EFE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#1E1B18]">Aivora AI Settings</h2>
              <p className="text-[11px] text-[#696256]">Credits, model usage, workspace & profile</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#696256] hover:text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body with Sidebar Tabs */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tab Navigation */}
          <div className="w-48 bg-[#F5EFE3] border-r border-[#DDD3C1] p-3 flex flex-col gap-1 text-xs shrink-0">
            <button
              onClick={() => setActiveTab('credits')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-semibold transition-all border-none cursor-pointer ${
                activeTab === 'credits' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <CreditCard size={14} className={activeTab === 'credits' ? 'text-[#C9A875]' : ''} />
              <span>Credits & Usage</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-semibold transition-all border-none cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <User size={14} />
              <span>User Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-semibold transition-all border-none cursor-pointer ${
                activeTab === 'preferences' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <Sliders size={14} />
              <span>Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-semibold transition-all border-none cursor-pointer ${
                activeTab === 'workspace' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <Database size={14} />
              <span>Workspace</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-semibold transition-all border-none cursor-pointer ${
                  activeTab === 'admin' 
                    ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                    : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
                }`}
              >
                <Shield size={14} className="text-[#4ADE80]" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-semibold transition-all border-none cursor-pointer ${
                activeTab === 'about' 
                  ? 'bg-[#1E2B1F] text-white shadow-2xs' 
                  : 'bg-transparent text-[#696256] hover:bg-[#EAE2D2] hover:text-[#1E1B18]'
              }`}
            >
              <Info size={14} />
              <span>About</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            
            {/* ========================================================
                CREDITS & USAGE TAB
            ======================================================== */}
            {activeTab === 'credits' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* A. CURRENT CREDIT BALANCE CARD */}
                <div className="bg-[#1E2B1F] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div>
                      <span className="text-[11px] font-mono text-[#CBD8CA] uppercase tracking-wider block">
                        Personal Credit Wallet
                      </span>
                      <h3 className="text-3xl font-display font-extrabold text-white mt-0.5">
                        {availableCredits.toLocaleString()}{' '}
                        <span className="text-sm font-sans font-bold text-[#C9A875]">Credits Available</span>
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        dispatch(openPricingModal());
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 border-none cursor-pointer"
                    >
                      <Sparkles size={14} className="text-[#A68546]" />
                      <span>Buy Credits</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-5 mt-4 border-t border-white/10 relative z-10 text-xs">
                    <div>
                      <p className="text-[10px] text-[#CBD8CA] uppercase">Purchased</p>
                      <p className="font-bold text-white text-sm">{totalPurchasedCredits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#CBD8CA] uppercase">Free Bonus</p>
                      <p className="font-bold text-[#4ADE80] text-sm">{totalBonusCredits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#CBD8CA] uppercase">Total Consumed</p>
                      <p className="font-bold text-[#F3C474] text-sm">{totalConsumedCredits.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* B. USAGE OVERVIEW */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                    Lifetime Token Accounting
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl space-y-0.5">
                      <span className="text-[10px] text-[#696256] uppercase">Total Requests</span>
                      <p className="text-base font-bold text-[#1E1B18] font-display">
                        {(usageStats?.totalRequests || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl space-y-0.5">
                      <span className="text-[10px] text-[#696256] uppercase">Input Tokens</span>
                      <p className="text-base font-bold text-[#1E1B18] font-display">
                        {(usageStats?.totalPromptTokens || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl space-y-0.5">
                      <span className="text-[10px] text-[#696256] uppercase">Output Tokens</span>
                      <p className="text-base font-bold text-[#1E1B18] font-display">
                        {(usageStats?.totalCompletionTokens || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl space-y-0.5">
                      <span className="text-[10px] text-[#696256] uppercase">Total Tokens</span>
                      <p className="text-base font-bold text-[#1E2B1F] font-display">
                        {(usageStats?.totalTokens || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* C. USAGE BY MODEL */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                    Usage by AI Model
                  </h4>
                  {modelStats.length === 0 ? (
                    <div className="p-4 bg-white border border-[#DDD3C1] rounded-xl text-center text-xs text-[#696256]">
                      No AI model requests recorded yet.
                    </div>
                  ) : (
                    <div className="bg-white border border-[#DDD3C1] rounded-xl overflow-hidden divide-y divide-[#DDD3C1]/60 text-xs">
                      {modelStats.map((m, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu size={14} className="text-[#4A653C]" />
                            <span className="font-mono font-bold text-[#1E1B18]">{m.model}</span>
                            <span className="text-[10.5px] text-[#696256]">({m.requests} requests)</span>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <span className="font-mono text-[11px] text-[#696256]">{m.totalTokens.toLocaleString()} tokens</span>
                            <span className="font-bold text-[#1E2B1F] bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#DDD3C1]">
                              {m.creditsConsumed.toLocaleString()} cr
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* D. CONVERSATION USAGE */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                    Recent Conversations Usage
                  </h4>
                  {conversationStats.length === 0 ? (
                    <div className="p-4 bg-white border border-[#DDD3C1] rounded-xl text-center text-xs text-[#696256]">
                      No conversation usage recorded yet.
                    </div>
                  ) : (
                    <div className="bg-white border border-[#DDD3C1] rounded-xl overflow-hidden divide-y divide-[#DDD3C1]/60 text-xs">
                      {conversationStats.slice(0, 5).map((conv, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-[#1E1B18] truncate">
                              Chat ID: {conv.conversationId.slice(-8)}
                            </p>
                            <span className="text-[10px] text-[#696256]">
                              Model: {conv.lastModelUsed || "Auto"} • {conv.requestCount} turns
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-[#1E1B18]">{conv.totalCreditsConsumed} credits</p>
                            <span className="text-[10px] text-[#696256]">{conv.totalTokens.toLocaleString()} tokens</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* E. TRANSACTION HISTORY TABLE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                      Credit Transaction History
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#696256]">
                      <button
                        onClick={() => setTxPage(p => Math.max(1, p - 1))}
                        disabled={txPage <= 1}
                        className="p-1 rounded hover:bg-[#EAE2D2] disabled:opacity-40 border-none cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="font-mono text-[11px]">{txPage} of {txTotalPages}</span>
                      <button
                        onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                        disabled={txPage >= txTotalPages}
                        className="p-1 rounded hover:bg-[#EAE2D2] disabled:opacity-40 border-none cursor-pointer"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="p-4 bg-white border border-[#DDD3C1] rounded-xl text-center text-xs text-[#696256]">
                      No transactions recorded yet.
                    </div>
                  ) : (
                    <div className="bg-white border border-[#DDD3C1] rounded-xl overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#DDD3C1] bg-[#F5EFE3]/80 text-[10px] font-bold text-[#696256] uppercase tracking-wider">
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Description</th>
                            <th className="p-2.5 text-right">Amount</th>
                            <th className="p-2.5 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DDD3C1]/50 font-mono text-[11px]">
                          {transactions.map((tx) => {
                            const isPositive = tx.amount > 0;
                            return (
                              <tr key={tx._id} className="hover:bg-[#FAF8F3]">
                                <td className="p-2.5 text-[#696256] whitespace-nowrap">
                                  {new Date(tx.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-2.5 whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    tx.type === 'purchase' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                                    tx.type === 'signup_bonus' ? 'bg-[#E3F2FD] text-[#1565C0]' :
                                    tx.type === 'admin_adjustment' ? 'bg-[#FFF3E0] text-[#E65100]' :
                                    'bg-[#F5EFE3] text-[#554E43]'
                                  }`}>
                                    {tx.type.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="p-2.5 font-sans text-xs text-[#1E1B18] max-w-[200px] truncate">
                                  {tx.description}
                                </td>
                                <td className={`p-2.5 text-right font-bold ${isPositive ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                                  {isPositive ? `+${tx.amount}` : tx.amount}
                                </td>
                                <td className="p-2.5 text-right text-[#1E1B18]">
                                  {tx.balanceAfter}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================
                ADMIN CONSOLE TAB
            ======================================================== */}
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDD3C1]">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#1E1B18]">Platform Credit Management</h3>
                    <p className="text-[11px] text-[#696256]">Monitor global usage, revenue & execute manual audit adjustments</p>
                  </div>
                  <span className="bg-[#1E2B1F] text-[#4ADE80] text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                    ADMIN VERIFIED
                  </span>
                </div>

                {/* Admin Analytics Highlights */}
                {adminAnalytics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                      <span className="text-[10px] text-[#696256] uppercase">Total Users</span>
                      <p className="text-lg font-bold font-display text-[#1E1B18] mt-0.5">{adminAnalytics.totalUsers}</p>
                    </div>
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                      <span className="text-[10px] text-[#696256] uppercase">Revenue (INR)</span>
                      <p className="text-lg font-bold font-display text-[#2E7D32] mt-0.5">₹{adminAnalytics.totalRevenueINR.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                      <span className="text-[10px] text-[#696256] uppercase">Credits Consumed</span>
                      <p className="text-lg font-bold font-display text-[#1E2B1F] mt-0.5">{adminAnalytics.totalConsumedCredits.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                      <span className="text-[10px] text-[#696256] uppercase">Total Requests</span>
                      <p className="text-lg font-bold font-display text-[#A68546] mt-0.5">{adminAnalytics.totalRequests.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Manual Adjustment Form */}
                <form onSubmit={handleAdminAdjustment} className="p-4 bg-white border border-[#DDD3C1] rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[#1E1B18]">Execute Credit Adjustment</h4>
                  
                  {adminMsg && (
                    <div className={`p-2.5 rounded-lg text-xs font-semibold ${adminMsg.type === 'success' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'}`}>
                      {adminMsg.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#696256] block mb-1">Target User ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 68ad1e..."
                        value={adminTargetId}
                        onChange={(e) => setAdminTargetId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#DDD3C1] text-xs font-mono bg-[#FAF8F3]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#696256] block mb-1">Credit Amount (+/-)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500 or -200"
                        value={adminAmount}
                        onChange={(e) => setAdminAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#DDD3C1] text-xs font-mono bg-[#FAF8F3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#696256] block mb-1">Audit Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Promotional grant or manual compensation"
                      value={adminReason}
                      onChange={(e) => setAdminReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD3C1] text-xs bg-[#FAF8F3]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1E2B1F] text-white font-bold hover:bg-[#283A27] transition-all cursor-pointer border-none text-xs"
                  >
                    Confirm Adjustment
                  </button>
                </form>

                {/* User Balances Preview */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-[#1E1B18]">User Wallets Directory</h4>
                  <div className="bg-white border border-[#DDD3C1] rounded-xl overflow-hidden divide-y divide-[#DDD3C1]/60">
                    {adminUsers.map((u) => (
                      <div key={u._id} className="p-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-[#1E1B18] text-[11px]">{u.userId}</span>
                          <p className="text-[10px] text-[#696256]">Purchased: {u.totalPurchasedCredits} • Bonus: {u.totalBonusCredits}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold font-mono text-xs text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                            {u.availableCredits} cr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5 p-3.5 bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl">
                  {userData?.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-[#C5BBAA]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-lg">
                      {userData?.name?.charAt(0) || 'G'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1E1B18] truncate">
                        {userData?.name || 'Guest User'}
                      </h3>
                      <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {userData?.role === 'admin' ? 'ADMIN' : userData?.isGuest ? 'GUEST' : 'PRO MEMBER'}
                      </span>
                    </div>
                    <p className="text-xs text-[#696256] truncate">
                      {userData?.email || 'guest@aivora.ai'}
                    </p>
                  </div>
                </div>

                {userData?.isGuest ? (
                  <div className="p-4 bg-white border border-[#DDD3C1] rounded-xl space-y-3 text-xs">
                    <p className="font-bold text-[#1E1B18]">Guest Account Status</p>
                    <p className="text-[#696256] leading-relaxed">
                      You are exploring Aivora AI as a guest. Register an account to unlock your personal credit wallet and persistent cloud history.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenLogin) onOpenLogin();
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#1E2B1F] text-white font-bold hover:bg-[#283A27] transition-all border-none cursor-pointer"
                    >
                      Create Free Account & Unlock Credits
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-white border border-[#DDD3C1] rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-[#1E1B18]">Account Security</p>
                      <p className="text-[11px] text-[#696256]">Protected by Google OAuth & 256-bit encrypted Redis sessions.</p>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#B91C1C] transition-colors border border-[#DDD3C1] cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out from Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E1B18] block">Default AI Mode</label>
                  <select 
                    value={defaultAgent}
                    onChange={(e) => setDefaultAgent(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#DDD3C1] rounded-xl text-xs font-medium text-[#1E1B18] focus:outline-none"
                  >
                    <option value="auto">Auto (Intelligent Multi-Agent Router)</option>
                    <option value="chat">General Chat (Senior Consultant)</option>
                    <option value="coding">Coding (Full-Stack Architect)</option>
                    <option value="pdf">PDF Tools (Publication Engine)</option>
                    <option value="ppt">Presentation (Slide Decks)</option>
                    <option value="image">Image Generation (Cinematic Art)</option>
                    <option value="search">Search (Real-time Live Intelligence)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDD3C1] rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-[#1E1B18]">Speech Recognition & Voice Input</p>
                      <p className="text-[11px] text-[#696256]">Enable microphone dictation in composer</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={speechEnabled} 
                      onChange={(e) => setSpeechEnabled(e.target.checked)}
                      className="cursor-pointer accent-[#1E2B1F]" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDD3C1] rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-[#1E1B18]">High Contrast Editorial Mode</p>
                      <p className="text-[11px] text-[#696256]">Deepen text contrast for reading long documents</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={highContrast} 
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="cursor-pointer accent-[#1E2B1F]" 
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#1E2B1F] text-white hover:bg-[#283A27] transition-all border-none cursor-pointer"
                >
                  {savedNotice ? <Check size={14} className="text-[#4ADE80]" /> : null}
                  <span>{savedNotice ? 'Preferences Saved!' : 'Save Preferences'}</span>
                </button>
              </div>
            )}

            {/* WORKSPACE TAB */}
            {activeTab === 'workspace' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                    <p className="text-[#696256] text-[11px]">Total Conversations</p>
                    <p className="text-lg font-bold text-[#1E1B18] mt-1">{conversations?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-white border border-[#DDD3C1] rounded-xl">
                    <p className="text-[#696256] text-[11px]">Storage Status</p>
                    <p className="text-lg font-bold text-[#4A653C] mt-1">Unlimited</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#DDD3C1] rounded-xl text-xs space-y-2">
                  <p className="font-bold text-[#1E1B18]">Artifacts & Export Hub</p>
                  <p className="text-[11px] text-[#696256] leading-relaxed">
                    Aivora AI automatically parses code projects into interactive sandboxes, reports into print-ready A4 PDFs, and presentations into editable PPTX decks.
                  </p>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="p-3.5 bg-white border border-[#DDD3C1] rounded-xl space-y-1.5">
                  <p className="font-bold text-sm text-[#1E1B18]">Aivora AI Platform</p>
                  <p className="text-[#696256] text-[11px]">Version 2.4.0 (Enterprise Editorial Release)</p>
                  <p className="text-[#696256] text-[11px]">Multi-Agent Orchestration Engine powered by LangGraph</p>
                </div>

                <div className="p-3.5 bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl space-y-1 text-[11px] text-[#696256]">
                  <p className="font-semibold text-[#1E1B18]">Engineered for Productivity</p>
                  <p>Designed with a luxury liquid glassmorphism identity, Warm Champagne aesthetic, and authoritative domain-expert intelligence.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#DDD3C1] bg-[#F5EFE3] flex items-center justify-between text-xs">
          <span className="text-[#696256] text-[11px]">Aivora AI • All services operational</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E2B1F] border border-[#C8BEAC] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
