import express from 'express';
import { getBuyers, createBuyer, getBuyerById, updateBuyer, deleteBuyer } from '../controllers/buyerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getBuyers)
    .post(protect, createBuyer);

router.route('/:id')
    .get(protect, getBuyerById)
    .put(protect, updateBuyer)
    .delete(protect, deleteBuyer);

export default router;
