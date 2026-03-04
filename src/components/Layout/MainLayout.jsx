import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-slate-50 w-full overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
};

export default MainLayout;
