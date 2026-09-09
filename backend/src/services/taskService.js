const db = require('../config/db');

class TaskService {
  /**
   * Retrieve tasks belonging to the authenticated user with optional filtering, search, and sorting
   * @param {number} userId - ID of authenticated user
   * @param {Object} options - { status, priority, search, sort }
   */
  async getAllTasks(userId, { status, priority, search, sort = 'newest' } = {}) {
    let sql = 'SELECT id, title, description, status, priority, due_date, created_at, user_id FROM tasks WHERE user_id = $1';
    const params = [userId];

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
   * Get user task statistics (total, pending, completed, high priority count)
   * @param {number} userId
   */
  async getStats(userId) {
    const sql = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int AS completed,
        COUNT(CASE WHEN priority = 'High' AND status = 'Pending' THEN 1 END)::int AS high_priority
      FROM tasks
      WHERE user_id = $1
    `;
    const result = await db.query(sql, [userId]);
    return result.rows[0] || { total: 0, pending: 0, completed: 0, high_priority: 0 };
  }

  /**
   * Get a single task by ID strictly belonging to userId
   * @param {number} userId
   * @param {number} id
   */
  async getTaskById(userId, id) {
    const sql = 'SELECT id, title, description, status, priority, due_date, created_at, user_id FROM tasks WHERE id = $1 AND user_id = $2';
    const result = await db.query(sql, [id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new task belonging to userId
   * @param {number} userId
   * @param {Object} taskData - { title, description, status, priority, due_date }
   */
  async createTask(userId, { title, description, status = 'Pending', priority = 'Medium', due_date = null }) {
    const createdAt = new Date().toISOString();
    const sql = `
      INSERT INTO tasks (title, description, status, priority, due_date, created_at, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, status, priority, due_date, created_at, user_id
    `;
    const result = await db.query(sql, [
      title.trim(),
      description ? description.trim() : '',
      status || 'Pending',
      priority || 'Medium',
      due_date || null,
      createdAt,
      userId,
    ]);
    return result.rows[0];
  }

  /**
   * Update full task details for userId
   * @param {number} userId
   * @param {number} id
   * @param {Object} updateData - { title, description, status, priority, due_date }
   */
  async updateTask(userId, id, { title, description, status, priority, due_date }) {
    const sql = `
      UPDATE tasks
      SET title = $1, description = $2, status = $3, priority = COALESCE($4, priority), due_date = $5
      WHERE id = $6 AND user_id = $7
      RETURNING id, title, description, status, priority, due_date, created_at, user_id
    `;
    const result = await db.query(sql, [
      title.trim(),
      description !== undefined ? (description ? description.trim() : '') : '',
      status,
      priority || 'Medium',
      due_date || null,
      id,
      userId,
    ]);
    return result.rows[0] || null;
  }

  /**
   * Update task status for userId
   * @param {number} userId
   * @param {number} id
   * @param {string} status - 'Pending' | 'Completed'
   */
  async updateTaskStatus(userId, id, status) {
    const sql = `
      UPDATE tasks
      SET status = $1
      WHERE id = $2 AND user_id = $3
      RETURNING id, title, description, status, priority, due_date, created_at, user_id
    `;
    const result = await db.query(sql, [status, id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Delete a task by ID for userId
   * @param {number} userId
   * @param {number} id
   */
  async deleteTask(userId, id) {
    const sql = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(sql, [id, userId]);
    return result.rowCount > 0;
  }
}

module.exports = new TaskService();
