import React from 'react';
import { UserProfile } from '../types';
import { User, ShieldCheck, Download, Database, LogOut, Users, ChevronRight } from 'lucide-react';

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
  return (
    <header style={{
      background: 'rgba(28,28,30,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0.75rem 1.25rem',
      marginBottom: '1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo-sdn-bobong.jpg"
            alt="Logo SD Negeri Bobong"
            style={{ width: '36px', height: '36px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              Presensi Guru
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              {schoolName}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

          {/* Server status */}
          {currentUser.role === 'admin' ? (
            <button
              onClick={onOpenSupabaseConfig}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                border: 'none', cursor: 'pointer',
                padding: '0.35rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                color: isSupabaseActive ? 'var(--success)' : 'var(--warning)',
                background: isSupabaseActive ? 'var(--success-bg)' : 'var(--warning-bg)',
              } as React.CSSProperties}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
              {isSupabaseActive ? 'Server Connected' : 'Demo Mode'}
            </button>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.35rem 0.65rem', borderRadius: '20px',
              fontSize: '0.78rem',
              color: isSupabaseActive ? 'var(--success)' : 'var(--warning)',
              background: isSupabaseActive ? 'var(--success-bg)' : 'var(--warning-bg)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
              {isSupabaseActive ? 'Server Connected' : 'Demo Mode'}
            </div>
          )}

          {/* Admin toggle view */}
          {currentUser.role === 'admin' && onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              {activeViewMode === 'guru' ? (
                <><ShieldCheck size={13} /> Panel Admin</>
              ) : (
                <><User size={13} /> Absen Saya</>
              )}
            </button>
          )}

          {/* Kelola Guru */}
          {currentUser.role === 'admin' && onOpenTeacherManagement && (
            <button
              onClick={onOpenTeacherManagement}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Users size={13} /> Kelola Guru
            </button>
          )}

          {/* Install PWA */}
          {isPwaInstallable && (
            <button
              onClick={onInstallPwa}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Download size={13} /> Install App
            </button>
          )}

          {/* User pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--bg-card-2)', borderRadius: '20px',
            padding: '0.3rem 0.75rem 0.3rem 0.4rem',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: currentUser.role === 'admin' ? 'var(--warning-bg)' : 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {currentUser.role === 'admin'
                ? <ShieldCheck size={13} color="var(--warning)" />
                : <User size={13} color="var(--primary)" />}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>
              {currentUser.fullName.split(' ')[0]}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', color: 'var(--danger)' }}
            title="Keluar"
          >
            <LogOut size={14} color="var(--danger)" />
          </button>
        </div>
      </div>
    </header>
  );
};
