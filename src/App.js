
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { differenceInCalendarDays, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import { FiBell } from 'react-icons/fi';
import Sidebar from './components/Sidebar';

import Dashboard from './components/Dashboard';
import Reminders from './components/Reminders';
import Transactions from './components/Transactions';
import Insights from './components/Insights';
import initialTransactions from './data/transactions.json';
import initialReminders from './data/reminders.json';

// Dark mode state (persisted)
function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? JSON.parse(stored) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  return [darkMode, setDarkMode];
}

function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      className={`ml-4 flex items-center rounded-full w-14 h-8 p-1 border border-gray-300 dark:border-gray-600 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition-all duration-300 focus:outline-none`}
      onClick={() => setDarkMode(d => !d)}
      aria-label="Toggle dark mode"
      type="button"
    >
      <span className={`w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-500 shadow transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : ''}`}>
        {darkMode ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

function NotificationBell({ reminders, readNotifications, onMarkAsRead }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const today = startOfDay(new Date());
  const notifications = reminders
    .filter(reminder => {
      const notifyFrom = startOfDay(parseISO(reminder.notifyFrom));
      const notifyUntil = startOfDay(parseISO(reminder.notifyUntil));
      return !isBefore(today, notifyFrom) && !isAfter(today, notifyUntil);
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map(reminder => ({
      ...reminder,
      daysLeft: differenceInCalendarDays(startOfDay(parseISO(reminder.dueDate)), today),
      isRead: Boolean(readNotifications[reminder.id]),
    }));
  const unreadCount = notifications.filter(reminder => !reminder.isRead).length;

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        aria-label="Open bill notifications"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.2rem] rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[90] mt-3 w-[320px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bill Notifications</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Alerts from 5 days before the due date until the due day.
                </p>
              </div>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                {unreadCount} unread
              </span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No active bill alerts right now.
              </div>
            ) : (
              notifications.map(reminder => (
                <div
                  key={reminder.id}
                  className={`border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-800 ${
                    reminder.isRead ? 'bg-gray-50/80 dark:bg-gray-800/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{reminder.title}</p>
                        {reminder.isRead && (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Read
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Due {format(parseISO(reminder.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">₹{reminder.amount.toLocaleString()}</p>
                      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        reminder.daysLeft === 0
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {reminder.daysLeft === 0
                          ? 'Due today'
                          : `${reminder.daysLeft} day${reminder.daysLeft === 1 ? '' : 's'} left`}
                      </span>
                      {!reminder.isRead && (
                        <button
                          type="button"
                          onClick={() => onMarkAsRead(reminder.id)}
                          className="mt-2 block w-full text-xs font-medium text-teal-600 transition-colors hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const pageTitles = {
  '/': 'Overview',
  '/transactions': 'Transactions',
  '/reminders': 'Reminders',
  '/insights': 'Insights',
};

const pageSubtitles = {
  '/transactions': 'Manage and track all your transactions.',
  '/reminders': 'Track upcoming bills and stay ahead of your due dates.',
  '/insights': 'Analyze your spending patterns and trends.',
};

function NavBar({ role, setRole, darkMode, setDarkMode, reminders, readNotifications, onMarkAsRead }) {
  const location = useLocation();
  const path = location.pathname;
  const title = pageTitles[path] || 'Overview';
  const subtitle = pageSubtitles[path];

  return (
    <nav className="relative z-[80] flex items-center justify-between gap-4 px-4 py-4 md:px-10 md:py-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <select
          className="appearance-none w-32 px-4 py-2 pr-8 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all text-sm"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
        <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <NotificationBell
          reminders={reminders}
          readNotifications={readNotifications}
          onMarkAsRead={onMarkAsRead}
        />
      </div>
    </nav>
  );
}

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [role, setRole] = useState('viewer');
  const [transactions, setTransactions] = useState(() => {
    const stored = localStorage.getItem('transactions');
    return stored ? JSON.parse(stored) : initialTransactions;
  });
  const [reminders] = useState(initialReminders);
  const [readNotifications, setReadNotifications] = useState(() => {
    const stored = localStorage.getItem('readNotifications');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }, [readNotifications]);

  const handleMarkNotificationRead = reminderId => {
    setReadNotifications(prev => ({ ...prev, [reminderId]: true }));
  };

  return (
    <Router>
      <div className={classNames('min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors')}>
        <Sidebar />
        <div className="flex-1 ml-[84px] md:ml-[220px] min-h-screen">
          <NavBar role={role} setRole={setRole} darkMode={darkMode} setDarkMode={setDarkMode} reminders={reminders} readNotifications={readNotifications} onMarkAsRead={handleMarkNotificationRead} />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard transactions={transactions} reminders={reminders} role={role} />} />
              <Route path="/transactions" element={<Transactions transactions={transactions} setTransactions={setTransactions} role={role} />} />
              <Route path="/reminders" element={<Reminders reminders={reminders} role={role} />} />
              <Route path="/insights" element={<Insights transactions={transactions} role={role} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
