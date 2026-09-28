const { body } = require('express-validator');

const consultationValidator = [
  body('appointment_id')
    .notEmpty()
    .withMessage('Appointment ID is required.')
    .isInt({ min: 1 }),
  body('patient_id')
    .notEmpty()
    .withMessage('Patient ID is required.')
    .isInt({ min: 1 }),
  body('symptoms')
    .trim()
    .notEmpty()
    .withMessage('Symptoms description is required.'),
  body('diagnosis')
    .trim()
    .notEmpty()
    .withMessage('Clinical diagnosis is required.'),
  body('treatment')
    .trim()
    .notEmpty()
    .withMessage('Treatment plan is required.'),
  body('follow_up_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid follow-up date format.')
];

module.exports = {
  consultationValidator,
};
