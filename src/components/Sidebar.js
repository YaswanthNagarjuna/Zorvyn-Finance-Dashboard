
import { NavLink } from 'react-router-dom';
import { FiCalendar, FiCreditCard, FiGrid, FiTrendingUp } from 'react-icons/fi';

const navLinks = [
  { label: 'Dashboard', icon: <FiGrid />, to: '/' },
  { label: 'Transactions', icon: <FiCreditCard />, to: '/transactions' },
  { label: 'Reminders', icon: <FiCalendar />, to: '/reminders' },
  { label: 'Insights', icon: <FiTrendingUp />, to: '/insights' },
];

const Sidebar = () => (
  <aside className="fixed top-0 left-0 h-full w-[84px] md:w-[220px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center py-8 z-30">
    <div className="flex flex-col gap-8 w-full items-center">
      <div className="flex flex-col items-center mb-4">
        <span className="text-3xl font-bold text-teal-600 dark:text-teal-400 tracking-tight">Z</span>
        <span className="hidden md:block text-lg font-bold text-gray-800 dark:text-gray-100 mt-1 tracking-tight">Zorvyn</span>
        <span className="hidden md:block text-xs text-gray-400 dark:text-gray-500">Finance</span>
      </div>
      <nav className="flex flex-col gap-1 w-full px-3">
        {navLinks.map(link => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all
              ${isActive
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="hidden md:inline-block">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
    <div className="mt-auto flex flex-col gap-1 w-full items-center pb-4">
      <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">v1.0</span>
    </div>
  </aside>
);

export default Sidebar;
