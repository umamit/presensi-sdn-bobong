import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, ShieldCheck, Download, Database, LogOut, Users, Menu, X, ChevronRight } from 'lucide-react';

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
  currentUser,
  onLogout,
  onOpenTeacherManagement,
  isPwaInstallable,
  onInstallPwa,
  onOpenSupabaseConfig,
  isSupabaseActive,
  schoolName,
  activeViewMode = 'admin',
  onToggleViewMode
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
        
        {/* Main Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img
              src="/logo-sdn-bobong.jpg"
              alt="Logo SD Negeri Bobong"
              style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                Presensi Guru
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                {schoolName}
              </div>
            </div>
          </div>

          {/* Right Section: Status Indicator & Hamburger Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            
            {/* Status Pill */}
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

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem',
                borderRadius: '9999px',
                minHeight: '36px',
                minWidth: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isMenuOpen ? 'var(--primary-light)' : 'rgba(255,255,255,0.08)',
                borderColor: isMenuOpen ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
              }}
              aria-label="Menu Presensi"
            >
              {isMenuOpen ? <X size={20} color="var(--primary)" /> : <Menu size={20} color="#ffffff" />}
            </button>
          </div>
        </div>

        {/* Dropdown Hamburger Menu List (Apple Sheet Style) */}
        {isMenuOpen && (
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            {/* User Profile Info Card */}
            <div style={{
              padding: '0.75rem 0.9rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: currentUser.role === 'admin' ? 'var(--warning-bg)' : 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {currentUser.role === 'admin' ? <ShieldCheck size={16} color="var(--warning)" /> : <User size={16} color="var(--primary)" />}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{currentUser.fullName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentUser.role.toUpperCase()} • NIP: {currentUser.nip}</div>
                </div>
              </div>
            </div>

            {/* Admin Toggle View */}
            {currentUser.role === 'admin' && onToggleViewMode && (
              <button
                onClick={() => { onToggleViewMode(); setIsMenuOpen(false); }}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span>{activeViewMode === 'guru' ? 'Beralih ke Panel Admin' : 'Beralih ke Mode Absen Saya'}</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            )}

            {/* Admin Kelola Guru */}
            {currentUser.role === 'admin' && onOpenTeacherManagement && (
              <button
                onClick={() => { onOpenTeacherManagement(); setIsMenuOpen(false); }}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Users size={16} color="var(--secondary)" />
                  <span>Kelola Akun Guru ({currentUser.role})</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            )}

            {/* Admin Supabase Config */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => { onOpenSupabaseConfig(); setIsMenuOpen(false); }}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Database size={16} color={isSupabaseActive ? 'var(--success)' : 'var(--warning)'} />
                  <span>Koneksi Server Supabase ({isSupabaseActive ? 'Aktif' : 'Demo'})</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            )}

            {/* PWA Install Button */}
            {isPwaInstallable && (
              <button
                onClick={() => { onInstallPwa(); setIsMenuOpen(false); }}
                className="btn btn-primary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Download size={16} />
                  <span>Install Aplikasi di Layar HP</span>
                </div>
                <ChevronRight size={16} />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={() => { onLogout(); setIsMenuOpen(false); }}
              className="btn btn-secondary"
              style={{
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.88rem',
                color: 'var(--danger)',
                borderColor: 'rgba(255, 69, 58, 0.2)',
                background: 'var(--danger-bg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LogOut size={16} color="var(--danger)" />
                <span style={{ fontWeight: 600 }}>Keluar dari Akun</span>
              </div>
              <ChevronRight size={16} color="var(--danger)" />
            </button>

          </div>
        )}

      </div>
    </header>
  );
};
