const { body } = require('express-validator');

const prescriptionValidator = [
  body('consultation_id')
    .notEmpty()
    .withMessage('Associated consultation ID is required.')
    .isInt({ min: 1 }),
  body('patient_id')
    .notEmpty()
    .withMessage('Patient ID is required.')
    .isInt({ min: 1 }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Prescription must contain at least one medication item.'),
  body('items.*.medicine_name')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required for all items.'),
  body('items.*.dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required (e.g. 500mg, 1 tablet).'),
  body('items.*.frequency')
    .trim()
    .notEmpty()
    .withMessage('Frequency is required (e.g. Twice daily).'),
  body('items.*.duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required (e.g. 7 days).'),
];

module.exports = {
  prescriptionValidator,
};
