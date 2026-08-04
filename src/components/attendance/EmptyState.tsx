import React from 'react';
import { CalendarX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onRefresh?: () => void;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  onRefresh, 
  message = "Belum ada catatan presensi guru pada tanggal ini." 
}) => {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '3rem 2rem', 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '1rem',
        borderColor: 'rgba(228,228,231,0.08)'
      }}
    >
      <div 
        style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '16px', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}
      >
        <CalendarX size={26} />
      </div>

      <div style={{ maxWidth: '320px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>Tidak Ada Data</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {message}
        </p>
      </div>

      {onRefresh && (
        <button 
          onClick={onRefresh} 
          className="btn btn-secondary" 
          style={{ 
            fontSize: '0.78rem', 
            padding: '0.45rem 0.85rem', 
            gap: '0.35rem',
            marginTop: '0.5rem',
            borderRadius: '8px'
          }}
        >
          <RefreshCw size={12} />
          <span>Refresh Data</span>
        </button>
      )}
    </div>
  );
};
