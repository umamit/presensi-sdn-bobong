import React from 'react';
import { Smartphone, Info, Compass, Share } from 'lucide-react';

interface PwaGuidePageProps {
  schoolName: string;
}

export const PwaGuidePage: React.FC<PwaGuidePageProps> = ({ schoolName }) => {
  // Deteksi perangkat iOS / iPhone
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Deteksi apakah menggunakan Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundImage: 'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 60%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2rem',
        background: '#1c1c1e',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        {/* Icon Header */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1.5px solid rgba(99, 102, 241, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <Smartphone size={36} color="var(--primary)" />
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Aplikasi Presensi Guru
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {schoolName}
        </p>

        {isIos ? (
          // PANDUAN UNTUK PENGGUNA IPHONE (iOS)
          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <Info size={16} /> Panduan Pemasangan iPhone
            </h4>
            
            {!isSafari ? (
              // Jika membuka di Chrome/browser lain selain Safari di iOS
              <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#f87171' }}>
                <p style={{ marginBottom: '0.75rem' }}>
                  ⚠️ Anda membuka aplikasi menggunakan browser non-Safari. Di iPhone, pemasangan aplikasi hanya didukung oleh browser **Safari bawaan**.
                </p>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.2)', fontSize: '0.78rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  https://presensi.sdnegeribobong.sch.id
                </div>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                  Silakan salin tautan di atas dan buka kembali di browser **Safari** untuk menginstal aplikasi.
                </p>
              </div>
            ) : (
              // Jika membuka di Safari bawaan iPhone
              <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '0.85rem', color: '#fff', fontWeight: 500 }}>
                  Aplikasi web harus ditambahkan ke layar utama agar fitur GPS dan kamera bekerja stabil. Ikuti langkah mudah ini:
                </p>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <li>
                    Tekan tombol <strong>Bagikan (Share)</strong> <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} color="var(--primary)" /> di bagian bawah layar Safari Anda.
                  </li>
                  <li>
                    Gulir ke bawah dan pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> (atau <em>"Add to Home Screen"</em>).
                  </li>
                  <li>
                    Tekan tombol <strong>"Tambah"</strong> di pojok kanan atas.
                  </li>
                  <li>
                    Buka ikon aplikasi <strong>Presensi SDN Bobong</strong> yang baru terpasang di layar utama HP Anda untuk mulai masuk (login).
                  </li>
                </ol>
              </div>
            )}
          </div>
        ) : (
          // PANDUAN UNTUK PENGGUNA NON-IPHONE (ANDROID / PC / CHROME)
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Compass size={16} /> Akses Browser Dinonaktifkan
            </h4>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--text-muted)', margin: 0 }}>
              Mulai saat ini, absensi presensi dari browser web biasa telah dinonaktifkan demi alasan keamanan GPS. 
            </p>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#fff', fontWeight: 600, marginTop: '0.75rem' }}>
              Bagi pengguna HP Android, silakan pasang Aplikasi APK Resmi terbaru yang dapat Anda peroleh dengan menghubungi Kepala Sekolah / Admin.
            </p>
          </div>
        )}

        {/* Footer info */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          SD Negeri Bobong — Taliabu Barat
        </div>
      </div>
    </div>
  );
};
