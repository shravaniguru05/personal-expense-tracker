import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getTransactions } from '../api/transactions';
import { getCategories } from '../api/categories';

export default function TransactionsPage() {
  const { showToast, refreshTrigger, setRefreshTrigger } = useOutletContext();

  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    page,
    pageSize,
    search,
    selectedType,
    selectedCategory,
    startDate,
    endDate,
    sortBy,
    order,
    refreshTrigger,
  ]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        order,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedType) params.type = selectedType;
      if (selectedCategory) params.category = selectedCategory;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await getTransactions(params);
      setTransactions(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      showToast(err.message || 'Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const handleDateChange = (newStart, newEnd) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Transaction Records
          </h2>
          <p className="text-xs text-slate-500">
            View, filter, edit, and export your complete transaction history.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Transaction Table */}
      {loading && transactions.length === 0 ? (
        <LoadingSpinner text="Loading transactions..." />
      ) : (
        <TransactionTable
          transactions={transactions}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          selectedType={selectedType}
          onTypeChange={(t) => {
            setSelectedType(t);
            setPage(1);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(c) => {
            setSelectedCategory(c);
            setPage(1);
          }}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
          categories={categories}
          onEditTransaction={(tx) => setEditingTransaction(tx)}
          onRefresh={fetchTransactions}
          showToast={showToast}
          showFilters={true}
        />
      )}

      {/* Edit / Add Modal */}
      {(isAddModalOpen || editingTransaction) && (
        <TransactionModal
          isOpen={isAddModalOpen || !!editingTransaction}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTransaction(null);
          }}
          transactionToEdit={editingTransaction}
          onSuccess={() => {
            showToast(
              editingTransaction
                ? 'Transaction updated successfully!'
                : 'Transaction recorded successfully!'
            );
            setIsAddModalOpen(false);
            setEditingTransaction(null);
            fetchTransactions();
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
