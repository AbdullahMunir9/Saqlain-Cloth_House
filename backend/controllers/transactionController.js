import Transaction from '../models/Transaction.js';
import Buyer from '../models/Buyer.js';
import Seller from '../models/Seller.js';
import Item from '../models/Item.js';

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

        const enrichedItems = [];

        // Handle Item Logic
        for (const item of items) {
            let dbItem = null;

            if (type === 'buy') {
                // Find existing item from this seller or create a new one
                dbItem = await Item.findOne({
                    itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') },
                    sellerId: entityId
                });

                if (dbItem) {
                    dbItem.stock += item.quantity;
                    dbItem.purchasePrice = item.pricePerUnit; // update to latest price?
                    await dbItem.save();
                } else {
                    dbItem = new Item({
                        itemName: item.itemName,
                        sellerId: entityId,
                        stock: item.quantity,
                        purchasePrice: item.pricePerUnit
                    });
                    await dbItem.save();
                }
            } else if (type === 'sell') {
                // Determine item from existing stock (item._id should ideally be passed)
                // Assuming item._id is passed as itemId from frontend
                const itemId = item.itemId;
                if (itemId) {
                    dbItem = await Item.findById(itemId);
                } else {
                    // Fallback, try to find by name 
                    dbItem = await Item.findOne({
                        itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') },
                        stock: { $gt: 0 }
                    });
                }

                if (!dbItem) {
                    return res.status(400).json({ message: `Item inventory not found for: ${item.itemName}` });
                }

                if (dbItem.stock < item.quantity) {
                    return res.status(400).json({ message: `Not enough stock for ${item.itemName}. Available: ${dbItem.stock}` });
                }

                dbItem.stock -= item.quantity;
                await dbItem.save();
            }

            enrichedItems.push({
                itemId: dbItem ? dbItem._id : null,
                itemName: item.itemName,
                quantity: item.quantity,
                pricePerUnit: item.pricePerUnit,
                total: item.quantity * item.pricePerUnit
            });
        }

        const transaction = new Transaction({
            type,
            entityId,
            entityModel: type === 'buy' ? 'Seller' : 'Buyer',
            date: date || Date.now(),
            items: enrichedItems,
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

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
// Deleting a transaction should reverse its effect on the buyer/seller
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        let entity;
        const totalBill = transaction.totalBill;
        const paymentAmount = transaction.paidNow;

        if (transaction.type === 'sell') {
            entity = await Buyer.findById(transaction.entityId);
            if (entity) {
                entity.totalBoughtAmount -= totalBill;
                entity.totalPaidAmount -= paymentAmount;
                entity.totalRemainingAmount -= (totalBill - paymentAmount);
                await entity.save();
            }

            // Restore item stock, user sold this but now deleted the sale
            for (const item of transaction.items) {
                // Try to restore by name if it matches, to simplify logic
                const dbItem = await Item.findOne({
                    itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') }
                });
                if (dbItem) {
                    dbItem.stock += item.quantity;
                    await dbItem.save();
                }
            }
        } else if (transaction.type === 'buy') {
            entity = await Seller.findById(transaction.entityId);
            if (entity) {
                entity.totalPurchasedAmount -= totalBill;
                entity.totalPaidAmount -= paymentAmount;
                entity.totalRemainingAmount -= (totalBill - paymentAmount);
                await entity.save();
            }

            // Restore stock back to the old value
            for (const item of transaction.items) {
                const dbItem = await Item.findOne({
                    itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') },
                    sellerId: transaction.entityId
                });
                if (dbItem) {
                    dbItem.stock -= item.quantity;
                    await dbItem.save();
                }
            }
        }

        await Transaction.deleteOne({ _id: req.params.id });

        res.json({ message: 'Transaction removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting transaction' });
    }
};
