const VERCEL_VERSION_URL = 'https://presensi-sdn-bobong.vercel.app/version.json';

interface VersionInfo {
  version: string;
  buildTime: number;
}

// Ambil version.json yang terbundel di APK (lokal)
async function getLocalVersion(): Promise<VersionInfo | null> {
  try {
    const res = await fetch('/version.json');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Ambil version.json dari Vercel live
async function getLiveVersion(): Promise<VersionInfo | null> {
  try {
    const res = await fetch(`${VERCEL_VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface VersionCheckResult {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
}

// Bandingkan versi lokal (bundel APK) vs versi live (Vercel)
export async function checkForUpdate(): Promise<VersionCheckResult> {
  const [local, live] = await Promise.all([getLocalVersion(), getLiveVersion()]);

  const currentVersion = local?.version || '1.0.0';
  const latestVersion = live?.version || currentVersion;
  const localBuildTime = local?.buildTime || 0;
  const liveBuildTime = live?.buildTime || 0;

  // Update tersedia jika build di server lebih baru dari yang terbundel di APK
  const isUpdateAvailable = liveBuildTime > localBuildTime;

  return { isUpdateAvailable, currentVersion, latestVersion };
}
