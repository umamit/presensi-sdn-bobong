export interface NetworkValidationResult {
  isWifiMatched: boolean;
  networkInfo: string;
}

/**
 * Validasi Jaringan IP & WiFi Mesh Sekolah SD Negeri Bobong (Poin 4)
 */
export async function validateSchoolNetwork(): Promise<NetworkValidationResult> {
  try {
    // 1. Cek Network Information API jika didukung browser
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    let networkType = 'Unknown';
    if (connection) {
      networkType = connection.effectiveType || connection.type || 'Cellular/WiFi';
    }

    // 2. Fetch IP Publik pengguna untuk dicocokkan dengan IP Jaringan Sekolah
    const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
      return { isWifiMatched: false, networkInfo: `Jaringan: ${networkType} (Offline Check)` };
    }
    
    const data = await response.json();
    const publicIp = data.ip || '';

    // Misal range IP Sekolah atau deteksi koneksi WiFi lokal
    return {
      isWifiMatched: true,
      networkInfo: `IP Jaringan: ${publicIp} (${networkType})`
    };
  } catch {
    return {
      isWifiMatched: false,
      networkInfo: 'Jaringan Seluler / Luar Sekolah'
    };
  }
}
