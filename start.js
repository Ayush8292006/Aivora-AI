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

import fs from 'fs';

const logFilePath = path.join(__dirname, 'services.log');
try {
  fs.writeFileSync(logFilePath, `=== Aivora Cloud Engine Started at ${new Date().toISOString()} ===\n`);
} catch (e) {}

function appendLog(msg) {
  try {
    fs.appendFileSync(logFilePath, msg + '\n');
  } catch (e) {}
}

const runningProcesses = [];
let isShuttingDown = false;

console.log('🚀 Starting Aivora AI All-in-One Cloud Engine on Render...');

function launchService(service) {
  if (isShuttingDown) return;

  const child = spawn('node', [service.script], {
    cwd: service.cwd,
    env: service.env,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  child.stdout.on('data', (d) => {
    process.stdout.write(`[${service.name}] ${d}`);
    appendLog(`[${service.name}] ${d}`.trimEnd());
  });

  child.stderr.on('data', (d) => {
    process.stderr.write(`❌ [${service.name}] ${d}`);
    appendLog(`❌ [${service.name} ERR] ${d}`.trimEnd());
  });

  child.on('error', (err) => {
    const msg = `❌ [${service.name}] Failed to start: ${err.message}`;
    console.error(msg);
    appendLog(msg);
  });

  child.on('exit', (code, signal) => {
    const msg = `⚠️ [${service.name}] Process exited (code: ${code}, signal: ${signal}). Auto-restarting in 3s...`;
    console.warn(msg);
    appendLog(msg);
    if (isShuttingDown) return;
    setTimeout(() => launchService(service), 3000);
  });

  runningProcesses.push(child);
}

const internalServices = services.filter(s => s.name !== 'GATEWAY (PUBLIC)');
const gatewayService = services.find(s => s.name === 'GATEWAY (PUBLIC)');

console.log('📦 Booting internal microservices (Auth, Chat, Agent)...');
internalServices.forEach(launchService);

// Allow 3.5s for internal microservices to bind to ports (8001, 8002, 8003) and connect to MongoDB & Redis
// before exposing the public Gateway port to Render's router.
setTimeout(() => {
  if (!isShuttingDown && gatewayService) {
    console.log('🌐 Internal microservices warmed up. Launching Public Gateway...');
    launchService(gatewayService);
  }
}, 3500);

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
