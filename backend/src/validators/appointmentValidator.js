const { body } = require('express-validator');

const appointmentValidator = [
  body('patient_id')
    .notEmpty()
    .withMessage('Patient is required.')
    .isInt({ min: 1 })
    .withMessage('Valid Patient ID is required.'),
  body('doctor_id')
    .notEmpty()
    .withMessage('Doctor is required.')
    .isInt({ min: 1 })
    .withMessage('Valid Doctor ID is required.'),
  body('appointment_date')
    .notEmpty()
    .withMessage('Appointment date is required.')
    .isISO8601()
    .withMessage('Invalid date format (must be YYYY-MM-DD).'),
  body('appointment_time')
    .notEmpty()
    .withMessage('Appointment time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage('Invalid appointment time format (HH:MM or HH:MM:SS).'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason for appointment is required.'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid appointment status.')
];

module.exports = {
  appointmentValidator,
};
