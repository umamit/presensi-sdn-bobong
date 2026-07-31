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
 * Format jam menit dari ISO String atau HH:mm:ss
 */
export function formatTime(isoString?: string): string {
  if (!isoString) return '--:-- WIT';
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' WIT';
}

/**
 * Format tanggal Indonesia (Contoh: Jumat, 31 Juli 2026)
 */
export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
