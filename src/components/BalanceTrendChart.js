import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function getBalanceTrend(transactions) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let balance = 0;
  const trend = [];
  const dailyMap = {};

  sorted.forEach(txn => {
    if (txn.type === 'income') balance += txn.amount;
    else if (txn.type === 'expense') balance -= txn.amount;
    dailyMap[txn.date] = balance;
  });

  Object.entries(dailyMap).forEach(([date, bal]) => {
    trend.push({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: bal,
    });
  });

  return trend;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const BalanceTrendChart = ({ transactions }) => {
  const data = getBalanceTrend(transactions);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="balance" stroke="#0d9488" strokeWidth={2} fill="url(#balanceFill)" dot={false} activeDot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default BalanceTrendChart;
