/**
 * Menghitung jarak antara dua koordinat GPS (latitude, longitude) menggunakan Haversine Formula dalam satuan Meter.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // return dalam meter (dibulatkan)
}

/**
 * Pengecekan Point-in-Polygon (Ray-Casting Algorithm) untuk Geofence Area Presensi KML
 */
export function isPointInPolygon(
  point: [number, number], // [latitude, longitude]
  vs: Array<[number, number]> // Array of [latitude, longitude]
): boolean {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Format jam menit dari ISO String atau HH:mm:ss dengan proteksi Safari iOS (iPhone)
 */
export function formatTime(isoString?: string): string {
  if (!isoString) return '--:-- WIT';
  
  let cleanString = isoString;
  if (typeof isoString === 'string') {
    cleanString = isoString.replace(/\s+/g, 'T'); // Ganti spasi dengan T untuk standarisasi ISO
  }

  const date = new Date(cleanString);
  if (isNaN(date.getTime())) {
    // Fallback: Ambil HH:MM menggunakan regex jika parser native browser gagal
    const timeMatch = isoString.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]} WIT`;
    }
    return '--:-- WIT';
  }

  return date.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jayapura',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' WIT';
}

/**
 * Format tanggal Indonesia (Contoh: Jumat, 31 Juli 2026) dengan proteksi Safari iOS (iPhone)
 */
export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '';
  
  let cleanString = dateStr;
  if (typeof dateStr === 'string') {
    cleanString = dateStr.replace(/\s+/g, 'T');
  }

  const date = new Date(cleanString);
  if (isNaN(date.getTime())) {
    // Fallback: Parsing manual jika Invalid Date di Safari
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const day = parseInt(parts[2], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      return `${day} ${months[monthIndex]} ${year}`;
    }
    return dateStr;
  }

  return date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jayapura',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Mengembalikan tanggal lokal saat ini (YYYY-MM-DD) sesuai zona waktu perangkat
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mendeteksi platform aplikasi yang digunakan (Capacitor APK, PWA Standalone, atau Web Browser biasa)
 */
export function detectAppType(): string {
  const win = window as any;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
  const isCapacitor = !!win.Capacitor?.isNativePlatform();

  if (isCapacitor) {
    return 'APK Android';
  } else if (isStandalone) {
    return 'PWA Standalone';
  } else {
    return 'Browser Web';
  }
}

