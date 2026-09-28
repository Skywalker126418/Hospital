const { body } = require('express-validator');

const laboratoryOrderValidator = [
  body('patient_id')
    .notEmpty()
    .withMessage('Patient is required.')
    .isInt({ min: 1 }),
  body('test_name')
    .trim()
    .notEmpty()
    .withMessage('Lab test name is required.'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
];

const laboratoryResultValidator = [
  body('status')
    .notEmpty()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid lab status.'),
  body('result')
    .optional()
    .trim(),
  body('technician_notes')
    .optional()
    .trim()
];

module.exports = {
  laboratoryOrderValidator,
  laboratoryResultValidator,
};
