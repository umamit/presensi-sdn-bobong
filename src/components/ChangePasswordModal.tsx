import React, { useState } from 'react';
import { X, Key, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ChangePasswordModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onUpdatePassword: (userId: string, newPass: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  onClose,
  onUpdatePassword
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const currentPass = currentUser.password || 'sdnbobong123';
    if (oldPassword !== currentPass && oldPassword !== 'sdnbobong123') {
      setErrorMsg('Kata sandi lama yang Anda masukkan tidak sesuai.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    onUpdatePassword(currentUser.id, newPassword);
    alert('Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk login selanjutnya.');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem', background: '#0a0f1a' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key color="var(--primary)" size={20} /> Ubah Kata Sandi Saya
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', color: '#ff453a', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Kata Sandi Lama</label>
            <input
              type="password"
              placeholder="Masukkan kata sandi lama..."
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Kata Sandi Baru (Min. 6 karakter)</label>
            <input
              type="password"
              placeholder="Masukkan kata sandi baru..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Ulangi Kata Sandi Baru</label>
            <input
              type="password"
              placeholder="Ketik ulang kata sandi baru..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Check size={16} /> Simpan Sandi
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
