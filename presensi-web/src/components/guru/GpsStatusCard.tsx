import React from 'react';
import { SchoolSettings } from '../../types';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface GpsStatusCardProps {
  isInRadius: boolean;
  distance: number | null;
  gpsLoading: boolean;
  gpsError: string | null;
  userCoords: { lat: number; lng: number } | null;
  schoolSettings: SchoolSettings;
  fetchGpsLocation: () => void;
}

export const GpsStatusCard: React.FC<GpsStatusCardProps> = ({
  isInRadius,
  distance,
  gpsLoading,
  gpsError,
  userCoords,
  schoolSettings,
  fetchGpsLocation
}) => {
  return (
    <div className="ios-group">
      <div className="ios-row" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className={`gps-pulse ${!isInRadius ? 'gps-pulse-out' : ''}`} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Lokasi GPS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isInRadius ? 'var(--success)' : 'var(--danger)' }}>
            {distance !== null ? `${distance}m — ${isInRadius ? 'Dalam Radius' : 'Di Luar'}` : 'Mendeteksi...'}
          </span>
          <button
            onClick={fetchGpsLocation}
            disabled={gpsLoading}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={12} className={gpsLoading ? 'spin' : ''} />
            {gpsLoading ? 'GPS...' : 'Refresh'}
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="ios-row" style={{ background: 'var(--danger-bg)' }}>
          <AlertTriangle size={14} color="var(--danger)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--danger)', lineHeight: 1.4 }}>{gpsError}</span>
        </div>
      )}

      {distance !== null && (
        <div style={{ padding: '0 1rem 0.85rem' }}>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (distance / (schoolSettings.radiusMeters * 2)) * 100)}%`,
              height: '100%',
              background: isInRadius ? 'var(--success)' : 'var(--danger)',
              borderRadius: '2px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
            <span>Batas: {schoolSettings.radiusMeters}m</span>
            <span>{userCoords?.lat.toFixed(5)}, {userCoords?.lng.toFixed(5)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
