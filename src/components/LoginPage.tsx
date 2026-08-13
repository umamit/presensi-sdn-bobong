import React from 'react';
import { HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { LoginHeader } from './login/LoginHeader';
import { LoginForm } from './login/LoginForm';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  allUsers: UserProfile[];
  schoolName: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, allUsers, schoolName }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem',
    backgroundImage: 'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 60%)',
    gap: '1rem'
  }}>
    <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.25rem 2rem', background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', margin: 0 }}>
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
        <a href="https://digital.ibraglobalenglish.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'opacity 0.2s' }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.75')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}>
          <span>Ibra Digital Engineering</span>
          <img src="/logo-ide.png" alt="Logo Ibra Digital Engineering" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', border: '1px solid rgba(255,255,255,0.2)' }} />
        </a>
      </p>
    </div>
  </div>
);
