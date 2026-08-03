import React from 'react';

interface LoginHeaderProps {
  schoolName: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ schoolName }) => (
  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
    <div style={{
      width: '90px', height: '90px', borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1rem', overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
      border: '2px solid rgba(99, 102, 241, 0.3)'
    }}>
      <img src="/logo-sdn-bobong.jpg" alt="Logo SD Negeri Bobong" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
      Presensi<span style={{ color: 'var(--secondary)' }}>Guru</span>
    </h2>
    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{schoolName}</p>
  </div>
);
