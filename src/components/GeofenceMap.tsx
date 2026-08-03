import React, { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon Leaflet yang rusak saat di-bundle Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GeofenceMapProps {
  userCoords: { lat: number; lng: number } | null;
  centerCoords: { lat: number; lng: number };
  radiusMeters: number;
  isInRadius: boolean;
  distanceMeters: number | null;
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  userCoords,
  centerCoords,
  radiusMeters,
  isInRadius,
  distanceMeters,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);

  // Inisialisasi peta sekali saja
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: [centerCoords.lat, centerCoords.lng],
      zoom: 17,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
    }).addTo(map);

    // Marker sekolah (biru)
    const schoolIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#6366f1;border:2px solid #fff;box-shadow:0 0 6px #6366f1;"></div>`,
      className: '',
      iconAnchor: [7, 7],
    });
    schoolMarkerRef.current = L.marker([centerCoords.lat, centerCoords.lng], { icon: schoolIcon })
      .addTo(map)
      .bindPopup('📍 Titik Pusat Sekolah');

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user marker & radius circle setiap kali coords berubah
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const color = isInRadius ? '#10b981' : '#ef4444';

    // Hapus marker & circle lama
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
    if (radiusCircleRef.current) { radiusCircleRef.current.remove(); radiusCircleRef.current = null; }

    // Lingkaran radius sekolah
    radiusCircleRef.current = L.circle([centerCoords.lat, centerCoords.lng], {
      radius: radiusMeters,
      color,
      fillColor: color,
      fillOpacity: 0.18,
      weight: 2,
    }).addTo(map);

    // Marker posisi guru
    if (userCoords) {
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 0 8px ${color};"></div>`,
        className: '',
        iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`📡 Posisi Anda (${distanceMeters ?? 0}m dari sekolah)`);

      // Fit map agar tampilkan kedua titik
      const bounds = L.latLngBounds(
        [centerCoords.lat, centerCoords.lng],
        [userCoords.lat, userCoords.lng]
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }
  }, [userCoords, isInRadius, radiusMeters, distanceMeters]);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem', background: 'rgba(11, 15, 25, 0.95)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Peta Geofencing Presensi</h4>
        </div>
        <span className={`badge ${isInRadius ? 'badge-hadir' : 'badge-alfa'}`} style={{ fontSize: '0.78rem' }}>
          {isInRadius ? 'Dalam Zone Presensi' : 'Di Luar Zone Presensi'}
        </span>
      </div>

      {/* Leaflet Map Container */}
      <div
        ref={mapDivRef}
        style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', zIndex: 0 }}
      />

      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>Posisi Anda: <strong>{userCoords ? `${userCoords.lat.toFixed(6)}, ${userCoords.lng.toFixed(6)}` : 'Mendeteksi...'}</strong></span>
        <span>Sekolah: <strong>{centerCoords.lat.toFixed(6)}, {centerCoords.lng.toFixed(6)}</strong></span>
      </div>
    </div>
  );
};
