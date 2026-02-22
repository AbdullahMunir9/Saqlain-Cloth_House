import Payment from '../models/Payment.js';
import Buyer from '../models/Buyer.js';
import Seller from '../models/Seller.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
    try {
        const { entityId, type } = req.query;
        let query = {};
        if (entityId) query.entityId = entityId;
        if (type) query.type = type;

        const payments = await Payment.find(query).sort({ date: -1, createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching payments' });
    }
};

// @desc    Add a payment (Receive from Buyer or Pay to Seller)
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
    const { type, entityId, amount, date, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ message: 'Valid amount is required' });
    }

    try {
        let entity;
        let newRemaining = 0;
        const paymentAmount = Number(amount);

        if (type === 'receive') {
            // Receive from Buyer -> Decrease their remaining balance
            entity = await Buyer.findById(entityId);
            if (!entity) return res.status(404).json({ message: 'Buyer not found' });

            newRemaining = entity.totalRemainingAmount - paymentAmount;

            entity.totalPaidAmount += paymentAmount;
            entity.totalRemainingAmount = newRemaining;

            await entity.save();
        } else if (type === 'pay') {
            // Pay to Seller -> Decrease our remaining balance owed
            entity = await Seller.findById(entityId);
            if (!entity) return res.status(404).json({ message: 'Seller not found' });

            newRemaining = entity.totalRemainingAmount - paymentAmount;

            entity.totalPaidAmount += paymentAmount;
            entity.totalRemainingAmount = newRemaining;

            await entity.save();
        } else {
            return res.status(400).json({ message: 'Invalid payment type. Use receive or pay.' });
        }

        const payment = new Payment({
            type,
            entityId,
            entityModel: type === 'receive' ? 'Buyer' : 'Seller',
            date: date || Date.now(),
            amount: paymentAmount,
            remainingAfterPayment: newRemaining,
            notes: notes || ''
        });

        const createdPayment = await payment.save();
        res.status(201).json(createdPayment);
    } catch (error) {
        res.status(500).json({ message: 'Server error processing payment' });
    }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (payment) {
            res.json(payment);
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
