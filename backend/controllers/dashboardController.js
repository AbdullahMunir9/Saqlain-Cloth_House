import Buyer from '../models/Buyer.js';
import Seller from '../models/Seller.js';
import Transaction from '../models/Transaction.js';

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard
// @access  Private
export const getDashboardSummary = async (req, res) => {
    try {
        // 1. Total Pending Receivable (From Buyers)
        const buyers = await Buyer.find({});
        const totalReceivable = buyers.reduce((acc, curr) => acc + curr.totalRemainingAmount, 0);
        const totalBuyers = buyers.length;

        // 2. Total Pending Payable (To Sellers)
        const sellers = await Seller.find({});
        const totalPayable = sellers.reduce((acc, curr) => acc + curr.totalRemainingAmount, 0);
        const totalSellers = sellers.length;

        // 3. Today's Transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysTransactions = await Transaction.find({
            date: { $gte: today }
        });
        const todaysTransactionsCount = todaysTransactions.length;
        const todaysTotalBill = todaysTransactions.reduce((acc, curr) => acc + curr.totalBill, 0);

        // 4. Monthly Summary (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const recentTransactions = await Transaction.find({
            date: { $gte: sixMonthsAgo }
        });

        // Group by month
        const monthlyData = {};
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthYear = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
            monthlyData[monthYear] = { buy: 0, sell: 0 };
        }

        recentTransactions.forEach(tx => {
            const d = new Date(tx.date);
            const monthYear = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

            if (monthlyData[monthYear]) {
                if (tx.type === 'buy') {
                    monthlyData[monthYear].buy += tx.totalBill;
                } else {
                    monthlyData[monthYear].sell += tx.totalBill;
                }
            }
        });

        // 5. Profit Stats per Product
        const profitStatsGrouped = await Transaction.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: { itemName: "$items.itemName", type: "$type" },
                    totalQuantity: { $sum: "$items.quantity" },
                    totalAmount: { $sum: { $multiply: ["$items.quantity", "$items.pricePerUnit"] } }
                }
            }
        ]);

        const profitMap = {};
        profitStatsGrouped.forEach(stat => {
            const { itemName, type } = stat._id;
            if (!profitMap[itemName]) {
                profitMap[itemName] = { buyQty: 0, buyAmount: 0, sellQty: 0, sellAmount: 0 };
            }
            if (type === 'buy') {
                profitMap[itemName].buyQty += stat.totalQuantity;
                profitMap[itemName].buyAmount += stat.totalAmount;
            } else {
                profitMap[itemName].sellQty += stat.totalQuantity;
                profitMap[itemName].sellAmount += stat.totalAmount;
            }
        });

        const profitStats = Object.keys(profitMap).map(name => {
            const data = profitMap[name];
            const avgBuyPrice = data.buyQty > 0 ? data.buyAmount / data.buyQty : 0;
            const avgSellPrice = data.sellQty > 0 ? data.sellAmount / data.sellQty : 0;
            const profit = data.sellAmount - (data.sellQty * avgBuyPrice);
            return {
                itemName: name,
                avgBuyPrice,
                avgSellPrice,
                totalSold: data.sellQty,
                totalProfit: profit
            };
        }).sort((a, b) => b.totalProfit - a.totalProfit);

        res.json({
            totals: {
                receivable: totalReceivable,
                payable: totalPayable,
                buyersCount: totalBuyers,
                sellersCount: totalSellers
            },
            today: {
                count: todaysTransactionsCount,
                totalAmount: todaysTotalBill,
                transactions: todaysTransactions
            },
            monthlyChart: monthlyData,
            profitStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
};
