const express = require('express');
const router = express.Router();
const laboratoryController = require('../controllers/laboratoryController');
const { laboratoryOrderValidator, laboratoryResultValidator } = require('../validators/laboratoryValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, laboratoryController.getLaboratoryTests);
router.get('/:id', authenticate, laboratoryController.getLaboratoryTestById);
router.post(
  '/',
  authenticate,
  authorize('doctor', 'admin'),
  laboratoryOrderValidator,
  validate,
  laboratoryController.createLaboratoryTest
);
router.patch(
  '/:id/result',
  authenticate,
  authorize('doctor', 'admin'),
  laboratoryResultValidator,
  validate,
  laboratoryController.updateLaboratoryResult
);

module.exports = router;
