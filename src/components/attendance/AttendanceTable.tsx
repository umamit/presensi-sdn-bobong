import React, { useState } from 'react';
import { Search, Download, UserCheck, AlertTriangle } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { exportAttendanceCsv } from '../../utils/exportCsv';
import { formatTime, formatDateIndo } from '../../utils/haversine';
import { AttendanceSheet } from './AttendanceSheet';

interface AttendanceTableProps {
  filteredRecords: AttendanceRecord[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  onRefresh?: () => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  filteredRecords,
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate,
  onRefresh
}) => {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Fungsi pembantu untuk memilih warna dot ping status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir': return 'var(--success)';
      case 'terlambat': return 'var(--warning)';
      case 'izin': return 'var(--primary)';
      case 'sakit': return 'var(--warning)';
      default: return 'var(--danger)';
    }
  };

  return (
    <>
      <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(255, 255, 255, 0.05)', background: '#1c1c1e' }}>
        {/* Header + Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <UserCheck size={16} color="var(--primary)" />
              <span>Daftar Presensi Guru</span>
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {filteredRecords.length} Catatan Ditemukan
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="glass-input"
              style={{ flex: '1 1 130px', minWidth: '130px', background: '#18181b', fontSize: '0.82rem', padding: '0.55rem 0.75rem' }}
            />
            <div style={{ position: 'relative', flex: '2 1 180px', minWidth: '140px' }}>
              <input
                type="text"
                placeholder="Cari NIP / nama guru..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.2rem', width: '100%', background: '#18181b', fontSize: '0.82rem', padding: '0.55rem 0.75rem 0.55rem 2.2rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button
              onClick={() => exportAttendanceCsv(filteredRecords)}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', gap: '0.4rem', whiteSpace: 'nowrap', borderRadius: '8px' }}
            >
              <Download size={14} /> <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* List Records (SaaS-styled card layout) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {filteredRecords.map((rec) => {
            const dotColor = getStatusColor(rec.status);
            return (
              <div
                key={rec.id}
                className="row-hover"
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  transition: 'border-color 0.15s, background 0.15s'
                }}
              >
                {/* Atas: Profile & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {rec.selfieUrl || rec.selfieOutUrl ? (
                      <div
                        onClick={() => setSelectedRecord(rec)}
                        title="Klik untuk melihat detail & foto presensi"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                          width: rec.selfieUrl && rec.selfieOutUrl ? '52px' : '36px',
                          height: '36px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {rec.selfieUrl && (
                          <img
                            src={rec.selfieUrl}
                            alt="Masuk"
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #1c1c1e',
                              position: 'absolute',
                              left: 0,
                              zIndex: 2,
                              transition: 'transform 0.15s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.zIndex = '10';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.zIndex = '2';
                            }}
                          />
                        )}
                        {rec.selfieOutUrl && (
                          <img
                            src={rec.selfieOutUrl}
                            alt="Pulang"
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #1c1c1e',
                              position: 'absolute',
                              left: rec.selfieUrl ? '16px' : 0,
                              zIndex: 1,
                              transition: 'transform 0.15s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.zIndex = '10';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.zIndex = '1';
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>-</div>
                    )}
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.88rem', display: 'block', fontWeight: 600 }}>{rec.userName}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rec.userNip}</span>
                    </div>
                  </div>

                  {/* Status Badge with active pinging dot */}
                  <span
                    className={`badge badge-${rec.status}`}
                    style={{
                      flexShrink: 0,
                      gap: '0.35rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      padding: '0.25rem 0.6rem'
                    }}
                  >
                    <span className="dot-ping">
                      <span className="dot-ping-wave" style={{ backgroundColor: dotColor }} />
                      <span className="dot-ping-core" style={{ backgroundColor: dotColor }} />
                    </span>
                    <span>{rec.status.toUpperCase()}</span>
                  </span>
                </div>

                {/* Bawah: Info presensi dengan Tooltip interaktif */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.02)' }}>
                  {/* Jam Masuk */}
                  <div className="has-tooltip">
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>MASUK</span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 500 }}>{formatTime(rec.checkInTime) || '-'}</span>
                    <span className="tooltip-box">
                      Presensi Masuk pada {formatDateIndo(rec.date)} pukul {formatTime(rec.checkInTime) || '--:--'} WIT
                    </span>
                  </div>

                  {/* Jam Pulang */}
                  <div className="has-tooltip">
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>PULANG</span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 500 }}>{formatTime(rec.checkOutTime) || '-'}</span>
                    <span className="tooltip-box">
                      Presensi Pulang pada pukul {formatTime(rec.checkOutTime) || '--:--'} WIT
                    </span>
                  </div>

                  {/* Jarak GPS */}
                  <div className="has-tooltip">
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>JARAK GPS</span>
                    <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 500 }}>{rec.distanceMeters ?? 0}m</span>
                    <span className="tooltip-box">
                      Akurasi jarak {rec.distanceMeters ?? 0} meter dari koordinat resmi sekolah
                    </span>
                  </div>
                </div>

                {/* Keterangan durasi keterlambatan */}
                {rec.status === 'terlambat' && rec.notes && rec.notes.startsWith('Terlambat:') && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'rgba(251,146,60,0.08)',
                    border: '1px solid rgba(251,146,60,0.2)',
                    borderRadius: '7px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem', color: '#fb923c'
                  }}>
                    <AlertTriangle size={13} />
                    <span>{rec.notes}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over panel Sheet (menggantikan modal pop-up visual lama) */}
      {selectedRecord && (
        <AttendanceSheet
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </>
  );
};
