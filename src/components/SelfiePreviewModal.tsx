import React from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, User } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { formatDateIndo, formatTime } from '../utils/haversine';

interface SelfiePreviewModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const SelfiePreviewModal: React.FC<SelfiePreviewModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 200 }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '1.25rem',
          background: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User color="var(--primary)" size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Bukti Foto Presensi</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Display High Quality Selfie Image */}
        {record.selfieUrl ? (
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img
              src={record.selfieUrl}
              alt={`Selfie ${record.userName}`}
              style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span className={`badge badge-${record.status}`}>{record.status.toUpperCase()}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} color="var(--success)" /> Verified
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            Foto bukti presensi tidak tersedia untuk catatan ini.
          </div>
        )}

        {/* Info Detail Guru & Presensi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>{record.userName}</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>NIP: {record.userNip}</span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.2rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="var(--primary)" />
              <span>{formatDateIndo(record.date)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color="var(--warning)" />
              <span>Masuk: {formatTime(record.checkInTime)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="var(--success)" />
              <span>Jarak: {record.distanceMeters ?? 0} Meter</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color="var(--secondary)" />
              <span>Pulang: {formatTime(record.checkOutTime)}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
          Tutup Pratinjau
        </button>
      </div>
    </div>
  );
};
