import express from 'express';
import helmet from 'helmet';
import http from 'http';
import WebSocket from 'ws';
import { config } from './config';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';
import { authMiddleware } from './middleware/auth';
import { generalLimiter } from './middleware/rateLimiter';
import { generationService } from './services/generationService';

// Import routes
import healthRouter from './routes/health';
import libraryRouter from './routes/library';
import queueRouter from './routes/queue';
import generateRouter, { setStatusBroadcastFunctions } from './routes/generate';
import outputRouter from './routes/output';

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Rate limiting
app.use(generalLimiter);

// Authentication (except health endpoint)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  return authMiddleware(req, res, next);
});

// Routes
app.use('/api', healthRouter);
app.use('/api', libraryRouter);
app.use('/api', queueRouter);
app.use('/api', generateRouter);
app.use('/api', outputRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Factory API Server',
    version: '6.0.0',
    status: 'running',
    endpoints: [
      'GET /api/health',
      'GET /api/library/:type',
      'GET /api/queue',
      'POST /api/generate',
      'GET /api/generate/status',
      'GET /api/output',
    ],
  });
});

// Error handler (must be last)
app.use(errorHandler);

// ========================================
// WebSocket Server
// ========================================

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('📡 Client connected to WebSocket');

  // Send initial status
  ws.send(JSON.stringify({
    type: 'status',
    data: generationService.getStatus(),
  }));

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('📡 Client disconnected from WebSocket');
  });
});

// Broadcast generation status updates to all connected clients
// This will be called periodically by generationService
export function broadcastStatus() {
  const status = generationService.getStatus();
  const message = JSON.stringify({
    type: 'status',
    data: status,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Poll and broadcast status every 1 second when generation is running
let statusBroadcastInterval: NodeJS.Timeout | null = null;

function startStatusBroadcast() {
  if (statusBroadcastInterval) return;

  statusBroadcastInterval = setInterval(() => {
    const status = generationService.getStatus();

    // Broadcast to all clients
    broadcastStatus();

    // Stop broadcasting when generation is not running
    if (status.status !== 'running') {
      stopStatusBroadcast();
    }
  }, 1000); // Broadcast every 1 second
}

function stopStatusBroadcast() {
  if (statusBroadcastInterval) {
    clearInterval(statusBroadcastInterval);
    statusBroadcastInterval = null;
  }
}

// Export for use in generate routes
export { startStatusBroadcast, stopStatusBroadcast };

// Pass broadcast functions to generate router
setStatusBroadcastFunctions(startStatusBroadcast);

// ========================================
// Start Server
// ========================================

server.listen(config.port, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║    AI Factory API Server v6.0                 ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📁 Factory root: ${config.factoryRoot}`);
  console.log(`🤖 ComfyUI: ${config.comfyApi}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`   http://localhost:${config.port}/api/health`);
  console.log(`   http://localhost:${config.port}/api/library/:type`);
  console.log(`   http://localhost:${config.port}/api/queue`);
  console.log(`   http://localhost:${config.port}/api/generate`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

export default app;
