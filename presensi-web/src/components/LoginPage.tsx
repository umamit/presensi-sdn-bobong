import React from 'react';
import { HelpCircle, AlertTriangle, Download, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';
import { LoginHeader } from './login/LoginHeader';
import { LoginForm } from './login/LoginForm';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  allUsers: UserProfile[];
  schoolName: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, allUsers, schoolName }) => {
  // 1. Deteksi platform & lingkungan Capacitor
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isCapacitor = !!(window as any).Capacitor;

  // 2. Blokir jika user membuka dari HP Android menggunakan browser biasa (bukan APK)
  if (isAndroid && !isCapacitor) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
        backgroundImage: 'radial-gradient(at 50% 0%, rgba(239, 68, 68, 0.15) 0px, transparent 60%)',
        gap: '1rem',
        backgroundColor: '#0a0a0c'
      }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', background: '#1c1c1e', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', marginBottom: '1.25rem' }}>
            <AlertTriangle size={40} color="#ef4444" />
          </div>
          
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            Akses Web Browser Dilarang!
          </h2>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
            Anda terdeteksi membuka website presensi menggunakan Browser di HP Android. Demi keamanan verifikasi GPS & Wajah, Anda **wajib** menggunakan Aplikasi APK Resmi.
          </p>

          <a 
            href="/PresensiMobile_SDNBobong_arm64.apk" 
            download
            className="btn btn-primary" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: '#ef4444', 
              borderColor: '#ef4444', 
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            <Download size={18} />
            Unduh APK Android Resmi
          </a>
          
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.75rem', display: 'block' }}>
            Hubungi Admin Sekolah jika mengalami kendala instalasi.
          </span>
        </div>
      </div>
    );
  }

  // 3. Tampilan normal untuk iOS dan Desktop
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
      backgroundImage: 'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 60%)',
      gap: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.25rem 2rem', background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', margin: 0 }}>
        
        {/* Banner Panduan Safari PWA untuk pengguna iPhone */}
        {isIOS && !isCapacitor && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'flex-start',
            textAlign: 'left'
          }}>
            <Smartphone size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Pengguna iPhone / iOS</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: '1.3' }}>
                Silakan ketuk tombol **Share** (Bagikan) di Safari lalu pilih **"Add to Home Screen"** untuk menginstal aplikasi presensi di iPhone Anda.
              </p>
            </div>
          </div>
        )}

        <LoginHeader schoolName={schoolName} />
        <LoginForm allUsers={allUsers} onLoginSuccess={onLoginSuccess} />

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <HelpCircle size={14} color="var(--secondary)" />
            Lupa password? Hubungi Kepala Sekolah / Admin.
          </p>
        </div>
      </div>

      {/* Developer Footer Credit */}
      <div style={{ textAlign: 'center', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
          <span>Developed by</span>
          <a href="https://ibradigital.id" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'opacity 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}>
            <span>Ibra Digital Engineering</span>
            <img src="/logo-ide.png" alt="Logo Ibra Digital Engineering" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', border: '1px solid rgba(255,255,255,0.2)' }} />
          </a>
        </p>
      </div>
    </div>
  );
};
