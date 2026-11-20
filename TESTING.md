# Aivora AI — Testing Guide

## Phase 0: Acceptance Verification Checklist

### Test Case 1: Session & Authentication
1. **Login Flow**:
   - Navigate to `http://localhost:5173`.
   - Click "Continue With Google". Complete popup sign-in.
   - Verify HTTP Response from `/api/auth/login` sets `Set-Cookie: sessionId=<UUID>; HttpOnly; SameSite=Lax`.
2. **Session Persistence**:
   - Refresh the page (`F5`).
   - Verify that `/api/me` returns HTTP 200 with user profile.
   - User remains logged in and conversation sidebar loads without returning to login screen.
3. **Invalid/Missing Session Protection**:
   - Send `GET /api/me` without cookies -> returns HTTP `401 Unauthorized` (not 400).
   - Send `GET /api/chat/get-conversation` without cookies -> returns HTTP `401 Unauthorized`.
4. **Logout Flow**:
   - Click the logout icon in the sidebar profile card.
   - Verify that `/api/auth/logout` deletes the Redis session key and clears the `sessionId` cookie.
   - Page redirects to unauthenticated state. Refreshing keeps user unauthenticated.

### Test Case 2: Agent Dispatch & Graph Execution
1. **Auto Agent**:
   - Send "Hello, what is Aivora AI?"
   - Verify router classifies to `chat` and returns conversational response.
2. **Chat Agent**:
   - Select "Chat" agent chip. Send "Explain JavaScript event loop in 2 paragraphs."
   - Verify response is returned without duplicated user prompt in LLM context.
3. **Search Agent**:
   - Select "Search" agent chip. Send "Who won the latest cricket match?"
   - Verify Tavily search is executed, results passed to chat synthesizer, and response generated without falling back to hardcoded server time string.
4. **Coding Agent**:
   - Select "Coding" agent chip. Send "Create a simple modern stopwatch with HTML, CSS, and JS".
   - Verify DeepSeek generates valid JSON with `index.html`, `style.css`, `script.js` files.
   - Verify Monaco preview / artifact panel renders code without JSON truncation error ("Error loading content").
5. **Placeholders (Image / PDF / PPT)**:
   - Select "Image" agent chip and send "Draw a futuristic city".
   - Select "PDF" agent chip and send "Create a resume for software engineer".
   - Select "PPT" agent chip and send "Create a pitch deck".
   - Verify each returns friendly response: `"This feature is coming soon."` without crashing the graph or throwing 500 error.
