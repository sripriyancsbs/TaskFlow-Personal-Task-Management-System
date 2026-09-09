const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let isInMemory = false;

const schemaPath = path.join(__dirname, '../../database/schema.sql');
const schemaSql = fs.existsSync(schemaPath)
  ? fs.readFileSync(schemaPath, 'utf8')
  : `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
      due_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_task_status CHECK (status IN ('Pending', 'Completed')),
      CONSTRAINT chk_task_priority CHECK (priority IN ('High', 'Medium', 'Low')),
      CONSTRAINT chk_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
  `;

/**
 * Initialize PostgreSQL connection pool and run idempotent schema migration.
 * In production/Vercel environments, a valid DATABASE_URL is strictly required.
 * Silent fallback to mock/in-memory storage is strictly prohibited.
 */
async function initPostgresPool() {
  if (pool) {
    return pool;
  }

  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const connectionString = process.env.DATABASE_URL;

  // 1. If DATABASE_URL is provided, connect to live PostgreSQL
  if (connectionString) {
    const isRemote = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
    const poolConfig = {
      connectionString,
      max: process.env.VERCEL ? 3 : 10, // Optimize pool size for serverless
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
    };

    if (isRemote || connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase.co')) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    }

    try {
      const livePool = new Pool(poolConfig);
      const client = await livePool.connect();
      await client.query('SELECT 1');
      await client.query(schemaSql);
      client.release();

      console.log('✓ Successfully connected to PostgreSQL database and verified schema.');
      pool = livePool;
      isInMemory = false;
      return pool;
    } catch (err) {
      console.error(`! Live PostgreSQL connection failed: ${err.message}`);
      if (isProduction) {
        // Strict failure in production: Do NOT mask connection failure with sample data
        throw new Error(`Database connection failed: ${err.message}. Please check DATABASE_URL.`);
      }
    }
  }

  // 2. Strict Production Guard: Refuse in-memory fallback in production / Vercel
  if (isProduction) {
    const err = new Error('DATABASE_URL environment variable is missing in production. PostgreSQL connection is required for persistent storage.');
    console.error(`[DB Error]: ${err.message}`);
    throw err;
  }

  // 3. In-memory PostgreSQL (pg-mem) ONLY for local test / offline development
  console.log('ℹ Using in-memory database for local testing/development environment.');
  const { newDb, DataType } = require('pg-mem');
  const db = newDb();

  db.public.registerFunction({
    name: 'trim',
    args: [DataType.text],
    returns: DataType.text,
    implementation: (str) => (typeof str === 'string' ? str.trim() : str),
  });
  db.public.registerFunction({
    name: 'length',
    args: [DataType.text],
    returns: DataType.integer,
    implementation: (str) => (typeof str === 'string' ? str.length : 0),
  });

  db.public.none(schemaSql);

  const pgAdapter = db.adapters.createPg();
  pool = new pgAdapter.Pool();
  isInMemory = true;
  return pool;
}

/**
 * Execute query against the PostgreSQL pool
 */
async function query(text, params = []) {
  if (!pool) {
    await initPostgresPool();
  }
  return pool.query(text, params);
}

/**
 * Health check helper to verify database connectivity
 */
async function checkDbConnection() {
  try {
    if (!pool) {
      await initPostgresPool();
    }
    const start = Date.now();
    await pool.query('SELECT 1');
    const latencyMs = Date.now() - start;

    return {
      connected: true,
      dialect: isInMemory ? 'pg-mem (in-memory)' : 'PostgreSQL',
      latencyMs,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
}

module.exports = {
  query,
  initPostgresPool,
  checkDbConnection,
  getPool: () => pool,
  isInMemory: () => isInMemory,
};
