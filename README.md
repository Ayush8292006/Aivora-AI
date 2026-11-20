# Aivora AI

A multi-agent AI chat application with real-time web search, artifact workspace preview, and specialized task agents.

## Architecture

- **Gateway Service** (`:8000`): Express 5 reverse proxy, session authentication guard (`sessionId` via Redis), CORS & route routing.
- **Auth Service** (`:8001`): Firebase Admin Google token verification, MongoDB User persistence, 7-day Redis session management.
- **Chat Service** (`:8002`): MongoDB Conversation and Message persistence (with multi-file artifact and image attachments).
- **Agent Service** (`:8003`): LangGraph orchestration engine with router and agent nodes (`chat`, `search`, `coding`, `pdf`, `ppt`, `image`).
- **Frontend** (`:5173`): Vite + React 19, Tailwind CSS v4, Redux Toolkit, Framer Motion, Monaco Editor & Live Preview.

## Services & Ports

| Service | Port | Description |
|---|---|---|
| Gateway | 8000 | API Gateway & Session Auth |
| Auth | 8001 | Firebase Auth & Session Controller |
| Chat | 8002 | Conversation & Message Persistence |
| Agent | 8003 | LangGraph Multi-Agent Engine |
| Frontend | 5173 | React Web Application |

## Getting Started

### Prerequisites
- Node.js >= 20
- Redis server
- MongoDB instance

### Environment Variables
Each service directory contains its own `.env` configuration. See `.env.example` in each service directory.

### Development Run
Install dependencies in each service and run concurrently:
```bash
# Gateway
cd backend/gateway && npm run dev

# Auth
cd backend/services/auth && npm run dev

# Chat
cd backend/services/chat && npm run dev

# Agent
cd backend/services/agent && npm run dev

# Frontend
cd frontend && npm run dev
```
