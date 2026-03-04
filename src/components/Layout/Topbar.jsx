import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, Globe } from 'lucide-react';
import { logout } from '../../store/authSlice';

const Topbar = () => {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ur' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('app_lang', newLang);
        document.documentElement.setAttribute('dir', newLang === 'ur' ? 'rtl' : 'ltr');
    };

    useEffect(() => {
        const currentLang = localStorage.getItem('app_lang') || 'en';
        document.documentElement.setAttribute('dir', currentLang === 'ur' ? 'rtl' : 'ltr');
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white shadow-sm flex items-center justify-end px-6 relative z-10 border-b border-gray-200">
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                >
                    <Globe size={20} />
                    <span className="font-medium uppercase">{i18n.language}</span>
                </button>

                <div className="h-6 w-px bg-gray-200"></div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        {userInfo?.email || 'Admin'}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
