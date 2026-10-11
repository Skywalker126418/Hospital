const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, doctorController.getDoctors);
router.get('/:id', authenticate, doctorController.getDoctorById);
router.patch('/:id/duty-status', authenticate, doctorController.updateDutyStatus);
router.get('/:id/slots', authenticate, doctorController.getDoctorSlots);

module.exports = router;
