import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { UserPlus, Trash2, Edit2, RotateCcw } from 'lucide-react';

interface TeacherAddFormProps {
  allUsers: UserProfile[];
  onAddTeacher: (newTeacher: UserProfile) => void;
  onBack: () => void;
}

export const TeacherAddForm: React.FC<TeacherAddFormProps> = ({ onAddTeacher, onBack }) => {
  const [nip, setNip] = useState('');
  const [fullName, setFullName] = useState('');
  const [subject, setSubject] = useState('Guru Kelas I');
  const [password, setPassword] = useState('sdnbobong123');
  const [role, setRole] = useState<'guru' | 'admin'>('guru');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !fullName) { alert('Mohon lengkapi data NIP dan Nama Lengkap guru.'); return; }

    const cleanNip = nip.trim();
    const newTeacher: UserProfile = {
      id: `usr-${Date.now()}`,
      nip: cleanNip,
      fullName: fullName.trim(),
      email: `${cleanNip}@sdnegeribobong.sch.id`,
      role, subject,
      password: password.trim() || 'sdnbobong123',
    };

    onAddTeacher(newTeacher);
    alert(`Akun untuk ${fullName} berhasil didaftarkan! NIP: ${cleanNip}`);
    onBack();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>NIP Guru</label>
        <input type="text" placeholder="Contoh: 199201012020011002" value={nip} onChange={(e) => setNip(e.target.value)} className="glass-input" required />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Peran (Role)</label>
        <select value={role} onChange={(e) => setRole(e.target.value as 'guru' | 'admin')} className="glass-input">
          <option value="guru" style={{ background: '#1c1c1e' }}>Guru Pengajar</option>
          <option value="admin" style={{ background: '#1c1c1e' }}>Admin / Kepala Sekolah</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Nama Lengkap & Gelar</label>
        <input type="text" placeholder="Contoh: Rina Amalia, S.Pd" value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass-input" required />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Jabatan / Guru Kelas</label>
        <input type="text" placeholder="Contoh: Guru Kelas III" value={subject} onChange={(e) => setSubject(e.target.value)} className="glass-input" />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Password Awal (Default Sekolah)</label>
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input" required />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
        <button type="button" onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><UserPlus size={15} /> Daftarkan</button>
      </div>
    </form>
  );
};

interface TeacherEditFormProps {
  user: UserProfile;
  onEditTeacher: (updatedTeacher: UserProfile) => void;
  onBack: () => void;
}

export const TeacherEditForm: React.FC<TeacherEditFormProps> = ({ user, onEditTeacher, onBack }) => {
  const [nip, setNip] = useState(user.nip);
  const [fullName, setFullName] = useState(user.fullName);
  const [subject, setSubject] = useState(user.subject || '');
  const [password, setPassword] = useState(user.password || '');
  const [role, setRole] = useState<'guru' | 'admin'>(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !fullName) { alert('Mohon lengkapi data NIP dan Nama Lengkap guru.'); return; }

    const cleanNip = nip.trim();
    const updated: UserProfile = {
      ...user,
      nip: cleanNip,
      fullName: fullName.trim(),
      email: `${cleanNip}@sdnegeribobong.sch.id`,
      role, 
      subject: subject.trim(),
      password: password.trim() || 'sdnbobong123',
    };

    onEditTeacher(updated);
    alert(`Data profil ${fullName} berhasil di-update!`);
    onBack();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>Edit Profil Guru</h4>
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>NIP Guru</label>
        <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} className="glass-input" required />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Peran (Role)</label>
        <select value={role} onChange={(e) => setRole(e.target.value as 'guru' | 'admin')} className="glass-input">
          <option value="guru" style={{ background: '#1c1c1e' }}>Guru Pengajar</option>
          <option value="admin" style={{ background: '#1c1c1e' }}>Admin / Kepala Sekolah</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Nama Lengkap & Gelar</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass-input" required />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Jabatan / Guru Kelas</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="glass-input" />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Password (Kata Sandi)</label>
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input" required />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
        <button type="button" onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Perubahan</button>
      </div>
    </form>
  );
};

interface TeacherListItemProps {
  user: UserProfile;
  onDelete: (userId: string, fullName: string) => void;
  onEditClick: (user: UserProfile) => void;
  onResetFace?: (userId: string, fullName: string) => void;
}

export const TeacherListItem: React.FC<TeacherListItemProps> = ({ user, onDelete, onEditClick, onResetFace }) => (
  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700 }}>{user.fullName}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        {user.faceDescriptor && onResetFace && (
          <button onClick={() => onResetFace(user.id, user.fullName)} style={{ background: 'rgba(255,159,10,0.15)', border: '1px solid rgba(255,159,10,0.3)', color: '#ff9f0a', borderRadius: '6px', padding: '0.2rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} title="Reset Registrasi Wajah">
            <RotateCcw size={11} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Reset Wajah</span>
          </button>
        )}
        <span className={`badge ${user.role === 'admin' ? 'badge-terlambat' : 'badge-izin'}`} style={{ fontSize: '0.65rem' }}>{user.role.toUpperCase()}</span>
        <button onClick={() => onEditClick(user)} style={{ background: 'rgba(10,132,255,0.15)', border: '1px solid rgba(10,132,255,0.3)', color: '#0a84ff', borderRadius: '6px', padding: '0.2rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} title="Edit Profil Guru">
          <Edit2 size={12} />
        </button>
        {user.role !== 'admin' && (
          <button onClick={() => onDelete(user.id, user.fullName)} style={{ background: 'rgba(255,69,58,0.15)', border: '1px solid rgba(255,69,58,0.3)', color: '#ff453a', borderRadius: '6px', padding: '0.2rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} title="Hapus Akun Guru">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
    <div style={{ fontSize: '0.78rem', color: '#8e8e93' }}>NIP: <strong style={{ color: '#ffffff' }}>{user.nip}</strong> &nbsp;·&nbsp; {user.subject || 'Guru'}</div>
    <div style={{ fontSize: '0.75rem', color: '#8e8e93' }}>Pass: <code style={{ color: '#0a84ff', background: 'rgba(10,132,255,0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace' }}>{user.password || 'sdnbobong123'}</code></div>
  </div>
);
