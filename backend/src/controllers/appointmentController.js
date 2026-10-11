const db = require('../config/database');

/**
 * Get appointments with filters and search
 */
const getAppointments = async (req, res, next) => {
  try {
    const {
      doctor_id,
      patient_id,
      date,
      status,
      search = '',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Role-based scoping: If doctor is requesting, default to their doctor_id unless admin
    if (req.user.role === 'doctor' && req.user.doctor_id) {
      whereClause += ' AND a.doctor_id = ?';
      params.push(req.user.doctor_id);
    } else if (doctor_id) {
      whereClause += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }

    if (patient_id) {
      whereClause += ' AND a.patient_id = ?';
      params.push(patient_id);
    }

    if (date) {
      whereClause += ' AND a.appointment_date = ?';
      params.push(date);
    }

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (search.trim()) {
      whereClause += ` AND (
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.patient_code LIKE ? OR 
        u.name LIKE ? OR 
        a.reason LIKE ?
      )`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    // Total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       ${whereClause}`,
      params
    );
    const totalRecords = countRows[0].total;

    // Paginated list
    const queryStr = `
      SELECT 
        a.id, a.patient_id, a.doctor_id, 
        a.appointment_date, a.appointment_time, 
        a.reason, a.status, a.notes, a.created_at,
        p.patient_code, p.first_name, p.last_name,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.phone as patient_phone, p.gender as patient_gender,
        p.date_of_birth as patient_dob,
        u.name as doctor_name, d.specialization as doctor_specialization,
        d.department as doctor_department,
        COALESCE(d.duty_status, 'available') as doctor_duty_status,
        c.id as consultation_id
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN consultations c ON c.appointment_id = a.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(queryStr, [...params, limitNum, offset]);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment by ID
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        a.id, a.patient_id, a.doctor_id, 
        a.appointment_date, a.appointment_time, 
        a.reason, a.status, a.notes, a.created_at,
        p.patient_code, p.first_name, p.last_name,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.phone as patient_phone, p.email as patient_email,
        p.blood_group, p.allergies,
        u.name as doctor_name, d.specialization as doctor_specialization,
        d.department as doctor_department,
        COALESCE(d.duty_status, 'available') as doctor_duty_status,
        c.id as consultation_id, c.diagnosis, c.treatment
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN consultations c ON c.appointment_id = a.id
      WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
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
 * Create new appointment: Receptionist assigns patient to doctor.
 * Validates doctor availability and sets doctor status to 'attending' if patient is assigned for immediate arrival.
 */
const createAppointment = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason, notes } = req.body;

    await conn.beginTransaction();

    // Verify patient exists
    const [patient] = await conn.query('SELECT id, first_name, last_name FROM patients WHERE id = ?', [patient_id]);
    if (patient.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Selected patient does not exist.' });
    }

    // Verify doctor exists & check attendance/duty_status
    const [doctor] = await conn.query(
      'SELECT d.id, u.name, d.specialization, COALESCE(d.duty_status, "available") as duty_status FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [doctor_id]
    );
    if (doctor.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Selected doctor does not exist.' });
    }

    if (doctor[0].duty_status === 'off_duty') {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Doctor ${doctor[0].name} is off duty today and cannot accept new patients. Please assign to an available specialist.`,
      });
    }

    // Format appointment_time if without seconds
    const timeFormatted = appointment_time.length === 5 ? `${appointment_time}:00` : appointment_time;

    // Check if slot is already occupied
    const [conflict] = await conn.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
       FOR UPDATE`,
      [doctor_id, appointment_date, timeFormatted]
    );

    if (conflict.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'This time slot is already reserved for the selected doctor. Please select another slot.',
      });
    }

    // Insert appointment
    const [result] = await conn.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
       VALUES (?, ?, ?, ?, ?, 'scheduled', ?)`,
      [patient_id, doctor_id, appointment_date, timeFormatted, reason, notes || null]
    );

    // If appointment is for today, mark doctor duty status as 'attending'
    const today = new Date().toISOString().slice(0, 10);
    if (appointment_date === today) {
      await conn.query('UPDATE doctors SET duty_status = "attending" WHERE id = ?', [doctor_id]);
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: {
        id: result.insertId,
        patient_name: `${patient[0].first_name} ${patient[0].last_name}`,
        doctor_name: doctor[0].name,
        specialization: doctor[0].specialization,
        date: appointment_date,
        time: timeFormatted.slice(0, 5),
        status: 'scheduled',
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
 * Update appointment status. When marked completed, release doctor back to 'available'
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowed = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const [existing] = await db.query('SELECT id, doctor_id, status FROM appointments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    await db.query(
      'UPDATE appointments SET status = ?, notes = COALESCE(?, notes) WHERE id = ?',
      [status, notes || null, id]
    );

    // When consultation is completed or cancelled, check if doctor has any remaining active visits today
    if (status === 'completed' || status === 'cancelled') {
      const today = new Date().toISOString().slice(0, 10);
      const [remaining] = await db.query(
        'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status IN ("scheduled", "confirmed")',
        [existing[0].doctor_id, today]
      );
      if (remaining.length === 0) {
        await db.query('UPDATE doctors SET duty_status = "available" WHERE id = ?', [existing[0].doctor_id]);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule appointment date and time
 */
const rescheduleAppointment = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;

    await conn.beginTransaction();

    const [apptRows] = await conn.query('SELECT doctor_id FROM appointments WHERE id = ?', [id]);
    if (apptRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const doctorId = apptRows[0].doctor_id;
    const timeFormatted = appointment_time.length === 5 ? `${appointment_time}:00` : appointment_time;

    // Check conflict
    const [conflict] = await conn.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND id != ? AND status != 'cancelled'
       FOR UPDATE`,
      [doctorId, appointment_date, timeFormatted, id]
    );

    if (conflict.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'The requested time slot is not available.',
      });
    }

    await conn.query(
      `UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = 'scheduled' WHERE id = ?`,
      [appointment_date, timeFormatted, id]
    );

    await conn.commit();

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
};
