const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { appointmentValidator } = require('../validators/appointmentValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, appointmentController.getAppointments);
router.get('/:id', authenticate, appointmentController.getAppointmentById);
router.post('/', authenticate, appointmentValidator, validate, appointmentController.createAppointment);
router.patch('/:id/status', authenticate, appointmentController.updateAppointmentStatus);
router.patch('/:id/reschedule', authenticate, appointmentController.rescheduleAppointment);

module.exports = router;
