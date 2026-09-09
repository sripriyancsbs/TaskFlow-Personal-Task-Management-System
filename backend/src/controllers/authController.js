const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../middleware/authMiddleware');

class AuthController {
  /**
   * POST /api/auth/register
   * Create a new user account
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Full name is required.',
        });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Email address is required.',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = email.trim().toLowerCase();
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address.',
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.',
        });
      }

      // Check if email already registered
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.',
        });
      }

      // Hash password with salt rounds 10
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [name.trim(), cleanEmail, passwordHash]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user with email and password
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !email.trim() || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are both required.',
        });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Retrieve user by email
      const result = await db.query(
        'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
        [cleanEmail]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const user = result.rows[0];

      // Compare password hash
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user details
   */
  async getMe(req, res, next) {
    try {
      const result = await db.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found.',
        });
      }

      res.status(200).json({
        success: true,
        user: result.rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
