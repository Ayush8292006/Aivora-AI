// start.js - Production Root Orchestrator for Render deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDbUri(serviceName, defaultDb) {
  if (serviceName === 'auth' && process.env.AUTH_MONGODB_URI) return process.env.AUTH_MONGODB_URI;
  if (serviceName === 'chat' && process.env.CHAT_MONGODB_URI) return process.env.CHAT_MONGODB_URI;
  if (serviceName === 'agent' && process.env.AGENT_MONGODB_URI) return process.env.AGENT_MONGODB_URI;

  const rawBase = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!rawBase) return undefined;
  const base = rawBase.replace(/^["']|["']$/g, '').trim();

  try {
    const [connPart, queryPart] = base.split('?');
    const protoEnd = connPart.indexOf('://');
    const pathSlash = protoEnd !== -1 ? connPart.indexOf('/', protoEnd + 3) : -1;
    const hostPart = pathSlash !== -1 ? connPart.substring(0, pathSlash) : connPart;
    const query = queryPart ? `?${queryPart}` : '?retryWrites=true&w=majority';
    return `${hostPart}/${defaultDb}${query}`;
  } catch (e) {
    return base;
  }
}

const authDbUri = getDbUri('auth', 'auth');
const chatDbUri = getDbUri('chat', 'chat');
const agentDbUri = getDbUri('agent', 'agent');

const services = [
  {
    name: 'AUTH SERVICE',
    cwd: path.join(__dirname, 'backend', 'services', 'auth'),
    script: 'index.js',
    env: {
      ...process.env,
      PORT: '8001',
      ...(authDbUri ? { MONGODB_URI: authDbUri, MONGO_URI: authDbUri } : {})
    }
  },
  {
    name: 'CHAT SERVICE',
    cwd: path.join(__dirname, 'backend', 'services', 'chat'),
    script: 'index.js',
    env: {
      ...process.env,
      PORT: '8002',
      ...(chatDbUri ? { MONGODB_URI: chatDbUri, MONGO_URI: chatDbUri } : {})
    }
  },
  {
    name: 'AGENT SERVICE',
    cwd: path.join(__dirname, 'backend', 'services', 'agent'),
    script: 'index.js',
    env: {
      ...process.env,
      PORT: '8003',
      ...(agentDbUri ? { MONGODB_URI: agentDbUri, MONGO_URI: agentDbUri } : {})
    }
  },
  {
    name: 'GATEWAY (PUBLIC)',
    cwd: path.join(__dirname, 'backend', 'gateway'),
    script: 'index.js',
    // Gateway listens on Render's assigned PORT or 8000
    env: {
      ...process.env,
      PORT: process.env.PORT || '8000',
      AUTH_SERVICE: 'http://127.0.0.1:8001',
      CHAT_SERVICE: 'http://127.0.0.1:8002',
      AGENT_SERVICE: 'http://127.0.0.1:8003'
    }
  }
];

const runningProcesses = [];
let isShuttingDown = false;

console.log('🚀 Starting Aivora AI All-in-One Cloud Engine on Render...');

function launchService(service) {
  if (isShuttingDown) return;

  const child = spawn('node', [service.script], {
    cwd: service.cwd,
    env: service.env,
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error(`❌ [${service.name}] Failed to start:`, err.message);
  });

  child.on('exit', (code, signal) => {
    if (isShuttingDown) return;
    console.warn(`⚠️ [${service.name}] Process exited (code: ${code}, signal: ${signal}). Auto-restarting in 3s...`);
    setTimeout(() => launchService(service), 3000);
  });

  runningProcesses.push(child);
}

services.forEach(launchService);

// Graceful shutdown
const shutdown = (signal) => {
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down all Aivora AI services...`);
  runningProcesses.forEach((p) => {
    try {
      p.kill('SIGTERM');
    } catch (e) {}
  });
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
