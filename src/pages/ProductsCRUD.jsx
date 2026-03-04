import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const ProductsCRUD = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);

    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('https://saqlain-cloth-house-1.onrender.com/api/products', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            await axios.post('https://saqlain-cloth-house-1.onrender.com/api/products', { name }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setName('');
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding product');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (id) => {
        if (!editName.trim()) return;
        setLoading(true);
        try {
            await axios.put(`https://saqlain-cloth-house-1.onrender.com/api/products/${id}`, { name: editName }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setEditingId(null);
            setEditName('');
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating product');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm(t('Are you sure you want to delete this product?'))) return;
        try {
            await axios.delete(`https://saqlain-cloth-house-1.onrender.com/api/products/${id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting product');
        }
    };

    const startEditing = (product) => {
        setEditingId(product._id);
        setEditName(product.name);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{t('Manage Items (New Item +)')}</h1>

            {/* Add Product Form */}
            <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <input
                    type="text"
                    placeholder={t('Enter product name (e.g. Cotton, Washing Wear)')}
                    className="flex-1 p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                    <Plus size={20} />
                    {t('Add Item')}
                </button>
            </form>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">{t('Product Name')}</th>
                            <th className="p-4 font-semibold text-gray-700 w-32 text-center">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-700">
                                    {editingId === product._id ? (
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-primary rounded outline-none"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                        />
                                    ) : (
                                        product.name
                                    )}
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    {editingId === product._id ? (
                                        <>
                                            <button onClick={() => handleUpdateProduct(product._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                                                <Save size={18} />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                                                <X size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEditing(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan="2" className="p-8 text-center text-gray-500 italic">
                                    {t('No products added yet.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsCRUD;
