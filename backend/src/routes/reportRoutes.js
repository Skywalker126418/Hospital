const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', authenticate, reportController.getDashboardSummary);
router.get('/', authenticate, authorize('admin'), reportController.getReports);

module.exports = router;
