const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.patch('/:id/toggle-status', authenticate, authorize('admin'), userController.toggleUserStatus);
router.post('/:id/reset-password', authenticate, authorize('admin'), userController.resetPassword);

module.exports = router;
