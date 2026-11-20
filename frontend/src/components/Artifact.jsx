import React, { useState, useRef, useEffect } from 'react'
import { Check, Code2, Copy, Eye, PanelRightClose, PanelRightOpen, Maximize2, Minimize2, Download, Sparkles, FileCode, Layout, Terminal, Layers, ChevronRight, ChevronLeft, Monitor, Smartphone, Tablet, X, FolderOpen, File, ChevronDown } from 'lucide-react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'

function Artifact() {
  const [collapsed, setCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { artifacts } = useSelector((state) => state.message)
  const [tab, setTab] = useState("code")
  const [activeFile, setActiveFile] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [deviceView, setDeviceView] = useState('desktop')
  const [showPreview, setShowPreview] = useState(false)

  if (!artifacts || artifacts.length === 0) {
    return null
  }

  const file = artifacts[0]?.files[activeFile]
  const htmlFile = artifacts[0]?.files?.find(f => f.name === "index.html")
  const cssFile = artifacts[0]?.files?.find(f => f.name === "style.css")
  const jsFile = artifacts[0]?.files?.find(f => f.name === "script.js")

  const canPreview = Boolean(htmlFile)
  const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${cssFile?.content || ""}</style>
</head>
<body>${htmlFile?.content || ""}</body>
<script>${jsFile?.content || ""}</script>
</html>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file?.content)
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
    if (name.endsWith(".js")) return "javascript"
    if (name.endsWith(".jsx")) return "javascript"
    if (name.endsWith(".ts")) return "typescript"
    if (name.endsWith(".tsx")) return "typescript"
    if (name.endsWith(".json")) return "json"
    if (name.endsWith(".py")) return "python"
    if (name.endsWith(".java")) return "java"
    if (name.endsWith(".cpp")) return "cpp"
    if (name.endsWith(".c")) return "c"
    return "plaintext"
  }

  const getFileIcon = (fileName) => {
    const name = fileName?.toLowerCase() || ''
    if (name.includes('html')) return '🌐'
    if (name.includes('css')) return '🎨'
    if (name.includes('js')) return '⚡'
    if (name.includes('json')) return '📋'
    if (name.includes('py')) return '🐍'
    return '📄'
  }

  const getFileColor = (fileName) => {
    const name = fileName?.toLowerCase() || ''
    if (name.includes('html')) return 'from-orange-500 to-red-500'
    if (name.includes('css')) return 'from-blue-500 to-cyan-500'
    if (name.includes('js')) return 'from-yellow-500 to-amber-500'
    if (name.includes('json')) return 'from-green-500 to-emerald-500'
    if (name.includes('py')) return 'from-blue-600 to-indigo-600'
    return 'from-gray-500 to-slate-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        width: collapsed ? 56 : 400,
        height: '100%',
      }}
      transition={{
        duration: 0.3,
        type: "spring",
        damping: 25,
        stiffness: 200
      }}
      className='hidden lg:block h-full rounded-xl overflow-hidden shadow-2xl relative flex-shrink-0'
    >
      {/* Container */}
      <div
        className={`relative h-full bg-gradient-to-br from-[#0d0f14] via-[#111318] to-[#0a0c10] border border-white/8 rounded-xl overflow-hidden ${collapsed ? 'p-1.5' : 'p-2.5'}`}
      >
        {!collapsed ? (
          <div className='flex flex-col h-full gap-1.5'>
            {/* Header Section - Sharp */}
            <div className='flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/6'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0'>
                  <Code2 className='text-white' size={16} />
                </div>
                
                <div className='flex-1 min-w-0'>
                  <h3 className='text-xs font-semibold text-white truncate'>
                    {artifacts[0].title}
                  </h3>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-[9px] text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded flex items-center gap-0.5'>
                      <FolderOpen size={9} />
                      {artifacts[0].files?.length || 0}
                    </span>
                    <span className='text-[9px] text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded flex items-center gap-0.5'>
                      <Sparkles size={9} />
                      v1
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className='p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all'
                >
                  {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
                <button
                  onClick={() => setCollapsed(true)}
                  className='p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all'
                >
                  <PanelRightClose size={13} />
                </button>
              </div>
            </div>

            {/* Tab Navigation - Sharp */}
            <div className='flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/6'>
              <div className='flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide'>
                {artifacts[0]?.files.map((f, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFile(index)}
                    className={`relative px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                      activeFile === index
                        ? `bg-gradient-to-r ${getFileColor(f.name)} text-white shadow-md`
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className='mr-1'>{getFileIcon(f.name)}</span>
                    {f.name}
                  </button>
                ))}
              </div>

              {canPreview && (
                <div className='flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5'>
                  <button
                    onClick={() => setTab("code")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      tab === "code"
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileCode size={12} className="inline mr-0.5" />
                    Code
                  </button>
                  <button
                    onClick={() => setTab("preview")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      tab === "preview"
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye size={12} className="inline mr-0.5" />
                    Preview
                  </button>
                </div>
              )}
            </div>

            {/* Main Content - Full Height */}
            <div className='flex-1 rounded-lg overflow-hidden bg-[#0a0c10] border border-white/6 relative'>
              {/* Floating Action Buttons */}
              <div className='absolute top-2 right-2 z-10 flex flex-col gap-1.5'>
                <button
                  onClick={handleCopy}
                  className='p-1.5 rounded-lg bg-black/60 hover:bg-indigo-500/30 border border-white/8 text-slate-300 hover:text-white transition-all'
                >
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                </button>
                <button className='p-1.5 rounded-lg bg-black/60 hover:bg-purple-500/30 border border-white/8 text-slate-300 hover:text-white transition-all'>
                  <Download size={13} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {(tab === "preview" && canPreview) ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className='w-full h-full'
                  >
                    <div className='absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-black/60 rounded-lg p-0.5 border border-white/8'>
                      {['desktop', 'tablet', 'mobile'].map((device) => (
                        <button
                          key={device}
                          onClick={() => setDeviceView(device)}
                          className={`p-1 rounded transition-all ${
                            deviceView === device
                              ? 'bg-indigo-500/30 text-indigo-400'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {device === 'desktop' && <Monitor size={12} />}
                          {device === 'tablet' && <Tablet size={12} />}
                          {device === 'mobile' && <Smartphone size={12} />}
                        </button>
                      ))}
                    </div>
                    <iframe
                      title='preview'
                      srcDoc={previewDoc}
                      sandbox='allow-scripts'
                      className='w-full h-full bg-white'
                      style={{
                        border: 'none',
                        height: '100%',
                        width: '100%'
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className='w-full h-full'
                  >
                    <Editor
                      theme='vs-dark'
                      language={detectLanguage(file?.name)}
                      value={file?.content}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        wordWrap: "on",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                        lineNumbers: "on",
                        renderLineHighlight: "none",
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Stats - Sharp */}
            <div className='flex items-center justify-between px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/6'>
              <div className='flex items-center gap-3 text-[10px] text-slate-400'>
                <span className='flex items-center gap-1'>
                  <Layers size={11} />
                  {file?.content?.split('\n').length || 0} lines
                </span>
                <span className='flex items-center gap-1'>
                  <FileCode size={11} />
                  {file?.name || 'No file'}
                </span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='w-1.5 h-1.5 rounded-full bg-green-400' />
                <span className='text-[9px] text-slate-400'>Live</span>
              </div>
            </div>
          </div>
        ) : (
          // Collapsed State - Sharp & Compact
          <div className='h-full flex flex-col items-center justify-between py-2'>
            {/* Top - Expand Button */}
            <button
              onClick={() => setCollapsed(false)}
              className='p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all'
            >
              <PanelRightOpen size={16} />
            </button>

            {/* Middle - Icon and Title */}
            <div className='flex flex-col items-center gap-2'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20'>
                <Code2 className='text-white' size={20} />
              </div>

              {/* Vertical Title */}
              <div className='relative'>
                <div className='text-[10px] font-bold text-white/80 tracking-wider uppercase whitespace-nowrap'
                  style={{
                    writingMode: "vertical-rl",
                    letterSpacing: '3px'
                  }}
                >
                  {artifacts[0].title}
                </div>
              </div>

              {/* File Count */}
              <div className='text-[8px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1'>
                <FolderOpen size={9} />
                {artifacts[0]?.files?.length || 0}
              </div>
            </div>

            {/* Bottom - Expand Hint */}
            <div className='text-[6px] text-slate-500 tracking-widest uppercase flex items-center gap-0.5'>
              <ChevronDown size={10} />
              Expand
              <ChevronDown size={10} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Artifact