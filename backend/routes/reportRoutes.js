import express from 'express';
import { getReports, globalSearch } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/reports').get(protect, getReports);
router.route('/search').get(protect, globalSearch);

export default router;
