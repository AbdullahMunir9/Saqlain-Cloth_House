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
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const { t } = useTranslation();

    const navItems = [
        { name: t('Dashboard'), path: '/', icon: <LayoutDashboard size={20} /> },
        { name: t('Buy Items'), path: '/buy', icon: <ShoppingCart size={20} /> },
        { name: t('Sellers Ledger'), path: '/sellers', icon: <Users size={20} /> },
        { name: t('Sell Items'), path: '/sell', icon: <Tag size={20} /> },
        { name: t('Buyers Ledger'), path: '/buyers', icon: <BookOpen size={20} /> },
        { name: t('Reports'), path: '/reports', icon: <FileText size={20} /> },
        { name: t('Search Records'), path: '/search', icon: <Search size={20} /> },
        { name: t('Settings'), path: '/settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside className="w-64 bg-white shadow-xl flex-shrink-0 min-h-screen rtl:border-l ltr:border-r border-gray-200">
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-center h-16 border-b border-gray-100 px-4">
                    <h1 className="text-xl font-bold text-primary truncate">
                        {t('Saqlain Cloth House')}
                    </h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
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
