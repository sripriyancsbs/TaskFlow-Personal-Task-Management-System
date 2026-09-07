const VALID_STATUSES = ['Pending', 'Completed'];
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

/**
 * Validate task ID route parameter
 */
function validateTaskId(req, res, next) {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== String(id)) {
    return res.status(400).json({
      error: 'Invalid task ID. ID must be a positive integer.',
    });
  }

  req.taskId = parsedId;
  next();
}

/**
 * Validate task creation payload
 */
function validateCreateTask(req, res, next) {
  const { title, status, priority } = req.body;

  if (title === undefined || title === null) {
    return res.status(400).json({
      error: 'Task title is required.',
    });
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'Task title cannot be empty or only whitespace.',
    });
  }

  if (title.trim().length > 255) {
    return res.status(400).json({
      error: 'Task title cannot exceed 255 characters.',
    });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status '${status}'. Allowed statuses: ${VALID_STATUSES.join(', ')}.`,
    });
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: `Invalid priority '${priority}'. Allowed priorities: ${VALID_PRIORITIES.join(', ')}.`,
    });
  }

  next();
}

/**
 * Validate full task update payload
 */
function validateUpdateTask(req, res, next) {
  const { title, status, priority } = req.body;

  if (title === undefined || title === null) {
    return res.status(400).json({
      error: 'Task title is required.',
    });
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'Task title cannot be empty or only whitespace.',
    });
  }

  if (title.trim().length > 255) {
    return res.status(400).json({
      error: 'Task title cannot exceed 255 characters.',
    });
  }

  if (status === undefined || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status is required and must be one of: ${VALID_STATUSES.join(', ')}.`,
    });
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: `Invalid priority '${priority}'. Allowed priorities: ${VALID_PRIORITIES.join(', ')}.`,
    });
  }

  next();
}

/**
 * Validate status patch payload
 */
function validateUpdateStatus(req, res, next) {
  const { status } = req.body;

  if (status === undefined || status === null) {
    return res.status(400).json({
      error: 'Status is required.',
    });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status '${status}'. Allowed statuses: ${VALID_STATUSES.join(', ')}.`,
    });
  }

  next();
}

module.exports = {
  validateTaskId,
  validateCreateTask,
  validateUpdateTask,
  validateUpdateStatus,
};
