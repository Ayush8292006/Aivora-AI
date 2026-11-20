import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { 
  X, ZoomIn, Copy, Check, FileText, Presentation, 
  Code2, ImageIcon, Download, ExternalLink, Sparkles 
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
      case 'pdf': return <FileText size={16} className="text-[#f87171]" />
      case 'ppt': return <Presentation size={16} className="text-[#dfc499]" />
      case 'image': return <ImageIcon size={16} className="text-[#4de370]" />
      default: return <Code2 size={16} className="text-[#9dfcb1]" />
    }
  }

  return (
    <>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full group my-1`}>
        
        {/* User Attachments Preview Chips */}
        {isUser && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 max-w-[85%]">
            {attachments.map((att, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 bg-[#122b1a]/80 border border-[#2b5438] rounded-xl px-3 py-1.5 text-xs text-[#c4d6c7]"
              >
                {att.kind === 'image' ? (
                  <ImageIcon size={13} className="text-[#4de370]" />
                ) : (
                  <FileText size={13} className="text-[#dfc499]" />
                )}
                <span className="max-w-[160px] truncate">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message Bubble Container */}
        <div className={`
          relative max-w-[92%] sm:max-w-[85%] md:max-w-[78%] transition-all duration-300
          ${isUser 
            ? 'bg-[#153120]/90 border border-[#2b593c] text-[#f5f8f5] rounded-2xl rounded-br-sm px-4 py-3 shadow-lg' 
            : isError
              ? 'bg-red-950/30 border border-red-500/30 text-red-200 rounded-2xl rounded-bl-sm px-4 py-3.5'
              : 'bg-transparent text-[#e6ede7] px-1 py-1'
          }
        `}>
          
          {/* Assistant Header (ChatGPT + Green glowing dot as in reference image) */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#173822] border border-[#3e6e4d] flex items-center justify-center shadow-sm">
                <Sparkles size={12} className="text-[#4de370]" />
              </div>
              <span className="text-sm font-bold text-[#f5f8f5] tracking-tight">ChatGPT</span>
              <span className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
            </div>
          )}

          {/* Markdown Content (with gold bold highlights from reference image) */}
          <div className="prose-aurora text-sm leading-relaxed break-words">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                strong({ children }) {
                  return <strong className="text-[#dfc499] font-bold">{children}</strong>
                },
                a({ href, children }) {
                  return (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#9dfcb1] hover:text-[#dfc499] underline decoration-[#4de370]/40 transition-colors"
                    >
                      {children}
                    </a>
                  )
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  const codeIndex = node?.position?.start?.line || 0

                  return !inline && match ? (
                    <div className="relative my-3 rounded-xl overflow-hidden border border-[#2b4d36] bg-[#07120a]">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0e2114] border-b border-[#23422d] text-xs text-[#8ca893]">
                        <span className="font-mono text-[11px] text-[#4de370]">{match[1]}</span>
                        <button
                          onClick={() => copyToClipboard(codeString, codeIndex)}
                          className="flex items-center gap-1.5 hover:text-white transition-colors bg-transparent border-none cursor-pointer py-0.5 text-[#8ca893]"
                        >
                          {copiedCode === codeIndex ? <Check size={12} className="text-[#4de370]" /> : <Copy size={12} />}
                          <span className="text-[11px]">{copiedCode === codeIndex ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '12px' }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-[#12281a] text-[#dfc499] px-1.5 py-0.5 rounded text-xs font-mono border border-[#2b5438]/50" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </Markdown>
          </div>

          {/* Generated / Retrieved Images Grid (as shown in reference image) */}
          {validImages.length > 0 && (
            <div className={`mt-3.5 grid gap-2.5 ${validImages.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {validImages.map((url, idx) => (
                <div 
                  key={idx}
                  onClick={() => openLightbox(url, idx)}
                  className="group/img relative rounded-xl overflow-hidden border border-[#284933] bg-[#07120a] aspect-[4/3] cursor-pointer hover:border-[#4de370]/60 transition-all shadow-md"
                >
                  <img
                    src={url}
                    alt="campus/scene"
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

          {/* Artifact Cards (PDF, PPT, Image, Code) */}
          {!isUser && artifacts.length > 0 && (
            <div className="mt-3.5 space-y-2 border-t border-[#23422d]/60 pt-3">
              {artifacts.map((art, aIdx) => (
                <div
                  key={art.id || aIdx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0d2114]/80 border border-[#284933] hover:border-[#4de370]/50 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-[#14301e] border border-[#2d573a]">
                      {getArtifactIcon(art.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-[#f5f8f5] truncate">{art.title}</p>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#163821] text-[#9dfcb1] border border-[#346b43]">
                          v{art.version || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7d9984] capitalize">{art.type} Artifact</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        dispatch(setActiveArtifactId(art.id))
                        dispatch(setArtifactOpen(true))
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold aurora-gold-btn border-none cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      Open
                    </button>
                    {art.url && (
                      <button
                        onClick={() => handleDownloadFile(art.url, art.title)}
                        className="flex items-center gap-1 p-1.5 rounded-lg text-[#8ca893] hover:text-white hover:bg-[#163821] transition-colors border-none bg-transparent cursor-pointer"
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
              className="opacity-0 group-hover:opacity-100 mt-2 p-1 rounded-md text-[#7d9984] hover:text-[#f4e5cb] hover:bg-[#122b1a] transition-all border-none bg-transparent cursor-pointer text-xs flex items-center gap-1"
              title="Copy message"
            >
              {copiedMessage ? <Check size={12} className="text-[#4de370]" /> : <Copy size={12} />}
              <span>{copiedMessage ? 'Copied' : 'Copy'}</span>
            </button>
          )}

        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownloadFile(lightboxImage, 'image.png')
              }}
              className="text-[#f4e5cb] hover:text-white bg-[#12281a] hover:bg-[#1b3d27] rounded-full p-2.5 transition-all border border-[#2b5438]"
              title="Download Image"
            >
              <Download size={18} />
            </button>
            <button
              onClick={closeLightbox}
              className="text-[#9ab5a0] hover:text-white bg-[#12281a] hover:bg-[#1b3d27] rounded-full p-2.5 transition-all border border-[#2b5438]"
            >
              <X size={18} />
            </button>
          </div>

          <div 
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Lightbox"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-[#2b5438]"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default MessageBubble
