import React from 'react';
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AdminStatBarProps {
  totalGuru: number;
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalBelumAbsen: number;
}

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px', flex: '1 1 120px' }}>
    {icon}
    <span style={{ fontSize: '0.82rem', color: '#8e8e93', whiteSpace: 'nowrap' }}>{label}</span>
    <strong style={{ fontSize: '0.92rem', marginLeft: 'auto' }}>{value}</strong>
  </div>
);

export const AdminStatBar: React.FC<AdminStatBarProps> = ({
  totalGuru, totalHadir, totalTerlambat, totalIzin, totalBelumAbsen
}) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    background: 'rgba(28, 28, 30, 0.6)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
    padding: '0.85rem 1rem', gap: '0.75rem'
  }}>
    <StatItem icon={<Users size={15} color="#8e8e93" />} label="Total Guru" value={<span style={{ color: '#fff' }}>{totalGuru}</span>} />
    <StatItem icon={<CheckCircle size={15} color="#30d158" />} label="Hadir" value={<span style={{ color: '#30d158' }}>{totalHadir}</span>} />
    <StatItem icon={<Clock size={15} color="#ff9f0a" />} label="Terlambat" value={<span style={{ color: '#ff9f0a' }}>{totalTerlambat}</span>} />
    <StatItem icon={<CheckCircle size={15} color="#0a84ff" />} label="Izin" value={<span style={{ color: '#0a84ff' }}>{totalIzin}</span>} />
    <StatItem icon={<AlertTriangle size={15} color="#ff453a" />} label="Belum Absen" value={<span style={{ color: '#ff453a' }}>{totalBelumAbsen}</span>} />
  </div>
);
