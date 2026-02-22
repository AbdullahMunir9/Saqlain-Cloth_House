import Transaction from '../models/Transaction.js';
import Buyer from '../models/Buyer.js';
import Seller from '../models/Seller.js';

// @desc    Get reports data (daily, monthly, yearly, top entities)
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res) => {
    try {
        const { timerange = 'monthly' } = req.query; // 'daily', 'monthly', 'yearly'

        // 1. Top Buyers (by totalBoughtAmount)
        const topBuyers = await Buyer.find({}).sort({ totalBoughtAmount: -1 }).limit(5);

        // 2. Top Sellers (by totalPurchasedAmount)
        const topSellers = await Seller.find({}).sort({ totalPurchasedAmount: -1 }).limit(5);

        // 3. Transactions in range
        let startDate = new Date();
        if (timerange === 'daily') {
            startDate.setHours(0, 0, 0, 0);
        } else if (timerange === 'monthly') {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        } else if (timerange === 'yearly') {
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
        }

        const transactions = await Transaction.find({ date: { $gte: startDate } }).sort({ date: -1 });

        // Calculate most sold items
        const itemCounts = {};
        transactions.forEach(tx => {
            if (tx.type === 'sell') {
                tx.items.forEach(item => {
                    if (itemCounts[item.itemName]) {
                        itemCounts[item.itemName] += item.quantity;
                    } else {
                        itemCounts[item.itemName] = item.quantity;
                    }
                });
            }
        });

        const sortedItems = Object.keys(itemCounts).map(key => ({
            itemName: key,
            quantity: itemCounts[key]
        })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

        res.json({
            topBuyers,
            topSellers,
            transactions,
            mostSoldItems: sortedItems
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error generating reports' });
    }
};

// @desc    Global search (buyers, sellers)
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ buyers: [], sellers: [] });

        const regex = new RegExp(query, 'i');

        const buyers = await Buyer.find({
            $or: [{ name: regex }, { phone: regex }]
        });

        const sellers = await Seller.find({
            $or: [{ name: regex }, { phone: regex }]
        });

        res.json({ buyers, sellers });
    } catch (error) {
        res.status(500).json({ message: 'Search error' });
    }
};
