# 🚀 Winbit App - Guía de Configuración

## ✅ Ya Completado

- ✅ Proyecto React + Vite completo
- ✅ Firebase Authentication (Google Sign-In)
- ✅ Firebase Hosting configurado
- ✅ Google Sheets API Key configurado
- ✅ Logo y favicon configurados
- ✅ PWA manifest configurado
- ✅ Tests completos (97%+ coverage)
- ✅ Build funciona correctamente

## ⏳ Pendiente de Chueco

### 1. Google Sheet ID

**Para obtenerlo:**
1. Abrí el Google Sheet con la data de inversores
2. En la URL: `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`
3. Copiá solo el ID (la parte entre `/d/` y `/edit`)

**Estructura requerida del Sheet:**

| Columna A | Columna B | Columna C | Columna D | Columna E | Columnas F+ |
|-----------|-----------|-----------|-----------|-----------|-------------|
| Email     | Nombre    | Balance   | Invertido | Returns % | Histórico   |
| investor@example.com | Juan Perez | 10000 | 8000 | 25 | 9000, 9500, 10000 |

**Dónde ponerlo:**
En el archivo `.env`, reemplazar:
```
VITE_GOOGLE_SHEETS_ID=PENDING_FROM_CHUECO
```
Por:
```
VITE_GOOGLE_SHEETS_ID=el_id_que_copió
```

---

### 2. EmailJS

**Pasos para Chueco:**

#### A. Registrarse en EmailJS
1. Ir a: https://www.emailjs.com/
2. Registrarse con el email de Winbit
3. Verificar email

#### B. Configurar Service
1. Click en **"Add New Service"**
2. Elegir **Gmail** (o el proveedor que use)
3. Conectar su email de Winbit
4. Copiar el **Service ID** (ej: `service_abc123`)

#### C. Crear Template de Retiro
1. Click en **"Email Templates"** → **"Create New Template"**
2. Template Name: `Winbit - Solicitud de Retiro`

**Contenido del email:**
```
Subject: 💰 Nueva solicitud de retiro - {{user_name}}

Hola,

Un inversor ha solicitado un retiro:

👤 Nombre: {{user_name}}
📧 Email: {{user_email}}
💵 Tipo: {{withdrawal_type}}
💰 Monto: {{amount}}
🕒 Fecha: {{timestamp}}

Por favor procesar según horarios establecidos.

Saludos,
Sistema Winbit
```

3. **Save** y copiar el **Template ID** (ej: `template_xyz789`)

#### D. Crear Template de Depósito
1. Crear otro template
2. Template Name: `Winbit - Notificación de Depósito`

**Contenido del email:**
```
Subject: 💳 Notificación de depósito - {{user_name}}

Hola,

Un inversor ha notificado un depósito:

👤 Nombre: {{user_name}}
📧 Email: {{user_email}}
💰 Monto: {{amount}}
🌐 Red: {{network}}
🔗 Hash: {{transaction_hash}}
🕒 Fecha: {{timestamp}}

Por favor verificar y procesar.

Saludos,
Sistema Winbit
```

3. **Save** y copiar el **Template ID**

#### E. Obtener Public Key
1. Ir a **"Account"** → **"API Keys"**
2. Copiar el **Public Key** (ej: `abc123xyz789`)

**Dónde poner las credenciales:**
En el archivo `.env`, reemplazar:
```
VITE_EMAILJS_SERVICE_ID=PENDING_FROM_CHUECO
VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL=PENDING_FROM_CHUECO
VITE_EMAILJS_TEMPLATE_ID_DEPOSIT=PENDING_FROM_CHUECO
VITE_EMAILJS_PUBLIC_KEY=PENDING_FROM_CHUECO
```

Por los valores reales copiados.

---

### 3. Wallet Addresses (Opcional)

**Actualizar direcciones de wallet:**
Editar el archivo `src/config/wallets.js` y reemplazar `PENDING_FROM_CHUECO`:

