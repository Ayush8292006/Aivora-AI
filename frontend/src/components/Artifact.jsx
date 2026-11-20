import React, { useState, useEffect } from 'react'
import { 
  Check, Code2, Copy, Eye, Maximize2, Minimize2, Download, 
  FileText, Presentation, ImageIcon, X, ChevronRight, ChevronLeft, 
  Monitor, Smartphone, Tablet, FileCode, Layers, ZoomIn, ZoomOut, Volume2 
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { setActiveArtifactId, setArtifactOpen, toggleMaximize } from '../redux/messageSlice'

function Artifact() {
  const dispatch = useDispatch()
  const { artifacts, activeArtifactId, isOpen, isMaximized } = useSelector((state) => state.message)
  
  const [activeFile, setActiveFile] = useState(0)
  const [tab, setTab] = useState("code") // "code" | "preview"
  const [copied, setCopied] = useState(false)
  const [deviceView, setDeviceView] = useState('desktop')
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"

  // Select active artifact
  const activeArtifact = artifacts?.find(a => a.id === activeArtifactId) || artifacts?.[artifacts.length - 1]

  useEffect(() => {
    setCurrentSlideIndex(0)
    setActiveFile(0)
    setImageZoom(1)
  }, [activeArtifact?.id])

  if (!isOpen || !artifacts || artifacts.length === 0 || !activeArtifact) {
    return null
  }

  const handleDownload = () => {
    if (!activeArtifact) return

    // If binary file with URL
    if (activeArtifact.url) {
      const fullUrl = activeArtifact.url.startsWith('http') 
        ? `${activeArtifact.url}?download=1` 
        : `${serverUrl}${activeArtifact.url}?download=1`
      const a = document.createElement('a')
      a.href = fullUrl
      a.download = activeArtifact.title || 'artifact'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }

    // If code project
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

  const handleCopyCode = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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

  // PPT theme colors
  const pptTheme = activeArtifact?.meta?.theme || 'modern'
  const isDarkTheme = pptTheme === 'dark' || pptTheme === 'vibrant'
  const slides = activeArtifact?.meta?.slides || []

  // Device width for preview iframe
  const getDeviceWidth = () => {
    if (deviceView === 'mobile') return '375px'
    if (deviceView === 'tablet') return '768px'
    return '100%'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        width: isMaximized ? '85vw' : '480px'
      }}
      transition={{ duration: 0.25 }}
      className={`
        fixed lg:relative inset-y-0 right-0 z-50 flex flex-col h-full bg-[#0e1118] border-l border-white/[0.08] shadow-2xl overflow-hidden
        ${isMaximized ? 'w-full lg:w-[85vw]' : 'w-full lg:w-[480px]'}
      `}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#121520]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-white/[0.05]">
            {activeArtifact.type === 'pdf' && <FileText size={16} className="text-red-400" />}
            {activeArtifact.type === 'ppt' && <Presentation size={16} className="text-amber-400" />}
            {activeArtifact.type === 'image' && <ImageIcon size={16} className="text-emerald-400" />}
            {activeArtifact.type === 'Project' && <Code2 size={16} className="text-indigo-400" />}
          </div>

          {/* Artifact selector if multiple */}
          {artifacts.length > 1 ? (
            <select
              value={activeArtifact.id}
              onChange={(e) => dispatch(setActiveArtifactId(Number(e.target.value)))}
              className="bg-transparent border border-white/[0.1] rounded-lg text-xs font-semibold text-slate-100 px-2 py-1 outline-none cursor-pointer max-w-[200px] truncate"
            >
              {artifacts.map((a, i) => (
                <option key={a.id || i} value={a.id} className="bg-[#121520] text-slate-200">
                  {a.title} (v{a.version || 1})
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-xs font-semibold text-slate-100 truncate max-w-[200px]">
                {activeArtifact.title}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v{activeArtifact.version || 1}
              </span>
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors border-none cursor-pointer"
            title="Download Artifact"
          >
            <Download size={13} />
            Download
          </button>

          <button
            onClick={() => dispatch(toggleMaximize())}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors border-none bg-transparent cursor-pointer hidden lg:block"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={() => dispatch(setArtifactOpen(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors border-none bg-transparent cursor-pointer"
            title="Close Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Switcher */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 1. CODE PROJECT ARTIFACT */}
        {activeArtifact.type === 'Project' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Project Tabs & Files Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-[#0f121a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTab("code")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border-none cursor-pointer transition-colors ${
                    tab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border-none cursor-pointer transition-colors ${
                    tab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  Preview
                </button>
              </div>

              {tab === 'preview' && (
                <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`p-1 rounded border-none cursor-pointer ${deviceView === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-transparent'}`}
                    title="Desktop"
                  >
                    <Monitor size={13} />
                  </button>
                  <button
                    onClick={() => setDeviceView('tablet')}
                    className={`p-1 rounded border-none cursor-pointer ${deviceView === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-transparent'}`}
                    title="Tablet"
                  >
                    <Tablet size={13} />
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`p-1 rounded border-none cursor-pointer ${deviceView === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-transparent'}`}
                    title="Mobile"
                  >
                    <Smartphone size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* File List when Code tab active */}
            {tab === 'code' && (
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.06] bg-[#0d0f15] overflow-x-auto [scrollbar-width:none]">
                {activeArtifact.files?.map((f, idx) => (
                  <button
                    key={f.name || idx}
                    onClick={() => setActiveFile(idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border-none cursor-pointer transition-colors whitespace-nowrap ${
                      activeFile === idx
                        ? 'bg-white/[0.08] text-indigo-300 font-semibold border-b-2 border-indigo-500'
                        : 'text-slate-400 hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    <FileCode size={12} />
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {/* Code Editor or Preview */}
            <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
              {tab === 'code' ? (
                <Editor
                  height="100%"
                  theme="vs-dark"
                  path={activeArtifact.files?.[activeFile]?.name}
                  language={detectLanguage(activeArtifact.files?.[activeFile]?.name)}
                  value={activeArtifact.files?.[activeFile]?.content || ""}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    readOnly: true
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2 bg-[#090b10]">
                  <iframe
                    title="Project Preview"
                    sandbox="allow-scripts"
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${activeArtifact.files?.find(f => f.name === 'style.css')?.content || ''}</style></head><body>${activeArtifact.files?.find(f => f.name === 'index.html')?.content || ''}<script>${activeArtifact.files?.find(f => f.name === 'script.js')?.content || ''}</script></body></html>`}
                    style={{ width: getDeviceWidth(), height: '100%' }}
                    className="bg-white rounded-lg shadow-xl border-none transition-all duration-300"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PDF ARTIFACT PREVIEW */}
        {activeArtifact.type === 'pdf' && (
          <div className="flex-1 flex flex-col h-full bg-[#121520]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0d0f15] text-xs text-slate-300">
              <span className="font-medium">PDF Document</span>
              <span className="text-[11px] text-slate-500">{activeArtifact.meta?.pages || 1} Page(s)</span>
            </div>

            <div className="flex-1 w-full h-full p-2 bg-[#0a0c12]">
              {activeArtifact.url ? (
                <iframe
                  title="PDF Viewer"
                  src={`${serverUrl}${activeArtifact.url}`}
                  className="w-full h-full rounded-xl border border-white/[0.08] bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <FileText size={40} className="text-red-400 opacity-60" />
                  <p className="text-sm">PDF ready for download</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. PPT SLIDE DECK PREVIEW */}
        {activeArtifact.type === 'ppt' && (
          <div className="flex-1 flex flex-col h-full bg-[#0a0c10]">
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0f121a] text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-400">Slide {currentSlideIndex + 1}</span>
                <span className="text-slate-500">of {slides.length}</span>
              </div>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-2 py-0.5 rounded text-[11px] border-none cursor-pointer transition-colors ${
                  showNotes ? 'bg-amber-500/20 text-amber-300' : 'bg-white/[0.05] text-slate-400'
                }`}
              >
                Speaker Notes
              </button>
            </div>

            {/* 16:9 Slide Canvas */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              {slides.length > 0 && slides[currentSlideIndex] ? (
                <div 
                  className={`
                    relative w-full aspect-video rounded-xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden border transition-all duration-300
                    ${isDarkTheme 
                      ? 'bg-[#0f172a] text-slate-100 border-white/[0.1]' 
                      : 'bg-white text-slate-900 border-slate-200'
                    }
                  `}
                >
                  {/* Slide Content */}
                  <div>
                    {slides[currentSlideIndex].layout === 'title' || currentSlideIndex === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center pt-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-2">
                          {slides[currentSlideIndex].title}
                        </h1>
                        {slides[currentSlideIndex].subtitle && (
                          <p className="text-sm sm:text-base text-slate-400 max-w-md">
                            {slides[currentSlideIndex].subtitle}
                          </p>
                        )}
                      </div>
                    ) : slides[currentSlideIndex].layout === 'closing' || currentSlideIndex === slides.length - 1 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center pt-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-2">
                          {slides[currentSlideIndex].title || 'Thank You'}
                        </h1>
                        {slides[currentSlideIndex].subtitle && (
                          <p className="text-sm text-slate-400">
                            {slides[currentSlideIndex].subtitle}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <h2 className="text-lg sm:text-xl font-bold mb-4 pb-2 border-b border-indigo-500/30">
                          {slides[currentSlideIndex].title}
                        </h2>

                        {/* Bullets */}
                        {Array.isArray(slides[currentSlideIndex].bullets) && (
                          <ul className="space-y-2.5 text-xs sm:text-sm pl-4 list-disc marker:text-indigo-500">
                            {slides[currentSlideIndex].bullets.map((b, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Stats layout */}
                        {Array.isArray(slides[currentSlideIndex].stats) && (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            {slides[currentSlideIndex].stats.map((s, sIdx) => (
                              <div key={sIdx} className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center">
                                <p className="text-xl font-bold text-indigo-400">{s.value}</p>
                                <p className="text-xs text-slate-400">{s.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Slide Footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/[0.06]">
                    <span>{activeArtifact.title}</span>
                    <span>{currentSlideIndex + 1} / {slides.length}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Speaker Notes Drawer */}
            {showNotes && slides[currentSlideIndex]?.notes && (
              <div className="px-4 py-2.5 bg-[#121520] border-t border-white/[0.08] text-xs text-slate-300">
                <span className="font-semibold text-amber-400">Notes: </span>
                <span>{slides[currentSlideIndex].notes}</span>
              </div>
            )}

            {/* Slide Navigation Controls & Thumbnails Strip */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-[#0c0e14]">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05] disabled:opacity-30 border-none cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] [scrollbar-width:none]">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-6 h-6 rounded text-xs font-mono border-none cursor-pointer transition-colors ${
                      currentSlideIndex === idx ? 'bg-amber-500 text-black font-bold' : 'bg-white/[0.05] text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05] disabled:opacity-30 border-none cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 4. IMAGE ARTIFACT PREVIEW */}
        {activeArtifact.type === 'image' && (
          <div className="flex-1 flex flex-col h-full bg-[#0a0c10] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0f121a] text-xs text-slate-300">
              <span className="font-medium text-emerald-400">Generated Image</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImageZoom(z => Math.max(z - 0.25, 0.5))}
                  className="p-1 rounded text-slate-400 hover:text-white bg-white/[0.05] border-none cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] text-slate-400">{Math.round(imageZoom * 100)}%</span>
                <button
                  onClick={() => setImageZoom(z => Math.min(z + 0.25, 2.5))}
                  className="p-1 rounded text-slate-400 hover:text-white bg-white/[0.05] border-none cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              {activeArtifact.url ? (
                <img
                  src={activeArtifact.url.startsWith('http') ? activeArtifact.url : `${serverUrl}${activeArtifact.url}`}
                  alt="Generated"
                  style={{ transform: `scale(${imageZoom})` }}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/[0.08] transition-transform duration-200"
                />
              ) : (
                <div className="text-slate-500 text-xs">Image unavailable</div>
              )}
            </div>

            {activeArtifact.meta?.prompt && (
              <div className="p-3 bg-[#10131d] border-t border-white/[0.06] text-xs text-slate-300">
                <p className="font-semibold text-slate-400 mb-1">Prompt:</p>
                <p className="italic text-slate-300 text-[11px] line-clamp-3">{activeArtifact.meta.prompt}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Artifact
