import express from 'express';
import { getReports, globalSearch, getSalesSummary, getTopBuyers, getTopSellers } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/reports').get(protect, getReports);
router.route('/reports/sales-summary').get(protect, getSalesSummary);
router.route('/reports/top-buyers').get(protect, getTopBuyers);
router.route('/reports/top-sellers').get(protect, getTopSellers);
router.route('/search').get(protect, globalSearch);

export default router;
