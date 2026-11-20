// src/components/WelcomeOnboarding.jsx
import React, { useRef } from 'react'
import { 
  Sparkles, MessageSquare, Code2, ImageIcon, FileText, 
  Presentation, Globe, ArrowUpRight, Plus, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useSelector } from 'react-redux'

export default function WelcomeOnboarding({ onSelectPrompt, onNewChat, onSelectMode }) {
  const { userData } = useSelector(state => state.user)
  const scrollRef = useRef(null)

  const promptCards = [
    {
      title: "Write & debug code",
      subtitle: "Full-stack code generator",
      prompt: "Build an interactive web calculator with modern CSS",
      agent: "coding",
      icon: Code2,
      color: "bg-[#1E2B1F] text-[#4ADE80]"
    },
    {
      title: "Synthesize 4K visual",
      subtitle: "Cinematic visual synthesis",
      prompt: "A majestic golden eagle soaring over snow alpine mountains at sunset",
      agent: "image",
      icon: ImageIcon,
      color: "bg-[#3D2D1E] text-[#F3C474]"
    },
    {
      title: "Executive PDF document",
      subtitle: "Print-ready vector PDF",
      prompt: "Create an executive resume for a Senior Solutions Architect",
      agent: "pdf",
      icon: FileText,
      color: "bg-[#3A1E1E] text-[#F87171]"
    },
    {
      title: "Investor pitch deck",
      subtitle: "Executive slide deck",
      prompt: "Create an 8-slide investor pitch deck for an AI startup",
      agent: "ppt",
      icon: Presentation,
      color: "bg-[#372E15] text-[#FBBF24]"
    },
    {
      title: "Explain a complex topic",
      subtitle: "Polymath concept breakdown",
      prompt: "Explain quantum computing mental models simply with real analogies",
      agent: "chat",
      icon: MessageSquare,
      color: "bg-[#243223] text-[#E8DDC8]"
    },
    {
      title: "Real-time web research",
      subtitle: "Live web intelligence",
      prompt: "What are the latest breakthroughs in clean fusion energy announced recently?",
      agent: "search",
      icon: Globe,
      color: "bg-[#1E2C3A] text-[#60A5FA]"
    }
  ]

  const scrollSuggestions = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const firstName = userData?.name ? userData.name.split(' ')[0] : null

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-6 sm:py-10 px-3 sm:px-6 my-auto text-center select-none">
      
      {/* Clean Minimalist Brand Logo & Heading (ChatGPT Style) */}
      <div className="flex flex-col items-center gap-2.5 mb-5 sm:mb-7">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-base shadow-sm border border-[#3E553D]/50">
          A
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#1E1B18]">
              {firstName ? `Welcome back, ${firstName}` : "Welcome to Aivora AI"}
            </h1>
            <span className="bg-[#1E2B1F] text-[#E8DDC8] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              PRO
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#7A7469] font-medium">
            What would you like to create today?
          </p>
        </div>
      </div>

      {/* Suggested Prompts Header with Clean Slider Controls */}
      <div className="w-full flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-bold text-[#7A7469] uppercase tracking-wider">
          Suggested Starters
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollSuggestions('left')}
            className="w-7 h-7 rounded-lg bg-[#F2ECE0] hover:bg-[#EAE2D2] text-[#1E1B18] border border-[#DDD3C1] flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
            title="Scroll Left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scrollSuggestions('right')}
            className="w-7 h-7 rounded-lg bg-[#1E2B1F] hover:bg-[#283A27] text-white border-none flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs"
            title="Scroll Right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Clean Horizontal Scrolling Cards (No Nested Box Inside Box!) */}
      <div 
        ref={scrollRef}
        className="w-full flex items-stretch gap-2.5 overflow-x-auto pb-3 pt-0.5 px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth text-left"
      >
        {promptCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              onClick={() => onSelectPrompt && onSelectPrompt(card.prompt, card.agent)}
              className="w-[230px] sm:w-[250px] shrink-0 snap-start bg-[#F4EEE2] hover:bg-[#EAE2D2] border border-[#DDD3C1] hover:border-[#BFAF98] rounded-2xl p-3.5 transition-all duration-150 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs active:scale-[0.98] group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${card.color} shrink-0 shadow-2xs`}>
                    <Icon size={14} />
                  </div>
                  <ArrowUpRight size={13} className="text-[#8B8476] group-hover:text-[#1E1B18] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#1E1B18] group-hover:text-black truncate">
                    {card.title}
                  </h3>
                  <p className="text-[10px] text-[#7A7469] truncate">
                    {card.subtitle}
                  </p>
                </div>

                <p className="text-[11px] text-[#554E43] font-medium line-clamp-2 leading-snug">
                  "{card.prompt}"
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-[#DDD3C1]/80 flex items-center justify-between text-[10.5px] font-bold text-[#1E2B1F]">
                <span>Try prompt</span>
                <span className="text-[#7A7469] group-hover:text-[#1E1B18]">&rarr;</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Subtle Bottom Swipe Hint */}
      <div className="w-full flex items-center justify-between text-[10px] text-[#8E877B] px-1 mt-1">
        <span>← Swipe horizontally for more ideas →</span>
        <button
          onClick={onNewChat}
          className="text-[#1E2B1F] font-bold hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
        >
          <Plus size={11} />
          <span>Fresh Chat</span>
        </button>
      </div>

    </div>
  )
}
