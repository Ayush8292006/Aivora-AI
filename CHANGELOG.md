# Aivora AI — Changelog

## Phase 0: Critical Bug Fixes
- Standardized session cookie name to `sessionId` across all services.
- Updated `backend/gateway/middleware/auth.middleware.js` to read `req.cookies?.sessionId` and return 401.
- Registered `cookie-parser` in `auth` service and implemented clean session deletion on logout.
- Unified image agent ID to `"image"` across frontend chips, router prompt, and graph edges.
- Added placeholders for empty agents to prevent LangGraph crashing.
- Removed duplicate `protect` middleware on `/api/agent` in gateway and attached `proxyWithHeader`.
- Raised LLM max tokens to 8,192 and added robust JSON parsing for coding projects.
- Removed duplicate user turn in LLM context and fixed Redis memory caching.
- Removed artificial server-time override in chat agent and injected real-time context.
- Fixed `dotenv/config` loading order across services.

---

## PDF, PPT & Image Agents Implementation (Complete End-to-End)

### 1. Storage & File Management
- Created MongoDB `File` model in `backend/services/agent/models/file.model.js` tracking uploaded and generated files (`userId`, `conversationId`, `origin`, `kind`, `name`, `mimeType`, `size`, `path`, `text`, `pages`, `meta`).
- Created `storage.js` disk adapter storing files securely under `backend/services/agent/storage/<userId>/<uuid>.<ext>` with path traversal guards.
- Implemented file endpoints under `/files`:
  - `POST /files/upload`: Multer upload with magic bytes detection (`checkMagicBytes`) and size limits (images ≤ 8 MB, PDFs ≤ 20 MB).
  - `GET /files/:id`: Secure streaming with ownership verification (`File.userId === x-user-id`) and `Content-Disposition`.
  - `DELETE /files/:id`: Deletes disk file and database record with ownership verification.
- Gateway mounts `/api/files` with `proxyWithHeader` and `parseReqBody: false` for multipart streaming.

### 2. PDF Agent (`pdf.agent.js`)
- **GENERATE mode**: LLM generates clean HTML document tailored to requested document type (`resume`, `report`, `invoice`, `letter`, `notes`).
- Puppeteer renders HTML to high-resolution A4 PDF with native font fallbacks supporting Hindi / Devanagari text (`Nirmala UI`, `Mangal`, `Segoe UI`).
- Hardened Puppeteer security: disabled JavaScript in page, blocked all network requests except `data:` URIs, sanitized HTML via `sanitize-html`.
- Follow-up edits: loads latest conversation PDF source HTML, applies edits via LLM, and creates `v2` with `parentId`.
- **READ mode**: Extracts text using `pdf-parse` (with Gemini multimodal OCR fallback for scanned documents), answers queries citing page numbers (`Page X`).

### 3. PPT Agent (`ppt.agent.js`)
- LLM generates structured presentation JSON outline (titles, layouts, bullets capped at 6 per slide, stats, comparison tables, speaker notes).
- Generates 16:9 `.pptx` presentations using `pptxgenjs` with customizable themes (`modern`, `dark`, `minimal`, `corporate`, `vibrant`).
- Returns artifact with `meta.slides` enabling live interactive preview in the frontend.
- Follow-up edits: updates existing presentation slides, rebuilds `.pptx`, and tracks version history (`v1` -> `v2`).

### 4. Image Agent (`vision.agent.js` -> `imageAgent`)
- **GENERATE mode**: Rewrites prompt into an expanded English prompt, calls image provider abstraction (`gemini` Imagen, `openrouter`, or Tavily image search fallback), saves output file, returns inline image URL and artifact.
- Supports aspect ratios (`1:1`, `16:9`, `9:16`) and multi-image variations.
- **UNDERSTAND mode**: Multi-modal Gemini analysis for user-uploaded images (screenshots, charts, OCR, object analysis).
- **REGENERATE mode**: Reuses previous image prompt for style variations.

### 5. Frontend Enhancements
- **Paperclip Attachments**: File picker in `ChatInput.jsx` supporting PDF and images with drag-and-drop, clipboard image paste, upload progress, and preview chips with removal.
- **Message Rendering**: `MessageBubble.jsx` renders artifact cards (icon by type, title, version badge, "Open" and "Download" buttons) and displays user attachments.
- **Artifact Panel Multi-Type Switcher**:
  - `Project`: Monaco code editor + multi-device preview.
  - `pdf`: Inline PDF viewer via blob stream, page count, and download button.
  - `ppt`: 16:9 interactive slide deck previewer rendered from `meta.slides`, speaker notes drawer, thumbnail strip, and `.pptx` download.
  - `image`: Zoomable image viewer with download and copy prompt.
  - Universal download button for all artifact types.
- **Progress UX**: Status bubble with live agent state ("Designing PDF...", "Building slides...", "Synthesizing image...") and working Stop button (`AbortController`).
