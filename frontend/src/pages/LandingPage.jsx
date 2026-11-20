// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { openPricingModal } from '../redux/creditSlice.js'
import { 
  Sparkles, MessageSquare, Code2, ImageIcon, FileText, 
  Presentation, Globe, Mic, LayoutDashboard, ArrowRight, 
  CheckCircle2, Download, ExternalLink, Layers, 
  ShieldCheck, Zap, Menu, X, ArrowUpRight, Play,
  ChevronDown, Terminal, Check, CreditCard, Award, Star
} from 'lucide-react'

// ─── Floating Orb Background ────────────────────────────────────────────────
function FloatingOrbs() {
  const orbs = [
    { size: 600, x: '10%', y: '10%', color: 'rgba(74,222,128,0.07)', duration: 25 },
    { size: 500, x: '80%', y: '20%', color: 'rgba(201,168,117,0.09)', duration: 30 },
    { size: 400, x: '30%', y: '70%', color: 'rgba(96,165,250,0.06)', duration: 22 },
    { size: 350, x: '70%', y: '80%', color: 'rgba(192,132,252,0.06)', duration: 28 },
  ]
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[100px]"
          style={{ width: orb.size, height: orb.size, background: orb.color, left: orb.x, top: orb.y }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── Magnetic Button ────────────────────────────────────────────────────────
function MagneticButton({ children, className, onClick, strength = 0.3 }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }, [x, y, strength])

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.button>
  )
}

// ─── Animated Counter ───────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 2 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = value / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, value, duration])

  return <span ref={ref}>{display.toLocaleString()}</span>
}

// ─── Typewriter ─────────────────────────────────────────────────────────────
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
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-[2px] h-[1em] bg-[#1E2B1F] ml-1 inline-block align-middle rounded-full"
      />
    </span>
  )
}

// ─── Spotlight Card ─────────────────────────────────────────────────────────
function SpotlightCard({ children, className, spotlightColor = 'rgba(201,168,117,0.12)' }) {
  const ref = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }, [mouseX, mouseY])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ─── Section Reveal ─────────────────────────────────────────────────────────
function SectionReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function LandingPage({ onStartChat, onOpenLogin, onOpenExplore }) {
  const dispatch = useDispatch()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [heroActiveTab, setHeroActiveTab] = useState('code')
  const [calculatorInput, setCalculatorInput] = useState('2,048')
  const [navbarScrolled, setNavbarScrolled] = useState(false)

  const { scrollY, scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.08], [1, 0.95])
  const progressWidth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const onScroll = () => setNavbarScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileNavOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const typewriterPhrases = [
    "build production-ready full-stack web apps",
    "generate McKinsey-grade pitch decks & slides",
    "craft ATS-compliant executive PDF resumes",
    "synthesize 4K photorealistic cinematic imagery",
    "research live web intelligence with citations",
    "reason through complex scientific mental models"
  ]

  const heroTabs = [
    { id: 'code', label: 'Full-Stack Code', icon: Code2, badge: 'Monaco Live Sandbox', prompt: 'Build a modern responsive calculator with keyboard support', response: 'Code Generated Successfully. Artifact compiled into live interactive sandbox.', meta: 'HTML5 • CSS3 Grid • Vanilla ES6+' },
    { id: 'pdf', label: 'Executive PDF', icon: FileText, badge: 'Puppeteer Vector Engine', prompt: 'Create a 2-page executive resume for a Senior Solutions Architect', response: 'PDF Document Compiled. Formatted with ATS-compliant typography & section layouts.', meta: 'A4 Vector PDF • Clean Typography • Instant Download' },
    { id: 'ppt', label: 'Pitch Decks', icon: Presentation, badge: 'McKinsey Flow Engine', prompt: 'Generate an 8-slide pitch deck on Autonomous Multi-Agent AI Systems', response: 'Presentation Deck Ready. Structured narrative with key metrics & speaker notes.', meta: '16:9 Widescreen • PPTX Vector • Speaker Notes' },
    { id: 'image', label: 'Cinematic Visuals', icon: ImageIcon, badge: '4K Diffusion Synthesis', prompt: 'A majestic golden eagle soaring over snow-capped alpine mountains at sunset', response: 'Photorealistic image synthesized with atmospheric volumetric lighting.', meta: '4K Ultra-HD • Volumetric Rays • Photorealistic' }
  ]

  const activeHero = heroTabs.find(t => t.id === heroActiveTab) || heroTabs[0]

  const capabilities = [
    { id: 'coding', title: "AI Coding & Live Sandbox", category: "Staff Software Architect", desc: "Generate complete, production-grade web applications in HTML5, CSS3, and ES6+. Preview output instantly in Monaco Editor with zero setup.", icon: Code2, color: "bg-[#1E2B1F] text-[#4ADE80]", badge: "Real-Time Runner", sample: "Build an interactive calculator with responsive styling" },
    { id: 'pdf', title: "Executive PDF & Resumes", category: "Publication Designer", desc: "Produce ATS-compliant executive resumes, corporate whitepapers, and itemized billing invoices rendered into print-ready A4 vector PDFs via Puppeteer.", icon: FileText, color: "bg-[#3A1E1E] text-[#F87171]", badge: "Vector A4 Export", sample: "Generate a 2-page Senior React Engineer resume" },
    { id: 'ppt', title: "PowerPoint Pitch Decks", category: "McKinsey Flow Specialist", desc: "Craft structured, high-impact PowerPoint presentations with clear narrative architecture, quantitative metrics, and ready-to-deliver speaker notes.", icon: Presentation, color: "bg-[#372E15] text-[#FBBF24]", badge: "16:9 Slide Engine", sample: "Create an 8-slide AI SaaS investor deck" },
    { id: 'image', title: "Cinematic Visual Synthesis", category: "Creative Visual Director", desc: "Translate natural language prompts into photorealistic imagery, brand concept art, and high-resolution wallpapers with expanded prompt physics.", icon: ImageIcon, color: "bg-[#3D2D1E] text-[#F3C474]", badge: "4K Photorealism", sample: "Futuristic sustainable architecture at dusk" },
    { id: 'chat', title: "Polymath Consultation & Reasoning", category: "Senior Research Fellow", desc: "Deep conceptual reasoning, mental models, mathematical proofs, and structured analysis across science, business, and literature with zero fluff.", icon: MessageSquare, color: "bg-[#243223] text-[#E8DDC8]", badge: "High Signal", sample: "Explain quantum computing mental models simply" },
    { id: 'search', title: "Real-Time Web Intelligence", category: "Senior Intelligence Analyst", desc: "Query live web engines, synthesize breaking news, extract citations, and curate relevant media without dumping raw unstructured JSON.", icon: Globe, color: "bg-[#1E2C3A] text-[#60A5FA]", badge: "Live Citations", sample: "Latest breakthroughs in fusion energy" },
    { id: 'voice', title: "Hands-Free Voice Interaction", category: "Voice Dictation", desc: "Speak naturally using browser speech recognition. Speak your thoughts and let Aivora orchestrate them directly into artifacts.", icon: Mic, color: "bg-[#2E1E3A] text-[#C084FC]", badge: "Speech-to-Text", sample: "Voice dictation available in chat toolbar" },
    { id: 'workspace', title: "Smart Workspace & History", category: "Unified Platform", desc: "Live 3-column dashboard with artifact previews, search filtering, pinning, renaming, and persistent multi-agent orchestration.", icon: LayoutDashboard, color: "bg-[#1E2E25] text-[#34D399]", badge: "Unified Canvas", sample: "Explore the 3-column live workspace" }
  ]

  return (
    <div className="w-full bg-[#D8CDBA] bg-[radial-gradient(circle_at_15%_15%,#E6D9C4_0%,transparent_40%),radial-gradient(circle_at_85%_10%,#E2D4BF_0%,transparent_45%),radial-gradient(circle_at_50%_80%,#CFC1AA_0%,transparent_50%),linear-gradient(135deg,#D8CDBA_0%,#CFC1AA_50%,#D5C8B4_100%)] text-[#1E1B18] selection:bg-[#1E2B1F] selection:text-[#E8DDC8] relative">
      
      <FloatingOrbs />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C9A875] via-[#4ADE80] to-[#C9A875] origin-left z-[100]"
        style={{ scaleX: progressWidth }}
      />

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50 z-0" />

      {/* ═══════════════════════════════════════════════════════════════════
          1. FLOATING NAVBAR
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.header
        className="sticky top-0 z-50 px-3 sm:px-6 max-w-7xl mx-auto pt-3 sm:pt-4"
        animate={{
          paddingTop: navbarScrolled ? '8px' : '16px',
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`backdrop-blur-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 flex items-center justify-between relative z-10 transition-all duration-300 ${
            navbarScrolled 
              ? 'bg-[#FAF8F3]/95 border-[#C9A875]/40 shadow-[0_12px_40px_rgba(40,32,20,0.12)]' 
              : 'bg-[#FAF8F3]/80 border-[#DDD3C1]/80 shadow-[0_8px_32px_rgba(40,32,20,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]'
          } border`}
        >
          <motion.div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group select-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-9 h-9 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-base shadow-md"
            >
              A
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-[#1E1B18] group-hover:text-[#1E2B1F] transition-colors">Aivora AI</span>
              <motion.span
                animate={{ boxShadow: ['0 0 0 rgba(201,168,117,0)', '0 0 12px rgba(201,168,117,0.4)', '0 0 0 rgba(201,168,117,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-[#1E2B1F] text-[#E8DDC8] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              >
                PRO
              </motion.span>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#5A5347]">
            {['features', 'showcase', 'how-it-works', 'why-aivora', 'pricing'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className="relative group hover:text-[#1E1B18] transition-colors bg-transparent border-none cursor-pointer"
              >
                {item === 'features' ? 'Capabilities' : item === 'showcase' ? 'Live Showcase' : item === 'how-it-works' ? 'Architecture' : item === 'why-aivora' ? 'Why Aivora' : 'Pricing'}
                <motion.span className="absolute -bottom-1 left-0 h-[2px] bg-[#C9A875] rounded-full" initial={{ width: 0 }} whileHover={{ width: '100%' }} transition={{ duration: 0.3 }} />
              </button>
            ))}
            <button
              onClick={onOpenExplore}
              className="text-[#3A5538] hover:text-[#1E2B1F] flex items-center gap-1.5 font-bold bg-[#E8DDC8]/60 hover:bg-[#E8DDC8] px-3 py-1.5 rounded-xl transition-colors border-none cursor-pointer"
            >
              <Sparkles size={13} className="text-[#C9A875]" />
              <span>Explore 8 Modes</span>
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <button onClick={onOpenLogin} className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer">
              Sign In
            </button>
            <MagneticButton
              onClick={() => onStartChat && onStartChat()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-[0_4px_14px_rgba(25,45,32,0.22)] hover:shadow-lg transition-all border-none cursor-pointer flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </MagneticButton>
          </div>

          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2 rounded-xl text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors bg-transparent border-none cursor-pointer">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </motion.div>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden mt-2 bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-4 shadow-2xl flex flex-col gap-2 relative z-20 overflow-hidden"
            >
              {['features', 'showcase', 'how-it-works', 'why-aivora', 'pricing'].map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(item)}
                  className="text-left text-xs font-bold text-[#1E1B18] py-2.5 px-3 rounded-xl hover:bg-[#F2ECE0] bg-transparent border-none transition-colors"
                >
                  {item === 'features' ? 'Capabilities' : item === 'showcase' ? 'Live Showcase' : item === 'how-it-works' ? 'Architecture' : item === 'why-aivora' ? 'Why Aivora' : 'Pricing'}
                </motion.button>
              ))}
              <div className="pt-2 border-t border-[#DDD3C1] flex flex-col gap-2">
                <button onClick={() => { setMobileNavOpen(false); onOpenLogin(); }} className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#E8DDC8] text-[#1E1B18] border border-[#DDD3C1] cursor-pointer">
                  Sign In
                </button>
                <button onClick={() => { setMobileNavOpen(false); onStartChat(); }} className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] text-white border-none cursor-pointer flex items-center justify-center gap-2">
                  <span>Start Chatting Free</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══════════════════════════════════════════════════════════════════
          2. HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
      >
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Engine Pill */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F3]/95 border border-[#DDD3C1] shadow-sm backdrop-blur-md"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_10px_rgba(74,222,128,0.8)]"
            />
            <span className="text-[11px] font-bold text-[#1E2B1F] tracking-wide uppercase">Aivora Multi-Agent Platform</span>
            <span className="text-[#998F80] text-[11px]">•</span>
            <span className="text-[11px] text-[#554E43] font-medium">Domain-Expert Intelligence</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[76px] font-extrabold tracking-[-0.035em] text-[#141413] leading-[1.05] sm:leading-[1.06]">
              One AI Workspace.<br />
              <motion.span
                className="bg-gradient-to-r from-[#1E2B1F] via-[#2D452E] to-[#99793E] bg-clip-text text-transparent inline-block"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Endless Possibilities.
              </motion.span>
            </h1>

            {/* Prompt Capsule */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="pt-1 pb-1"
            >
              <motion.div
                whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(40,32,20,0.12)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="inline-flex items-center gap-2.5 sm:gap-3.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-[#FAF8F3]/95 border border-[#D5C9B4] shadow-[0_8px_28px_rgba(40,32,20,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md max-w-2xl mx-auto"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-7 h-7 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center shrink-0 shadow-sm"
                >
                  <Sparkles size={14} className="text-[#C9A875]" />
                </motion.div>
                <div className="text-xs sm:text-sm text-left truncate flex items-center gap-1.5">
                  <span className="text-[#7D7567] font-medium shrink-0">Ask Aivora to</span>
                  <TypewriterText words={typewriterPhrases} />
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#EAE2D2] text-[#554E43] ml-auto border border-[#DDD3C1] shrink-0">Auto ↵</span>
              </motion.div>
            </motion.div>

            {/* Status Pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3 text-[11px] font-mono text-[#696256] pt-1"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FAF8F3]/85 border border-[#D5C9B4]/80 shadow-sm">
                <span className="flex items-center gap-1.5 font-bold text-[#1E2B1F] uppercase tracking-wider text-[10px]">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-[#4ADE80]"
                  />
                  Multi-Agent Graph 2026
                </span>
                <span className="text-[#C8BEAC]">•</span>
                <span className="text-[10.5px] text-[#554E43] font-semibold">8 Autonomous Models Active</span>
                <div className="w-14 h-1.5 bg-[#DDD3C1] rounded-full overflow-hidden hidden sm:block">
                  <motion.div
                    animate={{ width: ['20%', '88%', '20%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-[#C9A875] via-[#E8A338] to-[#4ADE80] rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Supporting Text */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-sm sm:text-base text-[#554E43] leading-relaxed max-w-2xl mx-auto font-normal"
          >
            Stop switching between separate AI subscriptions. Aivora coordinates specialized sub-agents for software architecture, executive resumes, McKinsey-grade slides, and photorealistic art.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <MagneticButton
              onClick={() => onStartChat && onStartChat()}
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-[0_6px_20px_rgba(25,45,32,0.28)] hover:shadow-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2.5 group"
            >
              <span>Get Started Free</span>
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight size={16} />
              </motion.span>
            </MagneticButton>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollTo('features')}
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#FAF8F3] hover:bg-[#F2ECE0] text-[#1E1B18] border border-[#DDD3C1] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={15} className="text-[#4A653C]" />
              <span>Explore Capabilities</span>
            </motion.button>
          </motion.div>

          {/* Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[#696256]"
          >
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: CheckCircle2, text: '8 Autonomous Models' },
              { icon: CheckCircle2, text: 'Instant guest access' },
            ].map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-1.5 font-medium"
              >
                <item.icon size={14} className="text-[#4A653C]" />
                {item.text}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* ═══ HERO WORKSPACE SHOWCASE ═══ */}
        <motion.div
          initial={{ y: 80, opacity: 0, rotateX: 8 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto mt-12 sm:mt-16"
          style={{ perspective: 1200 }}
        >
          <div className="rounded-3xl bg-[#C5BBA8]/80 p-2 sm:p-3 border border-[#DDD3C1] shadow-[0_30px_80px_-20px_rgba(30,43,31,0.4),0_0_0_1px_rgba(255,255,255,0.4)] backdrop-blur-xl">
            
            {/* Top Bar */}
            <div className="bg-[#FAF8F3] rounded-t-2xl px-4 py-2.5 border-b border-[#DDD3C1] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <motion.span whileHover={{ scale: 1.3 }} className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer" />
                <motion.span whileHover={{ scale: 1.3 }} className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] cursor-pointer" />
                <motion.span whileHover={{ scale: 1.3 }} className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] cursor-pointer" />
                <span className="font-mono text-[11px] font-semibold text-[#8B8476] ml-2">aivora-workspace.app</span>
              </div>

              <div className="flex items-center gap-1 bg-[#F2ECE0] p-1 rounded-xl border border-[#DDD3C1]">
                {heroTabs.map((t) => {
                  const Icon = t.icon
                  const isActive = heroActiveTab === t.id
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setHeroActiveTab(t.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        isActive ? 'bg-[#1E2B1F] text-white border-[#1E2B1F] shadow-sm' : 'bg-transparent text-[#696256] border-transparent hover:text-[#1E1B18]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-[#1E2B1F] rounded-lg"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon size={12} />
                        <span className="hidden sm:inline">{t.label}</span>
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#4A653C] font-bold">
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                <span>Interactive Runner</span>
              </div>
            </div>

            {/* 3-Column Preview */}
            <div className="grid grid-cols-12 gap-0 sm:gap-2 h-[400px] sm:h-[440px] bg-[#D8CDBA] rounded-b-2xl overflow-hidden">
              
              {/* Sidebar */}
              <div className="hidden md:flex md:col-span-3 bg-[#1E2B1F]/95 p-3 flex-col justify-between border-r border-white/10 text-[#CBD8CA] select-none">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-[9px]">A</div>
                      <span className="text-xs font-bold text-white tracking-tight">Aivora AI</span>
                      <span className="bg-[#2B3C2A] text-[#E8DDC8] text-[8px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#E8DDC8] text-[#1E2B1F] text-xs font-bold text-center shadow-sm cursor-pointer"
                  >
                    + New Chat
                  </motion.div>
                  <div className="space-y-1 pt-1">
                    <span className="text-[9px] font-bold text-[#8EA58C] uppercase tracking-wider px-1">Recents</span>
                    <motion.div
                      initial={{ backgroundColor: 'rgba(45,64,44,0)' }}
                      animate={{ backgroundColor: 'rgba(45,64,44,1)' }}
                      className="border border-[#435E41] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium flex items-center justify-between"
                    >
                      <span className="truncate">{activeHero.prompt.slice(0, 22)}...</span>
                      <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                    </motion.div>
                    {['Modern Calculator v2', 'Sequoia Pitch Deck', 'Lead Architect CV'].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 3 }}
                        className="text-[#CBD8CA] text-xs px-2.5 py-1 truncate cursor-pointer hover:text-white transition-colors"
                      >
                        {item}
                      </motion.div>
                    ))}
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

              {/* Chat Canvas */}
              <div className="col-span-12 md:col-span-5 bg-[#FAF8F3] p-3 sm:p-4 flex flex-col justify-between border-r border-[#DDD3C1] overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#DDD3C1]/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center text-[8px] font-bold">A</div>
                    <span className="text-xs font-bold text-[#1E1B18]">Aivora AI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A653C]" />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeHero.badge}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="text-[10px] font-semibold text-[#4A653C] bg-[#EAE2D2] px-2 py-0.5 rounded-full"
                    >
                      {activeHero.badge}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeHero.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 py-2 overflow-hidden"
                  >
                    <div className="flex justify-end">
                      <div className="bg-[#1E2B1F] text-white text-xs px-3.5 py-2 rounded-2xl max-w-[90%] font-medium shadow-sm">
                        {activeHero.prompt}
                      </div>
                    </div>
                    <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-2xl p-3.5 space-y-2 text-xs shadow-sm">
                      <p className="font-bold text-[#1E1B18]">{activeHero.response}</p>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-[#DDD3C1] rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#4A653C] font-bold">&lt;/&gt;</span>
                          <div>
                            <p className="text-xs font-bold text-[#1E1B18]">{activeHero.label} Artifact</p>
                            <p className="text-[10px] text-[#8B8476]">{activeHero.meta}</p>
                          </div>
                        </div>
                        <motion.span
                          animate={{ boxShadow: ['0 0 0 rgba(74,222,128,0)', '0 0 8px rgba(74,222,128,0.4)', '0 0 0 rgba(74,222,128,0)'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-[#1E2B1F] text-white text-[10px] font-bold px-2 py-1 rounded-lg"
                        >
                          Compiled
                        </motion.span>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl p-2 flex items-center justify-between text-xs">
                  <span className="text-[#8B8476] text-[11px] truncate">Ask anything, generate code, create decks...</span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onStartChat && onStartChat(activeHero.id)}
                    className="w-6 h-6 rounded-lg bg-[#1E2B1F] text-white flex items-center justify-center hover:bg-[#283A27] transition-colors border-none cursor-pointer"
                  >
                    <ArrowRight size={13} />
                  </motion.button>
                </div>
              </div>

              {/* Sandbox */}
              <div className="col-span-12 md:col-span-4 bg-[#181715] p-3.5 flex flex-col justify-between text-white overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
                  <span className="font-mono text-[#4ADE80] font-bold">Interactive Sandbox</span>
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-[10px] font-mono text-[#8E8A82]">LIVE RUNNER</motion.span>
                </div>

                <div className="flex-1 flex flex-col justify-center py-2">
                  <AnimatePresence mode="wait">
                    {heroActiveTab === 'code' && (
                      <motion.div
                        key="code"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#24211D] border border-white/10 rounded-xl p-3 space-y-2 shadow-inner"
                      >
                        <div className="bg-black/50 text-right px-3 py-2 rounded-lg text-lg font-mono text-[#4ADE80] border border-white/5">
                          {calculatorInput}
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-xs text-center font-bold">
                          {[
                            { label: 'C', action: () => setCalculatorInput('0'), style: 'bg-[#3A362F] hover:bg-[#48433A] text-[#CBD8CA]' },
                            { label: '±', action: () => setCalculatorInput('±'), style: 'bg-[#3A362F] hover:bg-[#48433A] text-[#CBD8CA]' },
                            { label: '%', action: () => setCalculatorInput('%'), style: 'bg-[#3A362F] hover:bg-[#48433A] text-[#CBD8CA]' },
                            { label: '÷', action: () => setCalculatorInput(prev => prev + '÷'), style: 'bg-[#C9A875] text-[#1E1B18]' },
                            { label: '7', action: () => setCalculatorInput(prev => prev + '7'), style: 'bg-[#2C2923] hover:bg-[#38342D] text-white' },
                            { label: '8', action: () => setCalculatorInput(prev => prev + '8'), style: 'bg-[#2C2923] hover:bg-[#38342D] text-white' },
                            { label: '9', action: () => setCalculatorInput(prev => prev + '9'), style: 'bg-[#2C2923] hover:bg-[#38342D] text-white' },
                            { label: '×', action: () => setCalculatorInput(prev => prev + '×'), style: 'bg-[#C9A875] text-[#1E1B18]' },
                            { label: '4', action: () => setCalculatorInput(prev => prev + '4'), style: 'bg-[#2C2923] hover:bg-[#38342D] text-white' },
                            { label: '5', action: () => setCalculatorInput(prev => prev + '5'), style: 'bg-[#2C2923] hover:bg-[#38342D] text-white' },
                            { label: '6', action: () => setCalculatorInput(prev => prev + '6'), style: 'bg-[#2C2923] hover:bg-[#38342D] text-white' },
                            { label: '-', action: () => setCalculatorInput(prev => prev + '-'), style: 'bg-[#C9A875] text-[#1E1B18]' },
                          ].map((btn, i) => (
                            <motion.button
                              key={i}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={btn.action}
                              className={`p-2 rounded border-none cursor-pointer ${btn.style}`}
                            >
                              {btn.label}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {heroActiveTab === 'pdf' && (
                      <motion.div
                        key="pdf"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#FAF8F3] text-[#1E1B18] rounded-xl p-3.5 space-y-2 border border-[#DDD3C1]"
                      >
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
                          {['LangGraph', 'React 19', 'Puppeteer'].map((tag) => (
                            <span key={tag} className="text-[8px] bg-[#EAE2D2] px-1.5 py-0.5 rounded font-medium">{tag}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {heroActiveTab === 'ppt' && (
                      <motion.div
                        key="ppt"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#221F1A] border border-white/10 rounded-xl p-3.5 space-y-2 text-white"
                      >
                        <span className="text-[9px] text-[#C9A875] font-bold uppercase tracking-wider">Slide 01 of 08 • Sequoia Pitch</span>
                        <h4 className="text-sm font-bold leading-tight">The Autonomous Multi-Agent Workspace Revolution</h4>
                        <ul className="text-[10.5px] text-[#DDD4C5] space-y-1 list-disc pl-4">
                          <li>Unifies 8 distinct domain expert models</li>
                          <li>Zero-latency interactive artifact sandbox</li>
                        </ul>
                      </motion.div>
                    )}

                    {heroActiveTab === 'image' && (
                      <motion.div
                        key="image"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#221F1A] border border-white/10 rounded-xl p-4 text-center space-y-2 text-white"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-10 h-10 rounded-xl bg-[#372E15] text-[#C9A875] flex items-center justify-center mx-auto"
                        >
                          <ImageIcon size={20} />
                        </motion.div>
                        <p className="text-xs font-bold">Cinematic 4K Synthesis</p>
                        <p className="text-[10px] text-[#8E8A82]">Volumetric ray tracing & photorealism</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8E8A82]">
                  <span>Ready for Instant Export</span>
                  <motion.button
                    whileHover={{ x: 3 }}
                    onClick={() => onStartChat && onStartChat(activeHero.id)}
                    className="text-[#E8DDC8] hover:underline font-bold bg-transparent border-none cursor-pointer"
                  >
                    Open in Canvas &rarr;
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-12 flex flex-col items-center justify-center gap-1 text-[#696256] text-xs font-medium cursor-pointer"
          onClick={() => scrollTo('features')}
        >
          <span>Scroll to explore capabilities</span>
          <ChevronDown size={16} />
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. CAPABILITIES
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 lg:py-28 bg-[#FAF8F3]/90 border-y border-[#DDD3C1] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">Autonomous Intelligence</span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
                8 Specialized Agents.<br />One Contextual Canvas.
              </h2>
              <p className="text-sm sm:text-base text-[#554E43] leading-relaxed">
                Every agent executes with specialized domain heuristics. Notice how each card glides into view with dedicated tools and artifact outputs.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon
              const isEven = idx % 2 === 0
              return (
                <motion.div
                  key={cap.id}
                  initial={{ opacity: 0, x: isEven ? -80 : 80, rotateY: isEven ? -5 : 5 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
                  onClick={() => onStartChat && onStartChat(cap.id)}
                  className="cursor-pointer"
                >
                  <SpotlightCard className="bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#C9A875] rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl group h-full">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className={`w-11 h-11 rounded-2xl ${cap.color} flex items-center justify-center shadow-md`}
                          >
                            <Icon size={22} />
                          </motion.div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-[#1E1B18] tracking-tight group-hover:text-black transition-colors">{cap.title}</h3>
                            <span className="text-[10.5px] font-semibold text-[#696256] block">{cap.category}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#4A653C] bg-[#E8DDC8] px-2.5 py-1 rounded-full uppercase tracking-wider">{cap.badge}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#554E43] leading-relaxed">{cap.desc}</p>
                      <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#DDD3C1]/80 text-xs text-[#696256]">
                        <span className="text-[10px] font-bold text-[#4A653C] uppercase tracking-wider block mb-0.5">Prompt Example</span>
                        <p className="text-[#1E1B18] font-medium truncate">"{cap.sample}"</p>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#DDD3C1] flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                      <span>Launch in Workspace</span>
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ArrowRight size={14} />
                      </motion.span>
                    </div>
                  </SpotlightCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionReveal>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">Execution Flow</span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">From Natural Thought to Production Artifact</h2>
            <p className="text-sm text-[#554E43]">How Aivora's LangGraph multi-agent architecture coordinates complex workflows seamlessly.</p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: '01', title: 'Multi-Modal Input', desc: 'Provide natural text in English or Hindi/Hinglish. Attach reference PDFs, drop images, or dictate with hands-free voice.' },
            { num: '02', title: 'Agent Intent Router', desc: 'Deterministic heuristics and LangGraph intent classification automatically route your request to the exact domain expert model.' },
            { num: '03', title: 'Artifact Compilation', desc: 'Software compiles into Monaco sandboxes; documents convert to A4 PDFs; presentations compile into vector PPTX slide decks.' },
            { num: '04', title: 'Live Execution & Sync', desc: 'Preview live apps directly in the browser, export one-click files, and keep history organized with search, pinning, and renaming.' },
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50, rotateX: 5 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-lg transition-all relative group"
            >
              <motion.span
                className="font-display text-4xl font-extrabold text-[#C8BEAC] block group-hover:text-[#C9A875] transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                {step.num}
              </motion.span>
              <h3 className="font-display text-base font-bold text-[#1E1B18]">{step.title}</h3>
              <p className="text-xs text-[#696256] leading-relaxed">{step.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A875] to-[#4ADE80] rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. SHOWCASE
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="showcase" className="py-20 bg-[#FAF8F3]/90 border-y border-[#DDD3C1] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">Studio Artifacts</span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">Experience True Multi-Modal Depth</h2>
              <p className="text-sm text-[#554E43]">No more static mockups. Aivora creates real, functional, interactive outputs.</p>
            </div>
          </SectionReveal>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="bg-[#F5EFE3] border border-[#DDD3C1] rounded-3xl p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-5 space-y-5">
              <motion.span
                animate={{ boxShadow: ['0 0 0 rgba(201,168,117,0)', '0 0 20px rgba(201,168,117,0.3)', '0 0 0 rgba(201,168,117,0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block text-xs font-bold text-[#4A653C] uppercase tracking-wider bg-[#E6DCC9] px-3 py-1 rounded-full"
              >
                Unified Creative Canvas
              </motion.span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">One thread. Code, presentations, and documents together.</h3>
              <p className="text-xs sm:text-sm text-[#554E43] leading-relaxed">
                Ask Aivora to research an industry, generate an executive summary report, build an interactive calculator for it, and generate an 8-slide pitch deck—all within a single conversation.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  'Real-time reactive code execution runner',
                  'Puppeteer vector PDF rendering engine',
                  'Automated ATS-friendly resume formatting',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-xs font-medium text-[#1E1B18]"
                  >
                    <CheckCircle2 size={16} className="text-[#4A653C]" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
              <div className="pt-2">
                <MagneticButton
                  onClick={() => onStartChat && onStartChat()}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-sm transition-all border-none cursor-pointer flex items-center gap-2"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight size={14} />
                </MagneticButton>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#1A1917] rounded-2xl border border-white/10 p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  {['#EF4444', '#F59E0B', '#10B981'].map((c, i) => (
                    <motion.span key={i} whileHover={{ scale: 1.3 }} className="w-2.5 h-2.5 rounded-full cursor-pointer" style={{ backgroundColor: c }} />
                  ))}
                  <span className="font-mono text-xs text-[#A69F91] ml-2">Aivora Enterprise Pipeline</span>
                </div>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-[10px] font-mono text-[#4ADE80]">READY</motion.span>
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
                {['chatAgent: Senior Consultant (ready)', 'codingAgent: Staff Architect & Sandbox (ready)', 'pdfAgent: Puppeteer Vector Engine (ready)', 'pptAgent: Slide Deck Specialist (ready)'].map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    • {line}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. WHY AIVORA
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="why-aivora" className="py-20 lg:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">The Aivora Advantage</span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">Why Switch to Aivora AI?</h2>
              <p className="text-sm text-[#696256]">Replace 5+ fragmented subscriptions with one unified, domain-expert platform.</p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: 'Zero Context Switching', desc: 'Never copy-paste code snippets into external sandboxes or slide scripts into presentation apps. Aivora compiles outputs inside your active session.', initialX: -60 },
              { icon: Zap, title: 'Staff-Level Intelligence', desc: 'Every agent possesses strict persona constraints and deep heuristics. You get clean semantic code, ATS-compliant resumes, and McKinsey-grade slide narratives.', initialX: 0 },
              { icon: ShieldCheck, title: 'Privacy & Cloud Sync', desc: 'Enterprise session management with Redis and MongoDB. Your documents, code projects, and custom presentations are securely saved and exportable anytime.', initialX: 60 },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: card.initialX, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl p-7 space-y-3.5 shadow-sm hover:shadow-xl transition-all group"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-11 h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold"
                >
                  <card.icon size={22} />
                </motion.div>
                <h3 className="font-display text-lg font-bold text-[#1E1B18]">{card.title}</h3>
                <p className="text-xs text-[#554E43] leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          7. PRICING
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#FAF8F3]/90 border-t border-[#DDD3C1] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">Pay As You Use</span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">Simple, Transparent AI Credits</h2>
              <p className="text-sm text-[#554E43]">No subscriptions or surprise recurring billing. Purchase credits whenever you need, with lifetime validity.</p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { code: 'starter', name: 'Starter', price: 49, credits: 500, desc: 'Ideal for trying out all models and test projects.', features: ['500 AI credits (~50,000 words)', 'All 8 AI specialized modes', 'Interactive code sandbox', 'Vector PDF resume exports'] },
              { code: 'basic', name: 'Basic', price: 99, credits: 1200, desc: 'Suitable for students and regular creators.', features: ['1,200 AI credits (~150,000 words)', 'High-speed Groq & Gemini', 'PowerPoint presentation engine', 'Cloud conversation sync'] },
              { code: 'pro', name: 'Pro', price: 199, credits: 3000, recommended: true, desc: 'Most popular for active developers & architects.', features: ['3,000 AI credits (~400,000 words)', 'Priority LangGraph routing', 'Unlimited code preview runners', '4K cinematic image synthesis', 'Real-time live web research'] },
              { code: 'premium', name: 'Premium', price: 499, credits: 9000, desc: 'Designed for intensive enterprise workflows.', features: ['9,000 AI credits (~1,200,000 words)', 'DeepSeek reasoning models', 'Highest priority execution queue', 'Multi-modal document parsing', 'Priority technical support'] },
            ].map((plan, idx) => (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className={`rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.recommended
                    ? 'bg-[#1E2B1F] text-white shadow-2xl border-2 border-[#C9A875]'
                    : 'bg-[#F4EEE2] hover:bg-[#EAE2D2] text-[#1E1B18] border border-[#DDD3C1] shadow-sm hover:shadow-lg'
                }`}
              >
                {plan.recommended && (
                  <motion.span
                    animate={{ boxShadow: ['0 0 0 rgba(201,168,117,0)', '0 0 20px rgba(201,168,117,0.6)', '0 0 0 rgba(201,168,117,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C9A875] to-[#E8A338] text-[#1E2B1F] text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1"
                  >
                    <Award size={11} /> Recommended
                  </motion.span>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight">{plan.name}</h3>
                    <p className={`text-xs mt-1 ${plan.recommended ? 'text-[#CBD8CA]' : 'text-[#554E43]'}`}>{plan.desc}</p>
                  </div>
                  <div className="pt-2 pb-2 border-y border-current/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold">₹</span>
                      <motion.span
                        className="text-4xl font-extrabold font-display"
                        whileHover={{ scale: 1.1 }}
                      >
                        {plan.price}
                      </motion.span>
                      <span className={`text-xs ${plan.recommended ? 'text-[#CBD8CA]' : 'text-[#696256]'}`}>one-time</span>
                    </div>
                    <p className={`text-xs font-bold pt-1 ${plan.recommended ? 'text-[#C9A875]' : 'text-[#1E2B1F]'}`}>
                      {plan.credits.toLocaleString()} AI Credits
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <Check size={14} className={plan.recommended ? 'text-[#4ADE80]' : 'text-[#1E2B1F]'} />
                        <span className={plan.recommended ? 'text-white/90' : 'text-[#1E1B18]'}>{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6 mt-4 border-t border-current/10">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => dispatch(openPricingModal())}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-sm ${
                      plan.recommended ? 'bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F]' : 'bg-[#1E2B1F] hover:bg-[#283A27] text-white'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Buy {plan.name} Plan</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          8. FINAL CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-[#1E2B1F] text-[#FAF8F3] relative overflow-hidden z-10">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-[#3E553D]/40 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#C9A875]/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-[#2B3C2A] text-[#E8DDC8] border border-[#3E553D] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
          >
            Ready to Upgrade Your AI Workflow?
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            Ready to experience a smarter workspace?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#CBD8CA] max-w-xl mx-auto leading-relaxed"
          >
            Experience the seamless power of 8 domain-expert AI models unified in one continuous canvas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-3 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton
              onClick={() => onStartChat && onStartChat()}
              className="px-8 py-4 rounded-xl text-sm font-bold bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F] shadow-lg transition-all border-none cursor-pointer flex items-center gap-2.5 group"
            >
              <span>Get Started Free</span>
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight size={16} />
              </motion.span>
            </MagneticButton>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenLogin}
              className="px-7 py-4 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
            >
              Sign In with Google
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-[11px] text-[#8EA58C]"
          >
            Instant access • No setup required • Free guest mode available
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          9. FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#141F15] text-[#8EA58C] border-t border-white/10 py-14 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5 text-white">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="w-7 h-7 rounded-lg bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-xs"
                >
                  A
                </motion.div>
                <span className="font-display text-base font-bold tracking-tight">Aivora AI</span>
              </div>
              <p className="text-[11.5px] leading-relaxed max-w-xs text-[#CBD8CA]/80">
                One AI Workspace. Endless Possibilities. Unified multi-agent architecture for software engineering, executive publications, and visual design.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#4ADE80]">
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                <span>All 8 Agent Services Operational</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Product</p>
              <ul className="space-y-2">
                {[
                  { label: 'Workspace Canvas', action: () => onStartChat && onStartChat() },
                  { label: 'Capabilities', action: () => scrollTo('features') },
                  { label: 'Artifact Studios', action: () => scrollTo('showcase') },
                  { label: 'Explore Modes', action: onOpenExplore },
                ].map((item, i) => (
                  <li key={i}>
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={item.action}
                      className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs transition-colors"
                    >
                      {item.label}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Studios</p>
              <ul className="space-y-2">
                {[
                  { label: 'Code Sandbox', id: 'coding' },
                  { label: 'PDF Generator', id: 'pdf' },
                  { label: 'Slide Decks', id: 'ppt' },
                  { label: 'Image Studio', id: 'image' },
                ].map((item, i) => (
                  <li key={i}>
                    <motion.span
                      whileHover={{ x: 3 }}
                      className="hover:text-white cursor-pointer transition-colors inline-block"
                      onClick={() => onStartChat(item.id)}
                    >
                      {item.label}
                    </motion.span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Company</p>
              <ul className="space-y-2">
                {['About Aivora', 'Security & Privacy', 'Terms of Service', 'Contact Support'].map((item, i) => (
                  <li key={i}>
                    <motion.span whileHover={{ x: 3 }} className="hover:text-white cursor-pointer transition-colors inline-block">
                      {item}
                    </motion.span>
                  </li>
                ))}
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