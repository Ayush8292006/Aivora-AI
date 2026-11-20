import React, { useState, useEffect } from 'react'
import { 
  Check, Code2, Copy, Download, FileText, Presentation, 
  ImageIcon, X, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  ChevronLeft, ChevronRight, Monitor, Smartphone, FileCode
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

  const activeArtifact = artifacts?.find(a => a.id === activeArtifactId) || artifacts?.[artifacts.length - 1]

  useEffect(() => {
    setCurrentSlideIndex(0)
    setActiveFile(0)
    setImageZoom(1)
  }, [activeArtifact?.id])

  const fallbackPrompt = "A minimalist modern calculator with sleek layout, dark palette and intuitive controls."
  const fallbackImage = "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80"

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
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`
        fixed lg:relative inset-y-0 right-0 z-40 flex flex-col h-full bg-[#141413]/92 backdrop-blur-xl rounded-2xl p-3.5 border border-white/10 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08),0_12px_32px_-6px_rgba(0,0,0,0.45)] overflow-hidden select-none text-[#E8E3D9]
        ${isMaximized ? 'w-full lg:w-[80vw]' : 'w-full lg:w-[420px]'}
      `}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-[#2A2825]/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#23211E] border border-[#36322C] flex items-center justify-center shrink-0 shadow-2xs">
            {(!activeArtifact || activeArtifact?.type === 'Project') && <span className="font-mono text-xs font-bold text-[#E8E3D9]">&lt;/&gt;</span>}
            {activeArtifact?.type === 'pdf' && <FileText size={14} className="text-[#A84B4B]" />}
            {activeArtifact?.type === 'ppt' && <Presentation size={14} className="text-[#C9AD7C]" />}
            {activeArtifact?.type === 'image' && <ImageIcon size={14} className="text-[#89977B]" />}
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-[#F3EFE6] truncate">
              {activeArtifact?.title || "generate calculator"}
            </h3>
            <span className="text-[10px] text-[#8E8A82] uppercase tracking-wider block font-medium">
              {activeArtifact?.type ? `${activeArtifact.type} Preview` : "PROJECT Preview"}
            </span>
          </div>
        </div>

        {/* Header Action: Export Button + Window Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[#36322C] hover:bg-[#443F38] text-[#E8E3D9] border border-[#48433C] cursor-pointer transition-colors shadow-2xs"
            title="Export"
          >
            <Download size={12} />
            <span>Export</span>
          </button>

          <button
            onClick={() => dispatch(toggleMaximize())}
            className="p-1 rounded-lg text-[#8E8A82] hover:text-[#F3EFE6] transition-colors border-none bg-transparent cursor-pointer hidden lg:block"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          <button
            onClick={() => dispatch(setArtifactOpen(false))}
            className="p-1 rounded-lg text-[#8E8A82] hover:text-[#F3EFE6] transition-colors border-none bg-transparent cursor-pointer"
            title="Close Panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="flex-1 overflow-hidden flex flex-col pt-3 min-h-0">
        
        {/* 1. CODE PROJECT ARTIFACT (Exact Match to Reference Image) */}
        {(!activeArtifact || activeArtifact?.type === 'Project') && (
          <div className="flex-1 flex flex-col h-full rounded-xl overflow-hidden border border-[#2A2825] bg-[#191816]">
            {/* Tabs: Code (Crisp Warm White Pill) vs Preview (Muted Gray) */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#141413] border-b border-[#2A2825]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTab("code")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors ${
                    tab === 'code' 
                      ? 'bg-[#F3EFE6] text-[#141413]' 
                      : 'text-[#8E8A82] hover:text-[#F3EFE6] bg-transparent'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors ${
                    tab === 'preview' 
                      ? 'bg-[#F3EFE6] text-[#141413]' 
                      : 'text-[#8E8A82] hover:text-[#F3EFE6] bg-transparent'
                  }`}
                >
                  Preview
                </button>
              </div>

              {tab === 'preview' && (
                <div className="flex items-center gap-1 bg-[#23211E] p-0.5 rounded-lg border border-[#2A2825]">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`p-1 rounded border-none cursor-pointer ${deviceView === 'desktop' ? 'bg-[#36322C] text-white' : 'text-[#8E8A82] bg-transparent'}`}
                  >
                    <Monitor size={11} />
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`p-1 rounded border-none cursor-pointer ${deviceView === 'mobile' ? 'bg-[#36322C] text-white' : 'text-[#8E8A82] bg-transparent'}`}
                  >
                    <Smartphone size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Monaco Editor Surface with Dark Editor Theme */}
            <div className="flex-1 relative overflow-hidden bg-[#191816]">
              {tab === 'code' ? (
                <Editor
                  height="100%"
                  theme="vs-dark"
                  path={activeArtifact?.files?.[activeFile]?.name || "index.html"}
                  language={detectLanguage(activeArtifact?.files?.[activeFile]?.name || "index.html")}
                  value={activeArtifact?.files?.[activeFile]?.content || `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Modern Calculator</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="calculator">\n    <div class="display">\n      <div class="previous-operand"></div>\n      <div class="current-operand">0</div>\n    </div>\n    <div class="buttons">\n      <button data-action="clear">AC</button>\n      <button data-action="delete">DEL</button>\n      <button data-action="operation">÷</button>\n      <button data-action="number">7</button>\n      <button data-action="number">8</button>\n      <button data-action="number">9</button>\n      <button data-action="operation">×</button>\n      <button data-action="number">4</button>\n      <button data-action="number">5</button>\n      <button data-action="number">6</button>\n      <button data-action="operation">-</button>\n      <button data-action="number">1</button>\n      <button data-action="number">2</button>\n      <button data-action="number">3</button>\n      <button data-action="operation">+</button>\n    </div>\n  </div>\n</body>\n</html>`}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    readOnly: true
                  }}
                />
              ) : (
                <iframe
                  title="Project Preview"
                  sandbox="allow-scripts"
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${activeArtifact?.files?.find(f => f.name === 'style.css')?.content || 'body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#141413;color:#F3EFE6;font-family:sans-serif;}'}</style></head><body>${activeArtifact?.files?.find(f => f.name === 'index.html')?.content || '<div style="text-align:center;"><h3>Project Preview</h3><p>Calculator UI initialized</p></div>'}<script>${activeArtifact?.files?.find(f => f.name === 'script.js')?.content || ''}</script></body></html>`}
                  className="w-full h-full bg-white border-none"
                />
              )}
            </div>
          </div>
        )}

        {/* 2. IMAGE ARTIFACT PREVIEW */}
        {activeArtifact?.type === 'image' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden justify-between gap-3">
            <div className="relative flex-1 rounded-xl overflow-hidden border border-[#2A2825] bg-[#191816] flex items-center justify-center group shadow-md">
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#23211E] border border-[#2A2825] rounded-full px-2.5 py-1 text-[11px] text-[#E8E3D9] shadow-xs">
                <ZoomIn size={12} className="text-[#8E8A82]" />
                <span className="font-mono text-[10px]">{Math.round(imageZoom * 100)}%</span>
                <button
                  onClick={() => setImageZoom(z => z > 1 ? 1 : 1.5)}
                  className="text-[#8E8A82] hover:text-white bg-transparent border-none cursor-pointer ml-0.5 text-xs font-bold"
                  title="Toggle Zoom"
                >
                  ∔
                </button>
              </div>

              <img
                src={displayImage}
                alt="Generated preview"
                style={{ transform: `scale(${imageZoom})` }}
                className="w-full h-full object-cover transition-transform duration-200"
              />
            </div>

            <div className="bg-[#191816] border border-[#2A2825] rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#F3EFE6]">Prompt:</span>
                <button
                  onClick={() => handleCopyPrompt(displayPrompt)}
                  className="text-[#8E8A82] hover:text-[#F3EFE6] transition-colors p-1 rounded-md hover:bg-[#23211E] border-none bg-transparent cursor-pointer"
                  title="Copy Prompt"
                >
                  {copiedPrompt ? <Check size={12} className="text-[#BAC6B1]" /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-[11.5px] text-[#8E8A82] leading-relaxed line-clamp-4 italic">
                {displayPrompt}
              </p>
            </div>
          </div>
        )}

        {/* 3. PDF VIEWER */}
        {activeArtifact?.type === 'pdf' && (
          <div className="flex-1 flex flex-col h-full rounded-xl overflow-hidden border border-[#2A2825] bg-[#191816]">
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#141413] border-b border-[#2A2825] text-xs">
              <span className="font-bold text-[#E57373]">PDF Document</span>
              <span className="text-[11px] font-mono text-[#8E8A82]">{activeArtifact.meta?.pages || 1} Page(s)</span>
            </div>

            <div className="flex-1 p-2">
              {activeArtifact.url ? (
                <iframe
                  title="PDF Viewer"
                  src={`${serverUrl}${activeArtifact.url}`}
                  className="w-full h-full rounded-lg border border-[#2A2825] bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#8E8A82]">
                  <FileText size={32} className="text-[#A84B4B] opacity-70" />
                  <p className="text-xs">PDF ready for download</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PPT VIEWER */}
        {activeArtifact?.type === 'ppt' && (
          <div className="flex-1 flex flex-col h-full rounded-xl overflow-hidden border border-[#2A2825] bg-[#191816]">
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#141413] border-b border-[#2A2825] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#E8E3D9]">Slide {currentSlideIndex + 1}</span>
                <span className="text-[11px] text-[#8E8A82]">of {slides.length}</span>
              </div>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border-none cursor-pointer transition-colors ${
                  showNotes ? 'bg-[#36322C] text-white font-bold' : 'bg-[#23211E] text-[#8E8A82]'
                }`}
              >
                Speaker Notes
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
              {slides.length > 0 && slides[currentSlideIndex] ? (
                <div className="w-full aspect-video rounded-xl bg-[#23211E] border border-[#2A2825] p-4 flex flex-col justify-between text-[#F3EFE6] shadow-md">
                  <div>
                    <h2 className="text-sm font-bold text-[#E8E3D9] mb-2 pb-1 border-b border-[#2A2825]">
                      {slides[currentSlideIndex].title}
                    </h2>
                    {Array.isArray(slides[currentSlideIndex].bullets) && (
                      <ul className="space-y-1.5 text-xs pl-4 list-disc marker:text-[#8E8A82]">
                        {slides[currentSlideIndex].bullets.map((b, idx) => (
                          <li key={idx} className="leading-snug text-[#8E8A82]">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8E8A82] pt-2 border-t border-[#2A2825]">
                    <span>{activeArtifact.title}</span>
                    <span>{currentSlideIndex + 1} / {slides.length}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between px-3.5 py-2 border-t border-[#2A2825] bg-[#141413]">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
                className="p-1 rounded-lg text-[#8E8A82] hover:text-white bg-[#23211E] disabled:opacity-30 border-none cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono text-[#E8E3D9]">{currentSlideIndex + 1} / {slides.length || 1}</span>
              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}
                className="p-1 rounded-lg text-[#8E8A82] hover:text-white bg-[#23211E] disabled:opacity-30 border-none cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </motion.aside>
  )
}

export default Artifact
