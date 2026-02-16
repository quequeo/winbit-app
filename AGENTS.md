# AGENTS.md — winbit-app (Portal de Clientes)

Guía única de convenciones, criterios de aceptación y reglas operativas para el portal de clientes de Winbit.

## 0) Regla fundamental

Si algo no está claro o hay más de una opción válida, el agente DEBE preguntar antes de actuar. Nunca asumir. Nunca tomar decisiones ambiguas sin confirmación explícita del usuario.

## 0.1) Archivos raíz del repositorio

- `README.md` — Setup, uso y troubleshooting. NO se edita sin autorización.
- `AGENTS.md` — Este archivo. Convenciones y reglas operativas.

## 1) Stack y versiones

- **Framework:** React 18 + Vite 5.
- **Lenguaje:** JavaScript (no TypeScript). Decisión pragmática; la arquitectura facilita migración futura.
- **Estilos:** Tailwind CSS 3 (config en `tailwind.config.js`). Color primario: `#58b098`. Font: Montserrat.
- **Routing:** React Router DOM 6.
- **Data fetching:** React Query (`@tanstack/react-query`) con `staleTime: 5min`.
- **Auth:** Firebase Auth (Google Sign-In).
- **i18n:** react-i18next (español default, inglés).
- **PWA:** vite-plugin-pwa (auto-update, workbox).
- **Emails:** EmailJS (notificaciones de solicitudes).
- **Charts:** Recharts.
- **Testing:** Vitest + React Testing Library + jsdom.
- **Linting:** ESLint 8 (flat config) + Prettier.
- **Deploy:** Firebase Hosting.

## 2) Estructura del repositorio

```text
winbit-app/
├── src/
│   ├── components/
│   │   ├── ui/                # Button, Card, EmptyState, ErrorMessage, Input, Modal, Select, Spinner, Toast
│   │   ├── layout/            # Header, Footer, ProtectedRoute
│   │   ├── features/
│   │   │   ├── auth/          # AuthProvider, AuthContext
│   │   │   ├── dashboard/     # BalanceCard, KpiCard, LastUpdated
│   │   │   ├── requests/      # DepositForm, WithdrawalForm
│   │   │   └── wallets/       # WalletCard, WalletList
│   │   └── ErrorBoundary.jsx
│   ├── pages/                 # DashboardPage, HistoryPage, LoginPage, OperatingPage, RequestsPage, UnauthorizedPage, WalletsPage
│   ├── hooks/                 # useAuth, useInvestorData, useInvestorHistory, useWallets
│   ├── services/              # api.js (capa API), firebase.js (Firebase SDK)
│   ├── utils/                 # formatCurrency, formatDate, formatName, formatPercentage, truncateAddress, uploadImage
│   ├── config/                # wallets.js
│   ├── lib/                   # queryClient.js (React Query config)
│   ├── test/                  # setup.js, utils.jsx
│   ├── i18n.js                # Configuración i18next
│   ├── App.jsx                # Rutas principales
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind imports
├── public/                    # Assets estáticos
├── .env                       # Variables dev (no versionado)
├── .env.production            # Variables prod (no versionado)
├── .env.production.example    # Template (versionado)
├── firebase.json              # Firebase Hosting config
├── vite.config.js             # Vite + PWA + Test config
├── tailwind.config.js         # Tailwind config
├── eslint.config.js           # ESLint flat config
├── .prettierrc.cjs            # Prettier config
├── .husky/pre-push            # Pre-push hook
├── package.json
└── AGENTS.md
```

## 3) Configuración obligatoria

- `.env` y `.env.production` no se versionan. Versionar solo `.env.production.example`.
- Variables requeridas:
  - `VITE_API_URL` — URL del backend (`http://localhost:3000` en dev, Heroku en prod).
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
  - `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL`, `VITE_EMAILJS_TEMPLATE_ID_DEPOSIT`, `VITE_EMAILJS_PUBLIC_KEY`.

