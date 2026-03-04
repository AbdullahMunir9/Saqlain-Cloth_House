import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../api';
import { DollarSign, Users, UserCheck, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${colorClass}`}>
            {icon}
        </div>
    </div>
);

const Dashboard = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                };
                const res = await axios.get(`${API_BASE_URL}/dashboard`, config);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userInfo]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard data</div>;

    const chartData = {
        labels: Object.keys(data.monthlyChart).reverse(),
        datasets: [
            {
                label: 'Buy (From Sellers)',
                data: Object.values(data.monthlyChart).reverse().map(m => m.buy),
                backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red for expense/buy
            },
            {
                label: 'Sell (To Buyers)',
                data: Object.values(data.monthlyChart).reverse().map(m => m.sell),
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green for income/sell
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Monthly Buy / Sell Summary' }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t('Dashboard')}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard
                    title={t("Total Pending Payable")}
                    value={`Rs. ${data.totals.payable.toLocaleString()}`}
                    icon={<DollarSign size={24} className="text-red-500" />}
                    colorClass="bg-red-50"
                />
                <StatCard
                    title={t("Total Pending Receivable")}
                    value={`Rs. ${data.totals.receivable.toLocaleString()}`}
                    icon={<DollarSign size={24} className="text-green-500" />}
                    colorClass="bg-green-50"
                />
                <StatCard
                    title={t("Today's Sale")}
                    value={`Rs. ${data.today.totalAmount.toLocaleString()}`}
                    icon={<TrendingUp size={24} className="text-blue-500" />}
                    colorClass="bg-blue-50"
                />
                <StatCard
                    title={t("Total Sellers")}
                    value={data.totals.sellersCount}
                    icon={<Users size={24} className="text-purple-500" />}
                    colorClass="bg-purple-50"
                />
                <StatCard
                    title={t("Total Buyers")}
                    value={data.totals.buyersCount}
                    icon={<UserCheck size={24} className="text-orange-500" />}
                    colorClass="bg-orange-50"
                />
            </div>

            {/* Realized Profit Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">{t('Realized Profit by Product')}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">{t('Product Name')}</th>
                                <th className="px-6 py-4 font-bold text-center">{t('Avg. Buy Rate')}</th>
                                <th className="px-6 py-4 font-bold text-center">{t('Avg. Sell Rate')}</th>
                                <th className="px-6 py-4 font-bold text-center">{t('Total Sold')}</th>
                                <th className="px-6 py-4 font-bold text-right">{t('Total Profit')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.profitStats.map((stat, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800">{stat.itemName}</td>
                                    <td className="px-6 py-4 text-center text-gray-600">Rs. {stat.avgBuyPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center text-gray-600">Rs. {stat.avgSellPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center font-medium">{stat.totalSold}m</td>
                                    <td className={`px-6 py-4 text-right font-bold ${stat.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Rs. {stat.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>
                                </tr>
                            ))}
                            {data.profitStats.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No sales data available yet.</td>
                                </tr>
                            )}
                        </tbody>
                        {data.profitStats.length > 0 && (
                            <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-100">
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-right text-gray-700">{t('Net Combined Profit')}:</td>
                                    <td className={`px-6 py-4 text-right text-xl ${data.profitStats.reduce((acc, s) => acc + s.totalProfit, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Rs. {data.profitStats.reduce((acc, s) => acc + s.totalProfit, 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Today's Transactions ({data.today.count})</h2>
                {data.today.transactions.length === 0 ? (
                    <p className="text-gray-500">No transactions today.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3">Total Bill</th>
                                    <th className="px-4 py-3">Paid Now</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.today.transactions.map((tx) => (
                                    <tr key={tx._id} className="border-b">
                                        <td className="px-4 py-3 font-medium">
                                            <span className={`px-2 py-1 rounded text-xs ${tx.type === 'buy' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {tx.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{tx.items.map(i => i.itemName).join(', ')}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">Rs. {tx.totalBill.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600">Rs. {tx.paidNow.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
