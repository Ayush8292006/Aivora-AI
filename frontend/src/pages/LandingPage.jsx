// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { openPricingModal } from '../redux/creditSlice.js'
import { 
  Sparkles, MessageSquare, Code2, ImageIcon, FileText, 
  Presentation, Globe, Mic, LayoutDashboard, ArrowRight, 
  CheckCircle2, Download, ExternalLink, Layers, 
  ShieldCheck, Zap, Menu, X, ArrowUpRight, Play,
  ChevronDown, Terminal, Check, CreditCard, Award
} from 'lucide-react'

// Dynamic Typewriter Component
function TypewriterText({ words = [], speed = 45, deleteSpeed = 25, pause = 2200 }) {
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [reverse, setReverse] = useState(false)

  useEffect(() => {
    if (words.length === 0) return

    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), pause)
      return () => clearTimeout(timeout)
    }

    if (subIndex === 0 && reverse) {
      setReverse(false)
      setIndex((prev) => (prev + 1) % words.length)
      return
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1))
    }, reverse ? deleteSpeed : speed)

    return () => clearTimeout(timeout)
  }, [subIndex, index, reverse, words, speed, deleteSpeed, pause])

  return (
    <span className="inline-flex items-baseline font-semibold text-[#1E2B1F]">
      <span>{words[index]?.substring(0, subIndex)}</span>
      <span className="w-[2px] h-[1em] bg-[#1E2B1F] ml-1 inline-block animate-pulse align-middle rounded-full" />
    </span>
  )
}

