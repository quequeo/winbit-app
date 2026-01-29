# Winbit App (Portal inversores) — winbit-app

Portal para inversores (React + Vite + Firebase Auth) conectado a la API de `winbit-rails`.

## Features
- 🔐 Google Sign-In (Firebase Auth)
- 📊 Dashboard (saldo + resultado estrategia YTD e histórico)
- 💰 Depósitos (direcciones)
- 📤 Retiros (solicitudes)
- 🧾 Historial + Operativa (detalle diario de resultados operativos)
- 📱 PWA

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth (Google Sign-In)
- **Data Source:** Winbit Rails API (PostgreSQL)
- **Hosting:** Firebase Hosting
- **Email:** EmailJS
- **Testing:** Vitest + React Testing Library

## Fórmulas / finanzas
La explicación de balances y retornos vive en:
- `../FORMULAS.md`

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

## Setup

### 1) Install

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

### (Removido) Google Sheet
Este portal ya no usa Google Sheets como fuente de datos: consume la API de `winbit-rails`.

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

## Notas
- El dashboard muestra **resultado estrategia (TWR)** como métrica principal.

## Deployment

### Environment Variables

#### Development (`.env`)

```bash
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
# ... other Firebase config
```

#### Production (`.env.production`)

> **⚠️ IMPORTANTE**: Este archivo NO está en git. Debes crearlo manualmente.

```bash
# Rails API URL - Heroku production
VITE_API_URL=https://winbit-rails-55a941b2fe50.herokuapp.com

# Firebase config (same as development)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
# ... other Firebase config
```

Ver `.env.production.example` para referencia completa.

### Firebase Hosting

**URL de producción:** https://winbit-6579c.web.app

1. Install Firebase CLI (si no lo tienes):

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Build y deploy:

```bash
# Asegúrate de tener .env.production configurado
npm run build          # Usa .env.production automáticamente
firebase deploy        # Deploy a Firebase Hosting
```

### CORS Configuration

El backend Rails debe permitir el origen de Firebase Hosting. Esto ya está configurado en Heroku:

```bash
# Variable de entorno en Heroku
CORS_ORIGINS=http://localhost:5173,https://winbit-6579c.web.app,https://winbit-6579c.firebaseapp.com
```

Si necesitas agregar otro dominio:

```bash
heroku config:set CORS_ORIGINS="existing_origins,new_origin" -a winbit-rails
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

### CORS errors in production

If you see `No 'Access-Control-Allow-Origin' header` errors:

1. Verify CORS_ORIGINS is set in Heroku:
   ```bash
   heroku config:get CORS_ORIGINS -a winbit-rails
   ```
2. Should include: `https://winbit-6579c.web.app,https://winbit-6579c.firebaseapp.com`
3. Update if needed:
   ```bash
   heroku config:set CORS_ORIGINS="http://localhost:5173,https://winbit-6579c.web.app,https://winbit-6579c.firebaseapp.com" -a winbit-rails
   ```

### Firebase Auth errors (Invalid API Key)

If you see `auth/api-key-not-valid` errors:

1. Verify the API key in `.env.production` matches your Firebase project
2. Check API key restrictions in Google Cloud Console
3. Ensure the key has "Identity Toolkit API" enabled
4. Verify authorized domains in Firebase Console include your hosting domain

### Cross-Origin-Opener-Policy warnings

Warnings like `COOP policy would block the window.closed call` are **normal** and don't affect functionality. These appear due to security headers in `firebase.json` and can be safely ignored.

### Email notifications not working

- Verify EmailJS credentials are correct
- Check EmailJS service is active
- Confirm email templates are published

## License

Private - All rights reserved © 2024 Winbit
