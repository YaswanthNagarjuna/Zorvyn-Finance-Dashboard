import React, { useMemo } from 'react';
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { FiBell } from 'react-icons/fi';
import SummaryCards from './SummaryCards';
import BalanceTrendChart from './BalanceTrendChart';
import SpendingBreakdownChart from './SpendingBreakdownChart';

const Dashboard = ({ transactions, reminders }) => {
  const upcomingReminders = useMemo(() => {
    const today = startOfDay(new Date());

    return reminders
      .map(reminder => {
        const dueDate = startOfDay(parseISO(reminder.dueDate));
        return {
          ...reminder,
          daysUntilDue: differenceInCalendarDays(dueDate, today),
        };
      })
      .filter(reminder => reminder.daysUntilDue >= 0)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 4);
  }, [reminders]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingIcon = hour < 12 ? '🌤️' : hour < 17 ? '☀️' : '🌙';

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {greetingIcon}&nbsp; {greeting}, <span className="text-teal-600 dark:text-teal-400">there!</span>
      </h2>

      {/* Summary Cards */}
      <SummaryCards transactions={transactions} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Balance Trend</h3>
          <BalanceTrendChart transactions={transactions} />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Spending Breakdown</h3>
          <SpendingBreakdownChart transactions={transactions} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 mt-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Upcoming Bills</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your next reminder dates at a glance.</p>
          </div>
          <span className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 flex items-center justify-center">
            <FiBell className="w-5 h-5" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingReminders.map(reminder => (
            <div
              key={reminder.id}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{reminder.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {format(parseISO(reminder.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">₹{reminder.amount.toLocaleString()}</div>
                  <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                    Due in {reminder.daysUntilDue} day{reminder.daysUntilDue === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
