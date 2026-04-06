
import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { FiCalendar, FiSearch, FiX } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import TransactionForm from './TransactionForm';

function exportToCSV(transactions) {
  if (!transactions.length) return;
  const header = Object.keys(transactions[0]);
  const csvRows = [
    header.join(','),
    ...transactions.map(txn => header.map(key => `"${String(txn[key]).replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}

const categoryColors = {
  Salary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Groceries: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Freelance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Dining: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Shopping: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Utilities: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Healthcare: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  Rent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const formatDateForFilter = date => format(date, 'yyyy-MM-dd');

const formatRangeLabel = (start, end) => {
  if (!start && !end) return '';
  if (start && end) return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  return `${format(start || end, 'MMM d, yyyy')} - Select end date`;
};

const Transactions = ({ transactions, setTransactions, role }) => {
  const [showForm, setShowForm] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesType = typeFilter === 'all' || txn.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || txn.category === categoryFilter;
      const matchesSearch =
        txn.category.toLowerCase().includes(search.toLowerCase()) ||
        txn.note.toLowerCase().includes(search.toLowerCase());
      const matchesDateFrom = !dateFrom || txn.date >= dateFrom;
      const matchesDateTo = !dateTo || txn.date <= dateTo;
      return matchesType && matchesCategory && matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [transactions, search, typeFilter, categoryFilter, dateFrom, dateTo]);

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [search, typeFilter, categoryFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  const handleAddTransaction = txn => {
    setTransactions(prev => [{ ...txn, id: Date.now() }, ...prev]);
    setShowForm(false);
  };

  const handleEditTransaction = txn => {
    setTransactions(prev => prev.map(t => t.id === txn.id ? txn : t));
    setEditTxn(null);
  };

  const handleDeleteTransaction = id => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleDateRangeChange = dates => {
    const [start, end] = dates;
    setDateRange(dates);
    setDateFrom(start ? formatDateForFilter(start) : '');
    setDateTo(end ? formatDateForFilter(end) : '');
  };

  const clearDateRange = () => {
    setDateRange([null, null]);
    setDateFrom('');
    setDateTo('');
  };

  const [startDate, endDate] = dateRange;

  return (
    <section>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
              placeholder="Search by category or note..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          <select
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="relative min-w-[240px]">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
              isClearable={false}
              placeholderText="Select date range"
              dateFormat="MMM d, yyyy"
              className="finance-date-range w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              calendarClassName="finance-date-picker-calendar"
              popperClassName="finance-date-picker-popper"
              monthsShown={1}
              shouldCloseOnSelect={false}
              title="Date range"
              value={formatRangeLabel(startDate, endDate)}
            />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={clearDateRange}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Clear date range"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => exportToCSV(filteredTransactions)}
            type="button"
          >
            Export CSV
          </button>
          {role === 'admin' && (
            <button
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-sm transition-colors"
              onClick={() => setShowForm(true)}
            >
              + Add
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && role === 'admin' && (
        <Modal open={showForm} onClose={() => setShowForm(false)}>
          <TransactionForm onSubmit={handleAddTransaction} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
      {editTxn && role === 'admin' && (
        <Modal open={!!editTxn} onClose={() => setEditTxn(null)}>
          <TransactionForm onSubmit={handleEditTransaction} onCancel={() => setEditTxn(null)} initialData={editTxn} />
        </Modal>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Note</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                {role === 'admin' && <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 6 : 5} className="text-center py-12 text-gray-400 dark:text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${categoryColors[txn.category] || categoryColors.Other}`}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">{txn.note}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold">
                      <span className={txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {txn.type === 'expense' ? '-' : '+'}₹{txn.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${txn.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="capitalize">{txn.type}</span>
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          className="text-sm text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 font-medium mr-3"
                          onClick={() => setEditTxn(txn)}
                        >Edit</button>
                        <button
                          className="text-sm text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 font-medium"
                          onClick={() => handleDeleteTransaction(txn.id)}
                        >Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginator */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>{filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span>
            Total: <span className="font-semibold text-gray-700 dark:text-gray-200">
              ₹{filteredTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0).toLocaleString()}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Rows:</span>
            <select
              className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First page"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              title="Previous page"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              title="Next page"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              title="Last page"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transactions;
