const taskService = require('../services/taskService');

class TaskController {
  /**
   * GET /api/tasks
   */
  async getTasks(req, res, next) {
    try {
      const { status, priority, search, sort } = req.query;
      const tasks = await taskService.getAllTasks({ status, priority, search, sort });
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/tasks/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await taskService.getStats();
      res.status(200).json({
        success: true,
        data: {
          total: Number(stats.total) || 0,
          pending: Number(stats.pending) || 0,
          completed: Number(stats.completed) || 0,
          high_priority: Number(stats.high_priority) || 0,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/tasks/:id
   */
  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.taskId} not found.`,
        });
      }
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/tasks
   */
  async createTask(req, res, next) {
    try {
      const { title, description, status, priority, due_date } = req.body;
      const newTask = await taskService.createTask({ title, description, status, priority, due_date });
      res.status(201).json({
        success: true,
        message: 'Task created successfully.',
        data: newTask,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/tasks/:id
   */
  async updateTask(req, res, next) {
    try {
      const { title, description, status, priority, due_date } = req.body;
      const updatedTask = await taskService.updateTask(req.taskId, { title, description, status, priority, due_date });
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.taskId} not found.`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Task updated successfully.',
        data: updatedTask,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/tasks/:id/status
   */
  async updateTaskStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updatedTask = await taskService.updateTaskStatus(req.taskId, status);
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.taskId} not found.`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Task status updated successfully.',
        data: updatedTask,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/tasks/:id
   */
  async deleteTask(req, res, next) {
    try {
      const deleted = await taskService.deleteTask(req.taskId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.taskId} not found.`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully.',
        data: { id: req.taskId },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
