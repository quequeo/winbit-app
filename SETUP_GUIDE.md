# Winbit App - Setup Guide

Esta guía te ayudará a completar la configuración del proyecto con las credenciales de Chueco.

## ✅ Ya Configurado

- ✅ Firebase project (winbit-6579c)
- ✅ Firebase Authentication (Google Sign-In enabled)
- ✅ Google Sheets API Key
- ✅ Proyecto completo con código y tests

## 📋 Pendiente de Chueco

### 1. Google Sheet ID

**Necesitamos:**
- El ID del Google Sheet donde está la data de los inversores

**Cómo obtenerlo:**
- En la URL del Sheet: `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`
- Copiar solo el ID (la parte entre `/d/` y `/edit`)

**Dónde colocarlo:**
- Archivo `.env`, reemplazar `PENDING_FROM_CHUECO` en:
  ```
  VITE_GOOGLE_SHEETS_ID=AQUI_VA_EL_ID
  ```

**Estructura requerida del Sheet:**
```
| Columna A           | Columna B | Columna C  | Columna D      | Columna E     | Columnas F+ |
|---------------------|-----------|------------|----------------|---------------|-------------|
| Email del inversor  | Nombre    | Balance    | Total Invertido| Returns (%)   | Data histórica |
| test@example.com    | Juan Perez| 10000      | 8000           | 25            | 9000, 9500... |
```

### 2. EmailJS (Chueco debe configurar)

**Pasos para Chueco:**

1. **Ir a:** https://www.emailjs.com/
2. **Registrarse** con su email de Winbit (@winbit.com o el que use)
3. **Add New Service:**
   - Elegir Gmail (o su proveedor)
   - Conectar su email de Winbit
   - Copiar el **Service ID**

4. **Create Email Templates** (necesita 2):

   **Template 1: Withdrawal Request**
   ```
   Subject: 💰 Nueva solicitud de retiro - {{user_name}}
   
   Hola,
   
   Un inversor ha solicitado un retiro:
   
   👤 Nombre: {{user_name}}
   📧 Email: {{user_email}}
   💵 Tipo: {{withdrawal_type}}
   💰 Monto: {{amount}}
   🕒 Fecha: {{timestamp}}
   
   Saludos,
   Sistema Winbit
   ```
   - Copiar el **Template ID** (ej: template_withdrawal_123)

   **Template 2: Deposit Notification**
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
   
   Saludos,
   Sistema Winbit
   ```
   - Copiar el **Template ID** (ej: template_deposit_456)

5. **Copiar Public Key:**
   - Ir a "Account" → "API Keys"
   - Copiar el **Public Key**

**Dónde colocar las credenciales:**
Archivo `.env`, reemplazar los `PENDING_FROM_CHUECO`:
```
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL=template_xxx
VITE_EMAILJS_TEMPLATE_ID_DEPOSIT=template_xxx
VITE_EMAILJS_PUBLIC_KEY=xxx
```

### 3. Wallet Addresses

**Necesitamos:**
Lista de direcciones de wallet por red para depósitos.

**Ejemplo:**
```
- Bitcoin (BTC): bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
- Ethereum (ETH): 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
- USDT TRC20: TXYZaPzUeZVfykd62FhkWqj8oBnHNzLhLx
- USDT ERC20: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Dónde colocarlas:**
Archivo `src/config/wallets.js`, reemplazar `PENDING_FROM_CHUECO`:
```javascript
export const WALLETS = [
  {
    network: 'Bitcoin (BTC)',
    address: 'LA_DIRECCION_REAL_AQUI',
    icon: '₿',
  },
  // ... etc
];
```

### 4. Logo (Opcional para V1)

**Si Chueco tiene logo:**
- Formato: SVG o PNG alta resolución
- Colocar en `public/` con nombres:
  - `icon-192x192.png` (192x192 pixels)
  - `icon-512x512.png` (512x512 pixels)
  - `apple-touch-icon.png` (180x180 pixels)
  - `favicon.ico`

**Por ahora:**
- Usaremos placeholder o solo texto "Winbit"
- Lo podemos agregar después

## 🚀 Testing Antes de Producción

### Test con datos de prueba:

1. **Agregar usuario de prueba en el Sheet:**
   ```
   test@gmail.com | Test User | 10000 | 8000 | 25 | 9000 | 9500 | 10000
   ```

2. **Probar localmente:**
   ```bash
   npm install
   npm run dev
   ```

3. **Verificar:**
   - ✅ Login con Google funciona
   - ✅ Se muestra el dashboard con data del Sheet
   - ✅ Gráfico se renderiza
   - ✅ Wallets se muestran
   - ✅ Formularios de retiro/depósito envían emails

4. **Correr tests:**
   ```bash
   npm run test:coverage
   ```
   - Debe mostrar > 97% coverage

## 📦 Deploy a Producción

Cuando todo esté configurado y probado:

```bash
# 1. Build
npm run build

# 2. Deploy a Firebase Hosting
firebase deploy
```

La app estará en:
- https://winbit-6579c.web.app/
- https://winbit-6579c.firebaseapp.com/

## 🔒 Security Checklist

Antes de producción, verificar:

- [ ] Google Sheets API key restringida solo a "Google Sheets API"
- [ ] Sheet compartido solo como "viewer" (no edit)
- [ ] Firebase Auth domain configurado correctamente
- [ ] `.env` no está en git (está en `.gitignore`)
- [ ] EmailJS configurado con email de Chueco

## 📞 Contacto

Si hay algún problema o pregunta durante la configuración:
- Email: jaimegarciamendez@gmail.com

