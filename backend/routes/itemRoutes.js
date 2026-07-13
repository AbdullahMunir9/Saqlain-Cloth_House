import express from 'express';
import { getItems, getItemById, clearItemStock } from '../controllers/itemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getItems);
router.route('/:id/stock').delete(protect, clearItemStock);
router.route('/:id').get(protect, getItemById);

export default router;
