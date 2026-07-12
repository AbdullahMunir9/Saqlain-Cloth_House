import express from 'express';
import { getItems, getItemById } from '../controllers/itemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getItems);
router.route('/:id').get(protect, getItemById);

export default router;
