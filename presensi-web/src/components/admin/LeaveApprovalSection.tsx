import React from 'react';
import { LeaveRequest } from '../../types';
import { formatDateIndo } from '../../utils/haversine';
import { Check, X } from 'lucide-react';

interface LeaveApprovalSectionProps {
  pendingLeaves: LeaveRequest[];
  onUpdateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;
}

export const LeaveApprovalSection: React.FC<LeaveApprovalSectionProps> = ({ pendingLeaves, onUpdateLeaveStatus }) => (
  <div className="glass-panel" style={{ padding: '1.5rem' }}>
    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
      Permohonan Izin / Cuti Menunggu Persetujuan ({pendingLeaves.length})
    </h3>
    {pendingLeaves.length === 0 ? (
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Tidak ada permohonan izin/sakit yang perlu ditinjau saat ini.
      </p>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {pendingLeaves.map((req) => (
          <div key={req.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(15,23,42,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{req.userName}</strong>
              <span className="badge badge-terlambat">{req.leaveType.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Tanggal: {formatDateIndo(req.startDate)} - {formatDateIndo(req.endDate)}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem', fontStyle: 'italic' }}>
              "{req.description}"
            </p>
            {req.documentUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <a href={req.documentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', display: 'inline-flex', gap: '0.3rem' }}>
                  Lihat Foto Surat Dokter / Lampiran
                </a>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => onUpdateLeaveStatus(req.id, 'approved')} className="btn btn-success" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}>
                <Check size={14} /> Setujui
              </button>
              <button onClick={() => onUpdateLeaveStatus(req.id, 'rejected')} className="btn btn-danger" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}>
                <X size={14} /> Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
