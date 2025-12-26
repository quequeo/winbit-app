# 📸 Instrucciones para el Logo

## Tamaños Necesarios

Para que la PWA funcione correctamente, necesitamos el logo en estos tamaños:

### 1. **icon-192x192.png**
- Tamaño: 192x192 pixels
- Ubicación: `/public/icon-192x192.png`
- Uso: PWA en Android

### 2. **icon-512x512.png**
- Tamaño: 512x512 pixels
- Ubicación: `/public/icon-512x512.png`
- Uso: PWA en Android (splash screen)

### 3. **apple-touch-icon.png**
- Tamaño: 180x180 pixels
- Ubicación: `/public/apple-touch-icon.png`
- Uso: PWA en iOS

### 4. **favicon.ico**
- Tamaño: 32x32 pixels (multi-size ICO)
- Ubicación: `/public/favicon.ico`
- Uso: Tab del navegador

## 🛠️ Cómo Generar los Tamaños

### Opción 1: Usar herramienta online (Más fácil)

1. **Favicon Generator:**
   - Ir a: https://realfavicongenerator.net/
   - Subir el logo
   - Descargar el paquete completo
   - Copiar todos los archivos a `/public/`

2. **PWA Asset Generator:**
   - Ir a: https://www.pwabuilder.com/imageGenerator
   - Subir el logo
   - Descargar los iconos
   - Copiar a `/public/`

### Opción 2: Redimensionar manualmente

Si tenés el logo en alta resolución, podés usar:

**En Mac:**
- Preview app (Abrir imagen → Tools → Adjust Size)
- Redimensionar a cada tamaño y guardar

**Online:**
- https://www.iloveimg.com/resize-image
- Subir logo
- Redimensionar a cada tamaño
- Descargar

**Photoshop/Figma/etc:**
- Export as PNG en cada tamaño

## 📁 Estructura Final

```
public/
├── icon-192x192.png      ← Logo 192x192
├── icon-512x512.png      ← Logo 512x512
├── apple-touch-icon.png  ← Logo 180x180
├── favicon.ico           ← Favicon 32x32
└── robots.txt
```

## ✅ Checklist

- [ ] Crear icon-192x192.png
- [ ] Crear icon-512x512.png
- [ ] Crear apple-touch-icon.png
- [ ] Crear favicon.ico
- [ ] Colocar todos en `/public/`
- [ ] Rebuild: `npm run build`
- [ ] Verificar que aparece en tab del browser

## 🎨 Recomendaciones

- **Fondo:** Preferiblemente transparente o blanco
- **Formato:** PNG con transparencia (excepto favicon.ico)
- **Calidad:** Máxima resolución posible
- **Margen:** Dejar un pequeño margen alrededor del logo (10-15%)

## 🔄 Después de agregar el logo

1. Rebuild la app:
   ```bash
   npm run build
   ```

2. Restart dev server si está corriendo:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

3. Verificar en el browser:
   - Favicon aparece en la tab
   - PWA manifest tiene los iconos correctos

---

**¿Necesitás ayuda?** Pasame el logo y te ayudo a generar todos los tamaños.

