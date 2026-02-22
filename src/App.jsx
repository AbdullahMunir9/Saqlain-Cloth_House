import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BuyItems from './pages/BuyItems';
import SellersLedger from './pages/SellersLedger';
import SellItems from './pages/SellItems';
import BuyersLedger from './pages/BuyersLedger';
import Reports from './pages/Reports';
import SearchPage from './pages/SearchPage';
import Settings from './pages/Settings';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="buy" element={<BuyItems />} />
          <Route path="sellers" element={<SellersLedger />} />
          <Route path="sell" element={<SellItems />} />
          <Route path="buyers" element={<BuyersLedger />} />
          <Route path="reports" element={<Reports />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
