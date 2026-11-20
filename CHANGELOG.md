# Aivora AI — Changelog

## Phase 0: Critical Bug Fixes

### 1. Cookie Name Mismatch
- Standardized session cookie name to `sessionId` across all services.
- Updated `backend/gateway/middleware/auth.middleware.js` to read `req.cookies?.sessionId` instead of `req.cookies?.session`.
- Changed status response from `400` to `401` for missing sessionId (`"unauthorized"`) and expired session (`"session expired"`).
- Updated `backend/services/auth/controllers/auth.controller.js` to clear `sessionId` with matching cookie attributes (`httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax'`).

### 2. Logout Crash Fix
- Registered `cookie-parser` in `backend/services/auth/index.js` so `req.cookies` is properly populated.
- Updated `logOut` controller in `backend/services/auth/controllers/auth.controller.js` to safely delete the session key in Redis (`session-${sessionId}`) and clear cookie with matching options.

### 3. Agent ID Mismatch
- Unified agent ID to `"image"` across frontend and backend.
- Updated `backend/services/agent/graph/router.js` prompt, classification rules, and `validAgents` array to use `"image"`.
- Added automatic mapping of legacy `"vision"` agent values to `"image"`.
- Updated `backend/services/agent/graph/graph.js` nodes and conditional edges to use `"image"`.

### 4. Empty Agent Crash Fix
- Fixed `pdfAgent` in `backend/services/agent/agents/pdf.agent.js` to return `{ ...state, aiResponse: "This feature is coming soon." }`.
- Fixed `pptAgent` in `backend/services/agent/agents/ppt.agent.js` to return `{ ...state, aiResponse: "This feature is coming soon." }`.
- Fixed `imageAgent` in `backend/services/agent/agents/vision.agent.js` to return `{ ...state, aiResponse: "This feature is coming soon." }`.

### 5. Duplicate Protect Middleware
- Removed redundant duplicate `protect` middleware on `/api/agent` in `backend/gateway/index.js`.
- Attached `proxyWithHeader` to forward `x-user-id` to the agent service.

### 6. Coding Agent Truncation & Parsing
- Increased `maxTokens` on OpenRouter DeepSeek configuration from 2,500 to 8,192 in `backend/services/agent/config/llmModels.js`.
- Added 60-second execution timeout via `Promise.race`.
- Updated intent classification to use `.trim().toUpperCase()` and `includes("CODE_GENERATION")` instead of strict equality.
- Implemented robust `parseProjectJSON` helper that trims output, strips markdown fences, extracts outermost JSON bounds, and retries once with the LLM upon initial parse failure before fallback.

### 7. Duplicate User Message in LLM Context
- Stripped Mongo fields from history in `backend/services/agent/config/memory.js` so only `{ role, content }` are stored and passed.
- Filtered out the trailing user message from retrieved history in `backend/services/agent/agents/chat.agent.js` when it matches the current user prompt, preventing the prompt from being sent twice in context.
- Capped conversational memory history to the last 20 messages.

### 8. Memory Cache Logic
- Removed premature `redis.del("messages-${conversationId}")` call from `backend/services/agent/controllers/agent.controller.js`.
- In `agent.controller.js`, cached both the user prompt and the assistant response in Redis (`addMessage` for user and assistant) after saving to MongoDB.
- Made `getMemory` consistently return an array (never `null` or `undefined`).
- Fixed typo in `backend/services/agent/utils/getMessages.js` (`converstationId` -> `conversationId`) and safeguarded error returns to empty array.

### 9. Chat Agent "No Access" Override Removal
- Removed the hardcoded override in `backend/services/agent/agents/chat.agent.js` that replaced assistant answers containing phrases like "real-time" or "not able to" with server time.
- Injected the current date & time formatted in `Asia/Kolkata` timezone directly into the system prompt.
- Refined system prompt instructions so the model leverages search results accurately without claiming lack of access.

### 10. Environment Variable Loading Order
- Added `import "dotenv/config"` as the first line of `backend/shared/redis/redis.js` and added lazy connection / retry strategy with error logging.
- Placed `import "dotenv/config"` at the top of each microservice entry point (`gateway/index.js`, `auth/index.js`, `chat/index.js`, `agent/index.js`).
