import React from 'react';
import { X, MapPin, Camera, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { SchoolSettings } from '../types';

interface GuideModalProps {
  schoolSettings: SchoolSettings;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ schoolSettings, onClose }) => {
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.15rem', fontSize: '0.82rem' }}>SHIFT PAGI:</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <li>Absen Masuk: <strong>{schoolSettings.pagiCheckInOpen || '06:00'} - {schoolSettings.pagiWorkStart || '07:15'} WIT</strong> (Tepat waktu)</li>
                  <li>Absen Pulang: <strong>{schoolSettings.pagiCheckOutStart || '12:00'} - {schoolSettings.pagiCheckOutEnd || '13:10'} WIT</strong></li>
                </ul>
              </div>

              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '0.15rem', fontSize: '0.82rem' }}>SHIFT SIANG:</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <li>Absen Masuk: <strong>{schoolSettings.siangCheckInOpen || '13:30'} - {schoolSettings.siangWorkStart || '14:00'} WIT</strong> (Tepat waktu)</li>
                  <li>Absen Pulang: <strong>{schoolSettings.siangCheckOutStart || '16:00'} - {schoolSettings.siangCheckOutEnd || '16:45'} WIT</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ color: '#ff453a', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> Solusi Izin GPS / Kamera Ditolak
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.4rem' }}>
              Jika Anda tidak sengaja menolak izin akses lokasi atau kamera, ikuti langkah berikut:
            </p>
            
            <div style={{ marginBottom: '0.55rem' }}>
              <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '0.15rem' }}>Untuk PWA (Melalui Google Chrome / Safari):</strong>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', margin: 0 }}>
                <li>Tekan ikon <strong>Gembok / Pengaturan</strong> di kiri baris alamat website (URL) browser HP Anda.</li>
                <li>Pilih <strong>Izin Situs (Site Settings)</strong> $\rightarrow$ Ubah <strong>Lokasi & Kamera</strong> menjadi <strong>"Izinkan / Allow"</strong>.</li>
                <li>Muat ulang (*refresh*) halaman web Anda.</li>
              </ol>
            </div>

            <div>
              <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '0.15rem' }}>Untuk APK (Aplikasi HP Terinstal):</strong>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', margin: 0 }}>
                <li>Buka menu <strong>Pengaturan / Settings</strong> di HP Android Anda.</li>
                <li>Pilih <strong>Aplikasi / Apps</strong> $\rightarrow$ Cari <strong>Presensi SDN Bobong</strong>.</li>
                <li>Pilih <strong>Izin / Permissions</strong> $\rightarrow$ Ubah <strong>Lokasi & Kamera</strong> menjadi <strong>"Izinkan / Allow"</strong>.</li>
              </ol>
            </div>
          </div>

        </div>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}>
          Saya Mengerti
        </button>

      </div>
    </div>
  );
};
