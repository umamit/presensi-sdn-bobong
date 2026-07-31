import React, { useState } from 'react';
import { LeaveType, LeaveRequest, UserProfile } from '../types';
import { X, Send, FileText } from 'lucide-react';

interface LeaveRequestModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (request: Partial<LeaveRequest>) => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  currentUser,
  onClose,
  onSubmit
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('sakit');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Mohon tuliskan alasan permohonan izin/sakit.');
      return;
    }

    onSubmit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userNip: currentUser.nip,
      startDate,
      endDate,
      leaveType,
      description,
      documentUrl: documentUrl || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', background: '#0f172a' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText color="var(--primary)" /> Form Pengajuan Izin / Sakit
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Jenis Pengajuan</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="glass-input"
            >
              <option value="sakit" style={{ background: '#0f172a' }}>Sakit (Dengan Surat Dokter)</option>
              <option value="izin" style={{ background: '#0f172a' }}>Izin Kepentingan Dinas / Pribadi</option>
              <option value="cuti" style={{ background: '#0f172a' }}>Cuti Tahunan / Alasan Penting</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Keterangan / Alasan Lengkap</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan keterangan detail di sini..."
              className="glass-input"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Link Lampiran Dokumen / Surat Dokter (Opsional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              className="glass-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Send size={16} /> Kirim Pengajuan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
