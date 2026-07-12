import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../api';
import { Eye, DollarSign, X, Trash2, Search } from 'lucide-react';

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
            const { data } = await axios.get(`${API_BASE_URL}/sellers`, {
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
                axios.get(`${API_BASE_URL}/transactions?entityId=${seller._id}&type=buy`, config),
                axios.get(`${API_BASE_URL}/payments?entityId=${seller._id}&type=pay`, config)
            ]);

            // Combine and sort chronologically (first by date, then by createdAt if date is same calendar day)
            const combined = [
                ...txRes.data.map(t => ({ ...t, kind: 'Purchase' })),
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

            if (record.kind === 'Purchase') {
                await axios.delete(`${API_BASE_URL}/transactions/${record._id}`, config);
            } else if (record.kind === 'Payment') {
                await axios.delete(`${API_BASE_URL}/payments/${record._id}`, config);
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
            await axios.post(`${API_BASE_URL}/payments`, {
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
        if (!window.confirm('WARNING: Are you sure you want to delete this dealer? This will also permanently delete ALL associated transactions and payments. This action CANNOT be undone.')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`${API_BASE_URL}/sellers/${sellerId}`, config);
            fetchSellers();
        } catch (error) {
            console.error('Error deleting seller', error);
            alert(error.response?.data?.message || 'Error deleting dealer');
        }
    };

    const filteredSellers = sellers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-7xl mx-auto px-1">
                <h1 className="text-2xl font-bold text-gray-800">{t('Dealer Hisaab')}</h1>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search dealers..."
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
                                    <th className="px-6 py-4">Dealer Name</th>
                                    <th className="px-6 py-4">Total Purchased</th>
                                    <th className="px-6 py-4">Total Paid (Direct)</th>
                                    <th className="px-6 py-4">Bakaya dene wale</th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                <button
                                                    onClick={() => handleViewLedger(seller)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                                    title="View Full Hisaab"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedSeller(seller); setShowPaymentModal(true); }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Pay Dealer"
                                                >
                                                    <DollarSign size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSeller(seller._id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete Dealer & All Records"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSellers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No dealers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PAYMENT MODAL */}
            {showPaymentModal && selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Pay Dealer</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm">Paying to <span className="font-bold">{selectedSeller.name}</span>. Current Payable: <span className="text-red-500 font-bold">Rs. {selectedSeller.totalRemainingAmount.toLocaleString()}</span></p>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Amount (Rs.)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary h-12"
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
                            <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md transition-colors h-12">
                                Disburse Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FULL LEDGER MODAL */}
            {showLedgerModal && selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center py-6 sm:py-10 px-2 sm:px-4 bg-black/60 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:block print:overflow-visible">
                    <div id="print-modal" className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-300 print:shadow-none print:border-none print:h-auto print:overflow-visible print:bg-white print:p-0">
                        {/* SCREEN-ONLY VIEW */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden print:hidden">
                            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedSeller.name} - Hisaab</h2>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Current Payable: <span className="font-bold text-red-600">Rs. {selectedSeller.totalRemainingAmount.toLocaleString()}</span></p>
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
                                                    <th className="p-3 text-right">Credit (Bill)</th>
                                                    <th className="p-3 text-right">Debit (Paid)</th>
                                                    <th className="p-3 text-right text-red-600">Balance</th>
                                                    <th className="p-3 text-center">Del</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ledgerData.map((record, idx) => (
                                                    <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="p-3 whitespace-nowrap text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${record.kind === 'Purchase' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
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
                        <div className="hidden print:block w-full p-5 bg-white text-slate-800 font-sans text-xs">
                            {/* Brand Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center text-slate-700 font-bold text-xl tracking-wider">
                                        {selectedSeller.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-black tracking-tight text-slate-900">{selectedSeller.name}</h1>
                                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Dealer Account</p>
                                        {selectedSeller.phone && (
                                            <p className="text-[10px] text-slate-500 font-semibold">Phone: {selectedSeller.phone}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-extrabold tracking-widest text-slate-400 uppercase">Hisaab Statement</h2>
                                    <div className="mt-1 text-[10px] text-slate-500 font-semibold space-y-0.5">
                                        <p>Statement Date: <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></p>
                                        <p>Time: <span className="font-bold text-slate-800">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t-2 border-slate-300 my-3"></div>

                            {/* Client & Summary Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-4">
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">BILL TO</p>
                                    <h3 className="text-sm font-extrabold text-slate-800">MALIK SAQLAIN FABRICS</h3>
                                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Bazar Kalan, Pak Bazar, Karak</p>
                                    <p className="text-[11px] text-slate-500 font-semibold">Phone: 0303-0655085</p>
                                </div>
                                <div className="flex flex-col justify-end text-right space-y-0.5 text-[11px]">
                                    <p className="text-slate-500 font-semibold">Total Purchased Amount: <span className="font-bold text-slate-800">Rs. {selectedSeller.totalPurchasedAmount.toLocaleString()}</span></p>
                                    <p className="text-slate-500 font-semibold">Total Paid Amount: <span className="font-bold text-slate-800">Rs. {selectedSeller.totalPaidAmount.toLocaleString()}</span></p>
                                    <div className="h-px bg-slate-300 w-40 ml-auto my-0.5"></div>
                                    <p className="text-xs font-bold text-slate-900">Net Payable Balance: <span className="text-red-600 font-extrabold text-sm">Rs. {selectedSeller.totalRemainingAmount.toLocaleString()}</span></p>
                                </div>
                            </div>

                            {/* Ledger Table */}
                            <table className="w-full text-left text-[11px] mb-4 border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b-2 border-slate-300">
                                        <th className="p-2.5 w-8 border-y border-slate-300">#</th>
                                        <th className="p-2.5 w-24 border-y border-slate-300">Date</th>
                                        <th className="p-2.5 w-20 border-y border-slate-300">Type</th>
                                        <th className="p-2.5 border-y border-slate-300">Details</th>
                                        <th className="p-2.5 text-right w-24 border-y border-slate-300">Credit (Bill)</th>
                                        <th className="p-2.5 text-right w-24 border-y border-slate-300">Debit (Paid)</th>
                                        <th className="p-2.5 text-right w-28 border-y border-slate-300">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerData.map((record, idx) => (
                                        <tr key={record._id} className="text-slate-700 font-semibold border-b border-slate-205 hover:bg-slate-50">
                                            <td className="p-2 text-slate-400">{idx + 1}</td>
                                            <td className="p-2 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="p-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${record.kind === 'Purchase' ? 'bg-orange-100 text-orange-850' : 'bg-green-100 text-green-850'}`}>
                                                    {record.kind === 'Purchase' ? 'Purchase' : 'Payment'}
                                                </span>
                                            </td>
                                            <td className="p-2 break-words max-w-xs">
                                                {record.kind === 'Purchase'
                                                    ? record.items.map(i => `${i.itemName} (${i.quantity}m)`).join(', ')
                                                    : record.notes || 'Standalone Payment'}
                                            </td>
                                            <td className="p-2 text-right text-slate-700">
                                                {record.kind === 'Purchase' ? `Rs. ${record.totalBill.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="p-2 text-right text-slate-700">
                                                {record.kind === 'Purchase'
                                                    ? (record.paidNow > 0 ? `Rs. ${record.paidNow.toLocaleString()}` : '-')
                                                    : `Rs. ${record.amount.toLocaleString()}`}
                                            </td>
                                            <td className="p-2 text-right font-extrabold text-slate-900 border-l border-slate-100">
                                                Rs. {(record.remainingAfterTransaction ?? record.remainingAfterPayment).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Footer block */}
                            <div className="flex justify-between items-start mt-6 pt-4 border-t border-slate-300">
                                {/* Bank details */}
                                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] w-2/3 max-w-md">
                                    <h4 className="font-extrabold text-slate-800 mb-1 tracking-wide uppercase">Payment Instructions</h4>
                                    <div className="space-y-0.5 font-semibold text-slate-700">
                                        <p><span className="text-slate-400">Account Title:</span> MALIK SAQLAIN FABRICS</p>
                                        <p><span className="text-slate-400">Bank Name:</span> Bank Islami</p>
                                        <p><span className="text-slate-400">Account No.:</span> 215700072420001</p>
                                        <p><span className="text-slate-400">IBAN:</span> PK15BKIP0215700072420001</p>
                                    </div>
                                    <p className="mt-2 text-[9px] text-slate-400 italic">Please use Account Title as reference when making bank transfers.</p>
                                </div>

                                {/* Signature block */}
                                <div className="text-center w-1/3 pt-2 flex flex-col items-center">
                                    <p className="text-[11px] font-extrabold text-slate-700 uppercase">For, MALIK SAQLAIN FABRICS</p>
                                    <div className="w-32 border-b border-slate-400 mt-10 mb-1"></div>
                                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Authorized Signature</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellersLedger;
