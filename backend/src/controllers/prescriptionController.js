const db = require('../config/database');

/**
 * Get all prescriptions
 */
const getPrescriptions = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (req.user.role === 'doctor' && req.user.doctor_id) {
      whereClause += ' AND p.doctor_id = ?';
      params.push(req.user.doctor_id);
    } else if (doctor_id) {
      whereClause += ' AND p.doctor_id = ?';
      params.push(doctor_id);
    }

    if (patient_id) {
      whereClause += ' AND p.patient_id = ?';
      params.push(patient_id);
    }

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM prescriptions p ${whereClause}`,
      params
    );
    const totalRecords = countRows[0].total;

    const queryStr = `
      SELECT 
        p.id, p.consultation_id, p.patient_id, p.doctor_id,
        p.prescription_date, p.instructions, p.created_at,
        pat.patient_code, CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
        pat.gender as patient_gender,
        u.name as doctor_name, d.specialization as doctor_specialization,
        c.diagnosis
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN consultations c ON p.consultation_id = c.id
      ${whereClause}
      ORDER BY p.prescription_date DESC
      LIMIT ? OFFSET ?
    `;

    const [prescriptions] = await db.query(queryStr, [...params, limitNum, offset]);

    for (const rx of prescriptions) {
      const [items] = await db.query(
        'SELECT id, medicine_name, dosage, frequency, duration, instructions FROM prescription_items WHERE prescription_id = ?',
        [rx.id]
      );
      rx.items = items;
    }

    return res.status(200).json({
      success: true,
      data: prescriptions,
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
 * Get prescription by ID
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        p.id, p.consultation_id, p.patient_id, p.doctor_id,
        p.prescription_date, p.instructions, p.created_at,
        pat.patient_code, CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
        pat.gender as patient_gender, pat.date_of_birth as patient_dob,
        pat.allergies,
        u.name as doctor_name, d.specialization as doctor_specialization,
        d.department as doctor_department,
        c.diagnosis, c.treatment
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN consultations c ON p.consultation_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    const prescription = rows[0];

    const [items] = await db.query(
      'SELECT id, medicine_name, dosage, frequency, duration, instructions FROM prescription_items WHERE prescription_id = ?',
      [id]
    );

    prescription.items = items;

    return res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new prescription with multiple medication items in a transaction
 */
const createPrescription = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const { consultation_id, patient_id, instructions, items } = req.body;

    const doctorId = req.user.doctor_id;
    if (!doctorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only registered doctors can create prescriptions.',
      });
    }

    await conn.beginTransaction();

    // Verify consultation
    const [consult] = await conn.query('SELECT doctor_id, patient_id FROM consultations WHERE id = ?', [consultation_id]);
    if (consult.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    const docIdToUse = doctorId || consult[0].doctor_id;
    const patIdToUse = patient_id || consult[0].patient_id;

    const [rxRes] = await conn.query(
      `INSERT INTO prescriptions (consultation_id, patient_id, doctor_id, prescription_date, instructions)
       VALUES (?, ?, ?, NOW(), ?)`,
      [consultation_id, patIdToUse, docIdToUse, instructions || null]
    );

    const prescriptionId = rxRes.insertId;

    // Insert each medicine item
    for (const item of items) {
      await conn.query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          prescriptionId,
          item.medicine_name,
          item.dosage,
          item.frequency,
          item.duration,
          item.instructions || null,
        ]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully.',
      data: {
        id: prescriptionId,
        itemCount: items.length,
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
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
};
