const db = require('../config/database');

/**
 * Generate unique Invoice Number (INV-YYYY-XXXX)
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const [rows] = await db.query(
    'SELECT count(*) as count FROM bills WHERE invoice_number LIKE ?',
    [`INV-${year}-%`]
  );
  const nextNum = (rows[0].count + 1).toString().padStart(4, '0');
  return `INV-${year}-${nextNum}`;
};

/**
 * Get bills with search, filter, and pagination
 */
const getBills = async (req, res, next) => {
  try {
    const { payment_status, patient_id, search = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (payment_status) {
      whereClause += ' AND b.payment_status = ?';
      params.push(payment_status);
    }

    if (patient_id) {
      whereClause += ' AND b.patient_id = ?';
      params.push(patient_id);
    }

    if (search.trim()) {
      whereClause += ` AND (
        b.invoice_number LIKE ? OR 
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.patient_code LIKE ?
      )`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM bills b
       JOIN patients p ON b.patient_id = p.id
       ${whereClause}`,
      params
    );
    const totalRecords = countRows[0].total;

    const queryStr = `
      SELECT 
        b.id, b.patient_id, b.appointment_id, b.invoice_number,
        b.total_amount, b.paid_amount,
        (b.total_amount - b.paid_amount) as remaining_balance,
        b.payment_status, b.payment_method, b.invoice_date, b.due_date,
        p.patient_code, CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.phone as patient_phone, p.email as patient_email
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      ${whereClause}
      ORDER BY b.invoice_date DESC
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
 * Get bill and invoice by ID with line items and hospital details for printing
 */
const getBillById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        b.id, b.patient_id, b.appointment_id, b.invoice_number,
        b.total_amount, b.paid_amount,
        (b.total_amount - b.paid_amount) as remaining_balance,
        b.payment_status, b.payment_method, b.invoice_date, b.due_date,
        p.patient_code, p.first_name, p.last_name,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.phone as patient_phone, p.email as patient_email, p.address as patient_address
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const bill = rows[0];

    const [items] = await db.query(
      'SELECT id, description, quantity, unit_price, total_price FROM bill_items WHERE bill_id = ?',
      [id]
    );

    const [settings] = await db.query('SELECT hospital_name, address, phone, email, currency FROM hospital_settings LIMIT 1');

    bill.items = items;
    bill.hospital = settings.length > 0 ? settings[0] : {
      hospital_name: 'Metropolitan Central Hospital',
      currency: 'USD',
    };

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new bill with itemized services/medications
 */
const createBill = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const { patient_id, appointment_id, due_date, items } = req.body;

    await conn.beginTransaction();

    const invoiceNumber = await generateInvoiceNumber();

    // Calculate total amount
    let totalAmount = 0;
    const computedItems = items.map((item) => {
      const qty = parseInt(item.quantity, 10) || 1;
      const unit = parseFloat(item.unit_price) || 0;
      const total = qty * unit;
      totalAmount += total;
      return {
        description: item.description,
        quantity: qty,
        unit_price: unit,
        total_price: total,
      };
    });

    const [billRes] = await conn.query(
      `INSERT INTO bills (patient_id, appointment_id, invoice_number, total_amount, paid_amount, payment_status, due_date, invoice_date)
       VALUES (?, ?, ?, ?, 0.00, 'pending', ?, NOW())`,
      [patient_id, appointment_id || null, invoiceNumber, totalAmount, due_date || null]
    );

    const billId = billRes.insertId;

    for (const item of computedItems) {
      await conn.query(
        `INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [billId, item.description, item.quantity, item.unit_price, item.total_price]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Invoice generated successfully.',
      data: {
        id: billId,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
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
 * Record a payment against an invoice
 */
const recordPayment = async (req, res, next) => {
  const conn = await db.pool.getConnection();
  try {
    const { id } = req.params;
    const { amount, payment_method } = req.body;

    const paymentVal = parseFloat(amount);

    await conn.beginTransaction();

    const [billRows] = await conn.query('SELECT total_amount, paid_amount FROM bills WHERE id = ? FOR UPDATE', [id]);
    if (billRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const currentBill = billRows[0];
    const newPaidAmount = parseFloat(currentBill.paid_amount) + paymentVal;
    const totalAmount = parseFloat(currentBill.total_amount);

    let newStatus = 'partially_paid';
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid';
    }

    await conn.query(
      `UPDATE bills SET paid_amount = ?, payment_status = ?, payment_method = ?, updated_at = NOW() WHERE id = ?`,
      [newPaidAmount, newStatus, payment_method, id]
    );

    await conn.commit();

    return res.status(200).json({
      success: true,
      message: `Payment of $${paymentVal.toFixed(2)} recorded successfully via ${payment_method}.`,
      data: {
        id,
        paid_amount: newPaidAmount,
        total_amount: totalAmount,
        payment_status: newStatus,
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
  getBills,
  getBillById,
  createBill,
  recordPayment,
};
