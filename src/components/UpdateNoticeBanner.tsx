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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
        <AlertTriangle size={18} color="#ff9f0a" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', color: '#ffe0a0', lineHeight: 1.4 }}>
          <strong>Versi baru tersedia (v{latestVersion})</strong> — Anda menggunakan v{currentVersion}.{' '}
          Silakan hubungi <strong>Kepala Sekolah</strong> untuk mendapatkan APK terbaru.
        </span>
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
