import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Menu, X } from 'lucide-react';
import { NavbarMenu } from './navbar/NavbarMenu';

interface NavbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenTeacherManagement?: () => void;
  isPwaInstallable: boolean;
  onInstallPwa: () => void;
  onOpenSupabaseConfig: () => void;
  isSupabaseActive: boolean;
  schoolName: string;
  activeViewMode?: 'admin' | 'guru';
  onToggleViewMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser, onLogout, onOpenTeacherManagement,
  isPwaInstallable, onInstallPwa, onOpenSupabaseConfig,
  isSupabaseActive, schoolName,
  activeViewMode = 'admin', onToggleViewMode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header style={{
      background: 'rgba(28,28,30,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0.75rem 1.25rem',
      marginBottom: '1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 90,
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/logo-sdn-bobong.png" alt="Logo SD Negeri Bobong" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>Presensi Guru</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>{schoolName}</div>
            </div>
          </div>

          {/* Right: Status Pill + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.6rem', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 600,
              color: isSupabaseActive ? 'var(--success)' : 'var(--warning)',
              background: isSupabaseActive ? 'var(--success-bg)' : 'var(--warning-bg)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
              {isSupabaseActive ? 'Online' : 'Demo'}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-secondary"
              style={{ padding: '0.4rem', borderRadius: '9999px', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isMenuOpen ? 'var(--primary-light)' : 'rgba(255,255,255,0.08)', borderColor: isMenuOpen ? 'var(--primary)' : 'rgba(255,255,255,0.12)' }}
              aria-label="Menu Presensi"
            >
              {isMenuOpen ? <X size={20} color="var(--primary)" /> : <Menu size={20} color="#ffffff" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <NavbarMenu
            currentUser={currentUser}
            activeViewMode={activeViewMode}
            isSupabaseActive={isSupabaseActive}
            isPwaInstallable={isPwaInstallable}
            onToggleViewMode={onToggleViewMode}
            onOpenTeacherManagement={onOpenTeacherManagement}
            onOpenSupabaseConfig={onOpenSupabaseConfig}
            onInstallPwa={onInstallPwa}
            onLogout={onLogout}
            onClose={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
};
