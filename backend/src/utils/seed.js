const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding process...');

  try {
    const conn = await db.pool.getConnection();

    // Disable foreign key checks for clean wiping if re-seeding
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE bill_items');
    await conn.query('TRUNCATE TABLE bills');
    await conn.query('TRUNCATE TABLE prescription_items');
    await conn.query('TRUNCATE TABLE prescriptions');
    await conn.query('TRUNCATE TABLE consultations');
    await conn.query('TRUNCATE TABLE laboratory_tests');
    await conn.query('TRUNCATE TABLE appointments');
    await conn.query('TRUNCATE TABLE patients');
    await conn.query('TRUNCATE TABLE doctors');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('TRUNCATE TABLE hospital_settings');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('[Seed] Tables cleared successfully.');

    // 1. Hospital Settings
    await conn.query(`
      INSERT INTO hospital_settings (hospital_name, address, phone, email, logo_url, currency, appointment_duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Metropolitan Central Hospital',
      '452 Healthcare Boulevard, Medical District, NY 10001',
      '+1 (800) 555-0199',
      'contact@metropolitan-hospital.org',
      '/logo.svg',
      'USD',
      30
    ]);

    // 2. Hash default passwords
    const adminPass = await bcrypt.hash('Admin123!', 10);
    const doctorPass = await bcrypt.hash('Doctor123!', 10);
    const receptionPass = await bcrypt.hash('Reception123!', 10);

    // 3. Create Users
    // Admin
    const [adminResult] = await conn.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'admin', 'active')
    `, ['Dr. Arthur Vance (Chief Administrator)', 'admin@hospital.com', adminPass]);
    const adminId = adminResult.insertId;

    // Doctors
    const [doc1User] = await conn.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'doctor', 'active')
    `, ['Dr. Jean Claude', 'doctor.claude@hospital.com', doctorPass]);

    const [doc2User] = await conn.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'doctor', 'active')
    `, ['Dr. Emily Smith', 'doctor.smith@hospital.com', doctorPass]);

    const [doc3User] = await conn.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'doctor', 'active')
    `, ['Dr. Aisha Patel', 'doctor.patel@hospital.com', doctorPass]);

    // Receptionists
    const [rec1User] = await conn.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'receptionist', 'active')
    `, ['Sarah Johnson', 'receptionist@hospital.com', receptionPass]);

    const [rec2User] = await conn.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'receptionist', 'active')
    `, ['David Miller', 'receptionist2@hospital.com', receptionPass]);

    // 4. Create Doctor Records
    const [doc1] = await conn.query(`
      INSERT INTO doctors (user_id, specialization, department, license_number, phone, availability, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, [
      doc1User.insertId,
      'General Medicine',
      'Outpatient Internal Medicine',
      'LIC-MED-84920',
      '+1 (555) 234-8801',
      JSON.stringify({ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], hours: '08:00 - 16:00' })
    ]);

    const [doc2] = await conn.query(`
      INSERT INTO doctors (user_id, specialization, department, license_number, phone, availability, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, [
      doc2User.insertId,
      'Cardiology',
      'Cardiovascular Sciences',
      'LIC-CARD-55193',
      '+1 (555) 234-8802',
      JSON.stringify({ days: ['Monday', 'Wednesday', 'Friday'], hours: '09:00 - 15:00' })
    ]);

    const [doc3] = await conn.query(`
      INSERT INTO doctors (user_id, specialization, department, license_number, phone, availability, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, [
      doc3User.insertId,
      'Pediatrics',
      'Child Health & Wellness',
      'LIC-PED-99412',
      '+1 (555) 234-8803',
      JSON.stringify({ days: ['Tuesday', 'Thursday', 'Saturday'], hours: '08:30 - 14:30' })
    ]);

    const docIdClaude = doc1.insertId;
    const docIdSmith = doc2.insertId;
    const docIdPatel = doc3.insertId;

    // 5. Create Patients
    const patientsData = [
      {
        code: 'PAT-2026-001',
        first: 'John',
        last: 'Doe',
        dob: '1985-04-12',
        gender: 'Male',
        nid: 'NID-991204',
        phone: '+1 (555) 712-4011',
        email: 'john.doe@example.com',
        address: '124 Elm Street, Apt 4B, New York, NY',
        eName: 'Jane Doe (Spouse)',
        ePhone: '+1 (555) 712-4012',
        blood: 'O+',
        allergies: 'Penicillin, Shellfish'
      },
      {
        code: 'PAT-2026-002',
        first: 'Maria',
        last: 'Santos',
        dob: '1992-08-25',
        gender: 'Female',
        nid: 'NID-884123',
        phone: '+1 (555) 639-1120',
        email: 'maria.santos@example.com',
        address: '77 Lexington Avenue, New York, NY',
        eName: 'Carlos Santos (Brother)',
        ePhone: '+1 (555) 639-1121',
        blood: 'A+',
        allergies: 'Aspirin'
      },
      {
        code: 'PAT-2026-003',
        first: 'Robert',
        last: 'Chen',
        dob: '1974-11-03',
        gender: 'Male',
        nid: 'NID-772910',
        phone: '+1 (555) 482-9901',
        email: 'robert.chen@example.com',
        address: '350 Broadway, Floor 8, New York, NY',
        eName: 'Lin Chen (Daughter)',
        ePhone: '+1 (555) 482-9905',
        blood: 'B+',
        allergies: 'None known'
      },
      {
        code: 'PAT-2026-004',
        first: 'Grace',
        last: 'Williams',
        dob: '2001-02-18',
        gender: 'Female',
        nid: 'NID-551029',
        phone: '+1 (555) 891-2345',
        email: 'grace.w@example.com',
        address: '19 Park Terrace, Brooklyn, NY',
        eName: 'Patricia Williams (Mother)',
        ePhone: '+1 (555) 891-2346',
        blood: 'AB-',
        allergies: 'Sulfa drugs'
      },
      {
        code: 'PAT-2026-005',
        first: 'Liam',
        last: 'O\'Connor',
        dob: '2018-06-14',
        gender: 'Male',
        nid: 'NID-442190',
        phone: '+1 (555) 303-9182',
        email: 'oconnor.family@example.com',
        address: '88 Queens Blvd, Queens, NY',
        eName: 'Siobhan O\'Connor (Mother)',
        ePhone: '+1 (555) 303-9182',
        blood: 'O-',
        allergies: 'Peanuts'
      }
    ];

    const patientIds = [];
    for (const p of patientsData) {
      const [res] = await conn.query(`
        INSERT INTO patients (patient_code, first_name, last_name, date_of_birth, gender, national_id, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [p.code, p.first, p.last, p.dob, p.gender, p.nid, p.phone, p.email, p.address, p.eName, p.ePhone, p.blood, p.allergies]);
      patientIds.push(res.insertId);
    }

    // 6. Create Appointments (Today's date and upcoming)
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    // Appt 1: Completed consultation today with Dr. Claude
    const [appt1] = await conn.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
      VALUES (?, ?, ?, '09:00:00', 'Persistent cough and mild chest tightness for 5 days', 'completed', 'Patient checked in on time')
    `, [patientIds[0], docIdClaude, today]);

    // Appt 2: Scheduled today for Dr. Claude
    await conn.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
      VALUES (?, ?, ?, '10:30:00', 'Routine hypertension and lipid profile checkup', 'confirmed', 'Patient arriving by transit')
    `, [patientIds[1], docIdClaude, today]);

    // Appt 3: Scheduled today for Dr. Smith (Cardiology)
    await conn.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
      VALUES (?, ?, ?, '11:00:00', 'Palpitations following mild exertion and dizziness', 'scheduled', 'Referral from general practice')
    `, [patientIds[2], docIdSmith, today]);

    // Appt 4: Completed with Dr. Smith
    const [appt4] = await conn.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
      VALUES (?, ?, ?, '14:00:00', 'Post-myocardial infarction medication review', 'completed', 'Follow-up exam')
    `, [patientIds[3], docIdSmith, today]);

    // Appt 5: Tomorrow with Dr. Patel (Pediatrics)
    await conn.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
      VALUES (?, ?, ?, '09:30:00', 'Well-child developmental exam & vaccination schedule', 'scheduled', 'Brought by mother')
    `, [patientIds[4], docIdPatel, tomorrow]);

    // 7. Consultations
    // For Appt 1
    const [consult1] = await conn.query(`
      INSERT INTO consultations (appointment_id, patient_id, doctor_id, consultation_date, symptoms, diagnosis, treatment, notes, follow_up_date)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)
    `, [
      appt1.insertId,
      patientIds[0],
      docIdClaude,
      'Dry nocturnal cough, slight low-grade fever (37.8C), normal breath sounds bilaterally.',
      'Acute Upper Respiratory Infection (Bronchial Irritation)',
      'Hydration, warm saline gargles, bronchodilator syrup, and rest for 3 days.',
      'Patient reports no chest pain on deep inspiration. Monitored SpO2 at 98% on room air.',
      new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    ]);

    // For Appt 4
    const [consult4] = await conn.query(`
      INSERT INTO consultations (appointment_id, patient_id, doctor_id, consultation_date, symptoms, diagnosis, treatment, notes, follow_up_date)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)
    `, [
      appt4.insertId,
      patientIds[3],
      docIdSmith,
      'Occasional sinus tachycardia, resting BP 132/84 mmHg, clear S1/S2 heart sounds.',
      'Essential Hypertension - Well Managed',
      'Continue ACE-inhibitor therapy and lifestyle sodium moderation.',
      'ECG rhythm shows normal sinus cadence without ST elevation. Routine echocardiogram scheduled in 6 months.',
      new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    ]);

    // 8. Prescriptions & Prescription Items
    const [rx1] = await conn.query(`
      INSERT INTO prescriptions (consultation_id, patient_id, doctor_id, prescription_date, instructions)
      VALUES (?, ?, ?, NOW(), ?)
    `, [consult1.insertId, patientIds[0], docIdClaude, 'Take after meals. Drink at least 2 liters of water daily.']);

    await conn.query(`
      INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
      VALUES 
      (?, 'Amoxicillin 500mg', '1 capsule', 'Three times daily', '7 days', 'Complete full course even if feeling better'),
      (?, 'Dextromethorphan Syrup', '10 ml', 'Twice daily as needed', '5 days', 'Take before sleeping for dry cough relief'),
      (?, 'Paracetamol 500mg', '1 tablet', 'Every 6 hours PRN', '3 days', 'For fever or headaches')
    `, [rx1.insertId, rx1.insertId, rx1.insertId]);

    const [rx4] = await conn.query(`
      INSERT INTO prescriptions (consultation_id, patient_id, doctor_id, prescription_date, instructions)
      VALUES (?, ?, ?, NOW(), ?)
    `, [consult4.insertId, patientIds[3], docIdSmith, 'Morning dosage with breakfast. Monitor blood pressure weekly.']);

    await conn.query(`
      INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
      VALUES 
      (?, 'Lisinopril 10mg', '1 tablet', 'Once daily (morning)', '30 days', 'Do not discontinue abruptly'),
      (?, 'Atorvastatin 20mg', '1 tablet', 'Once daily at bedtime', '30 days', 'Lipid lowering maintenance')
    `, [rx4.insertId, rx4.insertId]);

    // 9. Laboratory Tests
    await conn.query(`
      INSERT INTO laboratory_tests (patient_id, doctor_id, test_name, description, status, result, result_date, technician_notes)
      VALUES 
      (?, ?, 'Complete Blood Count (CBC)', 'Evaluate cellular blood composition & infection markers', 'completed', 'WBC: 7.2 x10^9/L (Normal), RBC: 4.8 x10^12/L (Normal), Platelets: 240 x10^9/L (Normal), Hemoglobin: 14.2 g/dL (Normal).', NOW(), 'Specimen clear, processed on automated hematology analyzer.'),
      (?, ?, 'Comprehensive Lipid Profile', 'Total Cholesterol, HDL, LDL, and Triglycerides evaluation', 'completed', 'Total Cholesterol: 185 mg/dL (Desirable), HDL: 52 mg/dL, LDL: 104 mg/dL, Triglycerides: 145 mg/dL.', NOW(), 'Fasting status confirmed 12 hours prior to draw.'),
      (?, ?, 'Cardiac Troponin I & CK-MB', 'Rule out acute myocardial necrosis', 'pending', NULL, NULL, 'Specimen received in central clinical laboratory, running assay.'),
      (?, ?, 'Urinalysis & Microscopic Exam', 'Screen for urinary tract infection and renal parameters', 'in_progress', NULL, NULL, 'Centrifuged sediment under microscopic inspection.')
    `, [
      patientIds[0], docIdClaude,
      patientIds[3], docIdSmith,
      patientIds[2], docIdSmith,
      patientIds[1], docIdClaude
    ]);

    // 10. Billing and Invoices
    // Invoice 1: Completed and Paid
    const [bill1] = await conn.query(`
      INSERT INTO bills (patient_id, appointment_id, invoice_number, total_amount, paid_amount, payment_status, payment_method, due_date)
      VALUES (?, ?, 'INV-2026-0001', 125.00, 125.00, 'paid', 'card', ?)
    `, [patientIds[0], appt1.insertId, today]);

    await conn.query(`
      INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price)
      VALUES 
      (?, 'General Physician Consultation', 1, 50.00, 50.00),
      (?, 'Complete Blood Count (CBC) Laboratory', 1, 45.00, 45.00),
      (?, 'Outpatient Pharmacy Dispensing (Amoxicillin & Syrup)', 1, 30.00, 30.00)
    `, [bill1.insertId, bill1.insertId, bill1.insertId]);

    // Invoice 2: Partially Paid
    const [bill2] = await conn.query(`
      INSERT INTO bills (patient_id, appointment_id, invoice_number, total_amount, paid_amount, payment_status, payment_method, due_date)
      VALUES (?, ?, 'INV-2026-0002', 220.00, 100.00, 'partially_paid', 'cash', ?)
    `, [patientIds[3], appt4.insertId, tomorrow]);

    await conn.query(`
      INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price)
      VALUES 
      (?, 'Specialist Cardiology Consultation', 1, 90.00, 90.00),
      (?, '12-Lead Diagnostic Electrocardiogram (ECG)', 1, 80.00, 80.00),
      (?, 'Comprehensive Lipid Profile Panel', 1, 50.00, 50.00)
    `, [bill2.insertId, bill2.insertId, bill2.insertId]);

    // Invoice 3: Pending
    const [bill3] = await conn.query(`
      INSERT INTO bills (patient_id, appointment_id, invoice_number, total_amount, paid_amount, payment_status, payment_method, due_date)
      VALUES (?, NULL, 'INV-2026-0003', 140.00, 0.00, 'pending', NULL, ?)
    `, [patientIds[2], tomorrow]);

    await conn.query(`
      INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price)
      VALUES 
      (?, 'Cardiology Follow-up Advance Booking Fee', 1, 75.00, 75.00),
      (?, 'Cardiac Biomarker Troponin Assays', 1, 65.00, 65.00)
    `, [bill3.insertId, bill3.insertId]);

    conn.release();

    console.log('[Seed] Seeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Default Accounts:');
    console.log('1. Admin:        admin@hospital.com       / Admin123!');
    console.log('2. Doctor:       doctor.claude@hospital.com / Doctor123!');
    console.log('3. Doctor:       doctor.smith@hospital.com  / Doctor123!');
    console.log('4. Receptionist: receptionist@hospital.com / Reception123!');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
