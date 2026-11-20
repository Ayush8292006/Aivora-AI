// src/components/WelcomeOnboarding.jsx
import React from 'react'
import { 
  Sparkles, MessageSquare, Code2, ImageIcon, FileText, 
  Presentation, Globe, ArrowUpRight, Plus
} from 'lucide-react'
import { useSelector } from 'react-redux'

export default function WelcomeOnboarding({ onSelectPrompt, onNewChat, onSelectMode }) {
  const { userData } = useSelector(state => state.user)

  const promptCards = [
    {
      title: "Explain a complex topic",
      subtitle: "Polymath concept breakdown",
      prompt: "Explain quantum computing mental models simply with real-world analogies",
      agent: "chat",
      icon: MessageSquare,
      color: "bg-[#243223] text-[#E8DDC8]"
    },
    {
      title: "Write and debug code",
      subtitle: "Full-stack code generator",
      prompt: "Build an interactive web-based calculator with clean modern CSS and keyboard support",
      agent: "coding",
      icon: Code2,
      color: "bg-[#1E2B1F] text-[#4ADE80]"
    },
    {
      title: "Generate an image",
      subtitle: "Cinematic visual synthesis",
      prompt: "A majestic golden eagle soaring over snow-capped alpine mountains at sunset, 4k photorealistic",
      agent: "image",
      icon: ImageIcon,
      color: "bg-[#3D2D1E] text-[#F3C474]"
    },
    {
      title: "Create a presentation",
      subtitle: "McKinsey-grade slide deck",
      prompt: "Create an 8-slide investor pitch deck for an Autonomous AI Agent startup",
      agent: "ppt",
      icon: Presentation,
      color: "bg-[#372E15] text-[#FBBF24]"
    },
    {
      title: "Analyze or create document",
      subtitle: "Print-ready vector PDF",
      prompt: "Create a modern 2-page executive resume for a Senior Full-Stack Engineer with 5 years experience",
      agent: "pdf",
      icon: FileText,
      color: "bg-[#3A1E1E] text-[#F87171]"
    },
    {
      title: "Research a topic",
      subtitle: "Real-time web intelligence",
      prompt: "What are the latest breakthroughs in clean fusion energy announced recently?",
      agent: "search",
      icon: Globe,
      color: "bg-[#1E2C3A] text-[#60A5FA]"
    }
  ]

  const quickModes = [
    { label: "Auto", mode: "Auto" },
    { label: "Chat", mode: "Chat" },
    { label: "Coding", mode: "Coding" },
    { label: "PDF Tools", mode: "PDF" },
    { label: "Presentation", mode: "PPT" },
    { label: "Image", mode: "Image" },
    { label: "Search", mode: "Search" }
  ]

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-6 sm:py-10 px-3 sm:px-6 my-auto text-center">
      
      {/* Brand Icon & Heading */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-13 h-13 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-lg shadow-sm border border-[#3E553D]/50">
          A
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1B18]">
              Welcome to Aivora AI{userData?.name ? `, ${userData.name.split(' ')[0]}` : ''}
            </h1>
            <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              PRO
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#696256] font-medium max-w-md mx-auto">
            What would you like to create today?
          </p>
        </div>

        {/* Quick Mode Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {quickModes.map((m) => (
            <button
              key={m.mode}
              onClick={() => onSelectMode && onSelectMode(m.mode)}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2ECE0] hover:bg-[#EAE2D2] text-[#1E1B18] border border-[#DDD3C1] transition-colors cursor-pointer"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Prompt Cards (Clean 2-Column Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left mb-6">
        {promptCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              onClick={() => onSelectPrompt && onSelectPrompt(card.prompt, card.agent)}
              className="group bg-[#F2ECE0] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color} shrink-0 shadow-2xs`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#1E1B18] group-hover:text-black truncate">
                      {card.title}
                    </h3>
                    <p className="text-[10px] text-[#7A7469] truncate">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-[#8B8476] group-hover:text-[#1E1B18] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>

              <p className="text-xs text-[#554E43] line-clamp-2 leading-relaxed bg-[#FAF8F3]/80 p-2.5 rounded-xl border border-[#DDD3C1]/60 font-medium">
                "{card.prompt}"
              </p>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA / New Chat */}
      <div className="flex items-center justify-center gap-3 text-xs text-[#696256]">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E8DDC8] hover:bg-[#DDD2BD] text-[#1E2B1F] border border-[#C8BEAC] cursor-pointer transition-colors shadow-2xs"
        >
          <Plus size={14} />
          <span>Start Fresh Chat</span>
        </button>
        <span>or ask anything in the composer below</span>
      </div>

    </div>
  )
}
