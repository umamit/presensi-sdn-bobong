import React from 'react';
import { UserProfile } from '../types';
import { MapPin, User, ShieldCheck, Download, Database, School, LogOut, Users } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenTeacherManagement?: () => void;
  isPwaInstallable: boolean;
  onInstallPwa: () => void;
  onOpenSupabaseConfig: () => void;
  isSupabaseActive: boolean;
  schoolName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenTeacherManagement,
  isPwaInstallable,
  onInstallPwa,
  onOpenSupabaseConfig,
  isSupabaseActive,
  schoolName
}) => {
  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 var(--radius-md) var(--radius-md)', borderTop: 'none', padding: '0.9rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & School Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <School size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Presensi<span style={{ color: 'var(--secondary)' }}>Guru</span>
              </h1>
              <span className="badge badge-izin" style={{ fontSize: '0.7rem' }}>PWA Ready</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin size={12} color="var(--secondary)" /> {schoolName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseConfig}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
            title="Pengaturan Supabase Client"
          >
            <Database size={14} color={isSupabaseActive ? '#34d399' : '#f59e0b'} />
            <span>{isSupabaseActive ? 'Supabase Connected' : 'Demo Mode'}</span>
          </button>

          {/* Admin Feature: Manage Teacher Accounts Button */}
          {currentUser.role === 'admin' && onOpenTeacherManagement && (
            <button
              onClick={onOpenTeacherManagement}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem', border: '1px solid var(--primary)' }}
            >
              <Users size={14} color="var(--primary)" />
              <span>Kelola Akun Guru</span>
            </button>
          )}

          {/* PWA Install Button if available */}
          {isPwaInstallable && (
            <button
              onClick={onInstallPwa}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
            >
              <Download size={14} />
              <span>Install PWA App</span>
            </button>
          )}

          {/* Active Logged-In User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {currentUser.role === 'admin' ? (
              <ShieldCheck size={16} color="var(--warning)" />
            ) : (
              <User size={16} color="var(--primary)" />
            )}
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block', lineHeight: 1.2 }}>
                {currentUser.fullName}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {currentUser.role.toUpperCase()} • NIP: {currentUser.nip}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="btn btn-danger"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
            title="Keluar dari Akun"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>

        </div>

      </div>
    </header>
  );
};
