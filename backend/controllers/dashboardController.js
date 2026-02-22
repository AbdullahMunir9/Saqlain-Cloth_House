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
            monthlyChart: monthlyData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
};
