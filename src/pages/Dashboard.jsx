import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DollarSign, ShoppingBag, Users, UserCheck, TrendingUp } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

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
                const res = await axios.get('https://saqlain-cloth-house-1.onrender.com/api/dashboard', config);
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8 max-w-5xl">
                <Bar options={chartOptions} data={chartData} />
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
