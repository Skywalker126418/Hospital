const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { prescriptionValidator } = require('../validators/prescriptionValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, prescriptionController.getPrescriptions);
router.get('/:id', authenticate, prescriptionController.getPrescriptionById);
router.post(
  '/',
  authenticate,
  authorize('doctor', 'admin'),
  prescriptionValidator,
  validate,
  prescriptionController.createPrescription
);

module.exports = router;
