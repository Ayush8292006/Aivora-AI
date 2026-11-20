import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { 
  X, ZoomIn, Copy, Check, FileText, Presentation, 
  Code2, ImageIcon, Download, ExternalLink 
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
  const [failedImages, setFailedImages] = useState(new Set())
  const [copiedCode, setCopiedCode] = useState(null)
  const [copiedMessage, setCopiedMessage] = useState(false)

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"

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

  const openLightbox = (url) => {
    setLightboxImage(url)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxImage(null)
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
      case 'pdf': return <FileText size={15} className="text-[#E57373]" />
      case 'ppt': return <Presentation size={15} className="text-[#C9AD7C]" />
      case 'image': return <ImageIcon size={15} className="text-[#89977B]" />
      default: return <Code2 size={15} className="text-[#E9DDC8]" />
    }
  }

  return (
    <>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full group my-1.5`}>
        
        {/* User Attachments Preview Chips */}
        {isUser && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 max-w-[85%]">
            {attachments.map((att, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-1.5 bg-[#30271F]/60 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-[#E9DDC8] shadow-sm backdrop-blur-md"
              >
                {att.kind === 'image' ? (
                  <ImageIcon size={12} className="text-[#89977B]" />
                ) : (
                  <FileText size={12} className="text-[#C9AD7C]" />
                )}
                <span className="max-w-[150px] truncate text-[11px] font-medium">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Liquid Glass Message Container */}
        <div className={`
          relative max-w-[94%] sm:max-w-[88%] md:max-w-[82%] transition-all duration-200
          ${isUser 
            ? 'bg-[#343B29]/75 border border-white/20 text-[#F5F0E6] rounded-2xl rounded-br-sm px-4 py-3 shadow-lg backdrop-blur-xl' 
            : isError
              ? 'bg-red-950/35 border border-red-500/35 text-red-200 rounded-2xl rounded-bl-sm p-4 backdrop-blur-xl'
              : 'glass-card text-[#F5F0E6] rounded-2xl rounded-bl-sm p-4 sm:p-5 shadow-xl'
          }
        `}>
          
          {/* Assistant Header in Liquid Glass Style */}
          {!isUser && (
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#30271F] to-[#211C16] border border-white/20 flex items-center justify-center text-[10px] font-bold text-[#E9DDC8] shadow-xs">
                  A
                </div>
                <span className="text-xs font-bold text-[#F5F0E6] tracking-tight">Aivora AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9AD7C] shadow-[0_0_6px_#C9AD7C]" />
              </div>

              {/* Action: Copy Message */}
              <button
                onClick={copyFullMessage}
                className="opacity-70 group-hover:opacity-100 p-1 rounded-md text-[#89977B] hover:text-[#E9DDC8] hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
                title="Copy response"
              >
                {copiedMessage ? <Check size={12} className="text-[#89977B]" /> : <Copy size={12} />}
              </button>
            </div>
          )}

          {/* Markdown Content with Liquid Glass Typography */}
          <div className="prose-glass text-sm leading-relaxed break-words">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                strong({ children }) {
                  return <strong className="text-[#E9DDC8] font-bold">{children}</strong>
                },
                a({ href, children }) {
                  return (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#C9AD7C] hover:text-[#E9DDC8] underline decoration-[#C9AD7C]/45 transition-colors"
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
                    <div className="relative my-3 rounded-xl overflow-hidden border border-white/12 bg-[#17130F]/90 shadow-lg">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#211C16]/70 border-b border-white/10 text-xs text-[#89977B]">
                        <span className="font-mono text-[11px] text-[#C9AD7C]">{match[1]}</span>
                        <button
                          onClick={() => copyToClipboard(codeString, codeIndex)}
                          className="flex items-center gap-1.5 hover:text-white transition-colors bg-transparent border-none cursor-pointer py-0.5 text-[#89977B]"
                        >
                          {copiedCode === codeIndex ? <Check size={12} className="text-[#89977B]" /> : <Copy size={12} />}
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
                    <code className="bg-[#211C16]/80 text-[#E9DDC8] px-1.5 py-0.5 rounded-md text-xs font-mono border border-white/10" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </Markdown>
          </div>

          {/* Generated Images Grid in Translucent Glass Cards */}
          {validImages.length > 0 && (
            <div className={`mt-3.5 grid gap-2.5 ${validImages.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {validImages.map((url, idx) => (
                <div 
                  key={idx}
                  onClick={() => openLightbox(url)}
                  className="group/img relative rounded-xl overflow-hidden border border-white/15 bg-black/35 aspect-[4/3] cursor-pointer hover:border-white/30 transition-all shadow-md"
                >
                  <img
                    src={url}
                    alt="attachment"
                    className="w-full h-full object-cover group-hover/img:scale-104 transition-transform duration-300"
                    onError={() => setFailedImages(prev => new Set(prev).add(idx))}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn size={18} className="text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Artifact Cards (PDF, PPT, Image, Code) */}
          {!isUser && artifacts.length > 0 && (
            <div className="mt-3.5 space-y-2 border-t border-white/10 pt-3">
              {artifacts.map((art, aIdx) => (
                <div
                  key={art.id || aIdx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#211C16]/55 border border-white/10 hover:border-white/25 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-[#343B29]/70 border border-white/15 shadow-xs">
                      {getArtifactIcon(art.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#F5F0E6] truncate">{art.title}</p>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#E9DDC8] border border-white/10">
                          v{art.version || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#89977B] capitalize">{art.type} Artifact</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        dispatch(setActiveArtifactId(art.id))
                        dispatch(setArtifactOpen(true))
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold btn-liquid-gold border-none cursor-pointer"
                    >
                      <ExternalLink size={11} />
                      Open
                    </button>
                    {art.url && (
                      <button
                        onClick={() => handleDownloadFile(art.url, art.title)}
                        className="flex items-center gap-1 p-1.5 rounded-lg text-[#89977B] hover:text-[#E9DDC8] hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
                        title="Download"
                      >
                        <Download size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Lightbox Modal with Frosted Glass Controls */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownloadFile(lightboxImage, 'image.png')
              }}
              className="text-[#E9DDC8] hover:text-white glass-card p-2 rounded-xl transition-all cursor-pointer"
              title="Download Image"
            >
              <Download size={18} />
            </button>
            <button
              onClick={closeLightbox}
              className="text-[#89977B] hover:text-white glass-card p-2 rounded-xl transition-all cursor-pointer"
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
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default MessageBubble
