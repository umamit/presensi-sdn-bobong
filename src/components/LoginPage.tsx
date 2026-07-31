import React, { useState } from 'react';
import { School, Lock, User, Eye, EyeOff, LogIn, Key, HelpCircle } from 'lucide-react';
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
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

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

  const handleFillDemo = (user: UserProfile) => {
    setIdentifier(user.nip);
    setPassword(user.password || 'sdnbobong123');
    setErrorMsg(null);
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
        boxShadow: 'var(--shadow-glow)'
      }}>
        
        {/* Header Logo & School Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
          }}>
            <School size={32} />
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
              NIP atau Email Sekolah
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Masukkan NIP atau email..."
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

        {/* Demo Credentials Helper Toggle */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <HelpCircle size={14} color="var(--secondary)" />
            <span>{showDemoCredentials ? 'Sembunyikan Bantuan Login' : 'Bantuan / Contoh Akun Terdaftar'}</span>
          </button>

          {showDemoCredentials && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Klik nama di bawah untuk mengisi form secara otomatis:</span>
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleFillDemo(u)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}
                >
                  <span><strong>{u.fullName}</strong> ({u.role.toUpperCase()})</span>
                  <span style={{ color: 'var(--secondary)' }}>NIP: {u.nip}</span>
                </button>
              ))}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Password Default Sekolah: <code>sdnbobong123</code>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
