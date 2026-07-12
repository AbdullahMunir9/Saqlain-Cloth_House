import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../api';
import { Eye, DollarSign, X, Trash2, Search } from 'lucide-react';

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
            const { data } = await axios.get(`${API_BASE_URL}/buyers`, {
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
                axios.get(`${API_BASE_URL}/transactions?entityId=${buyer._id}&type=sell`, config),
                axios.get(`${API_BASE_URL}/payments?entityId=${buyer._id}&type=receive`, config)
            ]);

            // Combine and sort chronologically (first by date, then by createdAt if date is same calendar day)
            const combined = [
                ...txRes.data.map(t => ({ ...t, kind: 'Sale' })),
                ...payRes.data.map(p => ({ ...p, kind: 'Payment' }))
            ].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                const dayA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
                const dayB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
                if (dayA.getTime() !== dayB.getTime()) {
                    return dayA.getTime() - dayB.getTime();
                }
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

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

            if (record.kind === 'Sale') {
                await axios.delete(`${API_BASE_URL}/transactions/${record._id}`, config);
            } else if (record.kind === 'Payment') {
                await axios.delete(`${API_BASE_URL}/payments/${record._id}`, config);
            }

            // Refresh the ledger modal data and the main buyers list
            fetchBuyers();
            // Re-fetch ledger data
            handleViewLedger(selectedBuyer);
        } catch (error) {
            console.error('Error deleting record', error);
            alert(error.response?.data?.message || 'Error deleting record');
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/payments`, {
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

    const handleDeleteBuyer = async (buyerId) => {
        if (!window.confirm('WARNING: Are you sure you want to delete this buyer? This will also permanently delete ALL associated transactions and payments. This action CANNOT be undone.')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`${API_BASE_URL}/buyers/${buyerId}`, config);
            fetchBuyers();
        } catch (error) {
            console.error('Error deleting buyer', error);
            alert(error.response?.data?.message || 'Error deleting buyer');
        }
    };

    const filteredBuyers = buyers.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.phone.includes(search));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-7xl mx-auto px-1">
                <h1 className="text-2xl font-bold text-gray-800">{t('Kharidar ka hisaab')}</h1>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search buyers..."
                        className="p-2 pl-10 border border-gray-300 rounded-lg outline-none focus:border-primary w-full shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-7xl mx-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="w-full text-left text-sm text-gray-700 min-w-[700px]">
                            <thead className="bg-gray-50 uppercase font-semibold text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Kharidar Name</th>
                                    <th className="px-6 py-4">Total Bought</th>
                                    <th className="px-6 py-4">Total Paid (Direct)</th>
                                    <th className="px-6 py-4">Bakaya lene wale</th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                <button
                                                    onClick={() => handleViewLedger(buyer)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                                    title="View Full Hisaab"
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
                                                <button
                                                    onClick={() => handleDeleteBuyer(buyer._id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete Buyer & All Records"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Receive Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm">Receiving from <span className="font-bold">{selectedBuyer.name}</span>. Current Remaining: <span className="text-red-500 font-bold">Rs. {selectedBuyer.totalRemainingAmount.toLocaleString()}</span></p>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Amount (Rs.)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary h-12"
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
                            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-md transition-colors h-12">
                                Save Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FULL LEDGER MODAL */}
            {showLedgerModal && selectedBuyer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center py-6 sm:py-10 px-2 sm:px-4 bg-black/60 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:block print:overflow-visible">
                    <div id="print-modal" className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-300 print:shadow-none print:border-none print:h-auto print:overflow-visible print:bg-white print:p-0">
                        {/* SCREEN-ONLY VIEW */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden print:hidden">
                            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedBuyer.name} - Hisaab</h2>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Current Remaining: <span className="font-bold text-red-600">Rs. {selectedBuyer.totalRemainingAmount.toLocaleString()}</span></p>
                                </div>
                                <button onClick={() => setShowLedgerModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-white overflow-x-hidden">
                                {ledgerData.length === 0 ? (
                                    <p className="text-center text-gray-500 py-10">No transactions recorded yet.</p>
                                ) : (
                                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 -mx-2 sm:mx-0">
                                        <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                                            <thead className="bg-slate-100 text-gray-700 uppercase font-medium">
                                                <tr>
                                                    <th className="p-3">Date</th>
                                                    <th className="p-3">Type</th>
                                                    <th className="p-3">Details</th>
                                                    <th className="p-3 text-right">Debit (Bill)</th>
                                                    <th className="p-3 text-right">Credit (Paid)</th>
                                                    <th className="p-3 text-right text-red-600">Balance</th>
                                                    <th className="p-3 text-center">Del</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ledgerData.map((record, idx) => (
                                                    <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="p-3 whitespace-nowrap text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${record.kind === 'Sale' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
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
                                                        <td className="p-3 text-center">
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
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                <button onClick={() => window.print()} className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors shadow-md">
                                    Print Statement
                                </button>
                            </div>
                        </div>

                        {/* PRINT-ONLY VIEW */}
                        <div className="hidden print:block w-full p-8 bg-white text-slate-800 font-sans">
                            {/* Brand Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-amber-600 flex items-center justify-center text-amber-700 font-bold text-2xl tracking-wider">
                                        MS
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight text-slate-900">MALIK SAQLAIN FABRICS</h1>
                                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Bazar Kalan, Pak Bazar, Karak</p>
                                        <p className="text-xs text-slate-500 font-semibold">Phone: 0303-0655085</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-extrabold tracking-widest text-slate-400 uppercase">Hisaab Statement</h2>
                                    <div className="mt-2 text-xs text-slate-500 font-semibold space-y-0.5">
                                        <p>Statement Date: <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></p>
                                        <p>Time: <span className="font-bold text-slate-800">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t-2 border-slate-300 my-4"></div>

                            {/* Client & Summary Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">BILL TO</p>
                                    <h3 className="text-base font-extrabold text-slate-800">{selectedBuyer.name}</h3>
                                    {selectedBuyer.phone && (
                                        <p className="text-xs text-slate-500 font-semibold mt-1">
                                            Phone: <span className="text-slate-800">{selectedBuyer.phone}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col justify-end text-right space-y-1 text-xs">
                                    <p className="text-slate-500 font-semibold">Total Bill Amount: <span className="font-bold text-slate-800">Rs. {selectedBuyer.totalBoughtAmount.toLocaleString()}</span></p>
                                    <p className="text-slate-500 font-semibold">Total Paid Amount: <span className="font-bold text-slate-800">Rs. {selectedBuyer.totalPaidAmount.toLocaleString()}</span></p>
                                    <div className="h-px bg-slate-300 w-48 ml-auto my-1"></div>
                                    <p className="text-sm font-bold text-slate-900">Net Receivable Balance: <span className="text-red-600 font-extrabold text-base">Rs. {selectedBuyer.totalRemainingAmount.toLocaleString()}</span></p>
                                </div>
                            </div>

                            {/* Ledger Table */}
                            <table className="w-full text-left text-xs mb-8 border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b-2 border-slate-300">
                                        <th className="p-3 w-8 border-y border-slate-300">#</th>
                                        <th className="p-3 w-28 border-y border-slate-300">Date</th>
                                        <th className="p-3 w-20 border-y border-slate-300">Type</th>
                                        <th className="p-3 border-y border-slate-300">Details</th>
                                        <th className="p-3 text-right w-28 border-y border-slate-300">Debit (Bill)</th>
                                        <th className="p-3 text-right w-28 border-y border-slate-300">Credit (Paid)</th>
                                        <th className="p-3 text-right w-32 border-y border-slate-300">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerData.map((record, idx) => (
                                        <tr key={record._id} className="text-slate-700 font-semibold border-b border-slate-200 hover:bg-slate-50">
                                            <td className="p-3 text-slate-400">{idx + 1}</td>
                                            <td className="p-3 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${record.kind === 'Sale' ? 'bg-orange-100 text-orange-850' : 'bg-green-100 text-green-850'}`}>
                                                    {record.kind === 'Sale' ? 'Sale' : 'Payment'}
                                                </span>
                                            </td>
                                            <td className="p-3 break-words max-w-xs">
                                                {record.kind === 'Sale'
                                                    ? record.items.map(i => `${i.itemName} (${i.quantity}m)`).join(', ')
                                                    : record.notes || 'Standalone Payment'}
                                            </td>
                                            <td className="p-3 text-right text-slate-700">
                                                {record.kind === 'Sale' ? `Rs. ${record.totalBill.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="p-3 text-right text-slate-700">
                                                {record.kind === 'Sale'
                                                    ? (record.paidNow > 0 ? `Rs. ${record.paidNow.toLocaleString()}` : '-')
                                                    : `Rs. ${record.amount.toLocaleString()}`}
                                            </td>
                                            <td className="p-3 text-right font-extrabold text-slate-900 border-l border-slate-100">
                                                Rs. {(record.remainingAfterTransaction ?? record.remainingAfterPayment).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Footer block */}
                            <div className="flex justify-between items-start mt-12 pt-6 border-t border-slate-300">
                                {/* Bank payment instructions */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs w-2/3 max-w-md">
                                    <h4 className="font-extrabold text-slate-800 mb-2 tracking-wide uppercase">Payment Instructions</h4>
                                    <div className="space-y-1 font-semibold text-slate-700">
                                        <p><span className="text-slate-400">Account Title:</span> MALIK SAQLAIN FABRICS</p>
                                        <p><span className="text-slate-400">Bank Name:</span> Bank Islami</p>
                                        <p><span className="text-slate-400">Account No.:</span> 215700072420001</p>
                                        <p><span className="text-slate-400">IBAN:</span> PK15BKIP0215700072420001</p>
                                    </div>
                                    <p className="mt-3 text-[10px] text-slate-400 italic">Please use Account Title as reference when making bank transfers.</p>
                                </div>

                                {/* Signature block */}
                                <div className="text-center w-1/3 pt-4 flex flex-col items-center">
                                    <p className="text-xs font-extrabold text-slate-700 uppercase">For, MALIK SAQLAIN FABRICS</p>
                                    <div className="w-36 border-b border-slate-400 mt-16 mb-2"></div>
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Authorized Signature</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyersLedger;
