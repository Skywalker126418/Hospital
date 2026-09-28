const db = require('../config/database');

/**
 * Get all laboratory tests with status and patient info
 */
const getLaboratoryTests = async (req, res, next) => {
  try {
    const { status, patient_id, search = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND l.status = ?';
      params.push(status);
    }

    if (patient_id) {
      whereClause += ' AND l.patient_id = ?';
      params.push(patient_id);
    }

    if (search.trim()) {
      whereClause += ` AND (
        l.test_name LIKE ? OR 
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.patient_code LIKE ?
      )`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM laboratory_tests l
       JOIN patients p ON l.patient_id = p.id
       ${whereClause}`,
      params
    );
    const totalRecords = countRows[0].total;

    const queryStr = `
      SELECT 
        l.id, l.patient_id, l.doctor_id, l.test_name, l.description,
        l.request_date, l.status, l.result, l.result_date, l.technician_notes,
        p.patient_code, CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.gender as patient_gender, p.date_of_birth as patient_dob,
        u.name as doctor_name, d.specialization as doctor_specialization
      FROM laboratory_tests l
      JOIN patients p ON l.patient_id = p.id
      JOIN doctors d ON l.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      ${whereClause}
      ORDER BY l.request_date DESC
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
 * Get laboratory test details by ID
 */
const getLaboratoryTestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        l.id, l.patient_id, l.doctor_id, l.test_name, l.description,
        l.request_date, l.status, l.result, l.result_date, l.technician_notes,
        p.patient_code, CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.gender as patient_gender, p.blood_group,
        u.name as doctor_name, d.specialization as doctor_specialization
      FROM laboratory_tests l
      JOIN patients p ON l.patient_id = p.id
      JOIN doctors d ON l.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE l.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Laboratory test not found.' });
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
 * Order a new laboratory test
 */
const createLaboratoryTest = async (req, res, next) => {
  try {
    const { patient_id, test_name, description } = req.body;
    let doctorId = req.user.doctor_id;

    if (!doctorId) {
      // If admin, pick first active doctor or require doctor_id
      const [docRows] = await db.query('SELECT id FROM doctors LIMIT 1');
      if (docRows.length > 0) doctorId = docRows[0].id;
    }

    const [result] = await db.query(
      `INSERT INTO laboratory_tests (patient_id, doctor_id, test_name, description, status, request_date)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [patient_id, doctorId, test_name, description || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Laboratory test requested successfully.',
      data: {
        id: result.insertId,
        test_name,
        status: 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update laboratory test results and status
 */
const updateLaboratoryResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, result, technician_notes } = req.body;

    const [existing] = await db.query('SELECT id FROM laboratory_tests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Laboratory test not found.' });
    }

    const isCompleted = status === 'completed';

    await db.query(
      `UPDATE laboratory_tests SET 
        status = ?, 
        result = COALESCE(?, result), 
        technician_notes = COALESCE(?, technician_notes),
        result_date = CASE WHEN ? = 1 THEN NOW() ELSE result_date END
      WHERE id = ?`,
      [status, result || null, technician_notes || null, isCompleted ? 1 : 0, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Laboratory test status and results updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLaboratoryTests,
  getLaboratoryTestById,
  createLaboratoryTest,
  updateLaboratoryResult,
};
