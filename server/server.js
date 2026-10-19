require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiters');
const initSockets = require('./sockets');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

// Security & parsing middleware (Section 29)
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// Static file serving for locally-generated certificate PDFs and any
// non-cloud-hosted uploads (Section 6 of README documents the tradeoffs).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'SmartLearn Pro API is running' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

initSockets(io);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info('server_started', { port: PORT, env: process.env.NODE_ENV });
      console.log(`SmartLearn Pro API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('startup_failed', { error: err.message });
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
