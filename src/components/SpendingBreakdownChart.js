import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#f97316', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4'];

function getSpendingData(transactions) {
  const totals = {};
  transactions.forEach(txn => {
    if (txn.type === 'expense') {
      totals[txn.category] = (totals[txn.category] || 0) + txn.amount;
    }
  });
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getAvailableMonths(transactions) {
  const months = new Set();
  transactions.forEach(txn => months.add(txn.date.slice(0, 7)));
  return [...months].sort();
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{payload[0].name}</p>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const SpendingBreakdownChart = ({ transactions }) => {
  const months = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const filtered = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter(txn => txn.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const data = getSpendingData(filtered);
  const total = data.reduce((s, d) => s + d.value, 0);

  const formatMonthLabel = key => {
    const [year, month] = key.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <select
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          <option value="all">All Months</option>
          {months.map(m => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full sm:w-1/2 space-y-2">
          {data.map((item, idx) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{item.name}</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">₹{item.value.toLocaleString()}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs w-12 text-right">{pct}%</span>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm font-semibold">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="text-gray-900 dark:text-white">₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingBreakdownChart;
