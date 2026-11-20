# Aivora AI — Testing Guide

## Automated Tests

Run the backend agent test suite:
```bash
node backend/services/agent/test/agents.test.js
node backend/services/agent/test/router.test.js
```

Both suites verify:
- Storage adapter (save, read, delete, path traversal protection).
- PPTX deck builder (builds valid 16:9 `.pptx` buffer with slides, stats, tables, and notes).
- PDF HTML sanitizer (strips script tags, external scripts, preserves inline styling).
- Router deterministic decisions (explicit agent selection, attachment routing, keyword rules in English & Hindi).

---

## Manual Test Cases

### 1. PDF Agent
- **Resume Generation**:
  - Prompt: `"Mera resume banao: Ayush, React developer, 2 projects"`
  - Verify artifact card appears with Red PDF icon. Click **Open** to inspect the PDF layout in the Artifact panel.
  - Click **Download** and verify the file opens in Adobe Acrobat / browser with clean formatting.
- **Hindi Document**:
  - Prompt: `"Solar energy par 2 page ka report banao Hindi mein"`
  - Verify Hindi Devanagari text renders properly without missing character boxes.
- **Follow-up Edit**:
  - Prompt: `"skills section add karo"`
  - Verify new version `v2` is generated while preserving earlier context.
- **Read & Q&A**:
  - Click **Paperclip**, upload a PDF document, and type: `"Summary do aur page 2 par kya likha hai?"`
  - Verify the response accurately cites the page content with page numbers (`Page 2`).
- **File Validation**:
  - Try uploading a file > 20 MB or non-PDF/image format. Verify immediate client rejection and backend 400 response.

### 2. PPT Agent
- **Deck Generation**:
  - Prompt: `"AI in healthcare par 8 slide ka PPT banao"`
  - Verify 8 slides generated with title slide and closing slide.
  - In Artifact panel, navigate slides using Next/Prev and thumbnail numbers.
  - Toggle **Speaker Notes** and verify notes match the slide content.
  - Click **Download** and open the `.pptx` file in Microsoft PowerPoint / LibreOffice to verify real editable text boxes.
- **Follow-up Edit**:
  - Prompt: `"slide 3 mein pricing table add karo aur theme dark kar do"`
  - Verify slide deck updates with `dark` theme palette and new table, generating `v2`.

### 3. Image Agent
- **Image Generation**:
  - Prompt: `"Ek sunset wala wallpaper generate karo"`
  - Verify image appears inline in chat with lightbox support and in the Artifact panel.
  - Click **Download** and verify the PNG/WebP file saves locally.
- **Image Understanding**:
  - Click **Paperclip**, upload a screenshot or chart, and ask: `"Isme kya error hai?"`
  - Verify Gemini multimodal model analyzes the image and explains the error in conversational Hindi/English.
- **Regenerate / Variations**:
  - Prompt: `"Dusra bana do with blue night theme"`
  - Verify image agent reuses the previous prompt context with the new style adjustment.

### 4. Cross-Cutting & Security
- **Ownership Guard**:
  - Ensure User B receives HTTP 404/403 when trying to access `/api/files/:id` belonging to User A.
- **Mobile Responsive (375px)**:
  - Open DevTools mobile viewport (375px width).
  - Open Artifact panel and verify it expands as a drawer, allowing preview and downloading.
