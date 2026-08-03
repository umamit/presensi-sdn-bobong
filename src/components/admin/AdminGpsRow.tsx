import React from 'react';
import { SchoolSettings } from '../../types';
import { MapPin } from 'lucide-react';

interface AdminGpsRowProps {
  schoolSettings: SchoolSettings;
  onOpenSettingsModal: () => void;
}

export const AdminGpsRow: React.FC<AdminGpsRowProps> = ({ schoolSettings, onOpenSettingsModal }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(28, 28, 30, 0.6)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
    padding: '1rem 1.25rem', flexWrap: 'wrap', gap: '1rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <div style={{ background: 'rgba(10, 132, 255, 0.15)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MapPin size={20} color="#0a84ff" />
      </div>
      <div>
        <strong style={{ fontSize: '0.92rem', color: '#ffffff', display: 'block' }}>
          Area GPS Presensi: {schoolSettings.schoolName}
        </strong>
        <span style={{ fontSize: '0.78rem', color: '#8e8e93' }}>
          Koordinat ({schoolSettings.latitude}, {schoolSettings.longitude}) • Max Radius: <strong>{schoolSettings.radiusMeters}m</strong> • Shift Pagi (06:00-12:00) & Shift Siang (12:00-16:45) WIT
        </span>
      </div>
    </div>
    <button onClick={onOpenSettingsModal} className="btn btn-secondary" style={{ fontSize: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)' }}>
      Ubah Titik GPS
    </button>
  </div>
);
