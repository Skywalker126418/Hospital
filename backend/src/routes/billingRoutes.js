const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { createBillValidator, recordPaymentValidator } = require('../validators/billingValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, billingController.getBills);
router.get('/:id', authenticate, billingController.getBillById);
router.post(
  '/',
  authenticate,
  authorize('admin', 'receptionist'),
  createBillValidator,
  validate,
  billingController.createBill
);
router.post(
  '/:id/payments',
  authenticate,
  authorize('admin', 'receptionist'),
  recordPaymentValidator,
  validate,
  billingController.recordPayment
);

module.exports = router;
