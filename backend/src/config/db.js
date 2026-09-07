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

const storageDir = path.join(__dirname, '../../database');
const storagePath = path.join(storageDir, 'tasks_storage.json');

async function persistTasksToDisk() {
  if (!isInMemory || process.env.NODE_ENV === 'test' || !pool) return;
  try {
    const res = await pool.query('SELECT id, title, description, status, priority, due_date, created_at FROM tasks ORDER BY id ASC');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    fs.writeFileSync(storagePath, JSON.stringify(res.rows, null, 2), 'utf8');
  } catch (err) {
    console.error('Error persisting tasks to disk:', err.message);
  }
}

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

  const isTest = process.env.NODE_ENV === 'test';
  let loadedFromDisk = false;

  if (!isTest && fs.existsSync(storagePath)) {
    try {
      const fileData = fs.readFileSync(storagePath, 'utf8');
      const savedTasks = JSON.parse(fileData);
      if (Array.isArray(savedTasks) && savedTasks.length > 0) {
        const table = db.getTable('tasks');
        let maxId = 0;

        const esc = (val) => {
          if (val === null || val === undefined) return 'NULL';
          return `'` + String(val).replace(/'/g, "''") + `'`;
        };

        const values = savedTasks.map((t) => {
          const id = Number(t.id);
          if (id > maxId) maxId = id;
          return `(${id}, ${esc(t.title)}, ${esc(t.description || '')}, ${esc(t.status || 'Pending')}, ${esc(t.priority || 'Medium')}, ${t.due_date ? esc(t.due_date) : 'NULL'}, ${esc(t.created_at || new Date().toISOString())})`;
        }).join(',\n');

        db.public.none(
          `INSERT INTO tasks (id, title, description, status, priority, due_date, created_at) VALUES ${values};`
        );

        // Advance pg-mem serial counter so new tasks increment without colliding
        if (maxId > 0) {
          const tx = db.data;
          let serials = tx.getMap(table.serialsId);
          serials = serials.set('id', maxId);
          tx.set(table.serialsId, serials);
        }

        loadedFromDisk = true;
        console.log(`✓ Restored ${savedTasks.length} tasks from persistent storage (${storagePath}).`);
      }
    } catch (readErr) {
      console.warn('! Could not read existing tasks_storage.json, re-seeding starter tasks:', readErr.message);
    }
  }

  if (!loadedFromDisk) {
    // Insert initial starter sample tasks with rich priorities and dates
    const nowMs = Date.now();
    const twoDaysAgo = new Date(nowMs - 2 * 86400000).toISOString();
    const threeHoursAgo = new Date(nowMs - 3 * 3600000).toISOString();
    const fortyFiveMinsAgo = new Date(nowMs - 45 * 60000).toISOString();

    db.public.none(`
      INSERT INTO tasks (title, description, status, priority, due_date, created_at) VALUES 
        ('Welcome to TaskFlow', 'Explore features like real-time search, priority filters, dark mode, keyboard shortcuts, and export.', 'Completed', 'Low', NOW() + INTERVAL '3 days', '${twoDaysAgo}'),
        ('Review System Architecture', 'Check the clean REST API, database schema, and responsive UI components.', 'Pending', 'High', NOW() + INTERVAL '1 day', '${threeHoursAgo}'),
        ('Deploy to Vercel and PostgreSQL', 'Configure production environment variables for cloud hosting.', 'Pending', 'Medium', NOW() + INTERVAL '5 days', '${fortyFiveMinsAgo}');
    `);
  }

  const pgAdapter = db.adapters.createPg();
  pool = new pgAdapter.Pool();
  isInMemory = true;
  console.log('✓ Initialized in-memory PostgreSQL engine with TaskFlow schema.');

  if (!isTest && !loadedFromDisk) {
    persistTasksToDisk().catch((e) => console.error('Initial disk save error:', e));
  }

  return pool;
}

// Wrapper for query execution with auto-persistence on mutations
async function query(text, params = []) {
  if (!pool) {
    await initPostgresPool();
  }
  const result = await pool.query(text, params);

  const trimmed = typeof text === 'string' ? text.trim().toUpperCase() : '';
  if (
    trimmed.startsWith('INSERT') ||
    trimmed.startsWith('UPDATE') ||
    trimmed.startsWith('DELETE')
  ) {
    persistTasksToDisk().catch((e) => console.error('Auto-persistence error:', e));
  }

  return result;
}

module.exports = {
  query,
  initPostgresPool,
  getPool: () => pool,
  isInMemory: () => isInMemory,
  persistTasksToDisk,
};