## 4) Flujo de autenticación

1. Usuario hace Sign-In con Google (Firebase Auth popup, fallback a redirect).
2. `AuthProvider` valida email contra `GET /api/public/investor/:email`.
3. Si no existe o está inactivo → logout automático + mensaje de error.
4. Si está activo → acceso permitido, datos del inversor disponibles.
5. `ProtectedRoute` verifica auth. Si no autenticado → redirect a `/login`.

## 5) Capa de servicios (API)

### `src/services/api.js`

- Base URL desde `VITE_API_URL`.
- Funciones:
  - `getInvestorData(email)` — Datos del inversor + portfolio.
  - `getInvestorHistory(email)` — Historial de movimientos.
  - `getWallets()` — Billeteras de depósito.
  - `createInvestorRequest(data)` — Crear solicitud de depósito/retiro.
  - `validateInvestor(email)` — Validar si el inversor existe y está activo.
- Manejo de errores: 404 (no encontrado), 403 (inactivo), otros (error genérico).

### Custom hooks (React Query)

- `useInvestorData` — Datos del inversor (staleTime: 5min).
- `useInvestorHistory` — Historial.
- `useWallets` — Billeteras.

## 6) Internacionalización (i18n)

- Idiomas: Español (default), Inglés.
- Storage: `localStorage` key `winbit_language`.
- Namespace único: `translation`.
- Secciones: `app`, `common`, `errors`, `nav`, `auth`, `footer`, `dashboard`, `deposits`, `withdrawals`, `requests`, `history`, `operating`, `unauthorized`.
- **Regla:** toda string visible al usuario debe pasar por `t()`. Nunca mostrar constantes crudas (ej: `TRADING_FEE` debe mostrarse como "Comisión de Trading").

### Traducciones de movimientos

| Constante                | Español                      | Inglés                   |
| ------------------------ | ---------------------------- | ------------------------ |
| `DEPOSIT`                | Depósito                     | Deposit                  |
| `WITHDRAWAL`             | Retiro                       | Withdrawal               |
| `OPERATING_RESULT`       | Resultado Operativo          | Operating Result         |
| `TRADING_FEE`            | Comisión de Trading          | Trading Fee              |
| `TRADING_FEE_ADJUSTMENT` | Comisión de Trading - Ajuste | Trading Fee - Adjustment |
| `REFERRAL_COMMISSION`    | Comisión por referido        | Referral Commission      |

## 7) Páginas

| Ruta            | Componente         | Descripción                           |
| --------------- | ------------------ | ------------------------------------- |
| `/login`        | `LoginPage`        | Login con Google.                     |
| `/`             | `DashboardPage`    | Balance, KPIs, gráfico TWR.           |
| `/history`      | `HistoryPage`      | Historial de movimientos con detalle. |
| `/operating`    | `OperatingPage`    | Resultados operativos.                |
| `/requests`     | `RequestsPage`     | Solicitudes de depósito/retiro.       |
| `/wallets`      | `WalletsPage`      | Billeteras para depósitos.            |
| `/unauthorized` | `UnauthorizedPage` | Acceso denegado.                      |

## 8) Componentes UI

### Reglas generales

- Componentes funcionales con hooks.
- Props desestructuradas.
- Tailwind CSS para estilos (no CSS modules ni styled-components).
- Responsive: mobile-first. Muchas páginas tienen vista mobile y desktop separadas.

### `HistoryPage` — Reglas especiales

- `translateMovement()`: convierte constantes de eventos a texto legible según idioma.
- `movementLabel()`: agrega metadata contextual (porcentaje de fee, período, etc.).
- Colores por tipo de movimiento:
  - Depósitos: verde
  - Retiros: rojo
  - Resultados operativos: verde/rojo según signo
  - Trading fees: azul
  - Referral commissions: púrpura/violeta

## 9) Testing

### Setup

