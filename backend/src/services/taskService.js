const db = require('../config/db');

class TaskService {
  /**
   * Retrieve tasks with optional filtering, search, and sorting
   * @param {Object} options - { status, priority, search, sort }
   */
  async getAllTasks({ status, priority, search, sort = 'newest' } = {}) {
    let sql = 'SELECT id, title, description, status, priority, due_date, created_at FROM tasks WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      if (status === 'Today') {
        params.push('Pending');
        sql += ` AND status = $${params.length} AND due_date IS NOT NULL AND DATE(due_date) = CURRENT_DATE`;
      } else {
        params.push(status);
        sql += ` AND status = $${params.length}`;
      }
    }

    if (priority && priority !== 'All') {
      params.push(priority);
      sql += ` AND priority = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(COALESCE(description, '')) LIKE $${params.length})`;
    }

    // Dynamic sorting
    switch (sort) {
      case 'oldest':
        sql += ' ORDER BY created_at ASC';
        break;
      case 'priority':
        sql += ` ORDER BY 
          CASE priority 
            WHEN 'High' THEN 1 
            WHEN 'Medium' THEN 2 
            WHEN 'Low' THEN 3 
            ELSE 4 
          END ASC, created_at DESC`;
        break;
      case 'due_date':
      case 'dueDate':
        sql += ` ORDER BY 
          CASE WHEN due_date IS NULL THEN 0 ELSE 1 END ASC,
          CASE WHEN due_date IS NULL THEN
            CASE priority 
              WHEN 'High' THEN 1 
              WHEN 'Medium' THEN 2 
              WHEN 'Low' THEN 3 
              ELSE 4 
            END
          ELSE NULL END ASC,
          due_date ASC,
          created_at DESC`;
        break;
      case 'title':
        sql += ' ORDER BY LOWER(title) ASC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY created_at DESC';
        break;
    }

    const result = await db.query(sql, params);
    return result.rows;
  }

  /**
   * Get task statistics (total, pending, completed, high priority count)
   */
  async getStats() {
    const sql = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int AS completed,
        COUNT(CASE WHEN priority = 'High' AND status = 'Pending' THEN 1 END)::int AS high_priority
      FROM tasks
    `;
    const result = await db.query(sql);
    return result.rows[0] || { total: 0, pending: 0, completed: 0, high_priority: 0 };
  }

  /**
   * Get a single task by ID
   * @param {number} id
   */
  async getTaskById(id) {
    const sql = 'SELECT id, title, description, status, priority, due_date, created_at FROM tasks WHERE id = $1';
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create a new task
   * @param {Object} taskData - { title, description, status, priority, due_date }
   */
  async createTask({ title, description, status = 'Pending', priority = 'Medium', due_date = null }) {
    const createdAt = new Date().toISOString();
    const sql = `
      INSERT INTO tasks (title, description, status, priority, due_date, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, description, status, priority, due_date, created_at
    `;
    const result = await db.query(sql, [
      title.trim(),
      description ? description.trim() : '',
      status || 'Pending',
      priority || 'Medium',
      due_date || null,
      createdAt,
    ]);
    return result.rows[0];
  }

  /**
   * Update full task details
   * @param {number} id
   * @param {Object} updateData - { title, description, status, priority, due_date }
   */
  async updateTask(id, { title, description, status, priority, due_date }) {
    const sql = `
      UPDATE tasks
      SET title = $1, description = $2, status = $3, priority = COALESCE($4, priority), due_date = $5
      WHERE id = $6
      RETURNING id, title, description, status, priority, due_date, created_at
    `;
    const result = await db.query(sql, [
      title.trim(),
      description !== undefined ? (description ? description.trim() : '') : '',
      status,
      priority || 'Medium',
      due_date || null,
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
      RETURNING id, title, description, status, priority, due_date, created_at
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
