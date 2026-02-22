import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';

const Reports = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);

    const [startDate, setStartDate] = useState(
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [salesSummary, setSalesSummary] = useState(null);
    const [topBuyers, setTopBuyers] = useState([]);
    const [topSellers, setTopSellers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [salesRes, buyersRes, sellersRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/reports/sales-summary?startDate=${startDate}&endDate=${endDate}`, config),
                axios.get(`http://localhost:5000/api/reports/top-buyers?limit=5`, config),
                axios.get(`http://localhost:5000/api/reports/top-sellers?limit=5`, config)
            ]);

            setSalesSummary(salesRes.data);
            setTopBuyers(buyersRes.data);
            setTopSellers(sellersRes.data);
        } catch (error) {
            console.error('Error fetching reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchReports();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-primary" />
                    {t('Reports & Analytics')}
                </h1>

                <form onSubmit={handleFilter} className="flex gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar size={18} className="text-gray-400" />
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="outline-none text-sm text-gray-700 bg-transparent" />
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-2 px-2">
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="outline-none text-sm text-gray-700 bg-transparent" />
                    </div>
                    <button type="submit" className="bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary-dark transition-colors">
                        Apply
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500">Generating reports...</div>
            ) : (
                <div className="space-y-6">
                    {/* Sales Summary Cards */}
                    {salesSummary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100">
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Transactions</p>
                                <p className="text-3xl font-bold text-gray-900">{salesSummary.totalTransactions}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500 border-gray-100 relative overflow-hidden">
                                <TrendingUp className="absolute right-[-10px] bottom-[-10px] text-green-50 opacity-50" size={100} />
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Sales (To Buyers)</p>
                                <p className="text-3xl font-bold text-gray-900">Rs. {salesSummary.totalSales.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-red-500 border-gray-100 relative overflow-hidden">
                                <TrendingDown className="absolute right-[-10px] bottom-[-10px] text-red-50 opacity-50" size={100} />
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Purchases (From Sellers)</p>
                                <p className="text-3xl font-bold text-gray-900">Rs. {salesSummary.totalPurchases.toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Buyers */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">Top 5 Buyers (By Volume)</h2>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="p-4 font-medium">Rank</th>
                                            <th className="p-4 font-medium">Buyer Name</th>
                                            <th className="p-4 font-medium text-right">Total Bought</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topBuyers.map((buyer, idx) => (
                                            <tr key={buyer._id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-4 font-bold text-gray-400">#{idx + 1}</td>
                                                <td className="p-4 font-semibold text-gray-800">{buyer.name}</td>
                                                <td className="p-4 text-right font-medium text-green-600">Rs. {buyer.totalBoughtAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top Sellers */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">Top 5 Sellers (By Volume)</h2>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="p-4 font-medium">Rank</th>
                                            <th className="p-4 font-medium">Seller Name</th>
                                            <th className="p-4 font-medium text-right">Total Purchased</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topSellers.map((seller, idx) => (
                                            <tr key={seller._id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-4 font-bold text-gray-400">#{idx + 1}</td>
                                                <td className="p-4 font-semibold text-gray-800">{seller.name}</td>
                                                <td className="p-4 text-right font-medium text-blue-600">Rs. {seller.totalPurchasedAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
