const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

/**
 * Get all users with roles, status, and profile info
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search = '' } = req.query;

    let queryStr = `
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.profile_image,
        u.last_login, u.created_at,
        d.id as doctor_id, d.specialization, d.department, d.license_number, d.phone, d.duty_status
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
      queryStr += ' AND (u.name LIKE ? OR u.email LIKE ? OR d.specialization LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
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
 * Admin creates user with specified role, credentials, and medical specialization
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
        `INSERT INTO doctors (user_id, specialization, department, license_number, phone, status, duty_status)
         VALUES (?, ?, ?, ?, ?, 'active', 'available')`,
        [
          newUserId,
          specialization || 'General Practice',
          department || 'General Medicine',
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
 * Update user details by Admin
 */
const updateUser = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const { id } = req.params;
    const { name, email, role, status, specialization, department, phone } = req.body;

    const [existing] = await conn.query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await conn.beginTransaction();

    await conn.query(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?',
      [name, email, role, status, id]
    );

    if (existing[0].role === 'doctor' || role === 'doctor') {
      const [docRows] = await conn.query('SELECT id FROM doctors WHERE user_id = ?', [id]);
      if (docRows.length > 0) {
        await conn.query(
          'UPDATE doctors SET specialization = COALESCE(?, specialization), department = COALESCE(?, department), phone = COALESCE(?, phone) WHERE user_id = ?',
          [specialization, department, phone, id]
        );
      } else if (role === 'doctor') {
        await conn.query(
          'INSERT INTO doctors (user_id, specialization, department, phone, status) VALUES (?, ?, ?, ?, ?)',
          [id, specialization || 'General Medicine', department || 'Outpatient', phone || null, 'active']
        );
      }
    }

    await conn.commit();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

/**
 * Delete user account by Admin (also deletes old profile photo if stored on disk)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own active administrator account.' });
    }

    const [rows] = await db.query('SELECT profile_image FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete uploaded image from disk if exists
    if (rows[0].profile_image && rows[0].profile_image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', rows[0].profile_image);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('[File] Failed to unlink file:', e.message);
        }
      }
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Staff account deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user status (active / inactive / blocked)
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

/**
 * Upload & update profile image for any authenticated user.
 * Deletes old profile photo from disk if present!
 */
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const targetUserId = req.params.id ? parseInt(req.params.id, 10) : req.user.id;

    // Verify permission: user can update own, or admin can update anyone
    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [rows] = await db.query('SELECT profile_image FROM users WHERE id = ?', [targetUserId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldImage = rows[0].profile_image;

    // Delete old profile image from disk if it was stored locally
    if (oldImage && oldImage.startsWith('/uploads/')) {
      const oldFilePath = path.join(__dirname, '../../', oldImage);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log('[Upload] Deleted previous profile image:', oldFilePath);
        } catch (e) {
          console.warn('[Upload] Could not delete old image:', e.message);
        }
      }
    }

    const newImageUrl = `/uploads/profiles/${req.file.filename}`;

    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [newImageUrl, targetUserId]);

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully.',
      imageUrl: newImageUrl,
      profile_image: newImageUrl,
      data: {
        profile_image: newImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete profile picture
 */
const deleteProfileImage = async (req, res, next) => {
  try {
    const targetUserId = req.params.id ? parseInt(req.params.id, 10) : req.user.id;

    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [rows] = await db.query('SELECT profile_image FROM users WHERE id = ?', [targetUserId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldImage = rows[0].profile_image;
    if (oldImage && oldImage.startsWith('/uploads/')) {
      const oldFilePath = path.join(__dirname, '../../', oldImage);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {}
      }
    }

    await db.query('UPDATE users SET profile_image = NULL WHERE id = ?', [targetUserId]);

    return res.status(200).json({
      success: true,
      message: 'Profile image removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
  uploadProfileImage,
  deleteProfileImage,
};
