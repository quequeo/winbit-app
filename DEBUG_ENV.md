# 🐛 Debug: Firebase API Key Error

## El Problema

Vite no está leyendo las variables de entorno del archivo `.env`.

## ✅ Solución Rápida

### Paso 1: Verificar que existe `.env`

Abrí tu terminal y corre:

```bash
cd /Users/jaime/Desktop/Apps/winbit-app
ls -la .env*
```

Deberías ver:
- `.env`
- `.env.development`
- `.env.production`

### Paso 2: Verificar contenido del `.env`

Abrí el archivo `.env` en el editor y **verificá que tenga EXACTAMENTE esto** (sin espacios extra, sin comentarios antes):

```env
VITE_FIREBASE_API_KEY=AIzaSyDZFh5KhyLj_N7MdjvlGzeniKcKARG89nM
VITE_FIREBASE_AUTH_DOMAIN=winbit-6579c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=winbit-6579c
VITE_FIREBASE_STORAGE_BUCKET=winbit-6579c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=242660530030
VITE_FIREBASE_APP_ID=1:242660530030:web:846703eb4ae3d6b1f5d37f
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyB-n7mX43BA33mUdZkU_6q-C_YHzOOp3Ro
VITE_GOOGLE_SHEETS_ID=PENDING_FROM_CHUECO
VITE_EMAILJS_SERVICE_ID=PENDING_FROM_CHUECO
VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL=PENDING_FROM_CHUECO
VITE_EMAILJS_TEMPLATE_ID_DEPOSIT=PENDING_FROM_CHUECO
VITE_EMAILJS_PUBLIC_KEY=PENDING_FROM_CHUECO
```

**⚠️ IMPORTANTE:**
- NO debe haber espacios alrededor del `=`
- NO debe haber comillas `""` alrededor de los valores
- La primera línea debe ser una variable, NO un comentario

### Paso 3: Reiniciar COMPLETAMENTE el servidor

```bash
# 1. Detener el servidor (Ctrl+C)

# 2. Limpiar caché
rm -rf node_modules/.vite

# 3. Volver a iniciar
npm run dev
```

### Paso 4: Verificar que Vite carga las variables

Agregá esto temporalmente en `src/main.jsx` al principio (para debug):

```javascript
console.log('🔥 Firebase Config Check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});
```

Guardá y mirá la consola del browser. Deberías ver los valores correctos.

## 🔍 Otras Posibles Causas

### Causa 1: Firebase Auth no habilitado

1. Ir a Firebase Console: https://console.firebase.google.com/
2. Seleccionar proyecto "Winbit" (winbit-6579c)
3. Ir a **Authentication**
4. Click en **Sign-in method**
5. Verificar que **Google** esté **Enabled** ✅

Si está deshabilitado:
- Click en Google
- Toggle "Enable"
- Guardar

### Causa 2: Dominio no autorizado

En Firebase Console → Authentication → Settings → Authorized domains:

Debe incluir:
- `localhost`
- `winbit-6579c.firebaseapp.com`
- `winbit-6579c.web.app`

Si falta `localhost`, agregalo.

### Causa 3: API Key incorrecta

Verificá de nuevo en Firebase Console:
1. Project Settings (⚙️)
2. Scroll down a "Your apps"
3. Seleccioná tu web app
4. Copiá el `apiKey` que aparece

Debe ser: `AIzaSyDZFh5KhyLj_N7MdjvlGzeniKcKARG89nM`

## 🧪 Test Rápido

Si seguís teniendo el error, probá este test:

Creá un archivo `test-firebase.html` en la raíz:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Firebase Test</title>
</head>
<body>
  <h1>Firebase Auth Test</h1>
  <div id="result"></div>
  
  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

    const firebaseConfig = {
      apiKey: "AIzaSyDZFh5KhyLj_N7MdjvlGzeniKcKARG89nM",
      authDomain: "winbit-6579c.firebaseapp.com",
      projectId: "winbit-6579c",
      storageBucket: "winbit-6579c.firebasestorage.app",
      messagingSenderId: "242660530030",
      appId: "1:242660530030:web:846703eb4ae3d6b1f5d37f"
    };

    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      document.getElementById('result').innerHTML = '✅ Firebase initialized successfully!';
      console.log('Auth:', auth);
    } catch (error) {
      document.getElementById('result').innerHTML = '❌ Error: ' + error.message;
      console.error(error);
    }
  </script>
</body>
</html>
```

Abrí ese archivo en el browser directamente. Si funciona ahí pero no en la app, el problema es el `.env`.

## 📞 Si nada funciona

Corré esto y mandame el output:

```bash
cd /Users/jaime/Desktop/Apps/winbit-app
echo "=== Checking .env files ==="
ls -la .env*
echo ""
echo "=== First 5 lines of .env ==="
head -5 .env
echo ""
echo "=== Environment variables in runtime ==="
npm run dev 2>&1 | head -20
```

