import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, User, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ buyers: [], sellers: [] });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Debounce search effect (optional, or just use a submit button. Let's use a button for explicit search)
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const { data } = await axios.get(`https://saqlain-cloth-house-1.onrender.com/api/search?query=${query}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setResults(data);
        } catch (error) {
            console.error('Search error', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToLedger = (id, type) => {
        if (type === 'Buyer') navigate('/buyers');
        else navigate('/sellers');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{t('Search Records')}</h1>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                            placeholder={t('Search by name or phone...')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md">
                        {t('Search')}
                    </button>
                </form>
            </div>

            {loading && <div className="text-center py-10 text-gray-500">Searching...</div>}

            {!loading && searched && (
                <div className="space-y-8">
                    {/* Buyers Results */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-blue-500" />
                            Buyers Found ({results.buyers.length})
                        </h2>
                        {results.buyers.length === 0 ? (
                            <p className="text-gray-500 ml-7">No buyers matched your search.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.buyers.map(b => (
                                    <div key={b._id} className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateToLedger(b._id, 'Buyer')}>
                                        <h3 className="font-bold text-lg text-gray-900">{b.name}</h3>
                                        <p className="text-gray-500 text-sm">{b.phone || 'No phone'}</p>
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Remaining</span>
                                                <span className="font-bold text-red-600">Rs. {b.totalRemainingAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sellers Results */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Archive size={20} className="text-purple-500" />
                            Sellers Found ({results.sellers.length})
                        </h2>
                        {results.sellers.length === 0 ? (
                            <p className="text-gray-500 ml-7">No sellers matched your search.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.sellers.map(s => (
                                    <div key={s._id} className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateToLedger(s._id, 'Seller')}>
                                        <h3 className="font-bold text-lg text-gray-900">{s.name}</h3>
                                        <p className="text-gray-500 text-sm">{s.phone || 'No phone'}</p>
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Payable</span>
                                                <span className="font-bold text-red-600">Rs. {s.totalRemainingAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
