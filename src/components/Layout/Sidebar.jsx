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


const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { t } = useTranslation();

    const navItems = [
        { name: t('Dashboard'), path: '/', icon: <LayoutDashboard size={20} /> },
        { name: t('Buy Items'), path: '/buy', icon: <ShoppingCart size={20} /> },
        { name: t('Sellers Ledger'), path: '/sellers', icon: <Users size={20} /> },
        { name: t('Sell Items'), path: '/sell', icon: <Tag size={20} /> },
        { name: t('Buyers Ledger'), path: '/buyers', icon: <BookOpen size={20} /> },
        { name: t('Reports'), path: '/reports', icon: <FileText size={20} /> },
        { name: t('Search Records'), path: '/search', icon: <Search size={20} /> },
        { name: t('Stock'), path: '/stock', icon: <Archive size={20} /> },
        { name: t('new item'), path: '/products', icon: <PlusCircle size={20} /> },
    ];


    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-xl flex-shrink-0 min-h-screen 
            rtl:border-l ltr:border-r border-gray-200 transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0'}
        `}>
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between h-16 border-b border-gray-100 px-4">
                    <h1 className="text-xl font-bold text-primary truncate">
                        {t('Saqlain Cloth House')}
                    </h1>
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
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
