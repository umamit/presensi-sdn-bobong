import React from 'react';
import { UserProfile, SchoolSettings } from '../../types';
import { formatDateIndo } from '../../utils/haversine';
import { Clock, Calendar, User } from 'lucide-react';

interface GuruHeaderProps {
  user: UserProfile;
  currentTime: Date;
  schoolSettings: SchoolSettings;
}

export const GuruHeader: React.FC<GuruHeaderProps> = ({ user, currentTime, schoolSettings }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '0.25rem' }}>
      {/* Kartu Selamat Datang Premium & Glassmorphic */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(28, 28, 30, 0.75) 0%, rgba(10, 132, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.95rem',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow efek halus di latar belakang */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '130px', height: '130px', background: 'rgba(94, 92, 230, 0.12)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
        
        {/* Atas: Profil singkat Guru */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
          <div 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: '0 4px 12px rgba(10, 132, 255, 0.25)',
              flexShrink: 0
            }}
          >
            <User size={20} color="#fff" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Selamat datang</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.fullName}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>
              {user.subject || 'Guru'} &bull; NIP {user.nip}
            </span>
          </div>
        </div>

        {/* Garis Pembatas Tipis */}
        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)' }} />

        {/* Bawah: Jam Digital Premium & Info Tanggal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Jam Digital */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span 
              style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: '#fff', 
                lineHeight: 1, 
                letterSpacing: '-0.02em', 
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'monospace, sans-serif'
              }}
            >
              {currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span style={{ fontSize: '0.68rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>WIT</span>
          </div>

          {/* Hari / Tanggal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'right' }}>
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span>{formatDateIndo(currentTime.toISOString())}</span>
          </div>
        </div>
      </div>

      {/* Info Shift Sekolah */}
      <div 
        style={{ 
          background: 'rgba(10, 132, 255, 0.05)', 
          border: '1px solid rgba(10, 132, 255, 0.12)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.65rem 0.85rem', 
          fontSize: '0.75rem', 
          color: 'var(--text-secondary)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.3rem',
          lineHeight: 1.4
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.2rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
            <strong>SHIFT PAGI:</strong>
          </span>
          <span style={{ color: '#fff' }}>Masuk: {schoolSettings.pagiCheckInOpen || '06:00'}-{schoolSettings.pagiWorkStart || '07:15'} WIT &bull; Pulang: {schoolSettings.pagiCheckOutStart || '12:00'}-{schoolSettings.pagiCheckOutEnd || '13:10'} WIT</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.3rem', flexWrap: 'wrap', gap: '0.2rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)' }} />
            <strong>SHIFT SIANG:</strong>
          </span>
          <span style={{ color: '#fff' }}>Masuk: {schoolSettings.siangCheckInOpen || '13:30'}-{schoolSettings.siangWorkStart || '14:00'} WIT &bull; Pulang: {schoolSettings.siangCheckOutStart || '16:00'}-{schoolSettings.siangCheckOutEnd || '16:45'} WIT</span>
        </div>
      </div>
    </div>
  );
};