export default function LandingPage({ onStartChat, onOpenLogin, onOpenExplore }) {
  const dispatch = useDispatch()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [heroActiveTab, setHeroActiveTab] = useState('code')
  const [calculatorInput, setCalculatorInput] = useState('2,048')

  const scrollTo = (id) => {
    setMobileNavOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const typewriterPhrases = [
    "build production-ready full-stack web apps",
    "create investor-ready pitch decks & slides",
    "craft ATS-compliant executive PDF resumes",
    "synthesize 4K photorealistic cinematic imagery",
    "research live web intelligence with citations",
    "reason through complex scientific mental models"
  ]

  const heroTabs = [
    {
      id: 'code',
      label: 'Full-Stack Code',
      icon: Code2,
      badge: 'Monaco Live Sandbox',
      prompt: 'Build a modern responsive calculator with keyboard support',
      response: 'Code Generated Successfully. Artifact compiled into live interactive sandbox.',
      meta: 'HTML5 • CSS3 Grid • Vanilla ES6+'
    },
    {
      id: 'pdf',
      label: 'Executive PDF',
      icon: FileText,
      badge: 'Puppeteer Vector Engine',
      prompt: 'Create a 2-page executive resume for a Senior Solutions Architect',
      response: 'PDF Document Compiled. Formatted with ATS-compliant typography & section layouts.',
      meta: 'A4 Vector PDF • Clean Typography • Instant Download'
    },
    {
      id: 'ppt',
      label: 'Pitch Decks',
      icon: Presentation,
      badge: 'Executive Slide Engine',
      prompt: 'Generate an 8-slide pitch deck on Next-Gen Cloud Architecture',
      response: 'Presentation Deck Ready. Structured narrative with key metrics & speaker notes.',
      meta: '16:9 Widescreen • PPTX Vector • Speaker Notes'
    },
    {
      id: 'image',
      label: 'Cinematic Visuals',
      icon: ImageIcon,
      badge: '4K Diffusion Synthesis',
      prompt: 'A majestic golden eagle soaring over snow-capped alpine mountains at sunset',
      response: 'Photorealistic image synthesized with atmospheric volumetric lighting.',
      meta: '4K Ultra-HD • Volumetric Rays • Photorealistic'
    }
  ]

  const activeHero = heroTabs.find(t => t.id === heroActiveTab) || heroTabs[0]

  const capabilities = [
    {
      id: 'coding',
      title: "AI Coding & Live Sandbox",
      category: "Staff Software Architect",
      desc: "Generate complete, production-grade web applications in HTML5, CSS3, and ES6+. Preview output instantly in Monaco Editor with zero setup.",
      icon: Code2,
      color: "bg-[#1E2B1F] text-[#4ADE80]",
      badge: "Real-Time Runner",
      sample: "Build an interactive calculator with responsive styling"
    },
    {
      id: 'pdf',
      title: "Executive PDF & Resumes",
      category: "Publication Designer",
      desc: "Produce ATS-compliant executive resumes, corporate whitepapers, and itemized billing invoices rendered into print-ready A4 vector PDFs via Puppeteer.",
      icon: FileText,
      color: "bg-[#3A1E1E] text-[#F87171]",
      badge: "Vector A4 Export",
      sample: "Generate a 2-page Senior React Engineer resume"
    },
    {
      id: 'ppt',
      title: "PowerPoint Pitch Decks",
      category: "Presentation Designer",
      desc: "Craft structured, high-impact PowerPoint presentations with clear narrative architecture, quantitative metrics, and ready-to-deliver speaker notes.",
      icon: Presentation,
      color: "bg-[#372E15] text-[#FBBF24]",
      badge: "16:9 Slide Engine",
      sample: "Create an 8-slide AI SaaS investor deck"
    },
    {
      id: 'image',
      title: "Cinematic Visual Synthesis",
      category: "Creative Visual Director",
      desc: "Translate natural language prompts into photorealistic imagery, brand concept art, and high-resolution wallpapers with expanded prompt physics.",
      icon: ImageIcon,
      color: "bg-[#3D2D1E] text-[#F3C474]",
      badge: "4K Photorealism",
      sample: "Futuristic sustainable architecture at dusk"
    },
    {
      id: 'chat',
      title: "Polymath Consultation & Reasoning",
      category: "Senior Research Fellow",
      desc: "Deep conceptual reasoning, mental models, mathematical proofs, and structured analysis across science, business, and literature with zero fluff.",
      icon: MessageSquare,
      color: "bg-[#243223] text-[#E8DDC8]",
      badge: "High Signal",
      sample: "Explain quantum computing mental models simply"
    },
    {
      id: 'search',
      title: "Real-Time Web Intelligence",
      category: "Senior Intelligence Analyst",
      desc: "Query live web engines, synthesize breaking news, extract citations, and curate relevant media without dumping raw unstructured JSON.",
      icon: Globe,
      color: "bg-[#1E2C3A] text-[#60A5FA]",
      badge: "Live Citations",
      sample: "Latest breakthroughs in fusion energy"
    },
    {
      id: 'voice',
      title: "Hands-Free Voice Interaction",
      category: "Voice Dictation",
      desc: "Speak naturally using browser speech recognition. Speak your thoughts and let Aivora orchestrate them directly into artifacts.",
      icon: Mic,
      color: "bg-[#2E1E3A] text-[#C084FC]",
      badge: "Speech-to-Text",
      sample: "Voice dictation available in chat toolbar"
    },
    {
      id: 'workspace',
      title: "Smart Workspace & History",
      category: "Unified Platform",
      desc: "Live 3-column dashboard with interactive artifact previews, search filtering, pinning, renaming, and persistent cloud sync.",
      icon: LayoutDashboard,
      color: "bg-[#1E2E25] text-[#34D399]",
      badge: "Unified Canvas",
      sample: "Explore the 3-column live workspace"
    }
  ]

  return (
    <div className="w-full bg-[#D8CDBA] bg-[radial-gradient(circle_at_15%_15%,#E6D9C4_0%,transparent_40%),radial-gradient(circle_at_85%_10%,#E2D4BF_0%,transparent_45%),radial-gradient(circle_at_50%_80%,#CFC1AA_0%,transparent_50%),linear-gradient(135deg,#D8CDBA_0%,#CFC1AA_50%,#D5C8B4_100%)] text-[#1E1B18] selection:bg-[#1E2B1F] selection:text-[#E8DDC8] relative">
      
      {/* Subtle Background Architectural Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50 z-0" />

      {/* ========================================================
          1. LUXURY FLOATING NAVBAR
      ======================================================== */}
      <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-xl bg-[#FAF8F3]/92 border border-[#DDD3C1]/80 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(40,32,20,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] relative z-10"
        >
          {/* Brand Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-200">
              A
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-[#1E1B18] group-hover:text-[#1E2B1F] transition-colors">
                Aivora AI
              </span>
              <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
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
              Live Showcase
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer">
              Architecture
            </button>
            <button onClick={() => scrollTo('why-aivora')} className="hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer">
              Why Aivora
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer">
              Pricing
            </button>
            <button 
              onClick={onOpenExplore}
              className="text-[#3A5538] hover:text-[#1E2B1F] flex items-center gap-1.5 font-bold bg-[#E8DDC8]/60 hover:bg-[#E8DDC8] px-3 py-1.5 rounded-xl transition-colors border-none cursor-pointer"
            >
              <Sparkles size={13} className="text-[#C9A875]" />
              <span>Explore 8 Modes</span>
            </button>
          </nav>

          {/* Nav Right CTA */}
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
              className="md:hidden mt-2 bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-4 shadow-xl flex flex-col gap-3 relative z-20"
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
                Live Showcase
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
                onClick={() => scrollTo('pricing')}
                className="text-left text-xs font-bold text-[#1E1B18] py-2 px-2 rounded-lg hover:bg-[#F2ECE0] bg-transparent border-none"
              >
                Pricing
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
          2. ELEGANT 2-COLUMN SPLIT SAAS HERO SECTION (LEFT & RIGHT)
      ======================================================== */}
      <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        
        {/* Soft Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[650px] h-[400px] bg-gradient-to-br from-[#2D452E]/12 via-[#C9A875]/8 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-10 right-10 w-[500px] h-[350px] bg-gradient-to-bl from-[#C9A875]/10 via-[#2D452E]/6 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ==================== LEFT COLUMN: HEADLINE, COPY & CTAS ==================== */}
          <div className="lg:col-span-5 text-left space-y-5">
            
            {/* Top Product Badge */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => scrollTo('features')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F3] border border-[#DDD3C1] shadow-2xs hover:border-[#BFAF98] transition-all cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              <span className="text-[11.5px] font-semibold text-[#1E1B18]">
                Introducing Aivora 2.0 • Unified Platform
              </span>
              <ArrowRight size={12} className="text-[#7D7567] group-hover:translate-x-0.5 transition-transform" />
            </motion.div>

            {/* Left-Aligned Headline */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-extrabold tracking-[-0.035em] text-[#141413] leading-[1.12]">
                The unified workspace for<br />
                <span className="bg-gradient-to-r from-[#1E2B1F] via-[#2E4731] to-[#99793E] bg-clip-text text-transparent">
                  code, documents & design.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#554E43] leading-relaxed font-normal pt-1">
                Build full-stack applications with live previews, author publication-ready PDFs, export pitch decks, and craft visual assets—in one seamless platform.
              </p>
            </motion.div>

            {/* Interactive Prompt Capsule */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#FAF8F3]/95 border border-[#D5C9B4] shadow-[0_4px_16px_rgba(40,32,20,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md">
                <div className="w-6 h-6 rounded-lg bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles size={12} className="text-[#C9A875]" />
                </div>
                <div className="text-xs truncate flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[#7D7567] font-medium shrink-0">Try:</span>
                  <TypewriterText words={typewriterPhrases} />
                </div>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#EAE2D2] text-[#554E43] border border-[#DDD3C1] shrink-0">
                  ↵
                </span>
              </div>
            </motion.div>

            {/* Quick Mode Switcher Chips */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center gap-1.5 pt-0.5"
            >
              {heroTabs.map((t) => {
                const Icon = t.icon
                const isActive = heroActiveTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setHeroActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-[#1E2B1F] text-[#E8DDC8] border-[#1E2B1F] shadow-xs' 
                        : 'bg-[#FAF8F3] hover:bg-[#F2ECE0] text-[#554E43] border-[#DDD3C1]'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-[#C9A875]' : 'text-[#7D7567]'} />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </motion.div>

            {/* Left Action Buttons */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartChat && onStartChat()}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-[0_6px_20px_rgba(25,45,32,0.22)] hover:shadow-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Start Free with 100 Credits</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <button
                onClick={() => scrollTo('features')}
                className="px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#FAF8F3] hover:bg-[#F2ECE0] text-[#1E1B18] border border-[#DDD3C1] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore Features</span>
              </button>
            </motion.div>

            {/* Left Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-5 pt-1 text-xs text-[#696256]"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-[#4A653C]" /> Instant 100 free bonus credits
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-[#4A653C]" /> Live interactive code previews
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-[#4A653C]" /> Private & secure per-user wallet
              </span>
            </motion.div>

          </div>

          {/* ==================== RIGHT COLUMN: INTERACTIVE WORKSPACE CANVAS ==================== */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="lg:col-span-7 relative"
          >
            {/* Glass Window Outer Frame */}
            <div className="rounded-3xl bg-[#C5BBA8]/80 p-2 sm:p-2.5 border border-[#DDD3C1] shadow-[0_25px_60px_-15px_rgba(30,43,31,0.28),0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-xl">
              
              {/* Window Top Bar with Interactive Mode Switcher */}
              <div className="bg-[#FAF8F3] rounded-t-2xl px-3.5 py-2 border-b border-[#DDD3C1] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                  <span className="font-mono text-[10px] font-semibold text-[#8B8476] ml-2">
                    aivora-workspace.app
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#F2ECE0] p-0.5 rounded-xl border border-[#DDD3C1]">
                  {heroTabs.map((t) => {
                    const Icon = t.icon
                    const isActive = heroActiveTab === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setHeroActiveTab(t.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                          isActive 
                            ? 'bg-[#1E2B1F] text-white border-[#1E2B1F] shadow-xs' 
                            : 'bg-transparent text-[#696256] border-transparent hover:text-[#1E1B18]'
                        }`}
                      >
                        <Icon size={11} />
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#4A653C] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  <span>Live Sandbox</span>
                </div>
              </div>

              {/* 2-Column Split inside Right Window */}
              <div className="grid grid-cols-12 h-[380px] sm:h-[420px] bg-[#D8CDBA] rounded-b-2xl overflow-hidden">
                
                {/* Center Chat Canvas */}
                <div className="col-span-12 sm:col-span-6 bg-[#FAF8F3] p-3 sm:p-3.5 flex flex-col justify-between border-r border-[#DDD3C1] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#DDD3C1]/80 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center text-[8px] font-bold">A</div>
                      <span className="text-xs font-bold text-[#1E1B18]">Aivora AI</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A653C]" />
                    </div>
                    <span className="text-[9.5px] font-semibold text-[#4A653C] bg-[#EAE2D2] px-2 py-0.5 rounded-full">
                      {activeHero.badge}
                    </span>
                  </div>

                  <div className="space-y-2.5 py-2 overflow-hidden">
                    <div className="flex justify-end">
                      <div className="bg-[#1E2B1F] text-white text-[11px] px-3 py-1.5 rounded-2xl max-w-[92%] font-medium shadow-2xs">
                        {activeHero.prompt}
                      </div>
                    </div>

                    <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-2xl p-2.5 sm:p-3 space-y-2 text-xs shadow-2xs">
                      <p className="font-bold text-[11px] text-[#1E1B18] leading-tight">{activeHero.response}</p>
                      <div className="bg-white border border-[#DDD3C1] rounded-xl p-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-xs text-[#4A653C] font-bold">&lt;/&gt;</span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-[#1E1B18] truncate">{activeHero.label} Artifact</p>
                            <p className="text-[9px] text-[#8B8476] truncate">{activeHero.meta}</p>
                          </div>
                        </div>
                        <span className="bg-[#1E2B1F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                          Compiled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl p-1.5 flex items-center justify-between text-xs">
                    <span className="text-[#8B8476] text-[10.5px] truncate pl-1">Ask anything, generate code, create decks...</span>
                    <button 
                      onClick={() => onStartChat && onStartChat(activeHero.id)}
                      className="w-5 h-5 rounded-lg bg-[#1E2B1F] text-white flex items-center justify-center hover:bg-[#283A27] transition-colors border-none cursor-pointer shrink-0"
                    >
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>

                {/* Right Interactive Runner (Calculator / Document / Deck / Image) */}
                <div className="col-span-12 sm:col-span-6 bg-[#181715] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-xs">
                    <span className="font-mono text-[#4ADE80] font-bold text-[11px]">Interactive Sandbox</span>
                    <span className="text-[9px] font-mono text-[#8E8A82]">LIVE RUNNER</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center py-2">
                    {heroActiveTab === 'code' && (
                      <div className="bg-[#24211D] border border-white/10 rounded-xl p-2.5 space-y-1.5 shadow-inner">
                        <div className="bg-black/50 text-right px-2.5 py-1.5 rounded-lg text-base font-mono text-[#4ADE80] border border-white/5">
                          {calculatorInput}
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[11px] text-center font-bold">
                          <button onClick={() => setCalculatorInput('0')} className="bg-[#3A362F] hover:bg-[#48433A] p-1.5 rounded text-[#CBD8CA] border-none cursor-pointer">C</button>
                          <button onClick={() => setCalculatorInput('±')} className="bg-[#3A362F] hover:bg-[#48433A] p-1.5 rounded text-[#CBD8CA] border-none cursor-pointer">±</button>
                          <button onClick={() => setCalculatorInput('%')} className="bg-[#3A362F] hover:bg-[#48433A] p-1.5 rounded text-[#CBD8CA] border-none cursor-pointer">%</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '÷')} className="bg-[#C9A875] text-[#1E1B18] p-1.5 rounded border-none cursor-pointer">÷</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '7')} className="bg-[#2C2923] hover:bg-[#38342D] p-1.5 rounded text-white border-none cursor-pointer">7</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '8')} className="bg-[#2C2923] hover:bg-[#38342D] p-1.5 rounded text-white border-none cursor-pointer">8</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '9')} className="bg-[#2C2923] hover:bg-[#38342D] p-1.5 rounded text-white border-none cursor-pointer">9</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '×')} className="bg-[#C9A875] text-[#1E1B18] p-1.5 rounded border-none cursor-pointer">×</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '4')} className="bg-[#2C2923] hover:bg-[#38342D] p-1.5 rounded text-white border-none cursor-pointer">4</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '5')} className="bg-[#2C2923] hover:bg-[#38342D] p-1.5 rounded text-white border-none cursor-pointer">5</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '6')} className="bg-[#2C2923] hover:bg-[#38342D] p-1.5 rounded text-white border-none cursor-pointer">6</button>
                          <button onClick={() => setCalculatorInput(prev => prev + '-')} className="bg-[#C9A875] text-[#1E1B18] p-1.5 rounded border-none cursor-pointer">-</button>
                        </div>
                      </div>
                    )}

                    {heroActiveTab === 'pdf' && (
                      <div className="bg-[#FAF8F3] text-[#1E1B18] rounded-xl p-3 space-y-1.5 border border-[#DDD3C1]">
                        <div className="flex justify-between items-center border-b border-[#DDD3C1] pb-1">
                          <div>
                            <h4 className="font-bold text-xs">Ayush Kumar</h4>
                            <p className="text-[9px] text-[#696256]">Staff Solutions Architect</p>
                          </div>
                          <span className="text-[8px] bg-[#1E2B1F] text-white px-1.5 py-0.5 rounded font-bold">A4 PDF</span>
                        </div>
                        <p className="text-[9.5px] text-[#554E43] leading-relaxed">
                          10+ years architecting scalable cloud platforms, real-time reactive runtimes, and distributed event-driven systems.
                        </p>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          <span className="text-[8px] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-medium">TypeScript</span>
                          <span className="text-[8px] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-medium">React 19</span>
                          <span className="text-[8px] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-medium">Node.js</span>
                        </div>
                      </div>
                    )}

                    {heroActiveTab === 'ppt' && (
                      <div className="bg-[#221F1A] border border-white/10 rounded-xl p-3 space-y-1.5 text-white">
                        <span className="text-[8.5px] text-[#C9A875] font-bold uppercase tracking-wider">Slide 01 of 08 • Executive Pitch</span>
                        <h4 className="text-xs font-bold leading-tight">The Next Generation of Unified Developer Workspaces</h4>
                        <ul className="text-[10px] text-[#DDD4C5] space-y-1 list-disc pl-3">
                          <li>Consolidates code, document design & presentations</li>
                          <li>Zero-latency interactive artifact sandbox</li>
                        </ul>
                      </div>
                    )}

                    {heroActiveTab === 'image' && (
                      <div className="bg-[#221F1A] border border-white/10 rounded-xl p-3 text-center space-y-1.5 text-white">
                        <div className="w-8 h-8 rounded-lg bg-[#372E15] text-[#C9A875] flex items-center justify-center mx-auto">
                          <ImageIcon size={16} />
                        </div>
                        <p className="text-xs font-bold">Cinematic 4K Synthesis</p>
                        <p className="text-[9.5px] text-[#8E8A82]">Volumetric ray tracing & photorealism</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8E8A82]">
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

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="mt-10 flex flex-col items-center justify-center gap-1 text-[#696256] text-xs font-medium cursor-pointer"
          onClick={() => scrollTo('features')}
        >
          <span>Scroll to explore capabilities</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ========================================================
          3. SCROLL-ANIMATED CAPABILITIES (LEFT/RIGHT FLY-IN CARDS)
      ======================================================== */}
      <section id="features" className="py-20 lg:py-28 bg-[#FAF8F3]/90 border-y border-[#DDD3C1] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Autonomous Intelligence
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
              8 Specialized Agents.<br />One Contextual Canvas.
            </h2>
            <p className="text-sm sm:text-base text-[#554E43] leading-relaxed">
              Every agent executes with specialized domain heuristics. Notice how each card glides into view with dedicated tools and artifact outputs.
            </p>
          </div>

          {/* Cards Flying In from Left and Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon
              const isEven = idx % 2 === 0 // Even index flies from Left, Odd index flies from Right!

              return (
                <motion.div
                  key={cap.id}
                  initial={{ opacity: 0, x: isEven ? -60 : 60, y: 30 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  onClick={() => onStartChat && onStartChat(cap.id)}
                  className="bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-3xl p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${cap.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-[#1E1B18] tracking-tight group-hover:text-black">
                            {cap.title}
                          </h3>
                          <span className="text-[10.5px] font-semibold text-[#696256] block">
                            {cap.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#4A653C] bg-[#E8DDC8] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {cap.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#554E43] leading-relaxed">
                      {cap.desc}
                    </p>

                    <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#DDD3C1]/80 text-xs text-[#696256]">
                      <span className="text-[10px] font-bold text-[#4A653C] uppercase tracking-wider block mb-0.5">Prompt Example</span>
                      <p className="text-[#1E1B18] font-medium truncate">"{cap.sample}"</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#DDD3C1] flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                    <span>Launch in Workspace</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          4. HOW IT WORKS (STAGGERED PIPELINE ANIMATIONS)
      ======================================================== */}
      <section id="how-it-works" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
            Execution Flow
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
            From Natural Thought to Production Artifact
          </h2>
          <p className="text-sm text-[#554E43]">
            How Aivora's intelligent engine coordinates complex creation workflows seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              num: "01",
              title: "Multi-Modal Input",
              desc: "Provide natural text in English or Hindi/Hinglish. Attach reference PDFs, drop images, or dictate with hands-free voice."
            },
            {
              num: "02",
              title: "Specialized Routing",
              desc: "Deterministic heuristics and intelligent intent classification automatically route your request to the exact specialized creation engine."
            },
            {
              num: "03",
              title: "Artifact Compilation",
              desc: "Software compiles into Monaco sandboxes; documents convert to A4 PDFs; presentations compile into vector PPTX slide decks."
            },
            {
              num: "04",
              title: "Live Execution & Sync",
              desc: "Preview live apps directly in the browser, export one-click files, and keep history organized with search, pinning, and renaming."
            }
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-6 space-y-3 shadow-2xs hover:shadow-md transition-shadow relative"
            >
              <span className="font-display text-4xl font-extrabold text-[#C8BEAC] block">{step.num}</span>
              <h3 className="font-display text-base font-bold text-[#1E1B18]">{step.title}</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. PRODUCT SHOWCASE (INTERACTIVE ARTIFACT PLAYGROUND)
      ======================================================== */}
      <section id="showcase" className="py-20 bg-[#FAF8F3]/90 border-y border-[#DDD3C1] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Studio Artifacts
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
              Experience True Multi-Modal Depth
            </h2>
            <p className="text-sm text-[#554E43]">
              No more static mockups. Aivora creates real, functional, interactive outputs.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="bg-[#F5EFE3] border border-[#DDD3C1] rounded-3xl p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider bg-[#E6DCC9] px-3 py-1 rounded-full">
                Unified Creative Canvas
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
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
          </motion.div>

        </div>
      </section>

      {/* ========================================================
          6. WHY AIVORA AI (VALUE PROPOSITION WITH LEFT/RIGHT GLIDES)
      ======================================================== */}
      <section id="why-aivora" className="py-20 lg:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              The Aivora Advantage
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
              Why Switch to Aivora AI?
            </h2>
            <p className="text-sm text-[#696256]">
              Replace 5+ fragmented subscriptions with one unified, domain-expert platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-7 space-y-3.5 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <Layers size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1E1B18]">Zero Context Switching</h3>
              <p className="text-xs text-[#554E43] leading-relaxed">
                Never copy-paste code snippets into external sandboxes or slide scripts into presentation apps. Aivora compiles outputs inside your active session.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-7 space-y-3.5 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <Zap size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1E1B18]">Domain-Specific Quality</h3>
              <p className="text-xs text-[#554E43] leading-relaxed">
                Specialized execution models tailored for each discipline. You get clean semantic code, ATS-compliant resumes, and investor-ready presentation decks.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-7 space-y-3.5 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1E1B18]">Privacy & Cloud Sync</h3>
              <p className="text-xs text-[#554E43] leading-relaxed">
                Enterprise session management with Redis and MongoDB. Your documents, code projects, and custom presentations are securely saved and exportable anytime.
              </p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6.5. TRANSPARENT CREDIT PACKAGES & PRICING
      ======================================================== */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#FAF8F3]/90 border-t border-[#DDD3C1] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Pay As You Use
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
              Simple, Transparent AI Credits
            </h2>
            <p className="text-sm text-[#554E43]">
              No subscriptions or surprise recurring billing. Purchase credits whenever you need, with lifetime validity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                code: 'starter',
                name: 'Starter',
                price: 49,
                credits: 500,
                desc: 'Ideal for trying out all models and test projects.',
                features: ['500 AI credits (~50,000 words)', 'All 8 AI specialized modes', 'Interactive code sandbox', 'Vector PDF resume exports']
              },
              {
                code: 'basic',
                name: 'Basic',
                price: 99,
                credits: 1200,
                desc: 'Suitable for students and regular creators.',
                features: ['1,200 AI credits (~150,000 words)', 'High-speed Groq & Gemini', 'PowerPoint presentation engine', 'Cloud conversation sync']
              },
              {
                code: 'pro',
                name: 'Pro',
                price: 199,
                credits: 3000,
                recommended: true,
                desc: 'Most popular for active developers & creators.',
                features: ['3,000 AI credits (~400,000 words)', 'Priority high-speed execution', 'Unlimited code preview runners', '4K cinematic image synthesis', 'Real-time live web research']
              },
              {
                code: 'premium',
                name: 'Premium',
                price: 499,
                credits: 9000,
                desc: 'Designed for intensive enterprise workflows.',
                features: ['9,000 AI credits (~1,200,000 words)', 'DeepSeek reasoning models', 'Highest priority execution queue', 'Multi-modal document parsing', 'Priority technical support']
              }
            ].map((plan, idx) => (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-200 ${
                  plan.recommended
                    ? 'bg-[#1E2B1F] text-white shadow-xl border-2 border-[#C9A875]'
                    : 'bg-[#F4EEE2] hover:bg-[#EAE2D2] text-[#1E1B18] border border-[#DDD3C1] shadow-2xs hover:shadow-md'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C9A875] to-[#E8A338] text-[#1E2B1F] text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Award size={11} /> Recommended
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight">{plan.name}</h3>
                    <p className={`text-xs mt-1 ${plan.recommended ? 'text-[#CBD8CA]' : 'text-[#554E43]'}`}>{plan.desc}</p>
                  </div>

                  <div className="pt-2 pb-2 border-y border-current/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold">₹</span>
                      <span className="text-4xl font-extrabold font-display">{plan.price}</span>
                      <span className={`text-xs ${plan.recommended ? 'text-[#CBD8CA]' : 'text-[#696256]'}`}>one-time</span>
                    </div>
                    <p className={`text-xs font-bold pt-1 ${plan.recommended ? 'text-[#C9A875]' : 'text-[#1E2B1F]'}`}>
                      {plan.credits.toLocaleString()} AI Credits
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={14} className={plan.recommended ? 'text-[#4ADE80]' : 'text-[#1E2B1F]'} />
                        <span className={plan.recommended ? 'text-white/90' : 'text-[#1E1B18]'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-current/10">
                  <button
                    onClick={() => dispatch(openPricingModal())}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-xs ${
                      plan.recommended
                        ? 'bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F]'
                        : 'bg-[#1E2B1F] hover:bg-[#283A27] text-white'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Buy {plan.name} Plan</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          7. HIGH-IMPACT FINAL CALL TO ACTION
      ======================================================== */}
      <section className="py-20 sm:py-28 bg-[#1E2B1F] text-[#FAF8F3] relative overflow-hidden z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#3E553D]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#C9A875]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="bg-[#2B3C2A] text-[#E8DDC8] border border-[#3E553D] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Ready to Upgrade Your AI Workflow?
          </span>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
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
      <footer className="bg-[#141F15] text-[#8EA58C] border-t border-white/10 py-14 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-7 h-7 rounded-lg bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <span className="font-display text-base font-bold tracking-tight">Aivora AI</span>
              </div>
              <p className="text-[11.5px] leading-relaxed max-w-xs text-[#CBD8CA]/80">
                One AI Workspace. Endless Possibilities. Unified multi-agent architecture for software engineering, executive publications, and visual design.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#4ADE80]">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span>All 8 Agent Services Operational</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Product</p>
              <ul className="space-y-2">
                <li><button onClick={() => onStartChat && onStartChat()} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Workspace Canvas</button></li>
                <li><button onClick={() => scrollTo('features')} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Capabilities</button></li>
                <li><button onClick={() => scrollTo('showcase')} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Artifact Studios</button></li>
                <li><button onClick={onOpenExplore} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Explore Modes</button></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Studios</p>
              <ul className="space-y-2">
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('coding')}>Code Sandbox</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('pdf')}>PDF Generator</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('ppt')}>Slide Decks</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('image')}>Image Studio</span></li>
              </ul>
            </div>

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
