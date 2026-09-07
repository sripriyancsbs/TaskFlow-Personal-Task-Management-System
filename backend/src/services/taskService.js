const db = require('../config/db');

class TaskService {
  /**
   * Retrieve tasks with optional filtering and search
   * @param {Object} options - { status, search }
   */
  async getAllTasks({ status, search } = {}) {
    let sql = 'SELECT id, title, description, status, created_at FROM tasks WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(COALESCE(description, '')) LIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.query(sql, params);
    return result.rows;
  }

  /**
   * Get task statistics (total, pending, completed)
   */
  async getStats() {
    const sql = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int AS completed
      FROM tasks
    `;
    const result = await db.query(sql);
    return result.rows[0] || { total: 0, pending: 0, completed: 0 };
  }

  /**
   * Get a single task by ID
   * @param {number} id
   */
  async getTaskById(id) {
    const sql = 'SELECT id, title, description, status, created_at FROM tasks WHERE id = $1';
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create a new task
   * @param {Object} taskData - { title, description, status }
   */
  async createTask({ title, description, status = 'Pending' }) {
    const sql = `
      INSERT INTO tasks (title, description, status)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, status, created_at
    `;
    const result = await db.query(sql, [
      title.trim(),
      description ? description.trim() : '',
      status || 'Pending',
    ]);
    return result.rows[0];
  }

  /**
   * Update full task details
   * @param {number} id
   * @param {Object} updateData - { title, description, status }
   */
  async updateTask(id, { title, description, status }) {
    const sql = `
      UPDATE tasks
      SET title = $1, description = $2, status = $3
      WHERE id = $4
      RETURNING id, title, description, status, created_at
    `;
    const result = await db.query(sql, [
      title.trim(),
      description !== undefined ? (description ? description.trim() : '') : '',
      status,
      id,
    ]);
    return result.rows[0] || null;
  }

  /**
   * Update task status
   * @param {number} id
   * @param {string} status - 'Pending' | 'Completed'
   */
  async updateTaskStatus(id, status) {
    const sql = `
      UPDATE tasks
      SET status = $1
      WHERE id = $2
      RETURNING id, title, description, status, created_at
    `;
    const result = await db.query(sql, [status, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete a task by ID
   * @param {number} id
   */
  async deleteTask(id) {
    const sql = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
    const result = await db.query(sql, [id]);
    return result.rowCount > 0;
  }
}

module.exports = new TaskService();
