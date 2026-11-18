const app = require('./app');
const { pool } = require('./config/db');
const { checkAndExpireSessions } = require('./controllers/demoSessionController');
const { startSeedScheduler } = require('./controllers/seedManagerController');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Expiry scheduler: runs every 2 minutes to transition expired demo sessions
const EXPIRY_INTERVAL_MS = 2 * 60 * 1000;
const expiryTimer = setInterval(() => {
  checkAndExpireSessions().catch(err => console.error('[Scheduler Interval Error]:', err));
}, EXPIRY_INTERVAL_MS);

// Initial check on startup
checkAndExpireSessions().catch(() => {});

// Start daily night seed runner
try {
  startSeedScheduler();
} catch (e) {
  console.error('[Seed Scheduler Init Error]:', e);
}

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`FlutterFlirt backend running on http://localhost:${PORT}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL}`);
  console.log(`CLIENT_URL1: ${process.env.CLIENT_URL1}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the old backend process and try again.`);
  } else {
    console.error('Server startup error:', error);
  }
  process.exit(1);
});

let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  server.close(async () => {
    try {
      await pool.end();
    } catch (error) {
      console.error('Database shutdown error:', error.message);
    }

    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
      return;
    }

    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGUSR2', () => shutdown('SIGUSR2'));
