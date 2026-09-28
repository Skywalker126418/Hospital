const db = require('../config/database');

/**
 * Generate unique Patient Code (PAT-YYYY-XXXX)
 */
const generatePatientCode = async () => {
  const year = new Date().getFullYear();
  const [rows] = await db.query(
    'SELECT count(*) as count FROM patients WHERE patient_code LIKE ?',
    [`PAT-${year}-%`]
  );
  const nextNum = (rows[0].count + 1).toString().padStart(4, '0');
  return `PAT-${year}-${nextNum}`;
};

/**
 * Get all patients with search, filtering, and pagination
 */
const getPatients = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search.trim()) {
      whereClause += ` AND (
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        patient_code LIKE ? OR 
        phone LIKE ? OR 
        email LIKE ? OR 
        national_id LIKE ?
      )`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s, s);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM patients ${whereClause}`,
      params
    );
    const totalRecords = countRows[0].total;

    // Get paginated rows
    const queryStr = `
      SELECT 
        id, patient_code, first_name, last_name, 
        CONCAT(first_name, ' ', last_name) as full_name,
        date_of_birth, 
        TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
        gender, national_id, phone, email, address,
        emergency_contact_name, emergency_contact_phone,
        blood_group, allergies, status, created_at, updated_at
      FROM patients
      ${whereClause}
      ORDER BY id DESC
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
 * Get patient profile by ID, including full clinical and billing timeline
 */
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [patientRows] = await db.query(
      `SELECT 
        id, patient_code, first_name, last_name,
        CONCAT(first_name, ' ', last_name) as full_name,
        date_of_birth,
        TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
        gender, national_id, phone, email, address,
        emergency_contact_name, emergency_contact_phone,
        blood_group, allergies, status, created_at, updated_at
      FROM patients WHERE id = ?`,
      [id]
    );

    if (patientRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.',
      });
    }

    const patient = patientRows[0];

    // Fetch appointments
    const [appointments] = await db.query(
      `SELECT 
        a.id, a.appointment_date, a.appointment_time, a.reason, a.status, a.notes, a.created_at,
        d.id as doctor_id, d.specialization, d.department,
        u.name as doctor_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [id]
    );

    // Fetch consultations
    const [consultations] = await db.query(
      `SELECT 
        c.id, c.appointment_id, c.consultation_date, c.symptoms, c.diagnosis, 
        c.treatment, c.notes, c.follow_up_date,
        u.name as doctor_name, d.specialization
      FROM consultations c
      JOIN doctors d ON c.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE c.patient_id = ?
      ORDER BY c.consultation_date DESC`,
      [id]
    );

    // Fetch prescriptions with their medication items
    const [prescriptions] = await db.query(
      `SELECT 
        p.id, p.consultation_id, p.prescription_date, p.instructions,
        u.name as doctor_name
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.prescription_date DESC`,
      [id]
    );

    for (const rx of prescriptions) {
      const [items] = await db.query(
        'SELECT id, medicine_name, dosage, frequency, duration, instructions FROM prescription_items WHERE prescription_id = ?',
        [rx.id]
      );
      rx.items = items;
    }

    // Fetch laboratory tests
    const [labTests] = await db.query(
      `SELECT 
        l.id, l.test_name, l.description, l.request_date, l.status,
        l.result, l.result_date, l.technician_notes,
        u.name as doctor_name
      FROM laboratory_tests l
      JOIN doctors d ON l.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE l.patient_id = ?
      ORDER BY l.request_date DESC`,
      [id]
    );

    // Fetch bills & invoices
    const [bills] = await db.query(
      `SELECT 
        id, invoice_number, total_amount, paid_amount, 
        (total_amount - paid_amount) as remaining_balance,
        payment_status, payment_method, invoice_date, due_date
      FROM bills
      WHERE patient_id = ?
      ORDER BY invoice_date DESC`,
      [id]
    );

    for (const bill of bills) {
      const [bItems] = await db.query(
        'SELECT id, description, quantity, unit_price, total_price FROM bill_items WHERE bill_id = ?',
        [bill.id]
      );
      bill.items = bItems;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...patient,
        appointments,
        consultations,
        prescriptions,
        laboratory_tests: labTests,
        bills,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new patient
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      national_id,
      phone,
      email,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      blood_group,
      allergies,
    } = req.body;

    // Check national_id uniqueness if provided
    if (national_id) {
      const [existingNid] = await db.query('SELECT id FROM patients WHERE national_id = ?', [national_id]);
      if (existingNid.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'A patient with this National ID is already registered.',
        });
      }
    }

    const patientCode = await generatePatientCode();

    const [result] = await db.query(
      `INSERT INTO patients (
        patient_code, first_name, last_name, date_of_birth, gender, national_id,
        phone, email, address, emergency_contact_name, emergency_contact_phone,
        blood_group, allergies, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        patientCode,
        first_name,
        last_name,
        date_of_birth,
        gender,
        national_id || null,
        phone,
        email || null,
        address,
        emergency_contact_name || null,
        emergency_contact_phone || null,
        blood_group || null,
        allergies || null,
      ]
    );

    const newPatientId = result.insertId;

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: {
        id: newPatientId,
        patient_code: patientCode,
        full_name: `${first_name} ${last_name}`,
        registration_date: new Date().toISOString().slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing patient
 */
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      national_id,
      phone,
      email,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      blood_group,
      allergies,
      status,
    } = req.body;

    // Ensure patient exists
    const [existing] = await db.query('SELECT id FROM patients WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    if (national_id) {
      const [duplicate] = await db.query(
        'SELECT id FROM patients WHERE national_id = ? AND id != ?',
        [national_id, id]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another patient already has this National ID.',
        });
      }
    }

    await db.query(
      `UPDATE patients SET 
        first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
        national_id = ?, phone = ?, email = ?, address = ?,
        emergency_contact_name = ?, emergency_contact_phone = ?,
        blood_group = ?, allergies = ?, status = COALESCE(?, status)
      WHERE id = ?`,
      [
        first_name,
        last_name,
        date_of_birth,
        gender,
        national_id || null,
        phone,
        email || null,
        address,
        emergency_contact_name || null,
        emergency_contact_phone || null,
        blood_group || null,
        allergies || null,
        status || 'active',
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Patient details updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
};
