const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-super-secret-jwt-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate signed JWT token for user
 * @param {Object} user - { id, email, name }
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Middleware to authenticate requests via Bearer JWT token
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access your tasks.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Your session has expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token. Please sign in again.',
    });
  }
}

module.exports = {
  authMiddleware,
  generateToken,
  JWT_SECRET,
};
