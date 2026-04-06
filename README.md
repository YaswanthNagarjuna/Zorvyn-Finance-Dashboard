# Zorvyn Finance Dashboard

A clean, minimal, and feature-rich personal finance dashboard built with React, Tailwind CSS, and Recharts. Track income and expenses, manage bill reminders, and analyze spending patterns with interactive visualizations.

## Features

### Dashboard (Overview)
- Time-based greeting (Good Morning / Afternoon / Evening)
- Summary cards for Total Balance, Income, and Expenses with rupee currency
- Balance trend area chart showing running balance over time
- Spending breakdown donut chart with monthly dropdown filter
- Upcoming bills section showing nearest due reminders

### Transactions
- Paginated table (default 10 rows, options: 10 / 25 / 50 / 100)
- Search by category or note
- Filter by type (income/expense), category, and date range
- Color-coded category badges and type indicators
- Add, edit, and delete transactions (admin role only)
- Export filtered transactions to CSV
- Transaction count and net total in footer
- Data persists to localStorage across page refreshes

### Reminders
- Upcoming bill tracker with due date countdown
- Stat cards: Due This Week, Overdue Bills, Scheduled Total
- Auto-pay badge indicator
- Status chips: overdue (red), due today (amber), upcoming (teal)
- Notification bell in navbar with unread count and mark-as-read

### Insights
- 4 stat cards: Total Income, Total Expenses, Net Savings, Savings Rate
- Monthly Income vs Expenses grouped bar chart with per-month savings summary
- Spending by Category horizontal bar chart (all-time aggregate)
- Category Spend by Month comparison chart (Jan / Feb / Mar side-by-side)
- Highest spending category with daily average
- Top 5 largest expenses list
- Contextual savings message banner

### General
- Dark mode toggle (persisted to localStorage, respects system preference)
- Role switcher (Viewer / Admin) for role-based UI
- Responsive sidebar navigation with active state highlighting
- Page titles in navbar that update based on current route
- Custom SVG favicon with Zorvyn branding

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | React Icons (Feather) |
| Date Utils | date-fns |
| Build Tool | Create React App |

## Project Structure

```
finance_dashboard/
├── public/
│   ├── favicon.svg              # Custom Zorvyn favicon
│   ├── index.html               # HTML template
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Dashboard.js         # Overview page with greeting, cards, charts, bills
│   │   ├── Transactions.js      # Transaction table with filters and pagination
│   │   ├── TransactionForm.js   # Add/edit transaction form modal
│   │   ├── Reminders.js         # Bill reminders page
│   │   ├── Insights.js          # Analytics with monthly comparison charts
│   │   ├── Sidebar.js           # Fixed sidebar navigation
│   │   ├── SummaryCards.js      # Balance, income, expense cards
│   │   ├── BalanceTrendChart.js # Running balance area chart
│   │   └── SpendingBreakdownChart.js # Donut chart with month filter
│   ├── data/
│   │   ├── transactions.json    # 3 months of mock transaction data (Jan-Mar 2026)
│   │   └── reminders.json       # 12 bill reminders (Apr-May 2026)
│   ├── App.js                   # Root component with routing, navbar, state management
│   ├── index.js                 # React entry point
│   └── index.css                # Tailwind imports
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## Mock Data

### Transactions (`src/data/transactions.json`)
- 40 transactions across January, February, and March 2026
- 10 categories: Salary, Freelance, Rent, Groceries, Transport, Dining, Shopping, Utilities, Entertainment, Healthcare
- Realistic amounts in INR (rupees)
- Mix of income (salary, freelance) and varied daily expenses

### Reminders (`src/data/reminders.json`)
- 12 bill reminders spanning April-May 2026
- Categories: Housing, Utilities, Finance, Insurance, Health, Entertainment, Subscriptions
- Each has a 5-day notification window before the due date
- Mix of autopay and manual payment bills

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

```sh
git clone <repository-url>
cd finance_dashboard
npm install
```

### Development

```sh
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

### Production Build

```sh
npm run build
```

The optimized output will be in the `build/` folder, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

### Deployed On
- https://zorvyn-finance-dashboard-teal.vercel.app/

## Data Persistence

- **First visit**: loads seed data from `transactions.json`
- **After changes**: saves to `localStorage` automatically
- **On refresh**: reads from `localStorage` (preserves your changes)
- **To reset**: run `localStorage.removeItem('transactions')` in the browser console

## Design Decisions

- **No gradients** - Clean white cards with subtle borders and left-accent colors
- **Teal as primary accent** - Used for active states, buttons, and highlights
- **Border-based section separation** - Every card/section has `border border-gray-200` for clear visual hierarchy
- **SVG icons over emojis** - Consistent look across platforms (except greeting icon)
- **Rupee currency** - All amounts displayed with the Indian Rupee symbol
- **localStorage over backend** - Keeps the app self-contained with no server dependency

## License

This project is for educational and demo purposes.

---

Built with React, Tailwind CSS, and Recharts.
