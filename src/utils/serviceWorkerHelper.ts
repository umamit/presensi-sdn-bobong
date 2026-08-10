// Versi rilis aplikasi saat ini (Naikkan ini untuk memaksa bersih cache di HP guru)
const CURRENT_APP_VERSION = 'sdn_bobong_v1.0.5';

/**
 * Utility untuk memaksa registrasi Service Worker memperbarui cache (No-Cache Reload)
 */
export async function registerFreshServiceWorker(): Promise<void> {
  // Bersihkan cache paksa jika versi aplikasi di perangkat pengguna berbeda
  if ('caches' in window) {
    const savedVersion = localStorage.getItem('sdn_bobong_cache_version');
    if (savedVersion !== CURRENT_APP_VERSION) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        localStorage.setItem('sdn_bobong_cache_version', CURRENT_APP_VERSION);
        console.log('Pembersihan cache paksa sukses untuk versi:', CURRENT_APP_VERSION);
        window.location.reload();
        return;
      } catch (err) {
        console.warn('Gagal menghapus cache:', err);
      }
    }
  }

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
