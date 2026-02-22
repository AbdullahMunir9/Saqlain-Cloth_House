import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Eye, DollarSign, X } from 'lucide-react';

const BuyersLedger = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);

    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal states
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Payment form states
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    // Ledger detailed states
    const [ledgerData, setLedgerData] = useState([]);

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        try {
            const { data } = await axios.get('https://saqlain-cloth-house-1.onrender.com/api/buyers', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setBuyers(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleViewLedger = async (buyer) => {
        setSelectedBuyer(buyer);
        setShowLedgerModal(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const [txRes, payRes] = await Promise.all([
                axios.get(`https://saqlain-cloth-house-1.onrender.com/api/transactions?entityId=${buyer._id}&type=sell`, config),
                axios.get(`https://saqlain-cloth-house-1.onrender.com/api/payments?entityId=${buyer._id}&type=receive`, config)
            ]);

            // Combine and sort chronologically
            const combined = [
                ...txRes.data.map(t => ({ ...t, kind: 'Sale' })),
                ...payRes.data.map(p => ({ ...p, kind: 'Payment' }))
            ].sort((a, b) => new Date(a.date) - new Date(b.date));

            setLedgerData(combined);
        } catch (error) {
            console.error('Error fetching ledger details', error);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://saqlain-cloth-house-1.onrender.com/api/payments', {
                type: 'receive',
                entityId: selectedBuyer._id,
                amount: Number(paymentAmount),
                notes: paymentNotes
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            setShowPaymentModal(false);
            setPaymentAmount('');
            setPaymentNotes('');
            fetchBuyers(); // Refresh list to get updated remaining amount
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing payment');
        }
    };

    const filteredBuyers = buyers.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.phone.includes(search));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">{t('Buyers Ledger')}</h1>
                <input
                    type="text"
                    placeholder="Search buyers..."
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
                                    <th className="px-6 py-4">Buyer Name</th>
                                    <th className="px-6 py-4">Total Bought</th>
                                    <th className="px-6 py-4">Total Paid (Direct)</th>
                                    <th className="px-6 py-4">Remaining</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBuyers.map((buyer) => (
                                    <tr key={buyer._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 border-b border-transparent hover:border-primary inline-block cursor-pointer" onClick={() => handleViewLedger(buyer)}>
                                                {buyer.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{buyer.phone || 'No phone'}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-blue-600">Rs. {buyer.totalBoughtAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-medium text-green-600">Rs. {buyer.totalPaidAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">Rs. {buyer.totalRemainingAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleViewLedger(buyer)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                                title="View Full Ledger"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedBuyer(buyer); setShowPaymentModal(true); }}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                title="Receive Payment"
                                            >
                                                <DollarSign size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBuyers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No buyers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PAYMENT MODAL */}
            {showPaymentModal && selectedBuyer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Receive Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">Receiving from <span className="font-bold">{selectedBuyer.name}</span>. Current Remaining: <span className="text-red-500 font-bold">Rs. {selectedBuyer.totalRemainingAmount.toLocaleString()}</span></p>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Amount (Rs.)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    max={selectedBuyer.totalRemainingAmount > 0 ? selectedBuyer.totalRemainingAmount : undefined}
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
                            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-md transition-colors">
                                Save Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FULL LEDGER MODAL */}
            {showLedgerModal && selectedBuyer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center py-10 px-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedBuyer.name} - Ledger Statement</h2>
                                <p className="text-gray-600 text-sm mt-1">Current Remaining: <span className="font-bold text-red-600">Rs. {selectedBuyer.totalRemainingAmount.toLocaleString()}</span></p>
                            </div>
                            <button onClick={() => setShowLedgerModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
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
                                            <th className="p-3 text-right">Debit (Bill)</th>
                                            <th className="p-3 text-right">Credit (Paid)</th>
                                            <th className="p-3 text-right text-red-600">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledgerData.map((record, idx) => (
                                            <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-3 whitespace-nowrap text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${record.kind === 'Sale' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                        {record.kind}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-600 max-w-xs truncate">
                                                    {record.kind === 'Sale'
                                                        ? record.items.map(i => `${i.itemName} (${i.quantity})`).join(', ')
                                                        : record.notes || 'Standalone Payment'}
                                                </td>
                                                <td className="p-3 text-right font-medium text-red-600">
                                                    {record.kind === 'Sale' ? `Rs. ${record.totalBill.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="p-3 text-right font-medium text-green-600">
                                                    {record.kind === 'Sale'
                                                        ? (record.paidNow > 0 ? `Rs. ${record.paidNow.toLocaleString()}` : '-')
                                                        : `Rs. ${record.amount.toLocaleString()}`}
                                                </td>
                                                <td className="p-3 text-right font-bold text-gray-900 border-l border-gray-100 ml-2">
                                                    Rs. {(record.remainingAfterTransaction ?? record.remainingAfterPayment).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button className="px-6 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-900 transition-colors">
                                Print Statement (Coming Soon)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyersLedger;
