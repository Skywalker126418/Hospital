const db = require('../config/database');

/**
 * Get consultations with filters
 */
const getConsultations = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, date, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (req.user.role === 'doctor' && req.user.doctor_id) {
      whereClause += ' AND c.doctor_id = ?';
      params.push(req.user.doctor_id);
    } else if (doctor_id) {
      whereClause += ' AND c.doctor_id = ?';
      params.push(doctor_id);
    }

    if (patient_id) {
      whereClause += ' AND c.patient_id = ?';
      params.push(patient_id);
    }

    if (date) {
      whereClause += ' AND DATE(c.consultation_date) = ?';
      params.push(date);
    }

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM consultations c ${whereClause}`,
      params
    );
    const totalRecords = countRows[0].total;

    const queryStr = `
      SELECT 
        c.id, c.appointment_id, c.patient_id, c.doctor_id,
        c.consultation_date, c.symptoms, c.diagnosis, c.treatment,
        c.notes, c.follow_up_date, c.created_at,
        p.patient_code, CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.gender as patient_gender, p.date_of_birth as patient_dob,
        u.name as doctor_name, d.specialization as doctor_specialization
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      JOIN doctors d ON c.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      ${whereClause}
      ORDER BY c.consultation_date DESC
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
 * Get consultation details by ID
 */
const getConsultationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        c.id, c.appointment_id, c.patient_id, c.doctor_id,
        c.consultation_date, c.symptoms, c.diagnosis, c.treatment,
        c.notes, c.follow_up_date, c.created_at,
        p.patient_code, p.first_name, p.last_name,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.gender as patient_gender, p.date_of_birth as patient_dob,
        p.blood_group, p.allergies,
        u.name as doctor_name, d.specialization as doctor_specialization,
        d.department as doctor_department
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      JOIN doctors d ON c.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultation record not found.' });
    }

    const consultation = rows[0];

    // Prescriptions linked to consultation
    const [prescriptions] = await db.query(
      'SELECT id, prescription_date, instructions FROM prescriptions WHERE consultation_id = ?',
      [id]
    );

    for (const rx of prescriptions) {
      const [items] = await db.query(
        'SELECT id, medicine_name, dosage, frequency, duration, instructions FROM prescription_items WHERE prescription_id = ?',
        [rx.id]
      );
      rx.items = items;
    }
    consultation.prescriptions = prescriptions;

    return res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create consultation and automatically mark appointment as completed
 */
const createConsultation = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const {
      appointment_id,
      patient_id,
      symptoms,
      diagnosis,
      treatment,
      notes,
      follow_up_date,
    } = req.body;

    const doctorId = req.user.doctor_id;
    if (!doctorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only registered doctors can create clinical consultation records.',
      });
    }

    await conn.beginTransaction();

    // Verify appointment exists
    const [appt] = await conn.query(
      'SELECT id, doctor_id, patient_id FROM appointments WHERE id = ? FOR UPDATE',
      [appointment_id]
    );

    if (appt.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const docIdToUse = doctorId || appt[0].doctor_id;

    // Check if consultation already exists for this appointment
    const [existing] = await conn.query('SELECT id FROM consultations WHERE appointment_id = ?', [appointment_id]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'A consultation is already recorded for this appointment.',
      });
    }

    // Insert consultation
    const [result] = await conn.query(
      `INSERT INTO consultations (
        appointment_id, patient_id, doctor_id, consultation_date,
        symptoms, diagnosis, treatment, notes, follow_up_date
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [
        appointment_id,
        patient_id || appt[0].patient_id,
        docIdToUse,
        symptoms,
        diagnosis,
        treatment,
        notes || null,
        follow_up_date || null,
      ]
    );

    // Update appointment status to completed
    await conn.query(
      `UPDATE appointments SET status = 'completed', updated_at = NOW() WHERE id = ?`,
      [appointment_id]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Consultation and clinical notes saved successfully.',
      data: {
        id: result.insertId,
        appointment_id,
        diagnosis,
      },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

module.exports = {
  getConsultations,
  getConsultationById,
  createConsultation,
};
