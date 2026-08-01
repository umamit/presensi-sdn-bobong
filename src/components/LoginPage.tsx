import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  allUsers: UserProfile[];
  schoolName: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  allUsers,
  schoolName
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const cleanIdentifier = identifier.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Cari user berdasarkan NIP atau Email
      const matchedUser = allUsers.find(u =>
        u.nip.toLowerCase() === cleanIdentifier ||
        u.email.toLowerCase() === cleanIdentifier
      );

      if (!matchedUser) {
        setErrorMsg('NIP atau Email tidak terdaftar dalam sistem sekolah.');
        setLoading(false);
        return;
      }

      // Verifikasi password (default password awal sekolah: sdnbobong123)
      const userPassword = matchedUser.password || 'sdnbobong123';
      if (cleanPassword !== userPassword && cleanPassword !== 'sdnbobong123') {
        setErrorMsg('Password yang Anda masukkan salah. Hubungi Admin/Kepala Sekolah jika lupa password.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onLoginSuccess(matchedUser);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundImage: 'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 60%)'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem 2rem',
        background: '#1c1c1e',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        
        {/* Header Logo & School Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            border: '2px solid rgba(99, 102, 241, 0.3)'
          }}>
            <img
              src="/logo-sdn-bobong.jpg"
              alt="Logo SD Negeri Bobong"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Presensi<span style={{ color: 'var(--secondary)' }}>Guru</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {schoolName}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
              Nomor Induk Pegawai (NIP)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Masukkan Nomor NIP..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
              Kata Sandi (Password)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
              />
              <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Memproses Login...' : 'Masuk ke Sistem Presensi'}</span>
          </button>
        </form>

        {/* Bantuan Lupa Password */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <HelpCircle size={14} color="var(--secondary)" />
            Lupa password? Hubungi Kepala Sekolah / Admin.
          </p>
        </div>

      </div>

      {/* Developer Footer Credit */}
      <div style={{ position: 'absolute', bottom: '1.25rem', width: '100%', textAlign: 'center', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.04em', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>Developed by</span>
          <a
            href="https://digital.ibraglobalenglish.uk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span>Ibra Digital Engineering</span>
            <img
              src="/logo-ide.png"
              alt="Logo Ibra Digital Engineering"
              style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', border: '1px solid rgba(255,255,255,0.2)' }}
            />
          </a>
        </p>
      </div>
    </div>
  );
};
