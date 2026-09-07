const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool;
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_task_status CHECK (status IN ('Pending', 'Completed')),
      CONSTRAINT chk_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
  `;

async function initPostgresPool() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const isRemote = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
    const poolConfig = {
      connectionString,
    };

    if (isRemote || connectionString.includes('sslmode=require')) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    }

    try {
      const livePool = new Pool(poolConfig);
      // Test connection with a quick query
      const client = await livePool.connect();
      await client.query('SELECT 1');
      await client.query(schemaSql);
      client.release();

      console.log('✓ Successfully connected to PostgreSQL database and verified schema.');
      pool = livePool;
      return pool;
    } catch (err) {
      console.warn(`! Live PostgreSQL connection failed (${err.message}). Falling back to in-memory PostgreSQL engine.`);
    }
  }

  // Fallback to in-memory PostgreSQL (pg-mem) for seamless local dev & tests
  const { newDb, DataType } = require('pg-mem');
  const db = newDb();
  
  // Register functions that pg-mem doesn't have built-in
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

  // Insert initial starter sample tasks if table is empty
  db.public.none(`
    INSERT INTO tasks (title, description, status) VALUES 
      ('Welcome to TaskFlow', 'Explore features like real-time search, filters, dark mode, and quick status toggles.', 'Completed'),
      ('Review System Architecture', 'Check the clean REST API, database schema, and responsive UI components.', 'Pending'),
      ('Deploy to Vercel and PostgreSQL', 'Configure production environment variables for cloud hosting.', 'Pending');
  `);

  const pgAdapter = db.adapters.createPg();
  pool = new pgAdapter.Pool();
  isInMemory = true;
  console.log('✓ Initialized in-memory PostgreSQL engine with TaskFlow schema.');
  return pool;
}

// Wrapper for query execution
async function query(text, params = []) {
  if (!pool) {
    await initPostgresPool();
  }
  return pool.query(text, params);
}

module.exports = {
  query,
  initPostgresPool,
  getPool: () => pool,
  isInMemory: () => isInMemory,
};
