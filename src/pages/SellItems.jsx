import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Save } from 'lucide-react';
import API_BASE_URL from '../api';
import CurrentBillModal from '../components/Print/CurrentBillModal';

const SellItems = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);

    const [buyers, setBuyers] = useState([]);
    const [selectedBuyer, setSelectedBuyer] = useState('');
    const [newBuyerName, setNewBuyerName] = useState('');
    const [newBuyerPhone, setNewBuyerPhone] = useState('');
    const [isNewBuyer, setIsNewBuyer] = useState(false);

    const [date, setDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [items, setItems] = useState([{ itemId: '', itemName: '', quantity: 1, availableQuantity: 0, pricePerUnit: 0 }]);
    const [paidNow, setPaidNow] = useState(0);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bill, setBill] = useState(null);

    const [availableItems, setAvailableItems] = useState([]);

    useEffect(() => {
        fetchBuyers();
        fetchAvailableItems();
    }, []);

    const fetchBuyers = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/buyers`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setBuyers(data);
        } catch (error) {
            console.error('Error fetching buyers', error);
        }
    };

    const fetchAvailableItems = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/items?activeOnly=true`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setAvailableItems(data);
        } catch (error) {
            console.error('Error fetching available items', error);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];

        if (field === 'itemId') {
            const selectedStockItem = availableItems.find(i => i._id === value);
            newItems[index].itemId = value;
            if (selectedStockItem) {
                newItems[index].itemName = selectedStockItem.itemName;
                newItems[index].availableQuantity = selectedStockItem.stock;
                newItems[index].pricePerUnit = selectedStockItem.purchasePrice;
            } else {
                newItems[index].itemName = '';
                newItems[index].availableQuantity = 0;
            }
        } else {
            let finalValue = value;
            if (field === 'quantity' && newItems[index].availableQuantity > 0) {
                finalValue = Math.min(value, newItems[index].availableQuantity);
            }
            newItems[index][field] = finalValue;
        }

        setItems(newItems);
    };

    const addItemRow = () => {
        setItems([...items, { itemId: '', itemName: '', quantity: 1, availableQuantity: 0, pricePerUnit: 0 }]);
    };

    const removeItemRow = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const totalBill = items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
    const remainingAmount = totalBill - Number(paidNow);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            let buyerId = selectedBuyer;
            let buyerName = buyers.find((buyer) => buyer._id === selectedBuyer)?.name || '';
            let buyerPhone = buyers.find((buyer) => buyer._id === selectedBuyer)?.phone || '';

            if (isNewBuyer) {
                const { data: newBuyer } = await axios.post(`${API_BASE_URL}/buyers`, {
                    name: newBuyerName,
                    phone: newBuyerPhone
                }, config);
                buyerId = newBuyer._id;
                buyerName = newBuyer.name;
                buyerPhone = newBuyer.phone;
            }

            if (!buyerId) {
                alert('Please select or create a kharidar');
                return;
            }

            // Validation: Ensure quantity doesn't exceed available stock
            for (const item of items) {
                if (item.quantity > item.availableQuantity) {
                    alert(`${t('Error')}: ${t('Not enough stock for')} ${item.itemName}. ${t('Available')}: ${item.availableQuantity}m`);
                    return;
                }
            }

            const { data: createdTransaction } = await axios.post(`${API_BASE_URL}/transactions`, {
                type: 'sell',
                entityId: buyerId,
                date,
                items,
                paidNow,
                notes
            }, config);

            setBill({ transaction: createdTransaction, entityName: buyerName, entityPhone: buyerPhone });
            // Reset form
            setItems([{ itemId: '', itemName: '', quantity: 1, pricePerUnit: 0 }]);
            setPaidNow(0);
            setNotes('');
            setIsNewBuyer(false);
            setNewBuyerName('');
            setNewBuyerPhone('');
            setSelectedBuyer('');
            fetchBuyers();
            fetchAvailableItems();

        } catch (error) {
            alert(error.response?.data?.message || 'Error saving sale');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{t('Sell Items')}</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6 text-gray-700">

                {/* Buyer Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Select Kharidar')}</label>
                        {!isNewBuyer ? (
                            <div className="flex gap-2">
                                <select
                                    className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    value={selectedBuyer}
                                    onChange={(e) => setSelectedBuyer(e.target.value)}
                                    required={!isNewBuyer}
                                >
                                    <option value="">{t('-- Choose Kharidar --')}</option>
                                    {buyers.map((b) => (
                                        <option key={b._id} value={b._id}>{b.name} ({b.phone})</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setIsNewBuyer(true)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium whitespace-nowrap">
                                    {t('Add New')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <input type="text" placeholder={t('Kharidar Name')} required className="w-full p-2 border border-gray-300 rounded" value={newBuyerName} onChange={e => setNewBuyerName(e.target.value)} />
                                <div className="flex gap-2">
                                    <input type="text" placeholder={t('Phone')} className="w-full p-2 border border-gray-300 rounded" value={newBuyerPhone} onChange={e => setNewBuyerPhone(e.target.value)} />
                                    <button type="button" onClick={() => { setIsNewBuyer(false); setNewBuyerName(''); setNewBuyerPhone(''); }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Date')}</label>
                        <input type="date" required className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>

                {/* Items List */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 -mx-6 md:mx-0">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 border-y border-gray-200 text-sm">
                            <tr>
                                <th className="p-3 font-semibold">{t('Item Name')}</th>
                                <th className="p-3 font-semibold w-24 text-center">{t('Available')}</th>
                                <th className="p-3 font-semibold w-24">{t('Meters')}</th>
                                <th className="p-3 font-semibold w-32">{t('Price/Meter')}</th>
                                <th className="p-3 font-semibold w-32">{t('Total')}</th>
                                <th className="p-3 font-semibold w-12 cursor-pointer text-center text-primary" onClick={addItemRow}><Plus size={20} className="mx-auto" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="p-2">
                                        <select
                                            required
                                            className="w-full p-2 border border-gray-300 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            value={item.itemId}
                                            onChange={e => handleItemChange(index, 'itemId', e.target.value)}
                                        >
                                            <option value="">-- Select Item --</option>
                                            {availableItems.map(availableItem => (
                                                <option key={availableItem._id} value={availableItem._id}>
                                                    {availableItem.itemName} ({availableItem.stock}m available)
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <span className={`px-2 py-1 rounded text-sm font-bold ${item.availableQuantity < item.quantity ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.availableQuantity}m
                                        </span>
                                    </td>
                                    <td className="p-2">
                                        <input type="number" min="1" max={item.availableQuantity || 1} required className="w-full p-2 border border-gray-300 rounded" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" min="0" required className="w-full p-2 border border-gray-300 rounded" value={item.pricePerUnit} onChange={e => handleItemChange(index, 'pricePerUnit', Number(e.target.value))} />
                                    </td>
                                    <td className="p-2 font-medium text-gray-800">
                                        Rs. {(item.quantity * item.pricePerUnit).toLocaleString()}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button type="button" onClick={() => removeItemRow(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-full" disabled={items.length === 1}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4 border-t border-gray-200">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium mb-1">{t('Notes')}</label>
                        <textarea className="w-full p-2 border border-gray-300 rounded outline-none focus:border-primary" rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..."></textarea>
                    </div>

                    <div className="w-full md:w-1/3 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                            <span>{t('Total Bill')}:</span>
                            <span>Rs. {totalBill.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{t('Paid Now')}:</span>
                            <div className="w-1/2">
                                <input type="number" min="0" max={totalBill} className="w-full p-2 border border-blue-300 rounded focus:border-blue-500 outline-none shadow-sm font-semibold text-right" value={paidNow} onChange={e => setPaidNow(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-green-600 border-t border-gray-200 pt-2">
                            <span>{t('Remaining Amount')}:</span>
                            <span>Rs. {remainingAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-md disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'Saving Sale...' : t('Save Sale')}
                    </button>
                </div>
            </form>
            <CurrentBillModal bill={bill} onClose={() => setBill(null)} />
        </div>
    );
};

export default SellItems;
