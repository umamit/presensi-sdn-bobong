import React from 'react';
import { UserProfile } from '../../types';
import { formatDateIndo } from '../../utils/haversine';

interface GuruHeaderProps {
  user: UserProfile;
  currentTime: Date;
}

export const GuruHeader: React.FC<GuruHeaderProps> = ({ user, currentTime }) => {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.25rem 0', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Selamat datang,</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{user.fullName.split(' ').slice(0, 2).join(' ')}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user.subject || 'Guru'} • NIP {user.nip}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>WIT • {formatDateIndo(currentTime.toISOString())}</div>
        </div>
      </div>

      <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.78rem', color: 'var(--primary)' }}>
        Shift Pagi 06:00–08:00 / Pulang 11:45–12:00 &nbsp;|&nbsp; Shift Siang 12:00–12:30 / Pulang 16:00–16:45 WIT
      </div>
    </>
  );
};
