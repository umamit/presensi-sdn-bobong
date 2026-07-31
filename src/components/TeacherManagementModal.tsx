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
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '1.5rem', background: '#0f172a' }}>
        
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users color="var(--primary)" /> Kelola Akun Guru SD Negeri Bobong
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('list')}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', background: activeTab === 'list' ? 'var(--primary-light)' : undefined, borderColor: activeTab === 'list' ? 'var(--primary)' : undefined }}
          >
            <Users size={16} /> Daftar Akun Guru ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            <UserPlus size={16} /> Tambah Akun Guru Baru
          </button>
        </div>

        {/* TAB 1: Daftar Guru */}
        {activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {allUsers.map((u) => (
              <div key={u.id} className="glass-panel" style={{ padding: '0.85rem 1rem', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{u.fullName}</strong>
                    <span className={`badge ${u.role === 'admin' ? 'badge-terlambat' : 'badge-izin'}`} style={{ fontSize: '0.7rem' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                    NIP: <strong>{u.nip}</strong> • {u.subject || 'Guru'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Email: {u.email} • Password: <code>{u.password || 'sdnbobong123'}</code>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Form Tambah Guru Baru */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>NIP Guru</label>
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
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Peran (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'guru' | 'admin')}
                  className="glass-input"
                >
                  <option value="guru" style={{ background: '#0f172a' }}>Guru Pengajar</option>
                  <option value="admin" style={{ background: '#0f172a' }}>Admin / Kepala Sekolah</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Nama Lengkap & Gelar</label>
              <input
                type="text"
                placeholder="Contoh: Rina Amalia, S.Pd"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Email Sekolah</label>
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
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Jabatan / Guru Kelas</label>
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
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Password Awal (Default Sekolah)</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setActiveTab('list')} className="btn btn-secondary" style={{ flex: 1 }}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <UserPlus size={16} /> Daftarkan Akun Guru
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
