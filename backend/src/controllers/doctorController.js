const db = require('../config/database');

/**
 * Get all doctors with profile, department, and specialization
 */
const getDoctors = async (req, res, next) => {
  try {
    const { department = '', specialization = '', search = '' } = req.query;

    let queryStr = `
      SELECT 
        d.id, d.user_id, u.name, u.email, u.profile_image,
        d.specialization, d.department, d.license_number, d.phone,
        d.availability, d.status
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.status = 'active'
    `;
    const params = [];

    if (department) {
      queryStr += ' AND d.department = ?';
      params.push(department);
    }

    if (specialization) {
      queryStr += ' AND d.specialization = ?';
      params.push(specialization);
    }

    if (search.trim()) {
      queryStr += ' AND (u.name LIKE ? OR d.specialization LIKE ? OR d.department LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    queryStr += ' ORDER BY u.name ASC';

    const [rows] = await db.query(queryStr, params);

    // Format availability if JSON string
    const formatted = rows.map((doc) => {
      let avail = doc.availability;
      if (typeof avail === 'string') {
        try {
          avail = JSON.parse(avail);
        } catch (e) {
          // keep as string
        }
      }
      return {
        ...doc,
        availability: avail || { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], hours: '08:00 - 16:00' },
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single doctor details
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        d.id, d.user_id, u.name, u.email, u.profile_image,
        d.specialization, d.department, d.license_number, d.phone,
        d.availability, d.status, d.created_at
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const doc = rows[0];
    if (typeof doc.availability === 'string') {
      try {
        doc.availability = JSON.parse(doc.availability);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available time slots for a doctor on a specific date
 * Standard operational slots: 08:30 to 16:30 in 30-min increments
 */
const getDoctorSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date query parameter is required (YYYY-MM-DD).',
      });
    }

    // Standard day slots
    const standardSlots = [
      '08:30:00', '09:00:00', '09:30:00', '10:00:00',
      '10:30:00', '11:00:00', '11:30:00', '13:00:00',
      '13:30:00', '14:00:00', '14:30:00', '15:00:00',
      '15:30:00', '16:00:00'
    ];

    // Fetch already booked appointments for this doctor on that date (not cancelled)
    const [bookedRows] = await db.query(
      `SELECT appointment_time 
       FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [id, date]
    );

    const bookedTimes = new Set(bookedRows.map((r) => r.appointment_time));

    const slots = standardSlots.map((time) => ({
      time: time.slice(0, 5), // HH:MM
      rawTime: time,
      isAvailable: !bookedTimes.has(time),
      status: bookedTimes.has(time) ? 'booked' : 'available',
    }));

    return res.status(200).json({
      success: true,
      doctor_id: parseInt(id, 10),
      date,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorSlots,
};
