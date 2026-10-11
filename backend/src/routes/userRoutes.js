const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

// Get all staff users (for admin management, or doctor/receptionist directory & messaging)
router.get('/', authenticate, userController.getUsers);

// Admin-only staff account provisioning & management
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);
router.patch('/:id/toggle-status', authenticate, authorize('admin'), userController.toggleUserStatus);
router.post('/:id/reset-password', authenticate, authorize('admin'), userController.resetPassword);

// Profile photo upload & removal (user can manage own photo, or admin can manage any)
router.post('/profile-image', authenticate, uploadProfile.single('profile_image'), userController.uploadProfileImage);
router.post('/:id/profile-image', authenticate, uploadProfile.single('profile_image'), userController.uploadProfileImage);
router.delete('/profile-image', authenticate, userController.deleteProfileImage);
router.delete('/:id/profile-image', authenticate, userController.deleteProfileImage);

module.exports = router;
