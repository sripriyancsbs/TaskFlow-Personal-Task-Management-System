const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    let data = null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('Unable to connect to the server. Please verify your connection.', 0, err);
  }
}

export const taskService = {
  /**
   * Fetch all tasks with optional filters and sorting
   * @param {Object} params - { status, priority, search, sort }
   */
  async getTasks({ status, priority, search, sort } = {}) {
    const query = new URLSearchParams();
    if (status && status !== 'All') query.append('status', status);
    if (priority && priority !== 'All') query.append('priority', priority);
    if (search && search.trim()) query.append('search', search.trim());
    if (sort) query.append('sort', sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/tasks${queryString}`);
    return res.data || [];
  },

  /**
   * Fetch task metrics
   */
  async getStats() {
    const res = await request('/tasks/stats');
    return res.data || { total: 0, pending: 0, completed: 0, high_priority: 0 };
  },

  /**
   * Fetch a single task by ID
   * @param {number|string} id
   */
  async getTask(id) {
    const res = await request(`/tasks/${id}`);
    return res.data;
  },

  /**
   * Create a new task
   * @param {Object} taskData - { title, description, status, priority, due_date }
   */
  async createTask(taskData) {
    const res = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return res.data;
  },

  /**
   * Full update of task
   * @param {number|string} id
   * @param {Object} taskData - { title, description, status, priority, due_date }
   */
  async updateTask(id, taskData) {
    const res = await request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    return res.data;
  },

  /**
   * Update task status (Pending ↔ Completed)
   * @param {number|string} id
   * @param {string} status - 'Pending' | 'Completed'
   */
  async updateTaskStatus(id, status) {
    const res = await request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  /**
   * Delete a task by ID
   * @param {number|string} id
   */
  async deleteTask(id) {
    const res = await request(`/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};
