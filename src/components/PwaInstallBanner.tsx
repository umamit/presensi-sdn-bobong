import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface PwaInstallBannerProps {
  onInstall: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onInstall }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 90,
      width: 'calc(100% - 2.5rem)',
      maxWidth: '480px'
    }}>
      <div className="glass-panel" style={{
        padding: '0.85rem 1.25rem',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid var(--primary)',
        boxShadow: 'var(--shadow-glow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
            <Smartphone size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block' }}>Install Aplikasi Presensi</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Akses cepat di layar HP seperti aplikasi mobile</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button onClick={onInstall} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            <Download size={14} /> Install
          </button>
          <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', padding: '0.3rem', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
