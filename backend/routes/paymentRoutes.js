import express from 'express';
import { getPayments, createPayment, getPaymentById, deletePayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getPayments)
    .post(protect, createPayment);

router.route('/:id')
    .get(protect, getPaymentById)
    .delete(protect, deletePayment);

export default router;
