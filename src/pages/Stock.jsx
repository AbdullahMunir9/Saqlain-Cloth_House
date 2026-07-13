import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Archive, Trash2 } from 'lucide-react';
import API_BASE_URL from '../api';

const Stock = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearingItemId, setClearingItemId] = useState(null);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/items?inStock=true`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setItems(data);
        } catch (error) {
            console.error('Error fetching stock', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearStock = async (item) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete all ${item.stock}m of ${item.itemName} from stock? The item itself will remain available for future purchases.`
        );

        if (!confirmed || clearingItemId) return;

        setClearingItemId(item._id);
        try {
            await axios.delete(`${API_BASE_URL}/items/${item._id}/stock`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setItems((currentItems) => currentItems.filter((currentItem) => currentItem._id !== item._id));
        } catch (error) {
            alert(error.response?.data?.message || 'Error clearing stock');
        } finally {
            setClearingItemId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Archive size={28} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{t('Available Stock')}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-200 text-sm whitespace-nowrap">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t('Item Name')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t('Meters Available')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t('Purchase Price / Meter')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t('Bought From')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">{t('Last Updated')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm sm:text-base">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        {t('Loading stock...')}
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        {t('No stock found.')}
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{item.itemName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.stock} m
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">Rs. {Number(item.purchasePrice).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.sellerId?.name || t('Unknown')}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(item.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleClearStock(item)}
                                                disabled={clearingItemId === item._id}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                title="Clear all stock"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Stock;
