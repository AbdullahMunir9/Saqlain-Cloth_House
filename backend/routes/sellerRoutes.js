import express from 'express';
import { getSellers, createSeller, getSellerById, updateSeller, deleteSeller } from '../controllers/sellerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSellers)
    .post(protect, createSeller);

router.route('/:id')
    .get(protect, getSellerById)
    .put(protect, updateSeller)
    .delete(protect, deleteSeller);

export default router;
