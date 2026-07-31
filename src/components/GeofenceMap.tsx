import React from 'react';
import { ShieldCheck, MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

interface GeofenceMapProps {
  userCoords: { lat: number; lng: number } | null;
  centerCoords: { lat: number; lng: number };
  polygonCoords?: Array<[number, number]>;
  radiusMeters: number;
  isInRadius: boolean;
  distanceMeters: number | null;
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  userCoords,
  centerCoords,
  polygonCoords,
  radiusMeters,
  isInRadius,
  distanceMeters
}) => {
  // Koordinat polygon KML atau fallback polygon box
  const poly = polygonCoords || [
    [centerCoords.lat - 0.0003, centerCoords.lng - 0.0003],
    [centerCoords.lat - 0.0003, centerCoords.lng + 0.0003],
    [centerCoords.lat + 0.0003, centerCoords.lng + 0.0003],
    [centerCoords.lat + 0.0003, centerCoords.lng - 0.0003]
  ];

  // Hitung bounding box untuk konversi koordinat GPS [lat, lng] ke SVG viewBox (200 x 200)
  const lats = poly.map(p => p[0]);
  const lngs = poly.map(p => p[1]);

  if (userCoords) {
    lats.push(userCoords.lat);
    lngs.push(userCoords.lng);
  }

  const minLat = Math.min(...lats) - 0.0001;
  const maxLat = Math.max(...lats) + 0.0001;
  const minLng = Math.min(...lngs) - 0.0001;
  const maxLng = Math.max(...lngs) + 0.0001;

  const latRange = maxLat - minLat || 0.0008;
  const lngRange = maxLng - minLng || 0.0008;

  // Function konversi GPS ke koordinat SVG Canvas (300 x 220)
  const mapToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / lngRange) * 260 + 20;
    // Latitude makin besar di GPS = posisi makin di atas (y makin kecil di SVG)
    const y = 200 - (((lat - minLat) / latRange) * 160 + 20);
    return { x, y };
  };

  // Titik SVG Polygon
  const svgPolygonPoints = poly
    .map(p => {
      const pt = mapToSvg(p[0], p[1]);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const centerPt = mapToSvg(centerCoords.lat, centerCoords.lng);
  const userPt = userCoords ? mapToSvg(userCoords.lat, userCoords.lng) : null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem', background: 'rgba(11, 15, 25, 0.95)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Peta Visual Geofencing (KML Area Presensi)</h4>
        </div>

        <span className={`badge ${isInRadius ? 'badge-hadir' : 'badge-alfa'}`} style={{ fontSize: '0.78rem' }}>
          {isInRadius ? 'Dalam Zone Presensi' : 'Di Luar Zone Presensi'}
        </span>
      </div>

      {/* SVG Canvas Map Render */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: '#090d16', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Grid Background Pattern */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Draw Polygon Geofence Zone from KML */}
          <polygon
            points={svgPolygonPoints}
            fill={isInRadius ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.12)'}
            stroke={isInRadius ? '#10b981' : '#ef4444'}
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Center Point Icon */}
          <circle cx={centerPt.x} cy={centerPt.y} r="6" fill="#6366f1" opacity="0.8" />
          <circle cx={centerPt.x} cy={centerPt.y} r="12" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />

          {/* Draw Line from Center to User */}
          {userPt && (
            <line
              x1={centerPt.x}
              y1={centerPt.y}
              x2={userPt.x}
              y2={userPt.y}
              stroke={isInRadius ? '#34d399' : '#f87171'}
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* User Marker */}
          {userPt && (
            <g transform={`translate(${userPt.x}, ${userPt.y})`}>
              <circle r="9" fill={isInRadius ? '#10b981' : '#ef4444'} opacity="0.3" />
              <circle r="5" fill={isInRadius ? '#34d399' : '#f87171'} stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Legend Overlay */}
        <div style={{ position: 'absolute', bottom: '8px', left: '10px', background: 'rgba(15,23,42,0.85)', padding: '0.4rem 0.7rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.72rem', display: 'flex', gap: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></span> Titik Pusat Sekolah
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isInRadius ? '#34d399' : '#f87171' }}></span> Posisi Anda ({distanceMeters ?? 0}m)
          </span>
        </div>

        <div style={{ position: 'absolute', top: '8px', right: '10px', background: 'rgba(15,23,42,0.85)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--secondary)' }}>
          Geofence KML (4-Point Boundary)
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>Koordinat Anda: <strong>{userCoords ? `${userCoords.lat.toFixed(6)}, ${userCoords.lng.toFixed(6)}` : 'Mendeteksi...'}</strong></span>
        <span>Koordinat Sekolah: <strong>{centerCoords.lat.toFixed(6)}, {centerCoords.lng.toFixed(6)}</strong></span>
      </div>
    </div>
  );
};
