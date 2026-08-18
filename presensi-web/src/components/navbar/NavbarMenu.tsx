import React from 'react';
import { UserProfile } from '../../types';
import { ShieldCheck, User, Users, Database, Download, LogOut, ChevronRight } from 'lucide-react';

interface NavbarMenuProps {
  currentUser: UserProfile;
  activeViewMode: 'admin' | 'guru';
  isSupabaseActive: boolean;
  isPwaInstallable: boolean;
  onToggleViewMode?: () => void;
  onOpenTeacherManagement?: () => void;
  onOpenSupabaseConfig: () => void;
  onInstallPwa: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export const NavbarMenu: React.FC<NavbarMenuProps> = ({
  currentUser, activeViewMode, isSupabaseActive, isPwaInstallable,
  onToggleViewMode, onOpenTeacherManagement, onOpenSupabaseConfig,
  onInstallPwa, onLogout, onClose
}) => (
  <div style={{
    marginTop: '0.85rem', paddingTop: '0.85rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
    animation: 'fadeIn 0.15s ease-out'
  }}>
    {/* User Profile Info Card */}
    <div style={{ padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: currentUser.role === 'admin' ? 'var(--warning-bg)' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentUser.role === 'admin' ? <ShieldCheck size={16} color="var(--warning)" /> : <User size={16} color="var(--primary)" />}
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{currentUser.fullName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentUser.role.toUpperCase()} • NIP: {currentUser.nip}</div>
        </div>
      </div>
    </div>

    {currentUser.role === 'admin' && onToggleViewMode && (
      <button onClick={() => { onToggleViewMode(); onClose(); }} className="btn btn-secondary" style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <span>{activeViewMode === 'guru' ? 'Beralih ke Panel Admin' : 'Beralih ke Mode Absen Saya'}</span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </button>
    )}

    {currentUser.role === 'admin' && onOpenTeacherManagement && (
      <button onClick={() => { onOpenTeacherManagement(); onClose(); }} className="btn btn-secondary" style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users size={16} color="var(--secondary)" />
          <span>Kelola Akun Guru ({currentUser.role})</span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </button>
    )}

    {currentUser.role === 'admin' && (
      <button onClick={() => { onOpenSupabaseConfig(); onClose(); }} className="btn btn-secondary" style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Database size={16} color={isSupabaseActive ? 'var(--success)' : 'var(--warning)'} />
          <span>Koneksi Server Supabase ({isSupabaseActive ? 'Aktif' : 'Demo'})</span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </button>
    )}

    {isPwaInstallable && (
      <button onClick={() => { onInstallPwa(); onClose(); }} className="btn btn-primary" style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Download size={16} /><span>Install Aplikasi di Layar HP</span>
        </div>
        <ChevronRight size={16} />
      </button>
    )}

    <button onClick={() => { onLogout(); onClose(); }} className="btn btn-secondary" style={{ justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem', color: 'var(--danger)', borderColor: 'rgba(255, 69, 58, 0.2)', background: 'var(--danger-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <LogOut size={16} color="var(--danger)" />
        <span style={{ fontWeight: 600 }}>Keluar dari Akun</span>
      </div>
      <ChevronRight size={16} color="var(--danger)" />
    </button>
  </div>
);
