import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, UserPlus, ShieldCheck, Users, Key, Trash2 } from 'lucide-react';

interface TeacherManagementModalProps {
  allUsers: UserProfile[];
  onClose: () => void;
  onAddTeacher: (newTeacher: UserProfile) => void;
}

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  allUsers,
  onClose,
  onAddTeacher
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // Form State untuk Pendaftaran Guru Baru oleh Admin
  const [nip, setNip] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Guru Kelas I');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('sdnbobong123');
  const [role, setRole] = useState<'guru' | 'admin'>('guru');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !fullName || !email) {
      alert('Mohon lengkapi data NIP, Nama Lengkap, dan Email guru.');
      return;
    }

    const newTeacher: UserProfile = {
      id: `usr-${Date.now()}`,
      nip: nip.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      subject,
      phone,
      password: password.trim() || 'sdnbobong123',
    };

    onAddTeacher(newTeacher);
    alert(`Akun untuk ${fullName} berhasil didaftarkan! NIP: ${nip}`);

    // Reset Form
    setNip('');
    setFullName('');
    setEmail('');
    setSubject('Guru Kelas I');
    setPhone('');
    setPassword('sdnbobong123');
    setActiveTab('list');
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '1.25rem', background: '#1c1c1e', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--primary)" /> Kelola Akun Guru
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('list')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', flex: 1, minWidth: '130px', background: activeTab === 'list' ? 'var(--primary-light)' : undefined, borderColor: activeTab === 'list' ? 'var(--primary)' : undefined }}
          >
            <Users size={14} /> Daftar Guru ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', flex: 1, minWidth: '130px' }}
          >
            <UserPlus size={14} /> Tambah Akun
          </button>
        </div>

        {/* TAB 1: Daftar Guru */}
        {activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {allUsers.map((u) => (
              <div key={u.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 600 }}>{u.fullName}</strong>
                    <span className={`badge ${u.role === 'admin' ? 'badge-terlambat' : 'badge-izin'}`} style={{ fontSize: '0.65rem' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    NIP: <strong style={{ color: '#fff' }}>{u.nip}</strong> &nbsp;·&nbsp; {u.subject || 'Guru'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Email: {u.email} &nbsp;·&nbsp; Pass: <code style={{ color: 'var(--primary)', background: 'rgba(10,132,255,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{u.password || 'sdnbobong123'}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Form Tambah Guru Baru */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>NIP Guru</label>
                <input
                  type="text"
                  placeholder="Contoh: 199201012020011002"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Peran (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'guru' | 'admin')}
                  className="glass-input"
                >
                  <option value="guru" style={{ background: '#1c1c1e' }}>Guru Pengajar</option>
                  <option value="admin" style={{ background: '#1c1c1e' }}>Admin / Kepala Sekolah</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Nama Lengkap & Gelar</label>
              <input
                type="text"
                placeholder="Contoh: Rina Amalia, S.Pd"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Email Sekolah</label>
                <input
                  type="email"
                  placeholder="rina@sdnegeribobong.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Jabatan / Guru Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: Guru Kelas III"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Password Awal (Default Sekolah)</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button type="button" onClick={() => setActiveTab('list')} className="btn btn-secondary" style={{ flex: 1 }}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <UserPlus size={15} /> Daftarkan
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
