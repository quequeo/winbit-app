# winbit-app (Portal de clientes)

Portal de inversores en React conectado a la API publica de `winbit-rails`.

## Stack

- React 18 + Vite
- Tailwind CSS
- Firebase Auth (Google)
- React Query
- Vitest + React Testing Library

## URLs

- Local: `http://localhost:5173`
- Produccion: `https://winbit-6579c.web.app`
- API backend: `https://winbit-rails-55a941b2fe50.herokuapp.com`

## Setup local

```bash
npm install
```

Crear `.env`:

```bash
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL=...
VITE_EMAILJS_TEMPLATE_ID_DEPOSIT=...
VITE_EMAILJS_PUBLIC_KEY=...
```

## Desarrollo

```bash
npm run dev
```

## Tests y calidad

```bash
npm run lint
npm run format:check
npm run test:ci
npm run build
```

## Deploy

```bash
npm run build
firebase deploy
```

`npm run build` usa `.env.production`.

## Reglas funcionales

- Formato monetario argentino manual (`$XX.XXX,XX`), no `toLocaleString`.
- Eventos internos en ingles (`DEPOSIT`, `WITHDRAWAL`, etc.), siempre traducidos en UI.
- El usuario debe existir como inversor activo en backend para acceder.

## Documentacion

- Convenciones del repo: `AGENTS.md`
- Formulas financieras: `../winbit-rails/FORMULAS.md`
