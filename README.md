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

## Technical Decisions and Trade-offs

**State Management — useState + localStorage over Redux/Context API.**
With only 4 routes and props passed at most 2 levels deep, a global state library would add boilerplate without benefit. localStorage syncs via useEffect on every state change, giving persistence across refreshes without a backend. We'd migrate to Context or Zustand only if the app grew to 10+ routes needing cross-component updates.

**Routing — React Router v6 pinned over v7.**
v7 dropped the BrowserRouter API and introduced loader/action patterns that require restructuring. Our 4 static routes don't need data loaders or nested layouts, so v6's simpler BrowserRouter + Routes pattern avoids unnecessary migration complexity.

**Charts — Recharts over Chart.js/D3.**
Recharts provides declarative React components (BarChart, PieChart, AreaChart) that compose naturally in JSX with custom tooltips. D3 requires imperative DOM manipulation conflicting with React's model. The ~180KB bundle cost is justified since charts are the dashboard's core feature.

**Data — JSON seed files + localStorage over API/Database.**
Mock data in src/data/ seeds initial state; changes persist to localStorage. This eliminates backend, database, and auth dependencies entirely. Trade-off: no multi-device sync and a ~5MB storage limit. A production version would use a REST API or Firebase.

**Pagination — Client-side over server-side.**
All transactions load into memory and get sliced by page/pageSize. With 40-100 records this is instant. Server-side pagination would only be needed at 10,000+ rows where loading everything upfront becomes a performance issue.

**Styling — Tailwind CSS utility classes over CSS Modules.**
Co-located styles in JSX eliminate file-switching. Dark mode uses Tailwind's dark: variant with class-based toggling persisted to localStorage. The verbose class strings are acceptable at this project size; a larger codebase would extract patterns with @apply directives.

**Build — CI=false for Vercel.**
Create React App treats warnings as errors when CI=true (Vercel's default). Setting CI=false in the build script prevents unused-variable warnings from failing deployment. In a team setting we'd fix all warnings instead.

**Currency — Hardcoded INR (₹) over i18n.**
All currency rendering uses the ₹ symbol directly. Implementing Intl.NumberFormat with locale detection and multi-currency support would be over-engineering for a single-region dashboard.

**Role-based Access — Client-side UI toggle over authentication.**
The Viewer/Admin dropdown hides CRUD buttons for viewers. This is cosmetic access control for demo purposes. Production would require JWT-based auth with server-side mutation validation.

**Notifications — Date-window filtering over push notifications.**
Reminders use notifyFrom/notifyUntil date ranges. The bell icon filters active reminders on each render. No push notifications or background workers — alerts only appear when the user opens the app.

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
