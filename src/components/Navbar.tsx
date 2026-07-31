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
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

        {/* Top Row: Brand + Server + User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img
              src="/logo-sdn-bobong.jpg"
              alt="Logo SD Negeri Bobong"
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {/* Server status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.55rem', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 600,
              color: isSupabaseActive ? 'var(--success)' : 'var(--warning)',
              background: isSupabaseActive ? 'var(--success-bg)' : 'var(--warning-bg)',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
              {isSupabaseActive ? 'Server Connected' : 'Demo Mode'}
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', color: 'var(--danger)', minHeight: '32px' }}
              title="Keluar"
            >
              <LogOut size={13} color="var(--danger)" />
            </button>
          </div>
        </div>

        {/* Bottom Row (Admin / Action Controls) */}
        {(currentUser.role === 'admin' || isPwaInstallable) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.1rem' }}>
            {currentUser.role === 'admin' && onToggleViewMode && (
              <button
                onClick={onToggleViewMode}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap', minHeight: '32px' }}
              >
                {activeViewMode === 'guru' ? (
                  <><ShieldCheck size={12} /> Panel Admin</>
                ) : (
                  <><User size={12} /> Absen Saya</>
                )}
              </button>
            )}

            {currentUser.role === 'admin' && onOpenTeacherManagement && (
              <button
                onClick={onOpenTeacherManagement}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap', minHeight: '32px' }}
              >
                <Users size={12} /> Kelola Guru
              </button>
            )}

            {isPwaInstallable && (
              <button
                onClick={onInstallPwa}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap', minHeight: '32px' }}
              >
                <Download size={12} /> Install App
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
