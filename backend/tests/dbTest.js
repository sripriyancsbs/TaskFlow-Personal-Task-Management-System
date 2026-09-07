const db = require('../src/config/db');

async function testDb() {
  try {
    await db.initPostgresPool();
    const insertRes = await db.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      ['Test Task Title', 'Test Description Details']
    );
    console.log('Inserted task id:', insertRes.rows[0].id);

    const selectRes = await db.query('SELECT * FROM tasks WHERE id = $1', [insertRes.rows[0].id]);
    console.log('Retrieved task:', selectRes.rows[0].title);

    const updateRes = await db.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      ['Completed', insertRes.rows[0].id]
    );
    console.log('Updated status:', updateRes.rows[0].status);

    const deleteRes = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [insertRes.rows[0].id]);
    console.log('Deleted task count:', deleteRes.rowCount);

    console.log('✓ Database operations verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database verification error:', err);
    process.exit(1);
  }
}

testDb();
