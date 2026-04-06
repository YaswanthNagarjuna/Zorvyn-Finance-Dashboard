import React from 'react';

function getSummary(transactions) {
  let income = 0, expense = 0;
  transactions.forEach(txn => {
    if (txn.type === 'income') income += txn.amount;
    else if (txn.type === 'expense') expense += txn.amount;
  });
  return { income, expense, balance: income - expense };
}

const summaryCardDefs = [
  { label: 'Total Balance', key: 'balance', borderColor: 'border-l-teal-500', iconBg: 'bg-teal-50 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400' },
  { label: 'Income',        key: 'income',  borderColor: 'border-l-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Expenses',      key: 'expense', borderColor: 'border-l-rose-500', iconBg: 'bg-rose-50 dark:bg-rose-900/30', iconColor: 'text-rose-600 dark:text-rose-400' },
];

const icons = {
  balance: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" stroke="none">₹</text>
    </svg>
  ),
  income: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  ),
  expense: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  ),
};

const SummaryCards = ({ transactions }) => {
  const { income, expense, balance } = getSummary(transactions);
  const values = { income, expense, balance };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {summaryCardDefs.map(card => (
        <div
          key={card.label}
          className={`rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 ${card.borderColor} p-5 transition-shadow hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
            <span className={`w-10 h-10 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
              {icons[card.key]}
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{values[card.key].toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
