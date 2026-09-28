const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { consultationValidator } = require('../validators/consultationValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, consultationController.getConsultations);
router.get('/:id', authenticate, consultationController.getConsultationById);
router.post(
  '/',
  authenticate,
  authorize('doctor', 'admin'),
  consultationValidator,
  validate,
  consultationController.createConsultation
);

module.exports = router;
