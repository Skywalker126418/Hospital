const db = require('../config/database');

/**
 * Get all doctors with profile, department, specialization, and real-time duty status
 */
const getDoctors = async (req, res, next) => {
  try {
    const { department = '', specialization = '', search = '', duty_status = '' } = req.query;

    let queryStr = `
      SELECT 
        d.id, d.user_id, u.name, u.email, u.profile_image,
        d.specialization, d.department, d.license_number, d.phone,
        d.availability, d.status,
        COALESCE(d.duty_status, 'available') as duty_status
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

    if (duty_status) {
      queryStr += ' AND d.duty_status = ?';
      params.push(duty_status);
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
        } catch (e) {}
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
 * Get single doctor details with active consultation count
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        d.id, d.user_id, u.name, u.email, u.profile_image,
        d.specialization, d.department, d.license_number, d.phone,
        d.availability, d.status, COALESCE(d.duty_status, 'available') as duty_status, d.created_at
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
 * Update doctor duty status (available, attending, off_duty)
 */
const updateDutyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duty_status } = req.body;

    const validStatuses = ['available', 'attending', 'off_duty'];
    if (!validStatuses.includes(duty_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be available, attending, or off_duty.',
      });
    }

    const [doc] = await db.query('SELECT id FROM doctors WHERE id = ? OR user_id = ?', [id, id]);
    if (doc.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor record not found.',
      });
    }

    await db.query('UPDATE doctors SET duty_status = ? WHERE id = ?', [duty_status, doc[0].id]);

    return res.status(200).json({
      success: true,
      message: `Doctor status updated to ${duty_status}.`,
      duty_status,
      doctor_id: doc[0].id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available time slots for a doctor on a specific date
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

    // Check doctor's duty status
    const [docRows] = await db.query('SELECT duty_status FROM doctors WHERE id = ?', [id]);
    const dutyStatus = docRows.length > 0 ? docRows[0].duty_status : 'available';

    // Standard day slots
    const standardSlots = [
      '08:30:00', '09:00:00', '09:30:00', '10:00:00',
      '10:30:00', '11:00:00', '11:30:00', '13:00:00',
      '13:30:00', '14:00:00', '14:30:00', '15:00:00',
      '15:30:00', '16:00:00'
    ];

    // If doctor is off_duty, no slots are available
    if (dutyStatus === 'off_duty') {
      return res.status(200).json({
        success: true,
        doctor_id: parseInt(id, 10),
        date,
        duty_status: dutyStatus,
        slots: standardSlots.map((time) => ({
          time: time.slice(0, 5),
          rawTime: time,
          isAvailable: false,
          status: 'off_duty',
        })),
      });
    }

    // Fetch already booked appointments
    const [bookedRows] = await db.query(
      `SELECT appointment_time 
       FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [id, date]
    );

    const bookedTimes = new Set(bookedRows.map((r) => r.appointment_time));

    const slots = standardSlots.map((time) => ({
      time: time.slice(0, 5),
      rawTime: time,
      isAvailable: !bookedTimes.has(time),
      status: bookedTimes.has(time) ? 'booked' : 'available',
    }));

    return res.status(200).json({
      success: true,
      doctor_id: parseInt(id, 10),
      date,
      duty_status: dutyStatus,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDutyStatus,
  getDoctorSlots,
};
