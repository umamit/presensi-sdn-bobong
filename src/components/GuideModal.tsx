import React from 'react';
import { X, MapPin, Camera, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', background: '#0a0f1a', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle color="var(--secondary)" size={22} /> Panduan Absensi SD Negeri Bobong
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ color: '#a5b4fc', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} /> 1. Izin Akses GPS & Lokasi Perangkat
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Pastikan GPS HP Anda sudah diaktifkan. Saat aplikasi meminta izin lokasi, klik <strong>"Izinkan saat menggunakan aplikasi"</strong>. Absen hanya bisa dilakukan jika Anda berada di dalam radius lingkungan sekolah.
            </p>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ color: '#34d399', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Camera size={16} /> 2. Ambil Foto Selfie Bukti Kehadiran
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Saat menekan tombol <strong>"Absen Masuk"</strong>, kamera selfie akan terbuka otomatis. Posisikan wajah Anda pada area panduan oval, lalu ambil foto selfie.
            </p>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ color: '#fbbf24', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> 3. Ketentuan Jam Sekolah (WIT)
            </h4>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li>Absen Masuk dibuka mulai jam <strong>06:00 WIT</strong></li>
              <li>Batas waktu tepat waktu adalah jam <strong>07:15 WIT</strong></li>
              <li>Absen Pulang resmi dimulai jam <strong>16:00 WIT</strong></li>
            </ul>
          </div>

        </div>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}>
          Saya Mengerti
        </button>

      </div>
    </div>
  );
};
