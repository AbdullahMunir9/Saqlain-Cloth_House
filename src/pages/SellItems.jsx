import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Save } from 'lucide-react';

const SellItems = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);

    const [buyers, setBuyers] = useState([]);
    const [selectedBuyer, setSelectedBuyer] = useState('');
    const [newBuyerName, setNewBuyerName] = useState('');
    const [newBuyerPhone, setNewBuyerPhone] = useState('');
    const [isNewBuyer, setIsNewBuyer] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([{ itemName: '', quantity: 1, pricePerUnit: 0 }]);
    const [paidNow, setPaidNow] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/buyers', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setBuyers(data);
        } catch (error) {
            console.error('Error fetching buyers', error);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItemRow = () => {
        setItems([...items, { itemName: '', quantity: 1, pricePerUnit: 0 }]);
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
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            let buyerId = selectedBuyer;

            if (isNewBuyer) {
                const { data: newBuyer } = await axios.post('http://localhost:5000/api/buyers', {
                    name: newBuyerName,
                    phone: newBuyerPhone
                }, config);
                buyerId = newBuyer._id;
            }

            if (!buyerId) {
                alert('Please select or create a buyer');
                return;
            }

            await axios.post('http://localhost:5000/api/transactions', {
                type: 'sell',
                entityId: buyerId,
                date,
                items,
                paidNow,
                notes
            }, config);

            alert('Sale saved successfully!');
            // Reset form
            setItems([{ itemName: '', quantity: 1, pricePerUnit: 0 }]);
            setPaidNow(0);
            setNotes('');
            setIsNewBuyer(false);
            setNewBuyerName('');
            setNewBuyerPhone('');
            setSelectedBuyer('');
            fetchBuyers();

        } catch (error) {
            alert(error.response?.data?.message || 'Error saving sale');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{t('Sell Items')}</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6 text-gray-700">

                {/* Buyer Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Select Buyer')}</label>
                        {!isNewBuyer ? (
                            <div className="flex gap-2">
                                <select
                                    className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    value={selectedBuyer}
                                    onChange={(e) => setSelectedBuyer(e.target.value)}
                                    required={!isNewBuyer}
                                >
                                    <option value="">-- Choose Buyer --</option>
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
                                <input type="text" placeholder={t('Buyer Name')} required className="w-full p-2 border border-gray-300 rounded" value={newBuyerName} onChange={e => setNewBuyerName(e.target.value)} />
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-y border-gray-200 text-sm">
                            <tr>
                                <th className="p-3 font-semibold">{t('Item Name')}</th>
                                <th className="p-3 font-semibold w-24">{t('Quantity')}</th>
                                <th className="p-3 font-semibold w-32">{t('Price/Unit')}</th>
                                <th className="p-3 font-semibold w-32">{t('Total')}</th>
                                <th className="p-3 font-semibold w-12 cursor-pointer text-center text-primary" onClick={addItemRow}><Plus size={20} className="mx-auto" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="p-2">
                                        <input type="text" required className="w-full p-2 border border-gray-300 rounded" value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)} placeholder="e.g. Silk Cloth" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" min="1" required className="w-full p-2 border border-gray-300 rounded" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} />
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
                    <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-md">
                        <Save size={20} />
                        {t('Save Sale')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SellItems;
