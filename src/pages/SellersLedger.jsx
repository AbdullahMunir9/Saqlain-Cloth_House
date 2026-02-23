import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Eye, DollarSign, X, Trash2 } from 'lucide-react';

const SellersLedger = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);

    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal states
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Payment form states
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    // Ledger detailed states
    const [ledgerData, setLedgerData] = useState([]);

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            const { data } = await axios.get('https://saqlain-cloth-house-1.onrender.com/api/sellers', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setSellers(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleViewLedger = async (seller) => {
        setSelectedSeller(seller);
        setShowLedgerModal(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const [txRes, payRes] = await Promise.all([
                axios.get(`https://saqlain-cloth-house-1.onrender.com/api/transactions?entityId=${seller._id}&type=buy`, config),
                axios.get(`https://saqlain-cloth-house-1.onrender.com/api/payments?entityId=${seller._id}&type=pay`, config)
            ]);

            // Combine and sort chronologically
            const combined = [
                ...txRes.data.map(t => ({ ...t, kind: 'Purchase' })),
                ...payRes.data.map(p => ({ ...p, kind: 'Payment' }))
            ].sort((a, b) => new Date(a.date) - new Date(b.date));

            setLedgerData(combined);
        } catch (error) {
            console.error('Error fetching ledger details', error);
        }
    };

    const handleDeleteRecord = async (record) => {
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone and will update the ledger balances.')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            if (record.kind === 'Purchase') {
                await axios.delete(`https://saqlain-cloth-house-1.onrender.com/api/transactions/${record._id}`, config);
            } else if (record.kind === 'Payment') {
                await axios.delete(`https://saqlain-cloth-house-1.onrender.com/api/payments/${record._id}`, config);
            }

            // Refresh the ledger modal data and the main sellers list
            fetchSellers();
            // Re-fetch ledger data to update view accurately
            handleViewLedger(selectedSeller);
        } catch (error) {
            console.error('Error deleting record', error);
            alert(error.response?.data?.message || 'Error deleting record');
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://saqlain-cloth-house-1.onrender.com/api/payments', {
                type: 'pay',
                entityId: selectedSeller._id,
                amount: Number(paymentAmount),
                notes: paymentNotes
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            setShowPaymentModal(false);
            setPaymentAmount('');
            setPaymentNotes('');
            fetchSellers(); // Refresh list to get updated remaining amount
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing payment');
        }
    };

    const handleDeleteSeller = async (sellerId) => {
        if (!window.confirm('WARNING: Are you sure you want to delete this seller? This will also permanently delete ALL associated transactions and payments. This action CANNOT be undone.')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`https://saqlain-cloth-house-1.onrender.com/api/sellers/${sellerId}`, config);
            fetchSellers();
        } catch (error) {
            console.error('Error deleting seller', error);
            alert(error.response?.data?.message || 'Error deleting seller');
        }
    };

    const filteredSellers = sellers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">{t('Sellers Ledger')}</h1>
                <input
                    type="text"
                    placeholder="Search sellers..."
                    className="p-2 border border-gray-300 rounded outline-none focus:border-primary w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-7xl mx-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="bg-gray-50 uppercase font-semibold text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Seller Name</th>
                                    <th className="px-6 py-4">Total Purchased</th>
                                    <th className="px-6 py-4">Total Paid (Direct)</th>
                                    <th className="px-6 py-4">Remaining (Payable)</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSellers.map((seller) => (
                                    <tr key={seller._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 border-b border-transparent hover:border-primary inline-block cursor-pointer" onClick={() => handleViewLedger(seller)}>
                                                {seller.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{seller.phone || 'No phone'}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-blue-600">Rs. {seller.totalPurchasedAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-medium text-green-600">Rs. {seller.totalPaidAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">Rs. {seller.totalRemainingAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleViewLedger(seller)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                                title="View Full Ledger"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedSeller(seller); setShowPaymentModal(true); }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Pay Seller"
                                            >
                                                <DollarSign size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSeller(seller._id)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete Seller & All Records"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSellers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No sellers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PAYMENT MODAL */}
            {showPaymentModal && selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Pay Seller</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">Paying to <span className="font-bold">{selectedSeller.name}</span>. Current Payable: <span className="text-red-500 font-bold">Rs. {selectedSeller.totalRemainingAmount.toLocaleString()}</span></p>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Amount (Rs.)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    max={selectedSeller.totalRemainingAmount > 0 ? selectedSeller.totalRemainingAmount : undefined}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded outline-none focus:border-primary"
                                    rows="2"
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md transition-colors">
                                Disburse Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FULL LEDGER MODAL */}
            {showLedgerModal && selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center py-10 px-4 bg-black/50 backdrop-blur-sm">
                    <div id="print-modal" className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedSeller.name} - Ledger Statement</h2>
                                <p className="text-gray-600 text-sm mt-1">Current Payable: <span className="font-bold text-red-600">Rs. {selectedSeller.totalRemainingAmount.toLocaleString()}</span></p>
                            </div>
                            <button onClick={() => setShowLedgerModal(false)} className="text-gray-400 hover:text-gray-600 p-2 no-print">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            {ledgerData.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">No transactions recorded yet.</p>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-gray-700 uppercase font-medium">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3">Details</th>
                                            <th className="p-3 text-right">Credit (Bill)</th>
                                            <th className="p-3 text-right">Debit (Paid)</th>
                                            <th className="p-3 text-right text-red-600">Balance</th>
                                            <th className="p-3 text-center no-print">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledgerData.map((record, idx) => (
                                            <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-3 whitespace-nowrap text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${record.kind === 'Purchase' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                        {record.kind}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-600 max-w-xs truncate">
                                                    {record.kind === 'Purchase'
                                                        ? record.items.map(i => `${i.itemName} (${i.quantity})`).join(', ')
                                                        : record.notes || 'Standalone Payment'}
                                                </td>
                                                <td className="p-3 text-right font-medium text-red-600">
                                                    {record.kind === 'Purchase' ? `Rs. ${record.totalBill.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="p-3 text-right font-medium text-green-600">
                                                    {record.kind === 'Purchase'
                                                        ? (record.paidNow > 0 ? `Rs. ${record.paidNow.toLocaleString()}` : '-')
                                                        : `Rs. ${record.amount.toLocaleString()}`}
                                                </td>
                                                <td className="p-3 text-right font-bold text-gray-900 border-l border-gray-100 ml-2">
                                                    Rs. {(record.remainingAfterTransaction ?? record.remainingAfterPayment).toLocaleString()}
                                                </td>
                                                <td className="p-3 text-center no-print">
                                                    <button
                                                        onClick={() => handleDeleteRecord(record)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end no-print">
                            <button onClick={() => window.print()} className="px-6 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-900 transition-colors">
                                Print Statement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellersLedger;
