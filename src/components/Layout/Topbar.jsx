import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, Globe, Menu } from 'lucide-react';
import { logout } from '../../store/authSlice';

const Topbar = ({ toggleSidebar }) => {
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
        <header className="h-16 bg-[#0A1931] shadow-sm flex items-center justify-between px-4 md:px-6 relative z-10 border-b border-[#15305B]">
            <button
                onClick={toggleSidebar}
                className="p-2 text-gray-300 hover:bg-white/5 rounded-lg md:hidden"
            >
                <Menu size={24} />
            </button>

            {/* Logo on the left */}
            <div className="absolute left-14 md:left-6 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <img src="/1-removebg-preview.png" alt="Logo" className="h-28 w-auto object-contain drop-shadow-lg" />
            </div>

            <div className="flex items-center gap-6 ms-auto">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                    <Globe size={20} />
                    <span className="font-medium uppercase">{i18n.language}</span>
                </button>

                <div className="h-6 w-px bg-[#15305B]"></div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-300 hidden sm:block">
                        {userInfo?.email || 'Admin'}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
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