- Runner: Vitest (config en `vite.config.js`).
- Environment: jsdom.
- Setup file: `src/test/setup.js` (cleanup, i18n init, mocks).
- Utilities: `src/test/utils.jsx`.

### Convenciones

- Archivos test junto al componente: `Component.test.jsx`.
- 66 archivos de test actualmente.
- Todos los componentes UI, pages, hooks y utils tienen tests.
- Mock de `fetch`/API para controlar escenarios.
- Mock de `navigator.clipboard` y `window.matchMedia` en setup.
- Para elementos que aparecen después de fetch async: usar `findBy*` (NO `getBy*`).
- Para queries dentro de un contenedor específico: usar `within(container)`.

### Correr tests

```bash
npm run test        # Watch mode
npm run test:ci     # Single run (CI)
npm run test:coverage  # Con cobertura
```

## 10) Estilo y calidad de código

- **ESLint:** Flat config (eslint.config.js). Plugins: react, react-hooks, react-refresh. `no-unused-vars` permite prefijo `_`.
- **Prettier:** Single quotes, semi, trailing comma all, print width 100, tab width 2.
- **Pre-push hook:** `npm run lint && npm run format:check && npm run test:ci`.
- **Formato numérico argentino:** `$XX.XXX,XX` (función manual en `utils/formatCurrency.js`, NO `toLocaleString`).

### Correr linters

```bash
npm run lint           # ESLint
npm run format:check   # Prettier check
npm run format         # Prettier fix
```

## 11) Build y deploy

### Build

```bash
npm run build   # Usa .env.production automáticamente
```

- Output: `dist/`.
- PWA: `vite-plugin-pwa` con `minify: false` (workaround para terser).

### Deploy a Firebase Hosting

```bash
npm run build && firebase deploy
```

- `firebase.json`: hosting desde `dist/`, SPA rewrite a `/index.html`.
- Predeploy: `npm run build` (automático con `firebase deploy`).
- Headers: `Cross-Origin-Opener-Policy: same-origin-allow-popups` (requerido para Google Sign-In popup).
- Producción: https://winbit-6579c.web.app

## 12) Protocolo Git

### Commits

- Mensaje conciso (1-2 líneas).
- NUNCA mencionar Cursor, Claude, AI, LLM, copilot ni herramientas de IA.
- PROHIBIDO cualquier trailer `Co-authored-by` que mencione IA.

### Pre-push

- `npm run lint` (sin errores)
- `npm run format:check` (sin errores)
- `npm run test:ci` (todos en verde)
- Si alguno falla, corregir antes de pushear.

### Permisos operativos

El agente tiene autorización para: `git add`, `commit`, `push`.

Condiciones:

- Cambios atómicos y trazables.
- Quality gates en verde.
- Sin secretos versionados.
- No comandos destructivos salvo solicitud explícita.

## 13) Convenciones de negocio

- **Event names internos:** Siempre en inglés mayúsculas (`DEPOSIT`, `WITHDRAWAL`, etc.).
- **Display al usuario:** Siempre traducidos vía i18n. NUNCA mostrar constantes crudas.
- **Status:** `PENDING`, `COMPLETED`, `REJECTED`.
- **Formato numérico:** Argentino `$XX.XXX,XX` (punto miles, coma decimales).
- **Fechas:** Formato localizado según idioma del usuario.

## 14) Qué NO hacer

1. NO usar `toLocaleString` para formato argentino (usar función manual).
2. NO mostrar constantes de eventos crudas al usuario (siempre traducir).
3. NO commitear sin pasar lint, format y tests.
4. NO crear archivos .md sin que el usuario lo pida.
5. NO usar `getByRole` para elementos async en tests (usar `findByRole`).
6. NO agregar TypeScript (decisión explícita de usar JS).
7. NO usar CSS modules ni styled-components (solo Tailwind).
8. NO modificar `.env` ni `.env.production` (solo `.env.production.example`).
