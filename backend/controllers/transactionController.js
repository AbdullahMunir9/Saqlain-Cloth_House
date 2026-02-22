import Transaction from '../models/Transaction.js';
import Buyer from '../models/Buyer.js';
import Seller from '../models/Seller.js';

// @desc    Get all transactions (can filter by entityId)
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
    try {
        const { entityId, type } = req.query;
        let query = {};
        if (entityId) query.entityId = entityId;
        if (type) query.type = type;

        const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error parsing transactions' });
    }
};

// @desc    Create a new transaction (Buy from Seller / Sell to Buyer)
// @route   POST /api/transactions
// @access  Private
// Body: { type: 'buy' | 'sell', entityId, date, items: [{itemName, quantity, pricePerUnit, total}], paidNow, notes }
export const createTransaction = async (req, res) => {
    const { type, entityId, date, items, paidNow, notes } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in transaction' });
    }

    try {
        // Calculate total bill from items
        const totalBill = items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
        const paymentAmount = Number(paidNow) || 0;

        let entity;
        let newRemaining = 0;

        if (type === 'sell') {
            // Sell to Buyer -> Increase buyer's remaining amount
            entity = await Buyer.findById(entityId);
            if (!entity) return res.status(404).json({ message: 'Buyer not found' });

            newRemaining = entity.totalRemainingAmount + totalBill - paymentAmount;

            entity.totalBoughtAmount += totalBill;
            entity.totalPaidAmount += paymentAmount;
            entity.totalRemainingAmount = newRemaining;

            await entity.save();
        } else if (type === 'buy') {
            // Buy from Seller -> Increase what we owe the seller
            entity = await Seller.findById(entityId);
            if (!entity) return res.status(404).json({ message: 'Seller not found' });

            newRemaining = entity.totalRemainingAmount + totalBill - paymentAmount;

            entity.totalPurchasedAmount += totalBill;
            entity.totalPaidAmount += paymentAmount;
            entity.totalRemainingAmount = newRemaining;

            await entity.save();
        } else {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }

        const transaction = new Transaction({
            type,
            entityId,
            entityModel: type === 'buy' ? 'Seller' : 'Buyer',
            date: date || Date.now(),
            items: items.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity,
                pricePerUnit: item.pricePerUnit,
                total: item.quantity * item.pricePerUnit
            })),
            totalBill,
            paidNow: paymentAmount,
            remainingAfterTransaction: newRemaining,
            notes: notes || ''
        });

        const createdTransaction = await transaction.save();
        res.status(201).json(createdTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error processing transaction' });
    }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (transaction) {
            res.json(transaction);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
