import React, { useMemo } from 'react';
import { differenceInCalendarDays, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { FiAlertCircle, FiBell, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const getReminderMeta = reminder => {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseISO(reminder.dueDate));
  const daysUntilDue = differenceInCalendarDays(dueDate, today);

  if (daysUntilDue < 0) {
    return {
      label: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}`,
      tone: 'text-rose-600 dark:text-rose-400',
      chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    };
  }

  if (daysUntilDue === 0) {
    return {
      label: 'Due today',
      tone: 'text-amber-600 dark:text-amber-400',
      chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    };
  }

  if (daysUntilDue <= 7) {
    return {
      label: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
      tone: 'text-teal-600 dark:text-teal-400',
      chip: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    };
  }

  return {
    label: `Due in ${daysUntilDue} days`,
    tone: 'text-gray-500 dark:text-gray-400',
    chip: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
};

const Reminders = ({ reminders }) => {
  const sortedReminders = useMemo(
    () => [...reminders].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [reminders]
  );

  const today = startOfDay(new Date());
  const dueThisWeek = reminders.filter(reminder => {
    const dueDate = startOfDay(parseISO(reminder.dueDate));
    const daysUntilDue = differenceInCalendarDays(dueDate, today);
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  }).length;

  const overdueCount = reminders.filter(reminder => isBefore(startOfDay(parseISO(reminder.dueDate)), today)).length;
  const scheduledAmount = reminders.reduce((sum, reminder) => sum + reminder.amount, 0);

  const statCards = [
    {
      label: 'Due This Week',
      value: dueThisWeek,
      icon: <FiBell className="w-5 h-5" />,
      iconWrap: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
    },
    {
      label: 'Overdue Bills',
      value: overdueCount,
      icon: <FiAlertCircle className="w-5 h-5" />,
      iconWrap: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    },
    {
      label: 'Scheduled Total',
      value: `₹${scheduledAmount.toLocaleString()}`,
      icon: <FiCheckCircle className="w-5 h-5" />,
      iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {statCards.map(card => (
          <div
            key={card.label}
            className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconWrap}`}>
                {card.icon}
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Upcoming Bills
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sorted by nearest due date first.
            </p>
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {sortedReminders.length} item{sortedReminders.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {sortedReminders.map(reminder => {
            const meta = getReminderMeta(reminder);

            return (
              <div
                key={reminder.id}
                className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-10 h-10 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 flex items-center justify-center">
                    <FiCalendar className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{reminder.title}</h4>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${meta.chip}`}>
                        {meta.label}
                      </span>
                      {reminder.autopay && (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                          Auto-pay
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {reminder.category} • Due {format(parseISO(reminder.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:block">
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    ₹{reminder.amount.toLocaleString()}
                  </div>
                  <div className={`text-sm font-medium mt-1 ${meta.tone}`}>
                    {meta.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Reminders;
