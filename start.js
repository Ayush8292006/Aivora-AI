// start.js - Production Root Orchestrator for Render deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  {
    name: 'AUTH SERVICE',
    cwd: path.join(__dirname, 'backend', 'services', 'auth'),
    script: 'index.js',
    env: { ...process.env, PORT: '8001' }
  },
  {
    name: 'CHAT SERVICE',
    cwd: path.join(__dirname, 'backend', 'services', 'chat'),
    script: 'index.js',
    env: { ...process.env, PORT: '8002' }
  },
  {
    name: 'AGENT SERVICE',
    cwd: path.join(__dirname, 'backend', 'services', 'agent'),
    script: 'index.js',
    env: { ...process.env, PORT: '8003' }
  },
  {
    name: 'GATEWAY (PUBLIC)',
    cwd: path.join(__dirname, 'backend', 'gateway'),
    script: 'index.js',
    // Gateway listens on Render's assigned PORT or 8000
    env: {
      ...process.env,
      PORT: process.env.PORT || '8000',
      AUTH_SERVICE: 'http://localhost:8001',
      CHAT_SERVICE: 'http://localhost:8002',
      AGENT_SERVICE: 'http://localhost:8003'
    }
  }
];

const runningProcesses = [];

console.log('🚀 Starting Aivora AI All-in-One Cloud Engine on Render...');

services.forEach((service) => {
  const child = spawn('node', [service.script], {
    cwd: service.cwd,
    env: service.env,
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error(`❌ [${service.name}] Failed to start:`, err.message);
  });

  child.on('exit', (code, signal) => {
    console.warn(`⚠️ [${service.name}] Process exited (code: ${code}, signal: ${signal})`);
  });

  runningProcesses.push(child);
});

// Graceful shutdown
const shutdown = (signal) => {
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
