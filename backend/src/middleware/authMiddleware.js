const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const db = require('../config/database');

/**
 * Verify Bearer JWT token in Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication session expired. Please log in again.',
          expired: true,
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    // Verify user exists and is active in MySQL
    const [rows] = await db.query(
      'SELECT id, name, email, role, status, profile_image FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      });
    }

    // If user is a doctor, fetch doctor_id
    if (user.role === 'doctor') {
      const [doctorRows] = await db.query(
        'SELECT id as doctor_id, specialization, department, license_number FROM doctors WHERE user_id = ?',
        [user.id]
      );
      if (doctorRows.length > 0) {
        user.doctor_id = doctorRows[0].doctor_id;
        user.specialization = doctorRows[0].specialization;
        user.department = doctorRows[0].department;
        user.license_number = doctorRows[0].license_number;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server authentication error.',
    });
  }
};

module.exports = {
  authenticate,
};
