const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { patientValidator } = require('../validators/patientValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All authenticated roles (admin, doctor, receptionist) can view patients
router.get('/', authenticate, patientController.getPatients);
router.get('/:id', authenticate, patientController.getPatientById);

// Receptionist and Admin can register and edit patient info
router.post(
  '/',
  authenticate,
  authorize('admin', 'receptionist'),
  patientValidator,
  validate,
  patientController.createPatient
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'receptionist'),
  patientValidator,
  validate,
  patientController.updatePatient
);

module.exports = router;
