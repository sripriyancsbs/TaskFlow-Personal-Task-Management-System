const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
  validateTaskId,
  validateCreateTask,
  validateUpdateTask,
  validateUpdateStatus,
} = require('../middleware/validator');

// Stats endpoint (placed before /:id to prevent collision)
router.get('/stats', (req, res, next) => taskController.getStats(req, res, next));

// Core CRUD endpoints
router.get('/', (req, res, next) => taskController.getTasks(req, res, next));
router.get('/:id', validateTaskId, (req, res, next) => taskController.getTaskById(req, res, next));
router.post('/', validateCreateTask, (req, res, next) => taskController.createTask(req, res, next));
router.put('/:id', validateTaskId, validateUpdateTask, (req, res, next) => taskController.updateTask(req, res, next));
router.patch('/:id/status', validateTaskId, validateUpdateStatus, (req, res, next) => taskController.updateTaskStatus(req, res, next));
router.delete('/:id', validateTaskId, (req, res, next) => taskController.deleteTask(req, res, next));

module.exports = router;
