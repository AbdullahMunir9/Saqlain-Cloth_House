import express from 'express';
import { getReports, globalSearch, getSalesSummary, getTopBuyers, getTopSellers } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getReports);
router.route('/sales-summary').get(protect, getSalesSummary);
router.route('/top-buyers').get(protect, getTopBuyers);
router.route('/top-sellers').get(protect, getTopSellers);

export default router;
