// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, MessageSquare, Code2, ImageIcon, FileText, 
  Presentation, Globe, Mic, LayoutDashboard, ArrowRight, 
  CheckCircle2, Download, ExternalLink, Layers, 
  ShieldCheck, Zap, Menu, X, ArrowUpRight, Play,
  Cpu, Terminal, Eye, FileCheck, Check, ChevronRight
} from 'lucide-react'

export default function LandingPage({ onStartChat, onOpenLogin, onOpenExplore }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [heroActiveTab, setHeroActiveTab] = useState('code')
  const [calculatorInput, setCalculatorInput] = useState('1,024')

  // Smooth scroll helper
  const scrollTo = (id) => {
    setMobileNavOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const heroTabs = [
    {
      id: 'code',
      label: 'Full-Stack Coding',
      icon: Code2,
      badge: 'Live Monaco Sandbox',
      prompt: 'Build a modern responsive calculator with keyboard support',
      response: 'Code Generated Successfully. Artifact compiled into live interactive sandbox.',
      meta: 'HTML5 • CSS3 Grid • Vanilla ES6+'
    },
    {
      id: 'pdf',
      label: 'Executive PDF Studio',
      icon: FileText,
      badge: 'Puppeteer Vector Engine',
      prompt: 'Create a 2-page executive resume for a Senior Solutions Architect',
      response: 'PDF Document Compiled. Formatted with ATS-compliant typography & section layouts.',
      meta: 'A4 Vector PDF • Clean Typography • Instant Download'
    },
    {
      id: 'ppt',
      label: 'Presentation Decks',
      icon: Presentation,
      badge: 'McKinsey Flow Engine',
      prompt: 'Generate an 8-slide pitch deck on Autonomous Multi-Agent AI Systems',
      response: 'Presentation Deck Ready. Structured narrative with key metrics & speaker notes.',
      meta: '16:9 Widescreen • PPTX Vector • Speaker Notes'
    },
    {
      id: 'image',
      label: 'Cinematic Image Studio',
      icon: ImageIcon,
      badge: '4K Diffusion Synthesis',
      prompt: 'A majestic golden eagle soaring over snow-capped alpine mountains at sunset',
      response: 'Photorealistic image synthesized with atmospheric volumetric lighting.',
      meta: '4K Ultra-HD • Volumetric Rays • Photorealistic'
    }
  ]

  const activeHero = heroTabs.find(t => t.id === heroActiveTab) || heroTabs[0]

  return (
    <div className="min-h-screen w-full bg-[#D8CDBA] bg-[radial-gradient(circle_at_15%_15%,#E6D9C4_0%,transparent_40%),radial-gradient(circle_at_85%_10%,#E2D4BF_0%,transparent_45%),radial-gradient(circle_at_50%_80%,#CFC1AA_0%,transparent_50%),linear-gradient(135deg,#D8CDBA_0%,#CFC1AA_50%,#D5C8B4_100%)] text-[#1E1B18] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#1E2B1F] selection:text-[#E8DDC8] overflow-x-hidden relative">
      
      {/* Subtle Architectural Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      {/* ========================================================
          1. LUXURY FLOATING NAVIGATION BAR
      ======================================================== */}
      <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 max-w-7xl mx-auto transition-all">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-xl bg-[#FAF8F3]/92 border border-[#DDD3C1]/80 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(40,32,20,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]"
        >
          {/* Brand Logo & Pill */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-200">
              A
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#1E1B18] group-hover:text-[#1E2B1F] transition-colors">
                Aivora AI
              </span>
              <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#5A5347]">
            <button onClick={() => scrollTo('features')} className="hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer">
              Capabilities
            </button>
            <button onClick={() => scrollTo('showcase')} className="hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer">
              Artifact Studio
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer">
              Architecture
            </button>
            <button onClick={() => scrollTo('why-aivora')} className="hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer">
              Why Aivora
            </button>
            <button 
              onClick={onOpenExplore}
              className="text-[#3A5538] hover:text-[#1E2B1F] flex items-center gap-1.5 font-bold bg-[#E8DDC8]/60 hover:bg-[#E8DDC8] px-2.5 py-1 rounded-lg transition-colors border-none cursor-pointer"
            >
              <Sparkles size={12} className="text-[#C9A875]" />
              <span>Explore 8 Modes</span>
            </button>
          </nav>

          {/* Nav Right CTA Group */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer"
            >
              Sign In
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartChat && onStartChat()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-[0_4px_14px_rgba(25,45,32,0.22)] hover:shadow-lg transition-all border-none cursor-pointer flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-xl text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </motion.div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-4 shadow-xl flex flex-col gap-3"
            >
              <button 
                onClick={() => scrollTo('features')}
                className="text-left text-xs font-bold text-[#1E1B18] py-2 px-2 rounded-lg hover:bg-[#F2ECE0] bg-transparent border-none"
              >
                Capabilities
              </button>
              <button 
                onClick={() => scrollTo('showcase')}
                className="text-left text-xs font-bold text-[#1E1B18] py-2 px-2 rounded-lg hover:bg-[#F2ECE0] bg-transparent border-none"
              >
                Artifact Studio
              </button>
              <button 
                onClick={() => scrollTo('how-it-works')}
                className="text-left text-xs font-bold text-[#1E1B18] py-2 px-2 rounded-lg hover:bg-[#F2ECE0] bg-transparent border-none"
              >
                Architecture
              </button>
              <button 
                onClick={() => scrollTo('why-aivora')}
                className="text-left text-xs font-bold text-[#1E1B18] py-2 px-2 rounded-lg hover:bg-[#F2ECE0] bg-transparent border-none"
              >
                Why Aivora
              </button>
              <button 
                onClick={() => { setMobileNavOpen(false); onOpenExplore(); }}
                className="text-left text-xs font-bold text-[#3A5538] py-2 px-2 rounded-lg hover:bg-[#F2ECE0] bg-transparent border-none flex items-center gap-2"
              >
                <Sparkles size={13} className="text-[#C9A875]" />
                <span>Explore 8 Modes</span>
              </button>

              <div className="pt-2 border-t border-[#DDD3C1] flex flex-col gap-2">
                <button
                  onClick={() => { setMobileNavOpen(false); onOpenLogin(); }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#E8DDC8] text-[#1E1B18] border border-[#DDD3C1] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileNavOpen(false); onStartChat(); }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] text-white border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Chatting Free</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================
          2. SHOW-STOPPING HERO SECTION
      ======================================================== */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Headline & Pitch */}
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12 lg:mb-16">
            
            {/* Ambient Animated Badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F3]/90 border border-[#DDD3C1] shadow-2xs backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse" />
              <span className="text-[11px] font-bold text-[#1E2B1F] tracking-wide uppercase">
                Aivora Multi-Agent Engine 2.4
              </span>
              <span className="text-[#998F80] text-[11px]">•</span>
              <span className="text-[11px] text-[#554E43] font-medium">Domain-Expert Intelligence</span>
            </motion.div>

            {/* Main Headline with High-Impact Display Typography */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="font-display uppercase tracking-tighter text-5xl sm:text-7xl lg:text-8xl font-extrabold text-[#1E1B18] leading-[0.92] select-none">
                Aivora AI
              </h1>
              <h2 className="font-display tracking-tight uppercase text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1E2B1F] leading-tight">
                One AI Workspace.<br className="hidden sm:inline" /> Endless Possibilities.
              </h2>

              {/* Progress/Accent Bar (Matching Reference Image) */}
              <div className="w-full max-w-md mx-auto pt-2 space-y-1.5">
                <div className="w-full h-1.5 bg-[#2E2822]/15 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-[#C9A875] via-[#E8A338] to-[#FFA500] w-[74%] rounded-full shadow-[0_0_10px_rgba(255,165,0,0.4)]" />
                </div>
                <div className="flex justify-between items-center text-[10.5px] font-mono text-[#554E43] font-semibold">
                  <span className="uppercase tracking-wider">Multi-Agent Engine 2026</span>
                  <span className="text-[#1E2B1F] font-bold">8 Autonomous Models • Ready</span>
                </div>
              </div>
            </motion.div>

            {/* Supporting Pitch Narrative */}
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#554E43] leading-relaxed max-w-2xl mx-auto font-normal"
            >
              Transform ideas into production software, McKinsey-grade pitch decks, print-ready PDF publications, and photorealistic imagery inside a unified, luxury multi-agent canvas.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartChat && onStartChat()}
                className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-[0_6px_20px_rgba(25,45,32,0.28)] hover:shadow-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <button
                onClick={() => scrollTo('showcase')}
                className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#FAF8F3] hover:bg-[#F2ECE0] text-[#1E1B18] border border-[#DDD3C1] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={15} className="text-[#4A653C]" />
                <span>Interactive Studio Demo</span>
              </button>
            </motion.div>

            {/* Trust Micro-Bullets */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[#696256]"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-[#4A653C]" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-[#4A653C]" /> 8 Autonomous Agents
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-[#4A653C]" /> Instant guest access
              </span>
            </motion.div>

          </div>

          {/* ========================================================
              HERO INTERACTIVE 3-COLUMN WORKSPACE SHOWCASE
          ======================================================== */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Ambient Glows */}
            <div className="absolute -top-12 -left-12 w-72 h-72 bg-[#9EB698]/30 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-[#C9A875]/25 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Glass Window Container */}
            <div className="rounded-3xl bg-[#C5BBA8]/80 p-2 sm:p-3 border border-[#DDD3C1] shadow-[0_25px_60px_-15px_rgba(30,43,31,0.35),0_0_0_1px_rgba(255,255,255,0.4)] backdrop-blur-xl">
              
              {/* macOS Style Window Bar */}
              <div className="bg-[#FAF8F3] rounded-t-2xl px-4 py-2.5 border-b border-[#DDD3C1] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                  <span className="font-mono text-[11px] font-semibold text-[#8B8476] ml-2">
                    aivora-workspace.app
                  </span>
                </div>

                {/* Hero Interactive Mode Switcher */}
                <div className="flex items-center gap-1 bg-[#F2ECE0] p-1 rounded-xl border border-[#DDD3C1]">
                  {heroTabs.map((t) => {
                    const Icon = t.icon
                    const isActive = heroActiveTab === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setHeroActiveTab(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isActive 
                            ? 'bg-[#1E2B1F] text-white border-[#1E2B1F] shadow-xs' 
                            : 'bg-transparent text-[#696256] border-transparent hover:text-[#1E1B18]'
                        }`}
                      >
                        <Icon size={12} />
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#4A653C] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  <span>Interactive Runner</span>
                </div>
              </div>

              {/* 3-Column Preview Surface */}
              <div className="grid grid-cols-12 gap-0 sm:gap-2 h-[420px] sm:h-[460px] bg-[#D8CDBA] rounded-b-2xl overflow-hidden">
                
                {/* 1. LEFT SIDEBAR (Forest Green Glass) */}
                <div className="hidden md:flex md:col-span-3 bg-[#1E2B1F]/95 p-3 flex-col justify-between border-r border-white/10 text-[#CBD8CA] select-none">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-[9px]">A</div>
                        <span className="text-xs font-bold text-white tracking-tight">Aivora AI</span>
                        <span className="bg-[#2B3C2A] text-[#E8DDC8] text-[8px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
                      </div>
                    </div>

                    <div className="w-full py-1.5 px-3 rounded-lg bg-[#E8DDC8] text-[#1E2B1F] text-xs font-bold text-center shadow-xs">
                      + New Chat
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[9px] font-bold text-[#8EA58C] uppercase tracking-wider px-1">Recents</span>
                      <div className="bg-[#2D402C] border border-[#435E41] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium flex items-center justify-between">
                        <span className="truncate">{activeHero.prompt.slice(0, 22)}...</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                      </div>
                      <div className="text-[#CBD8CA] text-xs px-2.5 py-1 truncate">Modern Calculator v2</div>
                      <div className="text-[#CBD8CA] text-xs px-2.5 py-1 truncate">Sequoia Pitch Deck</div>
                      <div className="text-[#CBD8CA] text-xs px-2.5 py-1 truncate">Lead Architect CV</div>
                    </div>
                  </div>

                  <div className="bg-[#162117] p-2 rounded-xl flex items-center gap-2 border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#3E553D] flex items-center justify-center text-[9px] font-bold text-white">AK</div>
                    <div className="text-xs min-w-0">
                      <p className="font-semibold text-white truncate text-[11px]">Ayush Kumar</p>
                      <p className="text-[#8EA58C] text-[9.5px]">Pro Tier Member</p>
                    </div>
                  </div>
                </div>

                {/* 2. CENTER CHAT CANVAS (Warm Ivory) */}
                <div className="col-span-12 md:col-span-5 bg-[#FAF8F3] p-3 sm:p-4 flex flex-col justify-between border-r border-[#DDD3C1] overflow-hidden">
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between border-b border-[#DDD3C1]/80 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center text-[8px] font-bold">A</div>
                      <span className="text-xs font-bold text-[#1E1B18]">Aivora AI</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A653C]" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#4A653C] bg-[#EAE2D2] px-2 py-0.5 rounded-full">
                      {activeHero.badge}
                    </span>
                  </div>

                  {/* Messages Stream */}
                  <div className="space-y-3 py-2 overflow-hidden">
                    {/* User Prompt */}
                    <div className="flex justify-end">
                      <div className="bg-[#1E2B1F] text-white text-xs px-3.5 py-2 rounded-2xl max-w-[90%] font-medium shadow-2xs">
                        {activeHero.prompt}
                      </div>
                    </div>

                    {/* AI Response Card */}
                    <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-2xl p-3.5 space-y-2 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1E1B18]">{activeHero.response}</span>
                      </div>

                      {/* Artifact Card */}
                      <div className="bg-white border border-[#DDD3C1] rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#4A653C] font-bold">&lt;/&gt;</span>
                          <div>
                            <p className="text-xs font-bold text-[#1E1B18]">{activeHero.label} Artifact</p>
                            <p className="text-[10px] text-[#8B8476]">{activeHero.meta}</p>
                          </div>
                        </div>
                        <span className="bg-[#1E2B1F] text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                          Compiled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message Composer */}
                  <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl p-2 flex items-center justify-between text-xs">
                    <span className="text-[#8B8476] text-[11px] truncate">Ask anything, generate code, create decks...</span>
                    <button 
                      onClick={() => onStartChat && onStartChat(activeHero.id)}
                      className="w-6 h-6 rounded-lg bg-[#1E2B1F] text-white flex items-center justify-center hover:bg-[#283A27] transition-colors border-none cursor-pointer"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>

                </div>

                {/* 3. RIGHT PREVIEW & SANDBOX RUNNER (Dark Frosted Surface) */}
                <div className="col-span-12 md:col-span-4 bg-[#181715] p-3.5 flex flex-col justify-between text-white overflow-hidden">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#4ADE80] font-bold">Interactive Sandbox</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8E8A82]">LIVE RUNNER</span>
                  </div>

                  {/* Dynamic Mockup Body per Tab */}
                  <div className="flex-1 flex flex-col justify-center py-2">
                    
                    {heroActiveTab === 'code' && (
                      <div className="bg-[#24211D] border border-white/10 rounded-xl p-3 space-y-2 shadow-inner">
                        <div className="bg-black/50 text-right px-3 py-2 rounded-lg text-lg font-mono text-[#4ADE80] border border-white/5">
                          {calculatorInput}
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-xs text-center font-bold">
                          <button onClick={() => setCalculatorInput('0')} className="bg-[#3A362F] hover:bg-[#48433A] p-2 rounded text-[#CBD8CA] border-none cursor-pointer">C</button>
                          <button onClick={() => setCalculatorInput('±')} className="bg-[#3A362F] hover:bg-[#48433A] p-2 rounded text-[#CBD8CA] border-none cursor-pointer">±</button>
                          <button onClick={() => setCalculatorInput('%')} className="bg-[#3A362F] hover:bg-[#48433A] p-2 rounded text-[#CBD8CA] border-none cursor-pointer">%</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '÷')} className="bg-[#C9A875] text-[#1E1B18] p-2 rounded border-none cursor-pointer">÷</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '7')} className="bg-[#2C2923] hover:bg-[#38342D] p-2 rounded text-white border-none cursor-pointer">7</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '8')} className="bg-[#2C2923] hover:bg-[#38342D] p-2 rounded text-white border-none cursor-pointer">8</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '9')} className="bg-[#2C2923] hover:bg-[#38342D] p-2 rounded text-white border-none cursor-pointer">9</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '×')} className="bg-[#C9A875] text-[#1E1B18] p-2 rounded border-none cursor-pointer">×</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '4')} className="bg-[#2C2923] hover:bg-[#38342D] p-2 rounded text-white border-none cursor-pointer">4</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '5')} className="bg-[#2C2923] hover:bg-[#38342D] p-2 rounded text-white border-none cursor-pointer">5</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '6')} className="bg-[#2C2923] hover:bg-[#38342D] p-2 rounded text-white border-none cursor-pointer">6</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '-')} className="bg-[#C9A875] text-[#1E1B18] p-2 rounded border-none cursor-pointer">-</button>
                        </div>
                      </div>
                    )}

                    {heroActiveTab === 'pdf' && (
                      <div className="bg-[#FAF8F3] text-[#1E1B18] rounded-xl p-3.5 space-y-2 border border-[#DDD3C1]">
                        <div className="flex justify-between items-center border-b border-[#DDD3C1] pb-1.5">
                          <div>
                            <h4 className="font-bold text-xs">Ayush Kumar</h4>
                            <p className="text-[9px] text-[#696256]">Staff Solutions Architect</p>
                          </div>
                          <span className="text-[8px] bg-[#1E2B1F] text-white px-2 py-0.5 rounded font-bold">A4 PDF</span>
                        </div>
                        <p className="text-[10px] text-[#554E43] leading-relaxed">
                          10+ years architecting multi-agent LLM systems, real-time reactive runtimes, and distributed event-driven systems.
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-[8px] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-medium">LangGraph</span>
                          <span className="text-[8px] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-medium">React 19</span>
                          <span className="text-[8px] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-medium">Puppeteer</span>
                        </div>
                      </div>
                    )}

                    {heroActiveTab === 'ppt' && (
                      <div className="bg-[#221F1A] border border-white/10 rounded-xl p-3.5 space-y-2 text-white">
                        <span className="text-[9px] text-[#C9A875] font-bold uppercase tracking-wider">Slide 01 of 08 • Sequoia Pitch</span>
                        <h4 className="text-sm font-bold leading-tight">The Autonomous Multi-Agent Workspace Revolution</h4>
                        <ul className="text-[10.5px] text-[#DDD4C5] space-y-1 list-disc pl-4">
                          <li>Unifies 8 distinct domain expert models</li>
                          <li>Zero-latency interactive artifact sandbox</li>
                        </ul>
                      </div>
                    )}

                    {heroActiveTab === 'image' && (
                      <div className="bg-[#221F1A] border border-white/10 rounded-xl p-4 text-center space-y-2 text-white">
                        <div className="w-10 h-10 rounded-xl bg-[#372E15] text-[#C9A875] flex items-center justify-center mx-auto">
                          <ImageIcon size={20} />
                        </div>
                        <p className="text-xs font-bold">Cinematic 4K Synthesis</p>
                        <p className="text-[10px] text-[#8E8A82]">Volumetric ray tracing & photorealism</p>
                      </div>
                    )}

                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8E8A82]">
                    <span>Ready for Instant Export</span>
                    <button 
                      onClick={() => onStartChat && onStartChat(activeHero.id)}
                      className="text-[#E8DDC8] hover:underline font-bold bg-transparent border-none cursor-pointer"
                    >
                      Open in Canvas &rarr;
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* ========================================================
          3. DOMAIN EXPERT CAPABILITY BENTO GRID (8 MODES)
      ======================================================== */}
      <section id="features" className="py-20 lg:py-28 bg-[#FAF8F3]/90 border-y border-[#DDD3C1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Specialized Multi-Agent Studios
            </span>
            <h2 className="font-display tracking-tight uppercase text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18]">
              8 Deep Domain Experts.<br />One Contextual Canvas.
            </h2>
            <p className="text-sm sm:text-base text-[#696256] leading-relaxed">
              Every agent is instructed with senior-level heuristics. No generic replies, no unasked projects—just high-signal execution.
            </p>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Bento Card 1: Coding (Large Spotlight) */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onStartChat && onStartChat('coding')}
              className="lg:col-span-2 bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-3xl p-6 sm:p-8 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E2B1F] text-[#4ADE80] flex items-center justify-center shadow-xs">
                    <Code2 size={24} />
                  </div>
                  <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider bg-[#E6DCC9] px-3 py-1 rounded-full">
                    Staff Solutions Architect
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1E1B18] tracking-tight">
                    AI Coding & Interactive Live Sandbox
                  </h3>
                  <p className="text-xs sm:text-sm text-[#554E43] leading-relaxed mt-2 max-w-xl">
                    Generate complete, production-ready web apps with semantic HTML5, modern CSS variables, and clean vanilla ES6+. Test them immediately in Monaco Editor with zero build configuration.
                  </p>
                </div>

                <div className="bg-[#181715] text-[#CBD8CA] p-3.5 rounded-xl font-mono text-xs border border-white/10 space-y-1">
                  <p className="text-[#4ADE80] font-semibold">// Production-Ready Artifact Output</p>
                  <p className="text-[#DDD4C5]">const app = new AivoraApp(); app.compile({'{ liveSandbox: true }'});</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#DDD3C1] flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                <span>Launch Coding Agent Studio</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Bento Card 2: PDF Studio */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onStartChat && onStartChat('pdf')}
              className="bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-3xl p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#3A1E1E] text-[#F87171] flex items-center justify-center shadow-xs">
                    <FileText size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-[#A84B4B] uppercase tracking-wider bg-[#E6DCC9] px-2.5 py-0.5 rounded-full">
                    Publication Designer
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1E1B18] tracking-tight">
                  Executive PDF & Resumes
                </h3>
                <p className="text-xs text-[#554E43] leading-relaxed">
                  Craft ATS-optimized resumes, business whitepapers, and invoices converted into print-ready A4 vector PDFs via Puppeteer.
                </p>

                <div className="bg-[#FAF8F3] p-3 rounded-xl border border-[#DDD3C1] text-xs space-y-1">
                  <span className="text-[9.5px] font-bold text-[#4A653C] block uppercase">Vector PDF Output</span>
                  <p className="font-semibold text-[#1E1B18] truncate">Lead Engineer Resume.pdf</p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#DDD3C1] flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                <span>Try PDF Tools</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Bento Card 3: Presentation Generator */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onStartChat && onStartChat('ppt')}
              className="bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-3xl p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#372E15] text-[#FBBF24] flex items-center justify-center shadow-xs">
                    <Presentation size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-[#94762A] uppercase tracking-wider bg-[#E6DCC9] px-2.5 py-0.5 rounded-full">
                    McKinsey Specialist
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1E1B18] tracking-tight">
                  PowerPoint Slide Decks
                </h3>
                <p className="text-xs text-[#554E43] leading-relaxed">
                  Generate complete structured slide presentations with punchy takeaways, key statistical callouts, and speaker notes.
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#DDD3C1] flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                <span>Generate Slides</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Bento Card 4: Image Generation */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onStartChat && onStartChat('image')}
              className="bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-3xl p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#3D2D1E] text-[#F3C474] flex items-center justify-center shadow-xs">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-[#8E6D38] uppercase tracking-wider bg-[#E6DCC9] px-2.5 py-0.5 rounded-full">
                    Creative Director
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1E1B18] tracking-tight">
                  Cinematic Image Studio
                </h3>
                <p className="text-xs text-[#554E43] leading-relaxed">
                  Synthesize high-resolution photorealistic imagery, brand concept art, and digital illustrations with prompt expansion.
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#DDD3C1] flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                <span>Synthesize Art</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Bento Card 5: AI Live Web Search */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onStartChat && onStartChat('search')}
              className="bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-3xl p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#1E2C3A] text-[#60A5FA] flex items-center justify-center shadow-xs">
                    <Globe size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider bg-[#E6DCC9] px-2.5 py-0.5 rounded-full">
                    Live Web Intelligence
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1E1B18] tracking-tight">
                  Real-Time Research Analyst
                </h3>
                <p className="text-xs text-[#554E43] leading-relaxed">
                  Synthesizes live news, verified facts, and citations across the web without dumping raw JSON snippets.
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#DDD3C1] flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                <span>Run Search</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. ARCHITECTURAL PIPELINE (HOW IT WORKS)
      ======================================================== */}
      <section id="how-it-works" className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Autonomous Pipeline
            </span>
            <h2 className="font-display tracking-tight uppercase text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              From Prompt to Production Artifact
            </h2>
            <p className="text-sm text-[#554E43]">
              How Aivora's LangGraph multi-agent architecture coordinates complex workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative">
              <span className="text-4xl font-extrabold text-[#C8BEAC]">01</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Multi-Modal Input</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Provide natural instructions in English or Hindi/Hinglish. Attach reference PDFs, drop images, or dictate with voice.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative">
              <span className="text-4xl font-extrabold text-[#C8BEAC]">02</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Agent Intent Router</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Deterministic heuristics & LLM intent classification route your query to the exact domain expert model.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative">
              <span className="text-4xl font-extrabold text-[#C8BEAC]">03</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Artifact Compilation</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Code bundles compile into Monaco sandboxes; documents convert to A4 PDFs; presentations compile into PPTX decks.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative">
              <span className="text-4xl font-extrabold text-[#C8BEAC]">04</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Live Execution & Sync</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Preview live apps in the browser, export one-click files, and keep history saved with search, pinning, and renaming.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          5. LIVE ARTIFACT STUDIO SHOWCASE
      ======================================================== */}
      <section id="showcase" className="py-20 bg-[#FAF8F3]/90 border-y border-[#DDD3C1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Studio Artifacts
            </span>
            <h2 className="font-display tracking-tight uppercase text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Experience True Multi-Modal Depth
            </h2>
            <p className="text-sm text-[#554E43]">
              No more static mockups. Aivora creates real, functional, interactive outputs.
            </p>
          </div>

          <div className="bg-[#F5EFE3] border border-[#DDD3C1] rounded-3xl p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider bg-[#E6DCC9] px-3 py-1 rounded-full">
                Unified Creative Canvas
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
                One thread. Code, presentations, and documents together.
              </h3>
              <p className="text-xs sm:text-sm text-[#554E43] leading-relaxed">
                Ask Aivora to research an industry, generate an executive summary report, build an interactive calculator for it, and generate an 8-slide pitch deck—all within a single conversation.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-[#1E1B18]">
                  <CheckCircle2 size={16} className="text-[#4A653C]" />
                  <span>Real-time reactive code execution runner</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#1E1B18]">
                  <CheckCircle2 size={16} className="text-[#4A653C]" />
                  <span>Puppeteer vector PDF rendering engine</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#1E1B18]">
                  <CheckCircle2 size={16} className="text-[#4A653C]" />
                  <span>Automated ATS-friendly resume formatting</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onStartChat && onStartChat()}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-xs transition-all border-none cursor-pointer flex items-center gap-2"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#1A1917] rounded-2xl border border-white/10 p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="font-mono text-xs text-[#A69F91] ml-2">Aivora Enterprise Pipeline</span>
                </div>
                <span className="text-[10px] font-mono text-[#4ADE80]">READY</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#24221E] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-[#A69F91] uppercase font-mono">Input Stream</p>
                  <p className="font-bold text-white">Natural Speech & Docs</p>
                </div>
                <div className="bg-[#24221E] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-[#A69F91] uppercase font-mono">Agent Graph</p>
                  <p className="font-bold text-[#4ADE80]">LangGraph Sub-Agents</p>
                </div>
              </div>

              <div className="p-4 bg-[#23201C] rounded-xl border border-white/5 text-xs font-mono space-y-1.5 text-[#DDD4C5]">
                <p className="text-[#C9A875] font-bold">&gt; Agent Orchestration Status:</p>
                <p>• chatAgent: Senior Consultant (ready)</p>
                <p>• codingAgent: Staff Architect & Sandbox (ready)</p>
                <p>• pdfAgent: Puppeteer Vector Engine (ready)</p>
                <p>• pptAgent: Slide Deck Specialist (ready)</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. WHY AIVORA AI (VALUE PROPOSITION)
      ======================================================== */}
      <section id="why-aivora" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              The Aivora Advantage
            </span>
            <h2 className="font-display tracking-tight uppercase text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Why Switch to Aivora AI?
            </h2>
            <p className="text-sm text-[#696256]">
              Replace 5+ fragmented subscriptions with one unified, domain-expert platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-7 space-y-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <Layers size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Zero Context Switching</h3>
              <p className="text-xs text-[#554E43] leading-relaxed">
                Never copy-paste code snippets into external sandboxes or slide scripts into presentation apps. Aivora compiles outputs inside your active session.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-7 space-y-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Staff-Level Intelligence</h3>
              <p className="text-xs text-[#554E43] leading-relaxed">
                Every agent possesses strict persona constraints and deep heuristics. You get clean semantic code, ATS-compliant resumes, and McKinsey-grade slide narratives.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-7 space-y-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Privacy & Cloud Sync</h3>
              <p className="text-xs text-[#554E43] leading-relaxed">
                Enterprise session management with Redis and MongoDB. Your documents, code projects, and custom presentations are securely saved and exportable anytime.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. HIGH-IMPACT FINAL CALL TO ACTION
      ======================================================== */}
      <section className="py-20 sm:py-28 bg-[#1E2B1F] text-[#FAF8F3] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#3E553D]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#C9A875]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="bg-[#2B3C2A] text-[#E8DDC8] border border-[#3E553D] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Ready to Upgrade Your AI Workflow?
          </span>

          <h2 className="font-display tracking-tight uppercase text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Ready to experience a smarter workspace?
          </h2>

          <p className="text-sm sm:text-base text-[#CBD8CA] max-w-xl mx-auto leading-relaxed">
            Experience the seamless power of 8 domain-expert AI models unified in one continuous canvas.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartChat && onStartChat()}
              className="px-8 py-4 rounded-xl text-sm font-bold bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F] shadow-lg transition-all border-none cursor-pointer flex items-center gap-2.5 group"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <button
              onClick={onOpenLogin}
              className="px-7 py-4 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>

          <p className="text-[11px] text-[#8EA58C]">
            Instant access • No setup required • Free guest mode available
          </p>
        </div>
      </section>

      {/* ========================================================
          8. ENTERPRISE FOOTER
      ======================================================== */}
      <footer className="bg-[#141F15] text-[#8EA58C] border-t border-white/10 py-14 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand Column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-7 h-7 rounded-lg bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <span className="text-base font-bold tracking-tight">Aivora AI</span>
              </div>
              <p className="text-[11.5px] leading-relaxed max-w-xs text-[#CBD8CA]/80">
                One AI Workspace. Endless Possibilities. Unified multi-agent architecture for software engineering, executive publications, and visual design.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#4ADE80]">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span>All 8 Agent Services Operational</span>
              </div>
            </div>

            {/* Links: Product */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Product</p>
              <ul className="space-y-2">
                <li><button onClick={() => onStartChat && onStartChat()} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Workspace Canvas</button></li>
                <li><button onClick={() => scrollTo('features')} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Capabilities</button></li>
                <li><button onClick={() => scrollTo('showcase')} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Artifact Studios</button></li>
                <li><button onClick={onOpenExplore} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Explore Modes</button></li>
              </ul>
            </div>

            {/* Links: Studios */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Studios</p>
              <ul className="space-y-2">
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('coding')}>Code Sandbox</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('pdf')}>PDF Generator</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('ppt')}>Slide Decks</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('image')}>Image Studio</span></li>
              </ul>
            </div>

            {/* Links: Legal & Company */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Company</p>
              <ul className="space-y-2">
                <li><span className="hover:text-white cursor-pointer">About Aivora</span></li>
                <li><span className="hover:text-white cursor-pointer">Security & Privacy</span></li>
                <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-white cursor-pointer">Contact Support</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#8EA58C]/70">
            <p>© {new Date().getFullYear()} Aivora AI Inc. All rights reserved.</p>
            <p>Designed with Luxury Liquid Glassmorphism & Editorial Typography.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
