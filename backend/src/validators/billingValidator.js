const { body } = require('express-validator');

const createBillValidator = [
  body('patient_id')
    .notEmpty()
    .withMessage('Patient ID is required.')
    .isInt({ min: 1 }),
  body('appointment_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Bill must contain at least one line item.'),
  body('items.*.description')
    .trim()
    .notEmpty()
    .withMessage('Item description is required.'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be at least 1.'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative.'),
  body('due_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid due date.')
];

const recordPaymentValidator = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than zero.'),
  body('payment_method')
    .isIn(['cash', 'card', 'bank_transfer', 'mobile_money'])
    .withMessage('Payment method must be cash, card, bank_transfer, or mobile_money.')
];

module.exports = {
  createBillValidator,
  recordPaymentValidator,
};
