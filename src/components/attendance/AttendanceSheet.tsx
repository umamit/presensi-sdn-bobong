import React from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, Navigation, User, FileText, Layers } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { formatDateIndo, formatTime } from '../../utils/haversine';

interface AttendanceSheetProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handleOpenMap = () => {
    if (record.checkInLat && record.checkInLng) {
      window.open(`https://www.google.com/maps?q=${record.checkInLat},${record.checkInLng}`, '_blank');
    } else {
      alert('Koordinat GPS presensi tidak terekam pada catatan ini.');
    }
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
        {/* Sheet Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Detail Verifikasi Presensi</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
          >
            <X size={16} />
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, minHeight: 0 }}>
          {/* Foto Presensi Section (Masuk & Pulang) */}
          <div style={{ display: 'grid', gridTemplateColumns: record.selfieOutUrl ? '1fr 1fr' : '1fr', gap: '0.75rem', flexShrink: 0 }}>
            {/* Foto Masuk */}
            {record.selfieUrl ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', background: '#090d16' }}>
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(16, 185, 129, 0.85)', color: '#fff', fontSize: '0.62rem', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 600, zIndex: 10 }}>MASUK</div>
                <img
                  src={record.selfieUrl}
                  alt={`Swafoto Masuk ${record.userName}`}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                />
                {/* Watermark GPS */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(9, 13, 22, 0.95) 30%, rgba(9, 13, 22, 0.5) 70%, transparent)',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.62rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontFamily: 'monospace',
                    lineHeight: 1.3
                  }}
                >
                  <div>DATE: {record.date} {formatTime(record.checkInTime)}</div>
                  <div>GPS: {record.checkInLat ? `${record.checkInLat.toFixed(6)}, ${record.checkInLng?.toFixed(6)}` : 'UNKNOWN'}</div>
                  <div>DIST: {record.distanceMeters ?? 0} METERS</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.08)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Bukti swafoto masuk tidak tersedia.
              </div>
            )}

            {/* Foto Pulang */}
            {record.selfieOutUrl && (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', background: '#090d16' }}>
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(245, 158, 11, 0.85)', color: '#fff', fontSize: '0.62rem', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 600, zIndex: 10 }}>PULANG</div>
                <img
                  src={record.selfieOutUrl}
                  alt={`Swafoto Pulang ${record.userName}`}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                />
                {/* Watermark GPS Pulang */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(9, 13, 22, 0.95) 30%, rgba(9, 13, 22, 0.5) 70%, transparent)',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.62rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontFamily: 'monospace',
                    lineHeight: 1.3
                  }}
                >
                  <div>DATE: {record.date} {formatTime(record.checkOutTime)}</div>
                  <div>GPS: {record.checkInLat ? `${record.checkInLat.toFixed(6)}, ${record.checkInLng?.toFixed(6)}` : 'UNKNOWN'}</div>
                  <div>STATUS: PULANG VERIFIED</div>
                </div>
              </div>
            )}
          </div>

          {/* Kolom Informasi Detail (Bawah/Kanan) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Profil Guru */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Karyawan</span>
                <span className={`badge badge-${record.status}`}>{record.status.toUpperCase()}</span>
              </div>
              <strong style={{ fontSize: '1rem', color: '#fff', display: 'block', marginBottom: '0.2rem' }}>{record.userName}</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>NIP: {record.userNip}</span>
            </div>

            {/* Waktu & Lokasi Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={11} /> TANGGAL
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#fff' }}>{formatDateIndo(record.date)}</span>
              </div>

              {/* Fix #13: Tampilkan info Shift */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Layers size={11} /> SHIFT
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: record.shift === 'siang' ? 'var(--warning)' : 'var(--primary)' }}>
                  {record.shift ? record.shift.toUpperCase() : '-'}
                </span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={11} /> JAM MASUK
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#fff' }}>{formatTime(record.checkInTime) || '--:--'}</span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={11} /> JAM PULANG
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#fff' }}>{formatTime(record.checkOutTime) || '--:--'}</span>
              </div>
            </div>

            {/* Catatan (Jika ada) */}
            {record.notes && !record.notes.includes('https://') && !record.notes.includes('http://') && (
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '0.85rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
                  <FileText size={11} /> CATATAN PRESENSI
                </span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                  "{record.notes}"
                </p>
              </div>
            )}

            {/* Tombol Map */}
            <button
              onClick={handleOpenMap}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginTop: '0.5rem',
                gap: '0.45rem',
                background: 'var(--primary)'
              }}
            >
              <Navigation size={14} />
              <span>Lihat Lokasi GPS Absen di Google Maps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
