// src/pages/LandingPage.jsx
import React, { useState } from 'react'
import { 
  Sparkles, MessageSquare, Code2, ImageIcon, FileText, 
  Presentation, Globe, Mic, LayoutDashboard, ArrowRight, 
  CheckCircle2, Play, Download, ExternalLink, Layers, 
  ShieldCheck, Zap, ChevronRight, Menu, X, ArrowUpRight
} from 'lucide-react'
import { FcGoogle } from "react-icons/fc"

export default function LandingPage({ onStartChat, onOpenLogin, onOpenExplore }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('code')

  const capabilities = [
    {
      title: "AI Chat & Research",
      desc: "Deep reasoning, mental models, conceptual breakdowns and structured analysis across science, business, and literature.",
      icon: MessageSquare,
      tag: "Polymath Consultant",
      mode: "chat"
    },
    {
      title: "AI Coding & Architecture",
      desc: "Staff-engineer grade code generation, live reactive previews in Monaco editor, bug diagnosis, and exportable project bundles.",
      icon: Code2,
      tag: "Staff Solutions Architect",
      mode: "coding"
    },
    {
      title: "Image Generation",
      desc: "Photorealistic cinematic art, visual concept mockups, vector illustrations, and high-resolution wallpapers with controlled lighting.",
      icon: ImageIcon,
      tag: "Creative Visual Director",
      mode: "image"
    },
    {
      title: "PDF Tools & Resumes",
      desc: "Create ATS-compliant executive resumes, corporate whitepapers, itemized financial invoices, and extract insights from uploaded documents.",
      icon: FileText,
      tag: "Publication Designer",
      mode: "pdf"
    },
    {
      title: "Presentation Generator",
      desc: "Generate complete, structured PowerPoint decks with McKinsey-grade narrative flow, quantitative statistics, and speaker notes.",
      icon: Presentation,
      tag: "Pitch Deck Specialist",
      mode: "ppt"
    },
    {
      title: "AI Live Web Search",
      desc: "Real-time web intelligence querying live search engines, synthesizing citations, and extracting facts without boilerplate.",
      icon: Globe,
      tag: "Intelligence Analyst",
      mode: "search"
    },
    {
      title: "Voice Interaction",
      desc: "Speak naturally with hands-free speech-to-text dictation built directly into the composer. Dictate thoughts seamlessly.",
      icon: Mic,
      tag: "Voice Dictation",
      mode: "chat"
    },
    {
      title: "Smart Workspace",
      desc: "Unified 3-column dashboard: conversation search, pinning, instant artifact previews, and persistent multi-agent workflows.",
      icon: LayoutDashboard,
      tag: "Unified Platform",
      mode: "auto"
    }
  ]

  const showcaseTabs = [
    {
      id: 'code',
      label: 'Code & Live Sandbox',
      icon: Code2,
      headline: 'Interactive Code Generation & Preview Sandbox',
      desc: 'Build full-stack web applications with semantic HTML5, modern CSS, and JavaScript. Preview output directly inside the live runner.',
      samplePrompt: 'generate modern calculator with keyboard support',
      previewType: 'code'
    },
    {
      id: 'pdf',
      label: 'Executive PDF Studio',
      icon: FileText,
      headline: 'Print-Perfect Resumes & Business Documents',
      desc: 'Generate executive resumes, formal corporate proposals, and itemized billing statements rendered into clean vector PDFs.',
      samplePrompt: 'Create a modern 2-page resume for a Lead Frontend Engineer',
      previewType: 'pdf'
    },
    {
      id: 'ppt',
      label: 'Slide Deck Studio',
      icon: Presentation,
      headline: 'McKinsey-Grade PowerPoint Presentations',
      desc: 'Craft investor-ready slide decks with clear problem statements, market size estimations, traction milestones, and speaker notes.',
      samplePrompt: 'Create an 8-slide presentation on Autonomous AI Agents',
      previewType: 'ppt'
    },
    {
      id: 'image',
      label: 'Cinematic Image Studio',
      icon: ImageIcon,
      headline: 'High-Fidelity Visual & Architectural Synthesis',
      desc: 'Translate natural language prompts into photorealistic imagery, brand concept art, and digital illustrations.',
      samplePrompt: 'A futuristic sustainable treehouse architecture at dusk',
      previewType: 'image'
    }
  ]

  return (
    <div className="min-h-screen w-full bg-[#D8CDBA] bg-[radial-gradient(circle_at_15%_20%,#E6D9C4_0%,transparent_45%),radial-gradient(circle_at_85%_15%,#E2D4BF_0%,transparent_50%),radial-gradient(circle_at_50%_85%,#CFC1AA_0%,transparent_60%),linear-gradient(135deg,#D8CDBA_0%,#CFC1AA_50%,#D5C8B4_100%)] text-[#1E1B18] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#243223] selection:text-[#E8DDC8]">
      
      {/* ========================================================
          1. NAVIGATION BAR
      ======================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF8F3]/85 border-b border-[#DDD3C1]/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-base shadow-sm">
              A
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#1E1B18]">Aivora AI</span>
              <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#696256]">
            <a href="#features" className="hover:text-[#1E1B18] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#1E1B18] transition-colors">How It Works</a>
            <a href="#showcase" className="hover:text-[#1E1B18] transition-colors">Product Showcase</a>
            <a href="#why-aivora" className="hover:text-[#1E1B18] transition-colors">Why Aivora</a>
            <button 
              onClick={onOpenExplore}
              className="text-[#4A653C] hover:text-[#1E2B1F] flex items-center gap-1 font-bold bg-transparent border-none cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Explore Modes</span>
            </button>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E1B18] hover:bg-[#EAE2D2] transition-colors border-none bg-transparent cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onStartChat}
              className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-xs hover:shadow-md transition-all border-none cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg text-[#1E1B18] hover:bg-[#EAE2D2] bg-transparent border-none cursor-pointer"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#FAF8F3] border-b border-[#DDD3C1] px-5 py-4 flex flex-col gap-3 animate-in slide-in-from-top duration-200">
            <a 
              href="#features" 
              onClick={() => setMobileNavOpen(false)}
              className="text-xs font-semibold text-[#1E1B18] py-1.5"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileNavOpen(false)}
              className="text-xs font-semibold text-[#1E1B18] py-1.5"
            >
              How It Works
            </a>
            <a 
              href="#showcase" 
              onClick={() => setMobileNavOpen(false)}
              className="text-xs font-semibold text-[#1E1B18] py-1.5"
            >
              Product Showcase
            </a>
            <a 
              href="#why-aivora" 
              onClick={() => setMobileNavOpen(false)}
              className="text-xs font-semibold text-[#1E1B18] py-1.5"
            >
              Why Aivora
            </a>
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
                <span>Start Chatting</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION
      ======================================================== */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
              
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F3]/90 border border-[#DDD3C1] shadow-2xs backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span className="text-[11px] font-bold text-[#1E2B1F] tracking-wide uppercase">
                  Multi-Agent Architecture 2.4
                </span>
                <span className="text-[#8B8476] text-[11px]">•</span>
                <span className="text-[11px] text-[#696256] font-medium">Domain-Expert Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#1E1B18] leading-[1.12]">
                One AI Workspace.<br />
                <span className="text-[#1E2B1F] underline decoration-[#A9C0A4] underline-offset-8">
                  Endless Possibilities.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#554E43] leading-relaxed max-w-xl">
                Your intelligent workspace to chat, create, code, research and turn ideas into reality. Replaces disjointed tools with unified, domain-expert multi-agents.
              </p>

              {/* Two CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2 w-full sm:w-auto">
                <button
                  onClick={onStartChat}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-[0_4px_14px_rgba(25,45,32,0.25)] hover:shadow-lg transition-all border-none cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Start Chatting</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('features')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-[#FAF8F3]/90 hover:bg-[#FAF8F3] text-[#1E1B18] border border-[#DDD3C1] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} className="text-[#4A653C]" />
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#696256]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#4A653C]" />
                  <span>Interactive Sandboxes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#4A653C]" />
                  <span>Vector PDF & PPTX Decks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#4A653C]" />
                  <span>No Setup Required</span>
                </div>
              </div>

            </div>

            {/* Right Hero Product Visual (Realistic 3-Column Aivora AI Mockup) */}
            <div className="lg:col-span-6 relative">
              
              {/* Warm Ambient Glow behind the mockup */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#9EB698]/30 via-[#E4D1AC]/40 to-[#789477]/20 rounded-3xl blur-2xl -z-10" />

              {/* Mockup Outer Frame */}
              <div className="relative rounded-2xl bg-[#C8BEAC] p-2 sm:p-3 border border-[#DDD3C1] shadow-[0_20px_50px_-15px_rgba(30,43,31,0.35)] backdrop-blur-xl">
                
                {/* 3-Panel Mini Preview Grid */}
                <div className="grid grid-cols-12 gap-1.5 sm:gap-2 h-[380px] sm:h-[420px] rounded-xl overflow-hidden bg-[#D8CDBA]">
                  
                  {/* Panel 1: Left Mini Sidebar (Forest Green Glass) */}
                  <div className="col-span-3 bg-[#1E2B1F]/95 p-2 sm:p-2.5 flex flex-col justify-between border-r border-white/10 text-white select-none">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-[8px]">
                          A
                        </div>
                        <span className="text-[10px] font-bold tracking-tight">Aivora</span>
                        <span className="bg-[#2B3C2A] text-[#E8DDC8] text-[7px] font-bold px-1 rounded-full">PRO</span>
                      </div>

                      <div className="py-1 px-1.5 bg-[#E8DDC8] text-[#1E2B1F] rounded-lg text-[8.5px] font-bold text-center">
                        + New Chat
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="text-[7.5px] font-bold text-[#8EA58C] uppercase tracking-wider px-1">Recents</div>
                        <div className="bg-[#2D402C] border border-[#435E41] rounded-md px-1.5 py-1 text-[8px] flex items-center justify-between text-white font-medium">
                          <span className="truncate">what is js</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                        </div>
                        <div className="text-[#CBD8CA] text-[8px] px-1.5 py-0.5 truncate">Modern Calculator</div>
                        <div className="text-[#CBD8CA] text-[8px] px-1.5 py-0.5 truncate">AI Healthcare PPT</div>
                        <div className="text-[#CBD8CA] text-[8px] px-1.5 py-0.5 truncate">Lead React CV</div>
                      </div>
                    </div>

                    <div className="bg-[#162117] p-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                      <div className="w-5 h-5 rounded-full bg-[#3E553D] flex items-center justify-center text-[8px] font-bold">AK</div>
                      <div className="text-[7.5px] leading-tight min-w-0">
                        <p className="font-semibold text-white truncate">Ayush Kumar</p>
                        <p className="text-[#8EA58C] text-[6.5px]">Pro Tier</p>
                      </div>
                    </div>
                  </div>

                  {/* Panel 2: Center Mini Chat Workspace (Warm Ivory) */}
                  <div className="col-span-5 bg-[#FAF8F3] p-2.5 flex flex-col justify-between border-r border-[#DDD3C1] overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#DDD3C1]/80 pb-1.5">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center text-[7px] font-bold">A</div>
                        <span className="text-[9px] font-bold text-[#1E1B18]">Aivora AI</span>
                        <span className="w-1 h-1 rounded-full bg-[#4A653C]" />
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-2 py-1 overflow-hidden">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="bg-[#243223] text-white text-[8px] px-2 py-1 rounded-lg max-w-[85%] font-medium">
                          generate calculator
                        </div>
                      </div>

                      {/* AI Response Card with Artifact */}
                      <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-lg p-2 space-y-1.5 text-[8px]">
                        <p className="text-[#1E1B18] font-semibold">Code Generated Successfully.</p>
                        
                        {/* Artifact pill */}
                        <div className="bg-white border border-[#DDD3C1] rounded-md p-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[8px] text-[#4A653C] font-bold">&lt;/&gt;</span>
                            <div>
                              <p className="text-[7.5px] font-bold text-[#1E1B18]">generate calculator</p>
                              <p className="text-[6.5px] text-[#8B8476]">Project Artifact v1</p>
                            </div>
                          </div>
                          <span className="bg-[#1E2B1F] text-white text-[7px] px-1.5 py-0.5 rounded font-bold">
                            Open
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Composer */}
                    <div className="bg-[#F2ECE0] border border-[#DDD3C1] rounded-lg p-1.5 flex items-center justify-between">
                      <span className="text-[7.5px] text-[#8B8476]">Ask anything, build apps, request slides...</span>
                      <div className="w-4 h-4 rounded-full bg-[#1E2B1F] text-white flex items-center justify-center text-[8px]">
                        &rarr;
                      </div>
                    </div>

                  </div>

                  {/* Panel 3: Right Mini Preview Runner (Dark Frosted Glass) */}
                  <div className="col-span-4 bg-[#181715] p-2 flex flex-col justify-between text-white overflow-hidden">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[8px]">
                        <span className="font-mono text-[#4ADE80] font-bold">Preview</span>
                        <span className="text-[7px] text-[#8E8A82]">Live Runner</span>
                      </div>

                      {/* Mini Calculator Preview Frame */}
                      <div className="bg-[#23211E] rounded-md p-2 border border-white/10 space-y-1">
                        <div className="bg-black/40 text-right px-1.5 py-1 rounded text-[10px] font-mono text-[#4ADE80]">
                          1,024
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[7px] text-center font-bold">
                          <span className="bg-[#33302A] p-1 rounded">C</span>
                          <span className="bg-[#33302A] p-1 rounded">±</span>
                          <span className="bg-[#33302A] p-1 rounded">%</span>
                          <span className="bg-[#C9A875] text-[#1E1B18] p-1 rounded">÷</span>
                          <span className="bg-[#2A2824] p-1 rounded">7</span>
                          <span className="bg-[#2A2824] p-1 rounded">8</span>
                          <span className="bg-[#2A2824] p-1 rounded">9</span>
                          <span className="bg-[#C9A875] text-[#1E1B18] p-1 rounded">×</span>
                          <span className="bg-[#2A2824] p-1 rounded">4</span>
                          <span className="bg-[#2A2824] p-1 rounded">5</span>
                          <span className="bg-[#2A2824] p-1 rounded">6</span>
                          <span className="bg-[#C9A875] text-[#1E1B18] p-1 rounded">-</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[7px] text-[#8E8A82] text-center">
                      Instant interactive artifact preview
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. FEATURES SECTION (8 CAPABILITIES)
      ======================================================== */}
      <section id="features" className="py-20 bg-[#FAF8F3]/90 border-y border-[#DDD3C1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Comprehensive Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
              8 Specialized Agents. One Unified Canvas.
            </h2>
            <p className="text-sm sm:text-base text-[#696256] leading-relaxed">
              Every agent in Aivora is tuned with senior-level domain expertise, from polymath research to staff software architecture and publication design.
            </p>
          </div>

          {/* Grid of 8 Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon
              return (
                <div
                  key={idx}
                  onClick={() => onStartChat && onStartChat(cap.mode)}
                  className="bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Icon size={19} />
                      </div>
                      <span className="text-[10px] font-bold text-[#4A653C] uppercase tracking-wider">
                        0{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#1E1B18] group-hover:text-black tracking-tight">
                        {cap.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-[#8B8476] uppercase tracking-wider block mt-0.5">
                        {cap.tag}
                      </span>
                    </div>

                    <p className="text-xs text-[#696256] leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#DDD3C1]/80 flex items-center justify-between text-xs font-bold text-[#1E2B1F]">
                    <span>Try Agent</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          4. HOW IT WORKS
      ======================================================== */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Workflow Simplicity
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
              How Aivora AI Powers Your Productivity
            </h2>
            <p className="text-sm text-[#696256]">
              From raw thought to complete interactive project in four intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative overflow-hidden">
              <span className="text-3xl font-extrabold text-[#C8BEAC]">01</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Start a Conversation</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Type your query, upload reference PDF documents, drag images, or use microphone voice dictation.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative overflow-hidden">
              <span className="text-3xl font-extrabold text-[#C8BEAC]">02</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Select Your AI Mode</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Leave on Auto for automatic routing, or explicitly select Coding, PDF Tools, Presentation, or Image mode.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative overflow-hidden">
              <span className="text-3xl font-extrabold text-[#C8BEAC]">03</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Generate, Create or Explore</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Watch code execute live in the right panel, download print-ready PDFs, or inspect slide decks in real-time.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-6 space-y-3 shadow-2xs relative overflow-hidden">
              <span className="text-3xl font-extrabold text-[#C8BEAC]">04</span>
              <h3 className="text-base font-bold text-[#1E1B18]">Save and Revisit</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Conversations are organized with real-time search, renaming, and pinning. Export assets in one click.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          5. PRODUCT SHOWCASE (INTERACTIVE TABS)
      ======================================================== */}
      <section id="showcase" className="py-20 bg-[#FAF8F3]/90 border-y border-[#DDD3C1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-[#4A653C] uppercase tracking-wider">
              Live Product Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
              Experience the Depth of Aivora Artifacts
            </h2>
            <p className="text-sm text-[#696256]">
              Switch through live output formats created by our specialized domain agents.
            </p>
          </div>

          {/* Showcase Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {showcaseTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-[#1E2B1F] text-white border-[#1E2B1F] shadow-sm' 
                      : 'bg-[#F2ECE0] text-[#696256] border-[#DDD3C1] hover:text-[#1E1B18] hover:bg-[#EAE2D2]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Active Tab Showcase Frame */}
          {showcaseTabs.filter(t => t.id === activeTab).map((tab) => (
            <div 
              key={tab.id}
              className="bg-[#F5EFE3] border border-[#DDD3C1] rounded-2xl p-6 sm:p-8 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200"
            >
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DDC8] text-[#1E2B1F] text-[11px] font-bold">
                  <span>Interactive Artifact Studio</span>
                </div>
                <h3 className="text-2xl font-bold text-[#1E1B18] tracking-tight">
                  {tab.headline}
                </h3>
                <p className="text-sm text-[#554E43] leading-relaxed">
                  {tab.desc}
                </p>

                <div className="p-3.5 bg-white border border-[#DDD3C1] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-[#4A653C] uppercase tracking-wider block">Sample Prompt</span>
                  <p className="text-xs font-medium text-[#1E1B18]">"{tab.samplePrompt}"</p>
                </div>

                <button
                  onClick={() => onStartChat && onStartChat(tab.id)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E2B1F] hover:bg-[#283A27] text-white shadow-xs transition-all border-none cursor-pointer flex items-center gap-2"
                >
                  <span>Try in Workspace</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Showcase Visual Window */}
              <div className="lg:col-span-7 bg-[#1A1917] rounded-xl border border-white/10 p-4 shadow-xl text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="font-mono text-[11px] text-[#A69F91] ml-2">Aivora Artifact Previewer</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#4ADE80]">READY</span>
                </div>

                {tab.id === 'code' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-[#24221E] rounded-lg border border-white/10 text-[#DDD4C5]">
                      <span className="text-[#60A5FA]">const</span> calc = <span className="text-[#FBBF24]">new</span> Calculator();<br />
                      calc.<span className="text-[#34D399]">mount</span>(<span className="text-[#F472B6]">'#app'</span>);<br />
                      <span className="text-[#9CA3AF]">// Live runner rendering styles, interactions and state</span>
                    </div>
                    <div className="bg-[#2A2824] p-3 rounded-lg border border-white/5 text-center text-[11px] text-[#A69F91]">
                      [Live HTML/CSS/JS Sandbox View Active]
                    </div>
                  </div>
                )}

                {tab.id === 'pdf' && (
                  <div className="bg-[#FAF8F3] text-[#1E1B18] p-5 rounded-lg space-y-3">
                    <div className="border-b border-[#DDD3C1] pb-2 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">Ayush Kumar</p>
                        <p className="text-[10px] text-[#696256]">Staff Solutions Architect • Senior Engineer</p>
                      </div>
                      <span className="text-[9px] bg-[#1E2B1F] text-white px-2 py-0.5 rounded font-bold">PDF EXPORT</span>
                    </div>
                    <p className="text-xs text-[#554E43]">Specialized in scalable distributed systems, LangGraph agent workflows, and reactive user interfaces.</p>
                  </div>
                )}

                {tab.id === 'ppt' && (
                  <div className="bg-[#23201C] p-5 rounded-lg space-y-2 border border-white/10">
                    <span className="text-[10px] text-[#C9A875] font-bold uppercase tracking-wider">Slide 01 of 08</span>
                    <h4 className="text-base font-bold text-white">The Autonomous AI Workspace Revolution</h4>
                    <ul className="text-xs text-[#DDD4C5] space-y-1 list-disc pl-4">
                      <li>Unifying 8 AI modalities into one contextual thread</li>
                      <li>Zero friction artifact rendering and immediate downloads</li>
                    </ul>
                  </div>
                )}

                {tab.id === 'image' && (
                  <div className="bg-[#25221E] p-6 rounded-lg border border-white/10 text-center space-y-2">
                    <ImageIcon size={32} className="mx-auto text-[#C9A875]" />
                    <p className="text-xs text-[#DDD4C5]">Photorealistic Visual Synthesis Engine</p>
                    <p className="text-[10px] text-[#8E8A82]">Cinematic atmospheric lighting • 4K photorealism • Prompt expansion</p>
                  </div>
                )}

              </div>
            </div>
          ))}

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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
              Why Choose Aivora AI?
            </h2>
            <p className="text-sm text-[#696256]">
              Stop paying for separate AI tools. Experience an integrated multi-agent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-7 space-y-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Unified Ecosystem</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Rather than jumping between ChatGPT, Midjourney, Gamma, and Copilot, Aivora synthesizes code, presentations, PDF reports, and images in one conversation stream.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-7 space-y-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Domain-Expert Agents</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                No generic boilerplate. Every agent executes with specialized prompts and constraints—giving you McKinsey-grade slides and staff-engineer quality software.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl p-7 space-y-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Privacy & Cloud Sync</h3>
              <p className="text-xs text-[#696256] leading-relaxed">
                Enterprise session management with Redis and MongoDB. Your documents, code projects, and custom presentations are securely saved and exportable anytime.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. FINAL HIGH-IMPACT CALL TO ACTION
      ======================================================== */}
      <section className="py-16 sm:py-24 bg-[#1E2B1F] text-[#FAF8F3] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#3E553D]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#C9A875]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="bg-[#2B3C2A] text-[#E8DDC8] border border-[#3E553D] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Ready to Upgrade Your Workflow?
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Ready to experience a smarter workspace?
          </h2>

          <p className="text-sm sm:text-base text-[#CBD8CA] max-w-xl mx-auto leading-relaxed">
            Join thousands of creators, engineers, and researchers leveraging Aivora AI's multi-agent intelligence.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartChat}
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F] shadow-lg transition-all border-none cursor-pointer flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onOpenLogin}
              className="px-7 py-3.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <p className="text-[11px] text-[#8EA58C]">
            Instant access • No credit card required • Free trial available
          </p>
        </div>
      </section>

      {/* ========================================================
          8. FOOTER
      ======================================================== */}
      <footer className="bg-[#141F15] text-[#8EA58C] border-t border-white/10 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-7 h-7 rounded-lg bg-[#E8DDC8] text-[#1E2B1F] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <span className="text-base font-bold tracking-tight">Aivora AI</span>
              </div>
              <p className="text-[11.5px] leading-relaxed max-w-xs text-[#CBD8CA]/80">
                One AI Workspace. Endless Possibilities. Engineered for deep research, software synthesis, and publication design.
              </p>
              <p className="text-[10px] text-[#8EA58C]/70">
                © {new Date().getFullYear()} Aivora AI Inc. All rights reserved.
              </p>
            </div>

            {/* Links Column 1: Product */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Product</p>
              <ul className="space-y-2">
                <li><button onClick={onStartChat} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">AI Workspace</button></li>
                <li><a href="#features" className="hover:text-white transition-colors">Capabilities</a></li>
                <li><a href="#showcase" className="hover:text-white transition-colors">Artifacts</a></li>
                <li><button onClick={onOpenExplore} className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-xs">Explore Modes</button></li>
              </ul>
            </div>

            {/* Links Column 2: Features */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Features</p>
              <ul className="space-y-2">
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('coding')}>Code Sandbox</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('pdf')}>PDF Generator</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('ppt')}>Slide Decks</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onStartChat('image')}>Image Studio</span></li>
              </ul>
            </div>

            {/* Links Column 3: Legal & About */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Company</p>
              <ul className="space-y-2">
                <li><span className="hover:text-white cursor-pointer">About Aivora</span></li>
                <li><span className="hover:text-white cursor-pointer">Contact Us</span></li>
                <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">Terms & Conditions</span></li>
              </ul>
            </div>

          </div>
        </div>
      </footer>

    </div>
  )
}
