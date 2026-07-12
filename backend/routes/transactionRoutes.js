import express from 'express';
import { getTransactions, createTransaction, getTransactionById, deleteTransaction } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTransactions)
    .post(protect, createTransaction);

router.route('/:id')
    .get(protect, getTransactionById)
    .delete(protect, deleteTransaction);

export default router;
