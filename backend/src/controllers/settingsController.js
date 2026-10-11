const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const seedDatabase = require('../utils/seed');

/**
 * Get hospital system configuration settings
 */
const getSettings = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM hospital_settings LIMIT 1');

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hospital_name: 'Metropolitan Central Hospital',
          address: '452 Healthcare Boulevard, Medical District, NY 10001',
          phone: '+1 (800) 555-0199',
          email: 'contact@metropolitan-hospital.org',
          logo_url: '/logo.svg',
          currency: 'USD',
          appointment_duration: 30,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update hospital system settings (Admin only)
 */
const updateSettings = async (req, res, next) => {
  try {
    const {
      hospital_name,
      address,
      phone,
      email,
      logo_url,
      currency,
      appointment_duration,
    } = req.body;

    const [rows] = await db.query('SELECT id FROM hospital_settings LIMIT 1');

    if (rows.length === 0) {
      await db.query(
        `INSERT INTO hospital_settings (hospital_name, address, phone, email, logo_url, currency, appointment_duration)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [hospital_name, address, phone, email, logo_url, currency || 'USD', appointment_duration || 30]
      );
    } else {
      await db.query(
        `UPDATE hospital_settings SET 
          hospital_name = ?, address = ?, phone = ?, email = ?,
          logo_url = ?, currency = ?, appointment_duration = ?
         WHERE id = ?`,
        [hospital_name, address, phone, email, logo_url, currency || 'USD', appointment_duration || 30, rows[0].id]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Hospital configuration settings updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload official hospital logo & delete old logo from storage
 */
const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const [rows] = await db.query('SELECT id, logo_url FROM hospital_settings LIMIT 1');
    const oldLogo = rows.length > 0 ? rows[0].logo_url : null;

    // Delete old logo file from disk if stored under /uploads/logos/
    if (oldLogo && oldLogo.startsWith('/uploads/logos/')) {
      const oldFilePath = path.join(__dirname, '../../', oldLogo);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log('[Logo] Deleted previous logo:', oldFilePath);
        } catch (e) {
          console.warn('[Logo] Could not delete old logo file:', e.message);
        }
      }
    }

    const newLogoUrl = `/uploads/logos/${req.file.filename}`;

    if (rows.length === 0) {
      await db.query('INSERT INTO hospital_settings (hospital_name, logo_url) VALUES (?, ?)', [
        'Metropolitan Central Hospital',
        newLogoUrl,
      ]);
    } else {
      await db.query('UPDATE hospital_settings SET logo_url = ? WHERE id = ?', [newLogoUrl, rows[0].id]);
    }

    return res.status(200).json({
      success: true,
      message: 'Hospital logo updated successfully.',
      logoUrl: newLogoUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all demo clinical records
 */
const clearAllDemoData = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE messages');
    await conn.query('TRUNCATE TABLE bill_items');
    await conn.query('TRUNCATE TABLE bills');
    await conn.query('TRUNCATE TABLE prescription_items');
    await conn.query('TRUNCATE TABLE prescriptions');
    await conn.query('TRUNCATE TABLE consultations');
    await conn.query('TRUNCATE TABLE laboratory_tests');
    await conn.query('TRUNCATE TABLE appointments');
    await conn.query('TRUNCATE TABLE patients');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    conn.release();

    return res.status(200).json({
      success: true,
      message: 'All demo records cleared. System is now fresh and clean.',
    });
  } catch (error) {
    conn.release();
    next(error);
  }
};

/**
 * Re-seed fictional demo records
 */
const reseedData = async (req, res, next) => {
  try {
    await seedDatabase();
    return res.status(200).json({
      success: true,
      message: 'Sample demo data successfully re-seeded.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadLogo,
  clearAllDemoData,
  reseedData,
};
