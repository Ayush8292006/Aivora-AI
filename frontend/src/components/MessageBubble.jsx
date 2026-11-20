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
      case 'pdf': return <FileText size={15} className="text-[#A84B4B]" />
      case 'ppt': return <Presentation size={15} className="text-[#8E6D38]" />
      case 'image': return <ImageIcon size={15} className="text-[#6C8461]" />
      default: return <span className="font-mono text-xs font-bold text-[#23211E]">&lt;/&gt;</span>
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
                className="flex items-center gap-1.5 bg-[#F2ECE0] border border-[#DDD3C1] rounded-xl px-2.5 py-1 text-xs text-[#1E1B18] shadow-2xs"
              >
                {att.kind === 'image' ? (
                  <ImageIcon size={12} className="text-[#4A653C]" />
                ) : (
                  <FileText size={12} className="text-[#696256]" />
                )}
                <span className="max-w-[150px] truncate text-[11px] font-medium">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message Card Surface */}
        <div className={`
          relative max-w-[94%] sm:max-w-[88%] md:max-w-[82%] transition-all
          ${isUser 
            ? 'bg-[#243223] text-[#FFFFFF] rounded-2xl px-4 py-2.5 shadow-2xs text-sm font-medium' 
            : isError
              ? 'bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] rounded-2xl p-4'
              : 'bg-[#F2ECE0] border border-[#DDD3C1] text-[#1E1B18] rounded-2xl p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_3px_rgba(0,0,0,0.03)]'
          }
        `}>
          
          {/* Assistant Header inside AI Message Card */}
          {!isUser && (
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDD3C1]/80">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#24201C] text-[#E8DDC8] flex items-center justify-center text-[10px] font-bold">
                  A
                </div>
                <span className="text-xs font-semibold text-[#1E1B18] tracking-tight">Aivora AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A653C]" />
              </div>

              {/* Action: Copy Message */}
              <button
                onClick={copyFullMessage}
                className="opacity-70 group-hover:opacity-100 p-1 rounded-md text-[#696256] hover:text-[#1E1B18] hover:bg-[#EAE2D2] transition-all border-none bg-transparent cursor-pointer"
                title="Copy response"
              >
                {copiedMessage ? <Check size={12} className="text-[#243223]" /> : <Copy size={12} />}
              </button>
            </div>
          )}

          {/* Markdown Content (Prose Editorial Cream) */}
          <div className={`${isUser ? 'text-white' : 'prose-editorial-cream text-sm leading-relaxed break-words'}`}>
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  const codeIndex = node?.position?.start?.line || 0

                  return !inline && match ? (
                    <div className="relative my-3 rounded-xl overflow-hidden border border-[#BCB29F] bg-[#191816] text-[#DDD4C5] shadow-xs">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#23211E] border-b border-[#2A2825] text-xs text-[#8E8A82]">
                        <span className="font-mono text-[11px] text-[#B6C6AE]">{match[1]}</span>
                        <button
                          onClick={() => copyToClipboard(codeString, codeIndex)}
                          className="flex items-center gap-1.5 hover:text-white transition-colors bg-transparent border-none cursor-pointer py-0.5 text-[#8E8A82]"
                        >
                          {copiedCode === codeIndex ? <Check size={12} className="text-[#9BB091]" /> : <Copy size={12} />}
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
                    <code className={isUser ? "bg-white/20 text-white px-1.5 py-0.5 rounded text-xs font-mono" : "bg-[#C8BEAC] text-[#1E1B18] px-1.5 py-0.5 rounded text-xs font-mono border border-[#B8AE9A]"} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </Markdown>
          </div>

          {/* Generated Images Grid */}
          {validImages.length > 0 && (
            <div className={`mt-3.5 grid gap-2.5 ${validImages.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {validImages.map((url, idx) => (
                <div 
                  key={idx}
                  onClick={() => openLightbox(url)}
                  className="group/img relative rounded-xl overflow-hidden border border-[#BCB29F] bg-[#DDD4C5] aspect-[4/3] cursor-pointer hover:border-[#1E1B18] transition-all shadow-2xs"
                >
                  <img
                    src={url}
                    alt="attachment"
                    className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-200"
                    onError={() => setFailedImages(prev => new Set(prev).add(idx))}
                  />
                  <div className="absolute inset-0 bg-[#23211E]/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn size={18} className="text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Project Artifact Inner Card (Exact Match to Reference Image) */}
          {!isUser && artifacts.length > 0 && (
            <div className="mt-3.5 space-y-2 border-t border-[#DDD3C1]/80 pt-3">
              {artifacts.map((art, aIdx) => (
                <div
                  key={art.id || aIdx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F3] border border-[#DDD3C1] shadow-2xs hover:border-[#9BB091] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F2ECE0] border border-[#DDD3C1] flex items-center justify-center shrink-0">
                      {getArtifactIcon(art.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-[#1E1B18] truncate">{art.title}</p>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F2ECE0] text-[#696256] border border-[#DDD3C1]">
                          v{art.version || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#696256] capitalize font-medium">{art.type === 'Project' ? 'Project Artifact' : `${art.type} Artifact`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        dispatch(setActiveArtifactId(art.id))
                        dispatch(setArtifactOpen(true))
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#241F1A] hover:bg-[#181410] text-white border-none cursor-pointer shadow-xs transition-colors"
                    >
                      <ExternalLink size={12} />
                      <span>Open</span>
                    </button>
                    {art.url && (
                      <button
                        onClick={() => handleDownloadFile(art.url, art.title)}
                        className="flex items-center gap-1 p-1.5 rounded-lg text-[#696256] hover:text-[#1E1B18] hover:bg-[#F2ECE0] transition-colors border-none bg-transparent cursor-pointer"
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

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[999] bg-[#23211E]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={closeLightbox}
        >
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownloadFile(lightboxImage, 'image.png')
              }}
              className="text-[#DDD4C5] hover:text-white bg-[#241F1A] p-2 rounded-xl transition-all cursor-pointer"
              title="Download Image"
            >
              <Download size={18} />
            </button>
            <button
              onClick={closeLightbox}
              className="text-[#DDD4C5] hover:text-white bg-[#241F1A] p-2 rounded-xl transition-all cursor-pointer"
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
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-xl border border-white/20"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default MessageBubble
