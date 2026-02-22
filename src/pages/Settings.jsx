import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Store, Globe, Save } from 'lucide-react';

const Settings = () => {
    const { t, i18n } = useTranslation();

    const [businessName, setBusinessName] = useState('Saklain Cloth House');
    const [phone, setPhone] = useState('+92 300 1234567');
    const [address, setAddress] = useState('Main Bazaar, City');

    const currentLang = localStorage.getItem('app_lang') || 'en';

    const handleSaveProfile = (e) => {
        e.preventDefault();
        // In a real app, send to backend. Here we just show a success message.
        alert('Business profile updated successfully!');
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        localStorage.setItem('app_lang', newLang);
        document.documentElement.setAttribute('dir', newLang === 'ur' ? 'rtl' : 'ltr');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <SettingsIcon className="text-primary" />
                {t('Settings')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Business Profile Menu */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
                            <Store size={20} className="text-gray-500" />
                            Business Profile
                        </h2>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded focus:border-primary outline-none"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded focus:border-primary outline-none"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        disabled
                                        className="w-full p-3 border border-gray-200 bg-gray-50 rounded text-gray-500 outline-none"
                                        value="admin@saklaincloth.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded focus:border-primary outline-none"
                                    rows="2"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded shadow hover:bg-primary-dark transition-colors">
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* System Preferences */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
                            <Globe size={20} className="text-gray-500" />
                            System Preferences
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Language</label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="language"
                                        value="en"
                                        checked={currentLang === 'en'}
                                        onChange={handleLanguageChange}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span>English (LTR)</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="language"
                                        value="ur"
                                        checked={currentLang === 'ur'}
                                        onChange={handleLanguageChange}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="font-urdu text-lg">اردو (RTL)</span>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Changing the language will automatically mirror the dashboard layout to match Right-to-Left (RTL) reading patterns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