```javascript
export const WALLETS = [
  {
    network: 'Bitcoin (BTC)',
    address: 'bc1q...direccion_real_btc',
    icon: '₿',
  },
  {
    network: 'Ethereum (ETH)',
    address: '0x...direccion_real_eth',
    icon: 'Ξ',
  },
  {
    network: 'USDT (TRC20)',
    address: 'T...direccion_real_trc20',
    icon: '₮',
  },
  {
    network: 'USDT (ERC20)',
    address: '0x...direccion_real_erc20',
    icon: '₮',
  },
];
```

---

## 🧪 Testing Local

### 1. Agregar usuario de prueba en el Sheet

Agregar una fila de test:
```
tu_email@gmail.com | Test User | 10000 | 8000 | 25 | 9000 | 9500 | 10000
```

### 2. Iniciar servidor de desarrollo

```bash
cd /Users/jaime/Desktop/Apps/winbit-app
npm run dev
```

### 3. Probar funcionalidades

- ✅ Login con Google → debe funcionar
- ✅ Dashboard → debe mostrar data del Sheet
- ✅ Gráfico → debe renderizarse
- ✅ Wallets → debe mostrar direcciones
- ✅ Formularios → deben enviar emails a Chueco

### 4. Correr tests

```bash
npm run test:coverage
```

Debe mostrar > 97% coverage.

---

## 🚀 Deploy a Producción

### 1. Verificar configuración

Antes de hacer deploy, verificar que el `.env` tenga todas las credenciales:

```bash
# Ver qué falta configurar:
grep "PENDING_FROM_CHUECO" .env
```

Si no devuelve nada, todo está configurado ✅

### 2. Build

```bash
npm run build
```

Debe completar sin errores.

### 3. Login a Firebase

```bash
firebase login
```

Esto abrirá el browser para autenticar.

### 4. Deploy

```bash
firebase deploy
```

La app estará disponible en:
- https://winbit-6579c.web.app/
- https://winbit-6579c.firebaseapp.com/

### 5. Verificar en producción

1. Abrir el link
2. Hacer login con Google
3. Verificar que todo funciona igual que en local

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor local

# Testing
npm run test             # Correr tests
npm run test:coverage    # Coverage report
npm run test:watch       # Tests en modo watch

# Build
npm run build            # Build para producción
npm run preview          # Preview del build

# Deploy
firebase deploy          # Deploy a Firebase Hosting
```

---

## 📁 Archivos Importantes

- **`.env`** - Variables de entorno (credenciales)
- **`src/config/wallets.js`** - Direcciones de wallets
- **`README.md`** - Documentación técnica completa
- **`firebase.json`** - Configuración de Firebase Hosting

---

## 🆘 Troubleshooting

### "Investor not found in database"
→ Verificar que el email del usuario existe en Columna A del Sheet

### "Email service not configured yet"
→ Completar las credenciales de EmailJS en `.env`

### Build fails
→ Correr `npm install` de nuevo

### Deploy fails
→ Verificar que estás logueado: `firebase login`

---

## 📞 Contacto

Para cualquier problema durante la configuración o deploy:
- Email: jaimegarciamendez@gmail.com

---

## ✅ Checklist Final

Antes de considerar el proyecto terminado:

- [ ] Google Sheet ID configurado en `.env`
- [ ] EmailJS Service ID configurado
- [ ] EmailJS Template IDs configurados (withdrawal + deposit)
- [ ] EmailJS Public Key configurado
- [ ] Wallet addresses configuradas en `wallets.js`
- [ ] Test con usuario real en el Sheet
- [ ] Formularios envían emails correctamente
- [ ] Build funciona sin errores
- [ ] Deploy exitoso a Firebase
- [ ] App funciona en producción
- [ ] Compartir link con inversores

**Cuando todo esté ✅, la app está lista para usar!** 🎉
