import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface UpdateNoticeBannerProps {
  currentVersion: string;
  latestVersion: string;
}

export const UpdateNoticeBanner: React.FC<UpdateNoticeBannerProps> = ({ currentVersion, latestVersion }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
      background: 'rgba(255, 159, 10, 0.15)', border: '1px solid rgba(255, 159, 10, 0.4)',
      borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '0.75rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, flexWrap: 'wrap' }}>
        <AlertTriangle size={18} color="#ff9f0a" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', color: '#ffe0a0', lineHeight: 1.4, flex: 1, minWidth: '200px' }}>
          <strong>Versi baru tersedia (v{latestVersion})</strong> — Anda menggunakan v{currentVersion}.
        </span>
        <a
          href="https://presensi.sdnegeribobong.sch.id/Presensi_SDN_Bobong.apk"
          download="Presensi_SDN_Bobong.apk"
          style={{
            background: '#ff9f0a',
            color: '#000000',
            border: 'none',
            borderRadius: '8px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Perbarui Sekarang
        </a>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#ff9f0a', padding: '4px', flexShrink: 0
        }}
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};
