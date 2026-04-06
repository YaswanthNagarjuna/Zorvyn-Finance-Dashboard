import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from 'recharts';
import { FiActivity, FiArrowDownRight, FiArrowUpRight, FiPercent } from 'react-icons/fi';

function getHighestSpendingCategory(transactions) {
  const expenseTotals = {};
  transactions.forEach(txn => {
    if (txn.type === 'expense') {
      expenseTotals[txn.category] = (expenseTotals[txn.category] || 0) + txn.amount;
    }
  });
  let maxCategory = null;
  let maxAmount = 0;
  Object.entries(expenseTotals).forEach(([cat, amt]) => {
    if (amt > maxAmount) {
      maxAmount = amt;
      maxCategory = cat;
    }
  });
  return { maxCategory, maxAmount };
}

function getMonthlyComparison(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { income, expense };
}

function getCategoryBreakdown(transactions) {
  const totals = {};
  transactions.forEach(txn => {
    if (txn.type === 'expense') {
      totals[txn.category] = (totals[txn.category] || 0) + txn.amount;
    }
  });
  return Object.entries(totals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function getMonthlyExpenditure(transactions) {
  const months = {};
  transactions.forEach(txn => {
    const monthKey = txn.date.slice(0, 7); // "2026-01"
    if (!months[monthKey]) months[monthKey] = { income: 0, expense: 0 };
    if (txn.type === 'income') months[monthKey].income += txn.amount;
    else if (txn.type === 'expense') months[monthKey].expense += txn.amount;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      const label = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return { month: label, income: data.income, expense: data.expense, savings: data.income - data.expense };
    });
}

function getMonthlyCategoryComparison(transactions) {
  const monthCat = {};
  const allMonths = new Set();
  const allCategories = new Set();

  transactions.forEach(txn => {
    if (txn.type !== 'expense') return;
    const monthKey = txn.date.slice(0, 7);
    allMonths.add(monthKey);
    allCategories.add(txn.category);
    if (!monthCat[txn.category]) monthCat[txn.category] = {};
    monthCat[txn.category][monthKey] = (monthCat[txn.category][monthKey] || 0) + txn.amount;
  });

  const sortedMonths = [...allMonths].sort();
  const monthLabels = sortedMonths.map(key => {
    const [year, month] = key.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
  });

  // Build data per category with each month as a key
  return [...allCategories]
    .filter(cat => cat !== 'Rent' && cat !== 'Salary')
    .map(cat => {
      const row = { category: cat };
      sortedMonths.forEach((mk, i) => {
        row[monthLabels[i]] = monthCat[cat]?.[mk] || 0;
      });
      return row;
    })
    .sort((a, b) => {
      const totalA = Object.values(a).filter(v => typeof v === 'number').reduce((s, v) => s + v, 0);
      const totalB = Object.values(b).filter(v => typeof v === 'number').reduce((s, v) => s + v, 0);
      return totalB - totalA;
    });
}

function getDailyAverage(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const days = new Set(expenses.map(t => t.date)).size;
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  return days > 0 ? (total / days).toFixed(0) : 0;
}

function getTopExpenses(transactions) {
  return [...transactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

const CATEGORY_COLORS = ['#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#f97316', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4'];
const MONTH_COLORS = ['#6366f1', '#0d9488', '#f59e0b'];

const statCards = [
  {
    key: 'income',
    label: 'Total Income',
    icon: <FiArrowUpRight className="w-5 h-5" />,
    iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    valueClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'expense',
    label: 'Total Expenses',
    icon: <FiArrowDownRight className="w-5 h-5" />,
    iconWrap: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    valueClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'net',
    label: 'Net Savings',
    icon: <FiActivity className="w-5 h-5" />,
    iconWrap: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
  },
  {
    key: 'rate',
    label: 'Savings Rate',
    icon: <FiPercent className="w-5 h-5" />,
    iconWrap: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
    valueClass: 'text-teal-600 dark:text-teal-400',
  },
];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SingleBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const Insights = ({ transactions }) => {
  const { maxCategory, maxAmount } = getHighestSpendingCategory(transactions);
  const { income, expense } = getMonthlyComparison(transactions);
  const net = income - expense;
  const categoryData = getCategoryBreakdown(transactions);
  const monthlyData = getMonthlyExpenditure(transactions);
  const monthlyCategoryData = getMonthlyCategoryComparison(transactions);
  const dailyAvg = getDailyAverage(transactions);
  const topExpenses = getTopExpenses(transactions);
  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : 0;

  // Extract month labels for the category comparison chart
  const monthLabels = monthlyData.map(d => d.month.split(' ')[0]); // ["Jan", "Feb", "Mar"]

  return (
    <section>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(card => {
          let value = '';
          let valueClass = card.valueClass || '';

          if (card.key === 'income') value = `₹${income.toLocaleString()}`;
          if (card.key === 'expense') value = `₹${expense.toLocaleString()}`;
          if (card.key === 'net') {
            value = `${net >= 0 ? '+' : '-'}₹${Math.abs(net).toLocaleString()}`;
            valueClass = net >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400';
          }
          if (card.key === 'rate') value = `${savingsRate}%`;

          return (
            <div key={card.key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {card.label}
                  </p>
                  <p className={`text-xl font-bold ${valueClass}`}>
                    {value}
                  </p>
                </div>
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconWrap}`}>
                  {card.icon}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Income vs Expense Comparison */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Monthly Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
        {/* Monthly summary table */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            {monthlyData.map(m => (
              <div key={m.month}>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">{m.month}</p>
                <p className={`text-sm font-bold ${m.savings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {m.savings >= 0 ? '+' : '-'}₹{Math.abs(m.savings).toLocaleString()} saved
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown + Month-over-Month Category Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Spending by Category (All Time)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<SingleBarTooltip />} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {categoryData.map((_, idx) => (
                  <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Category Spend by Month</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyCategoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {monthLabels.map((label, i) => (
                <Bar key={label} dataKey={label} name={label} fill={MONTH_COLORS[i % MONTH_COLORS.length]} radius={[0, 4, 4, 0]} maxBarSize={16} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Highest Spending</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{maxCategory || 'N/A'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">₹{maxAmount.toLocaleString()} spent</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Average Spending</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{dailyAvg}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Top 5 Expenses</h3>
          <div className="space-y-3">
            {topExpenses.map((txn, idx) => (
              <div key={txn.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{txn.note}</p>
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400 ml-2">₹{txn.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{txn.category}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Message */}
      <div className={`mt-6 rounded-lg border p-4 ${net >= 0 ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'}`}>
        <p className={`text-sm font-medium ${net >= 0 ? 'text-teal-700 dark:text-teal-300' : 'text-rose-700 dark:text-rose-300'}`}>
          {net >= 0
            ? `Great job! You saved ₹${net.toLocaleString()} across ${monthlyData.length} months — that's a ${savingsRate}% savings rate.`
            : `You spent ₹${Math.abs(net).toLocaleString()} more than you earned across ${monthlyData.length} months. Consider reviewing your expenses.`
          }
        </p>
      </div>
    </section>
  );
};

export default Insights;
