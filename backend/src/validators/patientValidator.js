const { body } = require('express-validator');

const patientValidator = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .isLength({ max: 100 }),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .isLength({ max: 100 }),
  body('date_of_birth')
    .notEmpty()
    .withMessage('Date of birth is required.')
    .isISO8601()
    .withMessage('Invalid date format (must be YYYY-MM-DD).')
    .custom((val) => {
      if (new Date(val) > new Date()) {
        throw new Error('Date of birth cannot be in the future.');
      }
      return true;
    }),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required.')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^[\d\s+\-().]{7,25}$/)
    .withMessage('Invalid phone number format.'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email address format.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Residential address is required.'),
  body('emergency_contact_name')
    .optional({ checkFalsy: true })
    .trim(),
  body('emergency_contact_phone')
    .optional({ checkFalsy: true })
    .trim(),
  body('blood_group')
    .optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group.'),
];

module.exports = {
  patientValidator,
};
