# Winbit App

Progressive Web Application (PWA) for investors to view their portfolio balance, performance, and request withdrawals or deposits.

## Features

- 🔐 **Google Authentication** - Secure login with Firebase Auth
- 📊 **Dashboard** - Portfolio metrics and performance tracking
- 💰 **Depósitos** - View deposit addresses (USDT/USDC only)
- 📤 **Retiros** - Submit partial or full withdrawal requests
- 🧾 **Historial** - Movements table (planned)
- 📱 **PWA Support** - Install as native app on mobile devices
- 🎨 **Responsive Design** - Optimized for mobile and desktop

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth (Google Sign-In)
- **Data Source:** Winbit Rails API (PostgreSQL)
- **Hosting:** Firebase Hosting
- **Email:** EmailJS
- **Testing:** Vitest + React Testing Library

## App Placement (Public Website + Investor Panel)

The investor panel can live either:

- As a route under the same domain (recommended): `/app` (e.g. `winbit.../app`)
- As a subdomain: `app.winbit...`

In both cases, the investor panel routes remain protected behind Firebase Auth.

### Local development note

When hosting the panel under `/app`, the development URL is typically:

- `http://localhost:5173/app/`

## Language

- Default language: **Español**
- Language switcher: **Header (top-right)** (Spanish / English)
- Language preference: stored in localStorage
- Translation system: `react-i18next`

## Number Format (Argentine Standard)

The app uses Argentine number formatting:

- **Thousands separator:** Point (`.`) - Example: `15.226`
- **Decimal separator:** Comma (`,`) - Example: `15.226,00`
- **Currency format:** `$15.226,00` (no space between $ and number)
- **Percentage format:** `+1,50%` (always show sign for positive values)
- **Return values:** Show `+` sign for positive results (except portfolio value)
- **Zero values:** No sign for zero (`$0,00`, `0,00%`)

### Examples:
- Portfolio value: `$15.226,50` (no sign)
- Positive returns: `+$1.500,75` and `+1,50%`
- Negative returns: `-$500,25` and `-2,30%`
- Zero: `$0,00` and `0,00%`

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Hosting enabled
- Winbit Rails backend running (see ../winbit-rails/README.md)
- EmailJS account for email notifications

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd winbit-app
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# Firebase Configuration (para autenticación con Google)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Winbit Rails API URL
# Desarrollo local: http://localhost:3000
# Producción: https://winbit-rails-55a941b2fe50.herokuapp.com
VITE_API_URL=http://localhost:3000

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL=your_withdrawal_template_id
VITE_EMAILJS_TEMPLATE_ID_DEPOSIT=your_deposit_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### 3. Configure Google Sheet

Your Google Sheet should have the following structure:

| Column A | Column B | Column C | Column D | Column E | Column F+       |
| -------- | -------- | -------- | -------- | -------- | --------------- |
| Email    | Name     | Balance  | Invested | Returns% | Historical Data |

- **Column A:** Investor email (must match Google Sign-In email)
- **Column B:** Investor name
- **Column C:** Current balance (USD)
- **Column D:** Total invested (USD)
- **Column E:** Returns/Performance (%)
 

### 4. Configure Wallets

Edit `src/config/wallets.js` with your wallet addresses:

```javascript
export const WALLETS = [
  {
    network: 'USDT (TRC20)',
    address: 'your_usdt_trc20_address',
    icon: '₮',
  },
  {
    network: 'USDC (TRC20)',
    address: 'your_usdc_trc20_address',
    icon: '$',
  },
  // Pending: final list of supported networks + addresses
];
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing & Coverage

The project uses Vitest and React Testing Library.

**Current Test Coverage:** ~89.6%

| Metric | Percentage |
|--------|-----------|
| Lines | 89.6% |
| Statements | 89.6% |
| Branches | 72.45% |
| Functions | 83.33% |

### Test Suite

- **Total Tests:** 167+ tests passing
- **Test Framework:** Vitest + React Testing Library
- **Test Files:** 40+ test files

### Key Coverage Areas

- ✅ **UI Components:** 100% coverage (Button, Card, Input, Select, Spinner, Toast, etc.)
- ✅ **Utils:** 98.96% coverage (formatCurrency, formatDate, formatName, etc.)
- ✅ **Hooks:** 98.63% coverage (useAuth, useInvestorData, useInvestorHistory, useWallets)
- ✅ **Services:**
  - `api.js` - 93.88% (critical API service with Rails backend)
  - `email.js` - 100%
- ✅ **Pages:** 92.23% average coverage
- ⚠️ **Authentication:** 53.42% (AuthProvider - Firebase integration, complex to test)

```bash
# Run all tests
npm run test

# Generate coverage report
npm run test:coverage
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase (if not done):

```bash
firebase init
```

Select:

- Hosting
- Use existing project
- Public directory: `dist`
- Single-page app: Yes
- GitHub actions: No

4. Build and deploy:

```bash
npm run build
firebase deploy
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
│       ├── auth/        # Authentication
│       ├── dashboard/   # Dashboard features
│       ├── wallets/     # Wallet management
│       └── requests/    # Withdrawal/Deposit forms
├── hooks/               # Custom React hooks
├── services/            # API services
├── utils/               # Helper functions
├── pages/               # Page components
├── config/              # Configuration files
├── test/                # Test setup
├── App.jsx
└── main.jsx
```

## Business Rules

### Portfolio Updates

- Portfolio updates are processed once per business day after the operational close
- Historical data available from investor's signup date

### Processing Hours

- Requests are received until **17:00 (GMT-3)** and executed at **18:00 (GMT-3)**.
- Requests submitted after **17:00 (GMT-3)** are processed the next day.

## Pending Definitions (Data / Sheet)

To finish the dashboard and history, we need the Google Sheet to explicitly define where these values come from:

- Dashboard metrics:
  - Current portfolio value (USD)
  - Total return since inception (USD)
  - Total return since inception (%)
  - Annual return (USD)
  - Annual return (%)
- History table:
  - Date, Movement type, Amount, Previous balance, New balance, Status
  - Whether history is a single sheet with an `email` column or per-investor tabs
  - Status values (e.g. Pending / Completed / Rejected)

### Security

- Only authenticated users with Google Sign-In
- User email must exist in Winbit Rails database as an active investor
- Firebase Auth validates authentication
- Rails API validates investor status before returning data

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## PWA Installation

Users can install Winbit as a native app:

1. Visit the app in a supported browser
2. Look for "Install" or "Add to Home Screen" prompt
3. Follow browser-specific installation steps

## Troubleshooting

### User not found error

- Ensure user's email exists in the Winbit Rails database as an investor
- Check that investor status is 'ACTIVE'
- Contact winbit.cfds@gmail.com to register as an investor

### API connection errors

- Verify Rails backend is running at the correct URL
- Check that VITE_API_URL is configured correctly
- Ensure investor exists and is active in the database

### Email notifications not working

- Verify EmailJS credentials are correct
- Check EmailJS service is active
- Confirm email templates are published

## License

Private - All rights reserved © 2024 Winbit
