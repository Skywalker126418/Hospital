const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadLogo } = require('../middleware/uploadMiddleware');

router.get('/', authenticate, settingsController.getSettings);
router.put('/', authenticate, authorize('admin'), settingsController.updateSettings);
router.post('/logo', authenticate, authorize('admin'), uploadLogo.single('logo'), settingsController.uploadLogo);
router.post('/clear-demo-data', authenticate, authorize('admin'), settingsController.clearAllDemoData);
router.post('/reseed-data', authenticate, authorize('admin'), settingsController.reseedData);

module.exports = router;
