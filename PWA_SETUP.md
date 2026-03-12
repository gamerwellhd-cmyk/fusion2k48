# PWA Configuration Guide

## PWA Setup Complete ✅

Your 2048 Fusion game is now configured as a Progressive Web App!

### Features
- ✅ Installable on mobile devices
- ✅ Works offline with service worker
- ✅ One-click install prompt in splash screen
- ✅ Fast loading with asset caching
- ✅ Add to home screen capability

### Installation Methods

#### Method 1: Chrome/Edge on Android
1. Open the game at `https://your-domain.vercel.app`
2. Tap the install bubble in top-right corner
3. Confirm installation

#### Method 2: Safari on iOS
1. Open the game in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

#### Method 3: Chrome Desktop
1. Open the game
2. Click the install icon in address bar
3. Confirm installation

### Vercel Deployment

**Deploy Automático Ativado** 🚀

Seu projeto já está conectado à Vercel. Para atualizar o site, basta enviar seus commits para o repositório:
```bash
git push
```
A Vercel fará o build e o deploy da nova versão automaticamente em instantes.

### Local Testing
```bash
npm run dev
# Open http://localhost:5173
```

### Testing PWA Features
1. **Install Prompt**: Should appear in top-right on first visit
2. **Service Worker**: Open DevTools → Application → Service Workers
3. **Offline Mode**: DevTools → Network → Offline, refresh page
4. **Manifest**: Check DevTools → Application → Manifest

### Icons
Place your app icons in `/public/`:
- `icon-192x192.svg` (192x192 pixels)
- `icon-512x512.svg` (512x512 pixels)

Currently using placeholder icons. Replace with your own for best experience.

### Security
- Service worker caches static assets only
- Firebase requests bypass cache for fresh data
- HTTPS required for production PWA

### Troubleshooting

**Install prompt not showing?**
- Check browser DevTools for errors
- Ensure on HTTPS (Vercel provides this automatically)
- Try incognito/private window
- Some browsers require specific conditions

**Service worker not caching?**
- Check browser DevTools → Service Workers
- Clear cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
- Check network tab to see cached responses (shows "ServiceWorker")

**App not working offline?**
- Service worker must be registered (check DevTools)
- Only GET requests are cached
- Firebase requests need internet connection

---
Version: 1.0 | Updated: 2026-03-12
