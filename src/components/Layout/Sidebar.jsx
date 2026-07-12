import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Tag,
    BookOpen,
    FileText,
    Search,
    Archive,
    PlusCircle,
    X
} from 'lucide-react';


const Sidebar = ({ isOpen, toggle }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ur';

    const navItems = [
        { name: t('Dashboard'), path: '/', icon: <LayoutDashboard size={20} /> },
        { name: t('Buy from Dealer'), path: '/buy', icon: <ShoppingCart size={20} /> },
        { name: t('Dealer Hisaab'), path: '/sellers', icon: <Users size={20} /> },
        { name: t('Sell Items'), path: '/sell', icon: <Tag size={20} /> },
        { name: t('Kharidar ka hisaab'), path: '/buyers', icon: <BookOpen size={20} /> },
        { name: t('Stock'), path: '/stock', icon: <Archive size={20} /> },
        { name: t('new item'), path: '/products', icon: <PlusCircle size={20} /> },
    ];


    return (
        <aside className={`fixed md:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-30 w-64 bg-[#0A1931] shadow-xl flex-shrink-0 transition-transform duration-300 transform 
            ${isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'} md:translate-x-0 min-h-screen rtl:border-l ltr:border-r border-[#15305B]`}>
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between md:justify-center h-16 border-b border-[#15305B] px-4">
                    <h1 className="text-xl font-bold text-white truncate">
                        {t('Saqlain Cloth House')}
                    </h1>
                    <button onClick={toggle} className="p-2 text-gray-300 hover:text-white md:hidden">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-[#15305B] text-white font-semibold shadow-sm'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`
                            }
                            onClick={() => { if (window.innerWidth < 768) toggle(); }}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
