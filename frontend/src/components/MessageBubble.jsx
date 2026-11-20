import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { ImageOff, X, ZoomIn, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function MessageBubble({ role, content, images, isError }) {
  const isUser = role === "user"
  const [lightboxImage, setLightboxImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [failedImages, setFailedImages] = useState(new Set())
  const [copiedCode, setCopiedCode] = useState(null)
  const [copiedMessage, setCopiedMessage] = useState(false)

  // ✅ Extract image URLs safely
  const getImageUrl = (img) => {
    if (!img) return null
    if (typeof img === 'string') return img
    if (typeof img === 'object') {
      return img.url || img.src || img.image || img.thumbnail || img.large || img.medium || img.small || null
    }
    return null
  }

  // ✅ Filter out failed images and get valid URLs
  const validImages = images?.filter((img, index) => {
    if (failedImages.has(index)) return false
    const url = getImageUrl(img)
    return url && (url.startsWith('http://') || url.startsWith('https://'))
  }) || []

  const imageUrls = validImages.map(img => getImageUrl(img)).filter(Boolean)

  // ✅ Open lightbox with image
  const openLightbox = (url, index) => {
    setLightboxImage(url)
    setCurrentIndex(index)
    document.body.style.overflow = 'hidden'
  }

  // ✅ Close lightbox
  const closeLightbox = () => {
    setLightboxImage(null)
    setCurrentIndex(0)
    document.body.style.overflow = 'auto'
  }

  // ✅ Navigate images in lightbox
  const nextImage = (e) => {
    e.stopPropagation()
    if (currentIndex < imageUrls.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setLightboxImage(imageUrls[currentIndex + 1])
    }
  }

  const prevImage = (e) => {
    e.stopPropagation()
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setLightboxImage(imageUrls[currentIndex - 1])
    }
  }

  // ✅ Copy full message
  const copyFullMessage = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // ✅ Copy code to clipboard
  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(index)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // ✅ Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight' && currentIndex < imageUrls.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setLightboxImage(imageUrls[currentIndex + 1])
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setLightboxImage(imageUrls[currentIndex - 1])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, imageUrls])

  // ✅ Premium Code Component with Syntax Highlighter
  const CodeBlock = ({ className, children }) => {
    const value = String(children).trim()
    const isInline = !className

    // ✅ Inline code
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-indigo-300 text-sm font-mono border border-white/5">
          {value}
        </code>
      )
    }

    // ✅ Extract language
    const language = className.replace("language-", "")

    return (
      <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10 shadow-xl shadow-black/30">
        {/* ✅ Header with language and copy button */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-sm border-b border-white/5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {language || 'Code'}
          </span>
          <button
            onClick={() => copyToClipboard(value, language)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/10"
          >
            {copiedCode === language ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* ✅ Syntax Highlighter */}
        <div className="relative">
          <SyntaxHighlighter
            language={language || 'text'}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              fontSize: '13px',
              lineHeight: '1.7',
              borderRadius: 0,
            }}
            showLineNumbers={value.split('\n').length > 1}
            wrapLines={true}
            wrapLongLines={false}
          >
            {value}
          </SyntaxHighlighter>

          {/* ✅ Line count badge for long code */}
          {value.split('\n').length > 20 && (
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5">
              {value.split('\n').length} lines
            </div>
          )}
        </div>
      </div>
    )
  }

  // ✅ Premium Minimal Components for Markdown
  const components = {
    code: CodeBlock,

    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-4 text-white/90 tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-semibold mt-5 mb-3 text-white/80 tracking-tight border-b border-white/5 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold mt-4 mb-2 text-white/70 tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-3 mb-2 text-white/60">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-base font-semibold mt-2 mb-1 text-white/50">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-semibold mt-2 mb-1 text-white/40 uppercase tracking-wider">
        {children}
      </h6>
    ),

    p: ({ children }) => (
      <p className="mb-3 leading-relaxed text-slate-200 text-[15px]">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="list-disc pl-4 mb-3 space-y-1.5 marker:text-indigo-400">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-4 mb-3 space-y-1.5 marker:text-indigo-400">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-slate-200 text-[14px] leading-relaxed pl-1">
        {children}
      </li>
    ),

    table: ({ children }) => (
      <div className="w-full my-4 rounded-xl overflow-hidden border border-white/5 shadow-lg shadow-black/20">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-white/5">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-white/5">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-white/5 transition-colors duration-300">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-white/10">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-slate-200/80 border-b border-white/5">
        {children}
      </td>
    ),

    blockquote: ({ children }) => (
      <div className="relative my-4 pl-5 py-2 border-l-2 border-indigo-400/60 bg-white/5 rounded-r-lg">
        <p className="text-slate-300/80 italic text-[15px] leading-relaxed">
          {children}
        </p>
      </div>
    ),

    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 underline decoration-indigo-500/30 underline-offset-2"
      >
        {children}
      </a>
    ),

    strong: ({ children }) => (
      <strong className="font-bold text-white/90">
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="italic text-slate-300/80">
        {children}
      </em>
    ),

    img: ({ src, alt }) => (
      <div className="my-4 rounded-xl overflow-hidden border border-white/5 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01]">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>
    ),

    hr: () => (
      <div className="relative my-6 flex items-center justify-center">
        <div className="flex-1 h-px bg-white/10"></div>
        <span className="mx-4 text-xs text-slate-600">✦</span>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>
    ),
  }

  return (
    <>
      <div className={`relative group flex ${isUser ? "justify-end" : "justify-start"} mb-5 animate-in fade-in slide-in-from-bottom-3 duration-400`}>
        <div className={`relative max-w-[78%] px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed shadow-xl transition-all duration-300 ${
  isUser
    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.01] border border-white/10"
    : isError
      ? "bg-red-500/10 border border-red-500/20 text-red-300"
      : "bg-[#1a1d24] backdrop-blur-sm border border-white/5 text-slate-200 rounded-bl-sm shadow-xl shadow-black/20 hover:border-white/10 transition-all duration-300"
}`}>

          {/* ✅ Decorative line for AI messages */}
          {!isUser && !isError && (
            <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-400/60 rounded-full shadow-lg shadow-indigo-500/20"></div>
          )}

          {/* ✅ Copy Full Message Button - Hover to show */}
          <button
            onClick={copyFullMessage}
            className="absolute top-3 right-3 text-slate-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            {copiedMessage ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Copy size={16} />
            )}
          </button>

          {/* ✅ Content with Markdown */}
          <div className="prose prose-invert prose-sm max-w-none">
            <Markdown remarkPlugins={[remarkGfm]} components={components}>
              {content}
            </Markdown>
          </div>

          {/* ✅ Images Grid with Premium Styling */}
          {imageUrls.length > 0 && (
            <div className={`grid gap-3 mt-4 ${
              imageUrls.length === 1 ? 'grid-cols-1' :
              imageUrls.length === 2 ? 'grid-cols-2' :
              imageUrls.length === 3 ? 'grid-cols-3' :
              'grid-cols-2 md:grid-cols-3'
            }`}>
              {imageUrls.map((url, i) => (
                <div 
                  key={i} 
                  className="relative group overflow-hidden rounded-xl border border-white/10 hover:border-indigo-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 cursor-pointer bg-white/5"
                  onClick={() => openLightbox(url, i)}
                >
                  <img
                    src={url}
                    loading='lazy'
                    alt={`Image ${i + 1}`}
                    className="w-full h-32 object-cover transition-all duration-500 group-hover:scale-105"
                    onError={() => {
                      setFailedImages(prev => new Set(prev).add(i))
                    }}
                  />
                  
                  {/* ✅ Overlay with zoom icon */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-full p-2.5 border border-white/20 transform scale-75 group-hover:scale-100 transition-all duration-300">
                      <ZoomIn size={18} className="text-white" />
                    </div>
                  </div>
                  
                  {/* ✅ Image counter badge */}
                  {imageUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10">
                      {i + 1}/{imageUrls.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ✅ Show message if images failed */}
          {images?.length > 0 && imageUrls.length === 0 && (
            <div className='mt-3 text-xs text-slate-400 bg-white/5 rounded-xl px-3 py-2 border border-white/5 flex items-center gap-2'>
              <ImageOff size={14} className="text-slate-400/60" />
              <span>{images.length} image{images.length > 1 ? 's' : ''} found but couldn't load</span>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Premium Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500"
          onClick={closeLightbox}
        >
          {/* ✅ Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110 border border-white/10"
          >
            <X size={24} />
          </button>

          {/* ✅ Image counter */}
          {imageUrls.length > 1 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10">
              {currentIndex + 1} / {imageUrls.length}
            </div>
          )}

          {/* ✅ Navigation buttons */}
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={prevImage}
                disabled={currentIndex === 0}
                className={`absolute left-6 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full p-4 transition-all duration-300 hover:scale-110 border border-white/10 ${
                  currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={nextImage}
                disabled={currentIndex === imageUrls.length - 1}
                className={`absolute right-6 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full p-4 transition-all duration-300 hover:scale-110 border border-white/10 ${
                  currentIndex === imageUrls.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* ✅ Premium Image Container */}
          <div 
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ✅ Image glow effect */}
            <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-3xl animate-pulse"></div>
            
            <img
              src={lightboxImage}
              alt="Lightbox"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-500 border border-white/5"
            />
          </div>

          {/* ✅ Hint text */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs font-medium tracking-widest uppercase bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5">
            Click outside or press ESC to close
          </div>
        </div>
      )}
    </>
  )
}

export default MessageBubble

