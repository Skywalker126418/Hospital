const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const config = require('../config/environment');

/**
 * Generate JWT token for user payload
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Register a new user (Receptionist or Doctor self-registration or standard registration)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'receptionist' } = req.body;

    // Check if email already registered
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, 'active']
    );

    const userId = result.insertId;

    // If registered as doctor, create basic doctor record
    if (role === 'doctor') {
      await db.query(
        'INSERT INTO doctors (user_id, specialization, department) VALUES (?, ?, ?)',
        [userId, 'General Practice', 'General Medicine']
      );
    }

    const token = generateToken({ id: userId, email, role, name });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        name,
        email,
        role,
        status: 'active',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role, status, profile_image FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This account was signed up using Google. Please log in with Google.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Update last_login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    let doctorInfo = null;
    if (user.role === 'doctor') {
      const [doctorRows] = await db.query(
        'SELECT id as doctor_id, specialization, department, license_number FROM doctors WHERE user_id = ?',
        [user.id]
      );
      if (doctorRows.length > 0) {
        doctorInfo = doctorRows[0];
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        doctor: doctorInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT id, name, email, role, status, profile_image, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const user = rows[0];
    let doctor = null;

    if (user.role === 'doctor') {
      const [doctorRows] = await db.query(
        'SELECT id as doctor_id, specialization, department, license_number, phone, availability FROM doctors WHERE user_id = ?',
        [user.id]
      );
      if (doctorRows.length > 0) {
        doctor = doctorRows[0];
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change current user password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Google OAuth Login Handler
 * Gracefully works whether Google Client ID is configured or in mock/demo mode
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential, email, name, googleId, picture } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google login requires valid account email.',
      });
    }

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id, name, email, role, status, profile_image FROM users WHERE email = ? OR google_id = ?',
      [email, googleId || '']
    );

    let user;

    if (existing.length > 0) {
      user = existing[0];
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Contact an administrator.',
        });
      }
      // Update google_id if not set
      if (!user.google_id && googleId) {
        await db.query('UPDATE users SET google_id = ?, last_login = NOW() WHERE id = ?', [googleId, user.id]);
      } else {
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      }
    } else {
      // Auto-create new user with receptionist role
      const [insertRes] = await db.query(
        'INSERT INTO users (name, email, role, google_id, profile_image, status, last_login) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [name || email.split('@')[0], email, 'receptionist', googleId || null, picture || null, 'active']
      );
      user = {
        id: insertRes.insertId,
        name: name || email.split('@')[0],
        email,
        role: 'receptionist',
        profile_image: picture || null,
        status: 'active',
      };
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Google authentication successful. Welcome, ${user.name}!`,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  googleAuth,
};
