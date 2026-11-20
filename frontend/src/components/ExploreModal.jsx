// src/components/ExploreModal.jsx
import React from 'react'
import { 
  X, MessageSquare, Code2, ImageIcon, FileText, 
  Presentation, Globe, Mic, LayoutDashboard, ArrowRight, Sparkles
} from 'lucide-react'

export default function ExploreModal({ isOpen, onClose, onSelectCapability }) {
  if (!isOpen) return null

  const capabilities = [
    {
      id: 'chat',
      title: 'AI Chat & Research',
      badge: 'Polymath',
      desc: 'Deep reasoning, mental models, conceptual breakdowns and structured analysis across science, business, and literature.',
      icon: MessageSquare,
      color: 'bg-[#243223] text-[#E8DDC8]',
      sample: 'Explain quantum computing mental models simply with real-world analogies',
      agent: 'chat'
    },
    {
      id: 'coding',
      title: 'AI Coding & Architecture',
      badge: 'Staff Engineer',
      desc: 'Generate complete, production-ready responsive web apps, debug complex errors, and test live code in interactive sandboxes.',
      icon: Code2,
      color: 'bg-[#1E2B1F] text-[#4ADE80]',
      sample: 'Build a modern interactive calculator with responsive CSS and JavaScript',
      agent: 'coding'
    },
    {
      id: 'image',
      title: 'Image Generation',
      badge: 'Creative Director',
      desc: 'Synthesize photorealistic, cinematic art, logos, concept visual designs, and wallpapers with precise lighting and composition.',
      icon: ImageIcon,
      color: 'bg-[#3D2D1E] text-[#F3C474]',
      sample: 'A majestic golden eagle soaring over snow-capped alpine mountains at sunset',
      agent: 'image'
    },
    {
      id: 'pdf',
      title: 'PDF Tools & Resumes',
      badge: 'Publication Designer',
      desc: 'Generate executive A4 resumes, business reports, itemized invoices, or analyze existing uploaded PDF documents.',
      icon: FileText,
      color: 'bg-[#3A1E1E] text-[#F87171]',
      sample: 'Create a modern executive resume for a Senior React Engineer with 5 years experience',
      agent: 'pdf'
    },
    {
      id: 'ppt',
      title: 'Presentation Generator',
      badge: 'McKinsey Specialist',
      desc: 'Craft structured, high-impact PowerPoint pitch decks with punchy takeaways, key statistics, and full speaker notes.',
      icon: Presentation,
      color: 'bg-[#372E15] text-[#FBBF24]',
      sample: 'Create an 8-slide investor pitch deck for an AI productivity startup',
      agent: 'ppt'
    },
    {
      id: 'search',
      title: 'AI Live Search',
      badge: 'Intelligence Analyst',
      desc: 'Query real-time web intelligence, synthesize breaking news, extract citations, and curate live images without fluff.',
      icon: Globe,
      color: 'bg-[#1E2C3A] text-[#60A5FA]',
      sample: 'What are the biggest breakthroughs in clean fusion energy announced recently?',
      agent: 'search'
    },
    {
      id: 'voice',
      title: 'Voice Interaction',
      badge: 'Hands-Free',
      desc: 'Dictate prompts naturally using browser speech recognition. Speak your ideas and let Aivora transform them into artifacts.',
      icon: Mic,
      color: 'bg-[#2E1E3A] text-[#C084FC]',
      sample: 'Voice dictation available directly in the message composer toolbar',
      agent: 'chat'
    },
    {
      id: 'workspace',
      title: 'Smart Workspace',
      badge: 'Unified Platform',
      desc: 'Live 3-column dashboard with interactive artifact rendering, conversation search, pinning, and instant exports.',
      icon: LayoutDashboard,
      color: 'bg-[#1E2E25] text-[#34D399]',
      sample: 'Explore the 3-column layout with real-time code runner and preview',
      agent: 'auto'
    }
  ]

  const handleLaunch = (cap) => {
    onClose()
    if (onSelectCapability) {
      onSelectCapability(cap.sample, cap.agent)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#FAF8F3] border border-[#DDD3C1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1E1B18]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD3C1] bg-[#F2ECE0]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-[#1E1B18]">Explore Aivora AI Capabilities</h2>
                <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase">
                  8 Multi-Agent Modes
                </span>
              </div>
              <p className="text-xs text-[#696256]">Click any capability to launch it directly in your workspace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#696256] hover:text-[#1E1B18] hover:bg-[#E5DDCF] transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <div
                key={cap.id}
                onClick={() => handleLaunch(cap)}
                className="group relative bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-2xl p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cap.color} shadow-xs`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1E1B18] group-hover:text-black">
                          {cap.title}
                        </h3>
                        <span className="text-[10px] font-semibold text-[#4A653C] uppercase tracking-wider">
                          {cap.badge}
                        </span>
                      </div>
                    </div>
                    <span className="p-1 rounded-lg text-[#696256] group-hover:text-[#1E1B18] group-hover:translate-x-0.5 transition-all">
                      <ArrowRight size={15} />
                    </span>
                  </div>

                  <p className="text-xs text-[#696256] leading-relaxed mb-3">
                    {cap.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#DDD3C1]/70 flex items-center justify-between text-[11px]">
                  <span className="text-[#8B8476] truncate max-w-[220px]">
                    e.g. "{cap.sample}"
                  </span>
                  <span className="font-semibold text-[#1E2B1F] group-hover:underline">
                    Try Now &rarr;
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DDD3C1] bg-[#F2ECE0]/80 flex items-center justify-between text-xs">
          <span className="text-[#696256] text-[11px]">All 8 domains work seamlessly together within a single chat</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E1B1F] border border-[#C8BEAC] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
