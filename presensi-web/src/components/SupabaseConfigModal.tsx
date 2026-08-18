import React, { useState } from 'react';
import { Database, X, CheckCircle, ExternalLink, Zap } from 'lucide-react';

interface SupabaseConfigModalProps {
  onClose: () => void;
  isConfigured: boolean;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  isConfigured
}) => {
  const [url, setUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [anonKey, setAnonKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '1.5rem', background: '#0f172a' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database color="var(--secondary)" /> Pengaturan Koneksi Supabase
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {isConfigured ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
              <CheckCircle size={18} />
              <span>Supabase Cloud Terhubung & Siap Digunakan!</span>
            </div>
          ) : (
            <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} color="#fbbf24" /> <strong>Mode Demo (Mock Local Storage) Aktif.</strong> Anda dapat menguji semua fitur aplikasi presensi ini secara langsung tanpa koneksi database.
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Untuk menghubungkan dengan Supabase PostgreSQL milik Anda sendiri, buat file <code>.env</code> di direktori proyek dengan variabel berikut:
        </div>

        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontFamily: 'monospace', color: '#38bdf8', marginBottom: '1.25rem' }}>
          VITE_SUPABASE_URL=https://your-project.supabase.co<br />
          VITE_SUPABASE_ANON_KEY=your-anon-key-here
        </div>

        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
