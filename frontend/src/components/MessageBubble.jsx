import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { 
  ImageOff, X, ZoomIn, ChevronLeft, ChevronRight, Copy, Check, 
  FileText, Presentation, Code2, ImageIcon, Download, ExternalLink, RefreshCw 
} from 'lucide-react'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useDispatch } from 'react-redux'
import { setActiveArtifactId, setArtifactOpen } from '../redux/messageSlice'

function MessageBubble({ role, content, images = [], artifacts = [], attachments = [], isError }) {
  const isUser = role === "user"
  const dispatch = useDispatch()
  const [lightboxImage, setLightboxImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [failedImages, setFailedImages] = useState(new Set())
  const [copiedCode, setCopiedCode] = useState(null)
  const [copiedMessage, setCopiedMessage] = useState(false)

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"

  // Extract and resolve image URLs safely
  const resolveImageUrl = (img) => {
    if (!img) return null
    let raw = typeof img === 'string' ? img : (img.url || img.src || img.image || null)
    if (!raw) return null
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
      return raw
    }
    if (raw.startsWith('/')) {
      return `${serverUrl}${raw}`
    }
    return `${serverUrl}/${raw}`
  }

  // Filter out failed images
  const validImages = images
    .filter((_, index) => !failedImages.has(index))
    .map(img => resolveImageUrl(img))
    .filter(Boolean)

  const openLightbox = (url, index) => {
    setLightboxImage(url)
    setCurrentIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setCurrentIndex(0)
    document.body.style.overflow = 'auto'
  }

  const nextImage = (e) => {
    e.stopPropagation()
    if (currentIndex < validImages.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setLightboxImage(validImages[currentIndex + 1])
    }
  }

  const prevImage = (e) => {
    e.stopPropagation()
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setLightboxImage(validImages[currentIndex - 1])
    }
  }

  const copyFullMessage = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(index)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownloadFile = async (url, filename) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `${serverUrl}${url}?download=1`
      const a = document.createElement('a')
      a.href = fullUrl
      a.download = filename || 'download'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const getArtifactIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText size={18} className="text-red-400" />
      case 'ppt': return <Presentation size={18} className="text-amber-400" />
      case 'image': return <ImageIcon size={18} className="text-emerald-400" />
      default: return <Code2 size={18} className="text-indigo-400" />
    }
  }

  return (
    <>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full group`}>
        {/* User Attachments Preview */}
        {isUser && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 max-w-[85%]">
            {attachments.map((att, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 bg-indigo-900/30 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-xs text-indigo-200"
              >
                {att.kind === 'image' ? (
                  <ImageIcon size={14} className="text-indigo-400" />
                ) : (
                  <FileText size={14} className="text-red-400" />
                )}
                <span className="max-w-[160px] truncate">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className={`
          relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 transition-all duration-300
          ${isUser 
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/10' 
            : isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-bl-sm'
              : 'bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-sm backdrop-blur-md shadow-xl'
          }
        `}>
          {/* Markdown Content */}
          <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  const codeIndex = node?.position?.start?.line || 0

                  return !inline && match ? (
                    <div className="relative my-4 rounded-xl overflow-hidden border border-white/[0.08] bg-[#12151d]">
                      <div className="flex items-center justify-between px-4 py-1.5 bg-white/[0.03] border-b border-white/[0.06] text-xs text-slate-400">
                        <span className="font-mono text-[11px] text-indigo-400">{match[1]}</span>
                        <button
                          onClick={() => copyToClipboard(codeString, codeIndex)}
                          className="flex items-center gap-1.5 hover:text-white transition-colors bg-transparent border-none cursor-pointer py-1"
                        >
                          {copiedCode === codeIndex ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span className="text-[11px]">{copiedCode === codeIndex ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '14px', background: 'transparent', fontSize: '12px' }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-white/[0.08] text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </Markdown>
          </div>

          {/* Generated / Retrieved Images Grid */}
          {validImages.length > 0 && (
            <div className={`mt-4 grid gap-2.5 ${validImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {validImages.map((url, idx) => (
                <div 
                  key={idx}
                  onClick={() => openLightbox(url, idx)}
                  className="group/img relative rounded-xl overflow-hidden border border-white/[0.08] bg-black/20 aspect-video cursor-pointer hover:border-indigo-500/40 transition-all"
                >
                  <img
                    src={url}
                    alt="attachment"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    onError={() => setFailedImages(prev => new Set(prev).add(idx))}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <ZoomIn size={18} className="text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Artifact Cards */}
          {!isUser && artifacts.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
              {artifacts.map((art, aIdx) => (
                <div
                  key={art.id || aIdx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      {getArtifactIcon(art.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-100 truncate">{art.title}</p>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          v{art.version || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 capitalize">{art.type} Artifact</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        dispatch(setActiveArtifactId(art.id))
                        dispatch(setArtifactOpen(true))
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors border-none cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      Open
                    </button>
                    {art.url && (
                      <button
                        onClick={() => handleDownloadFile(art.url, art.title)}
                        className="flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors border-none bg-transparent cursor-pointer"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Copy Message Button */}
          {!isUser && (
            <button
              onClick={copyFullMessage}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-all border-none cursor-pointer"
              title="Copy message"
            >
              {copiedMessage ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownloadFile(lightboxImage, 'image.png')
              }}
              className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all border border-white/10"
              title="Download Image"
            >
              <Download size={20} />
            </button>
            <button
              onClick={closeLightbox}
              className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all border border-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div 
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Lightbox"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default MessageBubble
