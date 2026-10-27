import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TransactionModal from '../transactions/TransactionModal';
import Toast from '../ui/Toast';
import { seedDemoData, resetData } from '../../api/dashboard';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Financial Dashboard';
      case '/transactions':
        return 'Transaction Management';
      case '/budgets':
        return 'Monthly Budgets';
      case '/reports':
        return 'Financial Reports & Analytics';
      case '/settings':
        return 'Categories & System Settings';
      default:
        return 'Expense Tracker';
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSeedDemo = async () => {
    try {
      const res = await seedDemoData();
      showToast(res.message || 'Demo data loaded successfully!');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Failed to seed demo data', 'error');
    }
  };

  const handleTransactionCreated = () => {
    showToast('Transaction recorded successfully!');
    setIsAddModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onSeedDemo={handleSeedDemo}
          pageTitle={getPageTitle()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ showToast, refreshTrigger, setRefreshTrigger }} />
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTransactionCreated}
      />

      {/* Global Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
