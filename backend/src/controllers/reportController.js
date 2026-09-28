const db = require('../config/database');

/**
 * Get top-level dashboard statistics (patients, doctors, receptionists, appointments today, revenue, pending bills)
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Counts
    const [[{ total_patients }]] = await db.query("SELECT COUNT(*) as total_patients FROM patients WHERE status = 'active'");
    const [[{ total_doctors }]] = await db.query("SELECT COUNT(*) as total_doctors FROM doctors WHERE status = 'active'");
    const [[{ total_receptionists }]] = await db.query("SELECT COUNT(*) as total_receptionists FROM users WHERE role = 'receptionist' AND status = 'active'");
    const [[{ today_appointments }]] = await db.query("SELECT COUNT(*) as today_appointments FROM appointments WHERE appointment_date = ?", [today]);
    const [[{ pending_appointments }]] = await db.query("SELECT COUNT(*) as pending_appointments FROM appointments WHERE status = 'scheduled'");
    const [[{ completed_consultations }]] = await db.query("SELECT COUNT(*) as completed_consultations FROM consultations");
    const [[{ pending_lab_tests }]] = await db.query("SELECT COUNT(*) as pending_lab_tests FROM laboratory_tests WHERE status IN ('pending', 'in_progress')");

    // Revenue
    const [[revenueRow]] = await db.query(`
      SELECT 
        COALESCE(SUM(paid_amount), 0) as total_revenue,
        COALESCE(SUM(total_amount - paid_amount), 0) as pending_revenue
      FROM bills
    `);

    // Today's appointments list for receptionist/doctor/admin quick widget
    const [recentAppointments] = await db.query(`
      SELECT 
        a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_code,
        u.name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 6
    `);

    // Recent activity timeline
    const [recentActivities] = await db.query(`
      SELECT 'appointment' as type, CONCAT('Appointment ', a.status, ' for ', p.first_name, ' ', p.last_name) as title, a.created_at as timestamp
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      UNION ALL
      SELECT 'consultation' as type, CONCAT('Consultation recorded: ', c.diagnosis) as title, c.created_at as timestamp
      FROM consultations c
      UNION ALL
      SELECT 'bill' as type, CONCAT('Invoice ', b.invoice_number, ' (', b.payment_status, ')') as title, b.created_at as timestamp
      FROM bills b
      ORDER BY timestamp DESC
      LIMIT 8
    `);

    // Monthly appointment trend (past 6 months)
    const [monthlyAppointments] = await db.query(`
      SELECT 
        DATE_FORMAT(appointment_date, '%b %Y') as month,
        COUNT(*) as count
      FROM appointments
      GROUP BY DATE_FORMAT(appointment_date, '%Y-%m'), DATE_FORMAT(appointment_date, '%b %Y')
      ORDER BY DATE_FORMAT(appointment_date, '%Y-%m') DESC
      LIMIT 6
    `);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPatients: total_patients,
          totalDoctors: total_doctors,
          totalReceptionists: total_receptionists,
          todayAppointments: today_appointments,
          pendingAppointments: pending_appointments,
          completedConsultations: completed_consultations,
          pendingLabTests: pending_lab_tests,
          totalRevenue: parseFloat(revenueRow.total_revenue),
          pendingRevenue: parseFloat(revenueRow.pending_revenue),
        },
        recentAppointments,
        recentActivities,
        monthlyAppointments: monthlyAppointments.reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Filterable reports for financial, appointment, patient, and laboratory data
 */
const getReports = async (req, res, next) => {
  try {
    const { type = 'revenue', period = 'this_month', startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (period === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      dateFilter = '= ?';
      params.push(today);
    } else if (period === 'this_week') {
      dateFilter = '>= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else {
      // this_month
      dateFilter = '>= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    if (type === 'revenue') {
      const [rows] = await db.query(`
        SELECT 
          b.invoice_number, b.invoice_date, b.total_amount, b.paid_amount,
          b.payment_status, b.payment_method,
          CONCAT(p.first_name, ' ', p.last_name) as patient_name
        FROM bills b
        JOIN patients p ON b.patient_id = p.id
        WHERE DATE(b.invoice_date) ${dateFilter}
        ORDER BY b.invoice_date DESC
      `, params);

      const [byMethod] = await db.query(`
        SELECT payment_method, SUM(paid_amount) as total
        FROM bills
        WHERE payment_method IS NOT NULL
        GROUP BY payment_method
      `);

      return res.status(200).json({
        success: true,
        type: 'revenue',
        data: rows,
        summaryByMethod: byMethod,
      });
    }

    if (type === 'appointments') {
      const [rows] = await db.query(`
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
          CONCAT(p.first_name, ' ', p.last_name) as patient_name,
          u.name as doctor_name, d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE a.appointment_date ${dateFilter}
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
      `, params);

      return res.status(200).json({
        success: true,
        type: 'appointments',
        data: rows,
      });
    }

    if (type === 'laboratory') {
      const [rows] = await db.query(`
        SELECT 
          l.id, l.test_name, l.status, l.request_date, l.result_date,
          CONCAT(p.first_name, ' ', p.last_name) as patient_name,
          u.name as doctor_name
        FROM laboratory_tests l
        JOIN patients p ON l.patient_id = p.id
        JOIN doctors d ON l.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE DATE(l.request_date) ${dateFilter}
        ORDER BY l.request_date DESC
      `, params);

      return res.status(200).json({
        success: true,
        type: 'laboratory',
        data: rows,
      });
    }

    // Default: patients
    const [rows] = await db.query(`
      SELECT 
        id, patient_code, CONCAT(first_name, ' ', last_name) as patient_name,
        date_of_birth, gender, phone, email, blood_group, status, created_at
      FROM patients
      WHERE DATE(created_at) ${dateFilter}
      ORDER BY created_at DESC
    `, params);

    return res.status(200).json({
      success: true,
      type: 'patients',
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getReports,
};
