import React from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, UserMinus, LogOut } from 'lucide-react';

interface AdminStatBarProps {
  totalGuru: number;
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalBelumAbsen: number;
  totalSudahPulang: number; // Fix #14
}

export const AdminStatBar: React.FC<AdminStatBarProps> = ({
  totalGuru, totalHadir, totalTerlambat, totalIzin, totalBelumAbsen, totalSudahPulang
}) => {
  const stats = [
    { label: 'Total Guru',      value: totalGuru,         icon: <Users size={16} />,        color: 'var(--text-muted)' },
    { label: 'Hadir Pagi/Siang', value: totalHadir,        icon: <CheckCircle size={16} />,  color: 'var(--success)' },
    { label: 'Terlambat',        value: totalTerlambat,    icon: <Clock size={16} />,        color: 'var(--warning)' },
    { label: 'Izin Disetujui',   value: totalIzin,         icon: <AlertTriangle size={16} />, color: 'var(--primary)' },
    { label: 'Sudah Pulang',     value: totalSudahPulang,  icon: <LogOut size={16} />,       color: '#34d399' }, // Fix #14
    { label: 'Belum Presensi',   value: totalBelumAbsen,   icon: <UserMinus size={16} />,    color: 'var(--danger)' },
  ];

  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '0.85rem',
        width: '100%'
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="glass-panel"
          style={{
            padding: '1rem 1.15rem',
            background: '#18181b', // Zinc background
            borderColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            transition: 'border-color 0.2s, transform 0.15s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.01em' }}>{stat.label}</span>
            <div style={{ color: stat.color, opacity: 0.8 }}>
              {stat.icon}
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};
