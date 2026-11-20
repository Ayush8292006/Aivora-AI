import React, { useState, useEffect } from 'react'
import { 
  Check, Code2, Copy, Download, FileText, Presentation, 
  ImageIcon, X, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  ChevronLeft, ChevronRight, Monitor, Tablet, Smartphone, FileCode
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { setActiveArtifactId, setArtifactOpen, toggleMaximize } from '../redux/messageSlice'

function Artifact() {
  const dispatch = useDispatch()
  const { artifacts, activeArtifactId, isOpen, isMaximized } = useSelector((state) => state.message)
  
  const [activeFile, setActiveFile] = useState(0)
  const [tab, setTab] = useState("code") // "code" | "preview"
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [deviceView, setDeviceView] = useState('desktop')
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"

  // Select active artifact or most recent artifact
  const activeArtifact = artifacts?.find(a => a.id === activeArtifactId) || artifacts?.[artifacts.length - 1]

  useEffect(() => {
    setCurrentSlideIndex(0)
    setActiveFile(0)
    setImageZoom(1)
  }, [activeArtifact?.id])

  // Default fallback showcase image if no artifact created yet on desktop
  const fallbackPrompt = "A golden retriever with glossy coat sitting in a field of green grass with sunlight, looking happy and friendly, cinematic photography, soft bokeh background, high detail, warm tones."
  const fallbackImage = "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80"

  // If closed explicitly on mobile or not open, hide on small screens
  // On desktop (lg+), if isOpen is false and artifacts is empty, we can hide or display based on isOpen
  if (!isOpen && (!artifacts || artifacts.length === 0)) {
    // Show showcase preview on large screens if desired, or return null if user closed
    return null
  }

  if (!isOpen) {
    return null
  }

  const handleDownload = () => {
    if (!activeArtifact) return

    if (activeArtifact.url) {
      const fullUrl = activeArtifact.url.startsWith('http') 
        ? `${activeArtifact.url}?download=1` 
        : `${serverUrl}${activeArtifact.url}?download=1`
      const a = document.createElement('a')
      a.href = fullUrl
      a.download = activeArtifact.title || 'aivora-artifact'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }

    if (activeArtifact.type === 'Project' && activeArtifact.files) {
      const htmlFile = activeArtifact.files.find(f => f.name === "index.html")
      const cssFile = activeArtifact.files.find(f => f.name === "style.css")
      const jsFile = activeArtifact.files.find(f => f.name === "script.js")

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${cssFile?.content || ''}</style>
</head>
<body>
${htmlFile?.content || ''}
<script>${jsFile?.content || ''}</script>
</body>
</html>`

      const blob = new Blob([fullHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeArtifact.title || 'project'}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleCopyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch (err) {
      console.error('Failed to copy prompt:', err)
    }
  }

  const detectLanguage = (fileName = "") => {
    const name = fileName.toLowerCase()
    if (name.endsWith(".html")) return "html"
    if (name.endsWith(".css")) return "css"
    if (name.endsWith(".js") || name.endsWith(".jsx")) return "javascript"
    if (name.endsWith(".ts") || name.endsWith(".tsx")) return "typescript"
    if (name.endsWith(".json")) return "json"
    return "plaintext"
  }

  const slides = activeArtifact?.meta?.slides || []
  const displayImage = activeArtifact?.type === 'image' && activeArtifact?.url
    ? (activeArtifact.url.startsWith('http') ? activeArtifact.url : `${serverUrl}${activeArtifact.url}`)
    : fallbackImage

  const displayPrompt = activeArtifact?.meta?.prompt || fallbackPrompt

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        width: isMaximized ? '80vw' : '420px'
      }}
      transition={{ duration: 0.25 }}
      className={`
        fixed lg:relative inset-y-0 right-0 z-50 flex flex-col h-full aurora-glass-panel rounded-[26px] p-3.5 border border-[#2b4d36]/70 shadow-2xl overflow-hidden
        ${isMaximized ? 'w-full lg:w-[80vw]' : 'w-full lg:w-[420px]'}
      `}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-[#23422d]/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#14301e] border border-[#2d573a] flex items-center justify-center shrink-0">
            {(!activeArtifact || activeArtifact?.type === 'image') && <ImageIcon size={14} className="text-[#4de370]" />}
            {activeArtifact?.type === 'pdf' && <FileText size={14} className="text-[#f87171]" />}
            {activeArtifact?.type === 'ppt' && <Presentation size={14} className="text-[#dfc499]" />}
            {activeArtifact?.type === 'Project' && <Code2 size={14} className="text-[#9dfcb1]" />}
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-bold text-[#f5f8f5] truncate">
              {activeArtifact?.title || "Generated Image"}
            </h3>
            <span className="text-[10px] text-[#7d9984]">
              {activeArtifact?.type ? `${activeArtifact.type.toUpperCase()} Preview` : "Visual Preview (1:1)"}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold aurora-gold-btn border-none cursor-pointer"
            title="Download"
          >
            <Download size={12} />
            <span>Download</span>
          </button>

          <button
            onClick={() => dispatch(toggleMaximize())}
            className="p-1.5 rounded-lg text-[#8ca893] hover:text-white hover:bg-[#163821] transition-colors border-none bg-transparent cursor-pointer hidden lg:block"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            onClick={() => dispatch(setArtifactOpen(false))}
            className="p-1.5 rounded-lg text-[#8ca893] hover:text-white hover:bg-[#163821] transition-colors border-none bg-transparent cursor-pointer"
            title="Close Panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-hidden flex flex-col pt-3 min-h-0">
        
        {/* 1. IMAGE ARTIFACT (or fallback showcase preview matching reference) */}
        {(!activeArtifact || activeArtifact.type === 'image') && (
          <div className="flex-1 flex flex-col h-full overflow-hidden justify-between gap-3">
            
            {/* Image Canvas with Zoom Badge */}
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-[#2b4d36] bg-[#07120a] flex items-center justify-center group shadow-xl">
              
              {/* Zoom badge at top right (matching reference image) */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#0a180f]/80 backdrop-blur-md border border-[#2b5438] rounded-full px-2.5 py-1 text-[11px] text-[#c4d6c7] shadow-lg">
                <ZoomIn size={12} className="text-[#4de370]" />
                <span className="font-mono">{Math.round(imageZoom * 100)}%</span>
                <button
                  onClick={() => setImageZoom(z => z > 1 ? 1 : 1.5)}
                  className="text-[#9ab5a0] hover:text-white bg-transparent border-none cursor-pointer ml-0.5 text-xs font-bold"
                  title="Toggle Zoom"
                >
                  ∔
                </button>
              </div>

              {/* Main Image */}
              <img
                src={displayImage}
                alt="Generated preview"
                style={{ transform: `scale(${imageZoom})` }}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </div>

            {/* Prompt Information Card (exact match with reference image) */}
            <div className="aurora-glass-card rounded-2xl p-3 border border-[#2b4d36]/70 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#dfc499]">
                  <span>💡</span>
                  <span>Prompt:</span>
                </div>
                <button
                  onClick={() => handleCopyPrompt(displayPrompt)}
                  className="text-[#8ca893] hover:text-[#f4e5cb] transition-colors p-1 rounded hover:bg-[#163821] border-none bg-transparent cursor-pointer"
                  title="Copy Prompt"
                >
                  {copiedPrompt ? <Check size={13} className="text-[#4de370]" /> : <Copy size={13} />}
                </button>
              </div>
              <p className="text-[11.5px] text-[#b8ccbe] leading-relaxed line-clamp-4 italic">
                {displayPrompt}
              </p>
            </div>

          </div>
        )}

        {/* 2. PDF ARTIFACT PREVIEW */}
        {activeArtifact?.type === 'pdf' && (
          <div className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-[#2b4d36] bg-[#07120a]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e2114] border-b border-[#23422d] text-xs text-[#8ca893]">
              <span className="font-semibold text-[#f87171]">PDF Document</span>
              <span className="text-[11px] font-mono">{activeArtifact.meta?.pages || 1} Page(s)</span>
            </div>

            <div className="flex-1 p-2">
              {activeArtifact.url ? (
                <iframe
                  title="PDF Viewer"
                  src={`${serverUrl}${activeArtifact.url}`}
                  className="w-full h-full rounded-xl border border-[#23422d] bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#7d9984]">
                  <FileText size={36} className="text-[#f87171] opacity-70" />
                  <p className="text-xs">PDF ready for download</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. PPT ARTIFACT PREVIEW */}
        {activeArtifact?.type === 'ppt' && (
          <div className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-[#2b4d36] bg-[#07120a]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e2114] border-b border-[#23422d] text-xs text-[#8ca893]">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#dfc499]">Slide {currentSlideIndex + 1}</span>
                <span className="text-[11px] text-[#7d9984]">of {slides.length}</span>
              </div>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-2 py-0.5 rounded text-[10px] border-none cursor-pointer transition-colors ${
                  showNotes ? 'bg-[#2b5438] text-[#dfc499]' : 'bg-[#142e1d] text-[#8ca893]'
                }`}
              >
                Speaker Notes
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
              {slides.length > 0 && slides[currentSlideIndex] ? (
                <div className="w-full aspect-video rounded-xl bg-[#0e2417] border border-[#2d573a] p-4 flex flex-col justify-between text-[#f5f8f5] shadow-xl">
                  <div>
                    <h2 className="text-sm font-bold text-[#dfc499] mb-2 pb-1 border-b border-[#23422d]">
                      {slides[currentSlideIndex].title}
                    </h2>
                    {Array.isArray(slides[currentSlideIndex].bullets) && (
                      <ul className="space-y-1.5 text-xs pl-4 list-disc marker:text-[#4de370]">
                        {slides[currentSlideIndex].bullets.map((b, idx) => (
                          <li key={idx} className="leading-snug text-[#b8ccbe]">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#7d9984] pt-2 border-t border-[#1d3d27]">
                    <span>{activeArtifact.title}</span>
                    <span>{currentSlideIndex + 1} / {slides.length}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Slide Navigation */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#23422d] bg-[#0b1b11]">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
                className="p-1 rounded-lg text-[#8ca893] hover:text-white bg-[#142e1d] disabled:opacity-30 border-none cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono text-[#c4d6c7]">{currentSlideIndex + 1} / {slides.length || 1}</span>
              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}
                className="p-1 rounded-lg text-[#8ca893] hover:text-white bg-[#142e1d] disabled:opacity-30 border-none cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* 4. CODE PROJECT PREVIEW */}
        {activeArtifact?.type === 'Project' && (
          <div className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-[#2b4d36] bg-[#07120a]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e2114] border-b border-[#23422d]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTab("code")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border-none cursor-pointer transition-colors ${
                    tab === 'code' ? 'aurora-gold-btn text-[#17140e]' : 'text-[#8ca893] bg-transparent'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border-none cursor-pointer transition-colors ${
                    tab === 'preview' ? 'aurora-gold-btn text-[#17140e]' : 'text-[#8ca893] bg-transparent'
                  }`}
                >
                  Preview
                </button>
              </div>

              {tab === 'preview' && (
                <div className="flex items-center gap-1 bg-[#142e1d] p-0.5 rounded-lg border border-[#2b5438]">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`p-1 rounded border-none cursor-pointer ${deviceView === 'desktop' ? 'bg-[#2b5438] text-white' : 'text-[#8ca893] bg-transparent'}`}
                  >
                    <Monitor size={12} />
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`p-1 rounded border-none cursor-pointer ${deviceView === 'mobile' ? 'bg-[#2b5438] text-white' : 'text-[#8ca893] bg-transparent'}`}
                  >
                    <Smartphone size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Editor or Preview Frame */}
            <div className="flex-1 relative overflow-hidden bg-[#0a180f]">
              {tab === 'code' ? (
                <Editor
                  height="100%"
                  theme="vs-dark"
                  path={activeArtifact.files?.[activeFile]?.name}
                  language={detectLanguage(activeArtifact.files?.[activeFile]?.name)}
                  value={activeArtifact.files?.[activeFile]?.content || ""}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    wordWrap: 'on',
                    readOnly: true
                  }}
                />
              ) : (
                <iframe
                  title="Project Preview"
                  sandbox="allow-scripts"
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${activeArtifact.files?.find(f => f.name === 'style.css')?.content || ''}</style></head><body>${activeArtifact.files?.find(f => f.name === 'index.html')?.content || ''}<script>${activeArtifact.files?.find(f => f.name === 'script.js')?.content || ''}</script></body></html>`}
                  className="w-full h-full bg-white border-none"
                />
              )}
            </div>
          </div>
        )}

      </div>
    </motion.aside>
  )
}

export default Artifact
