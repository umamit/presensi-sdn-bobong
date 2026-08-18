export interface NetworkValidationResult {
  isWifiMatched: boolean;
  networkInfo: string;
}

/**
 * Validasi Jaringan IP & WiFi Mesh Sekolah SD Negeri Bobong (Poin 4)
 */
export async function validateSchoolNetwork(): Promise<NetworkValidationResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { isWifiMatched: false, networkInfo: 'Koneksi: Offline / Luar Jaringan' };
  }
  try {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    let networkType = 'Seluler';
    if (connection) {
      const type = connection.type || '';
      const effectiveType = connection.effectiveType || '';
      if (type === 'wifi' || effectiveType.includes('wifi')) {
        networkType = 'WiFi';
      } else if (type === 'cellular') {
        networkType = 'Seluler';
      } else {
        networkType = effectiveType.toUpperCase() || 'Seluler';
      }
    }

    // Pengecekan IP Publik
    const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
      return { isWifiMatched: false, networkInfo: `Koneksi: ${networkType} (Offline)` };
    }
    
    const data = await response.json();
    const publicIp = data.ip || '';

    return {
      isWifiMatched: false, // Set false karena penentu radius utama murni adalah koordinat GPS
      networkInfo: `Koneksi: ${networkType} (${publicIp})`
    };
  } catch {
    return {
      isWifiMatched: false,
      networkInfo: 'Koneksi: Seluler / Luar Jaringan'
    };
  }
}
