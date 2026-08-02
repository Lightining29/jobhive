/**
 * Socket.IO server — Voice AI real-time communication layer.
 * Attaches to the existing HTTP server.  Zero changes to app.js routes.
 */
const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const logger = require('../config/logger');
const voiceHandler = require('./voiceHandler');

let io = null;

/**
 * Initialise Socket.IO on the shared HTTP server.
 * @param {import('http').Server} httpServer
 */
function initSocketIO(httpServer) {
  // Accept connections from the configured CLIENT_URL plus localhost variants
  const allowedOrigins = [
    env.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    // Allow large audio blobs
    maxHttpBufferSize: 10 * 1024 * 1024, // 10 MB
    transports: ['websocket', 'polling'],
    // Increase ping timeout for slow networks
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Authentication middleware ───────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie || '';
      const cookies = cookie.parse(rawCookie);
      const token = cookies.token;

      if (!token) {
        // Allow anonymous connections — voice works for guests too (limited)
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, env.jwt.secret);
      const user = await User.findById(decoded.id).select('-password').lean();

      if (!user || user.status === 'suspended') {
        socket.user = null;
        return next();
      }

      socket.user = user;
      next();
    } catch {
      socket.user = null;
      next();
    }
  });

  // ── Connection handler ──────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString() || `anon_${socket.id}`;
    logger.info(`[socket] connected — user=${userId} id=${socket.id}`);

    // Hand off all voice events to the dedicated handler
    voiceHandler(socket, io);

    socket.on('disconnect', (reason) => {
      logger.info(`[socket] disconnected — user=${userId} reason=${reason}`);
    });
  });

  logger.info('[socket] Socket.IO initialised');
  logger.info(`[voice] LLM provider: ${require('../services/voice/llm.service').LLM_CONFIG.provider} — model: ${require('../services/voice/llm.service').LLM_CONFIG.model}`);
  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocketIO, getIO };
