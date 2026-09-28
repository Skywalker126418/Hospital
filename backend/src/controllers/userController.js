const bcrypt = require('bcryptjs');
const db = require('../config/database');

/**
 * Get all users with roles and status
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search = '' } = req.query;

    let queryStr = `
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.profile_image,
        u.last_login, u.created_at,
        d.id as doctor_id, d.specialization, d.department, d.license_number
      FROM users u
      LEFT JOIN doctors d ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      queryStr += ' AND u.role = ?';
      params.push(role);
    }

    if (status) {
      queryStr += ' AND u.status = ?';
      params.push(status);
    }

    if (search.trim()) {
      queryStr += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }

    queryStr += ' ORDER BY u.created_at DESC';

    const [rows] = await db.query(queryStr, params);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates user with specified role and credentials
 */
const createUser = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      department,
      license_number,
      phone,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Email is already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [userRes] = await conn.query(
      `INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'active')`,
      [name, email, passwordHash, role]
    );

    const newUserId = userRes.insertId;

    if (role === 'doctor') {
      await conn.query(
        `INSERT INTO doctors (user_id, specialization, department, license_number, phone, status)
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [
          newUserId,
          specialization || 'General Medicine',
          department || 'Internal Medicine',
          license_number || `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
          phone || null,
        ]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: `User ${name} created successfully with role ${role}.`,
      data: {
        id: newUserId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

/**
 * Toggle user status (active / inactive)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own administrative account.' });
    }

    const [rows] = await db.query('SELECT status FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = rows[0].status === 'active' ? 'inactive' : 'active';
    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      success: true,
      message: `User account is now ${newStatus}.`,
      status: newStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin reset user password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);

    return res.status(200).json({
      success: true,
      message: 'User password reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  toggleUserStatus,
  resetPassword,
};
