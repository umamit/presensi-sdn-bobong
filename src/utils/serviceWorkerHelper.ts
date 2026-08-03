/**
 * Utility untuk memaksa registrasi Service Worker memperbarui cache (No-Cache Reload)
 */
export function registerFreshServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.location.reload();
              }
            };
          }
        });
      }).catch((err) => console.warn('SW register error:', err));
    });
  }
}
