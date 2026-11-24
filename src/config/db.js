const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const isRemoteDb = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.DATABASE_URL.includes('sslmode=require') ||
  process.env.NODE_ENV === 'production'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('connect', () => {
  // Connected
});

pool.on('error', (err) => {
  // Gracefully log stale socket disconnects without crashing the pool
  if (err.code === 'ECONNRESET' || err.message?.includes('Connection terminated unexpectedly')) {
    console.warn('[PostgreSQL Pool Warning]: Stale idle connection recycled by Neon pooler.');
  } else {
    console.error('Unexpected database error:', err.message);
  }
});

// Helper with automatic single-retry on stale pooled connection reset
const queryWithRetry = async (text, params, retries = 1) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    if (retries > 0 && (err.code === 'ECONNRESET' || err.message?.includes('Connection terminated unexpectedly'))) {
      console.warn('[PostgreSQL Query Retry]: Connection was reset by pooler, retrying query...');
      return await pool.query(text, params);
    }
    throw err;
  }
};

module.exports = {
  query: queryWithRetry,
  pool,
};
