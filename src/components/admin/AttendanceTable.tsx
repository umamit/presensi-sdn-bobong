import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { exportAttendanceCsv } from '../../utils/exportCsv';
import { formatTime } from '../../utils/haversine';
import { SelfiePreviewModal } from '../SelfiePreviewModal';

interface AttendanceTableProps {
  filteredRecords: AttendanceRecord[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  filteredRecords,
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate
}) => {
  const [selectedPreviewRecord, setSelectedPreviewRecord] = useState<AttendanceRecord | null>(null);

  return (
    <>
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        {/* Header + Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Daftar Presensi Guru</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="glass-input"
              style={{ flex: '1 1 130px', minWidth: '130px' }}
            />
            <div style={{ position: 'relative', flex: '2 1 180px', minWidth: '140px' }}>
              <input
                type="text"
                placeholder="Cari NIP / nama guru..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.2rem', width: '100%' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button
              onClick={() => exportAttendanceCsv(filteredRecords)}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <Download size={14} /> Ekspor Rekap (Excel/CSV)
            </button>
          </div>
        </div>

        {/* Card List (Mobile-first, no table) */}
        {filteredRecords.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Tidak ada catatan presensi untuk tanggal ini.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredRecords.map((rec) => (
              <div key={rec.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.9rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {rec.selfieUrl ? (
                      <button
                        onClick={() => setSelectedPreviewRecord(rec)}
                        title="Klik untuk melihat foto presensi"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <img src={rec.selfieUrl} alt="Selfie" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--secondary)', flexShrink: 0 }} />
                      </button>
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', color: 'var(--text-dim)' }}>-</div>
                    )}
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{rec.userName}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rec.userNip}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${rec.status}`} style={{ flexShrink: 0 }}>{rec.status.toUpperCase()}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.7rem' }}>Masuk</span>
                    <span style={{ color: '#fff' }}>{formatTime(rec.checkInTime) || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.7rem' }}>Pulang</span>
                    <span style={{ color: '#fff' }}>{formatTime(rec.checkOutTime) || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.7rem' }}>Jarak GPS</span>
                    <span style={{ color: 'var(--secondary)' }}>{rec.distanceMeters ?? 0}m</span>
                  </div>
                </div>

                {rec.notes && !rec.notes.includes('https://') && !rec.notes.includes('http://') && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{rec.notes}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPreviewRecord && (
        <SelfiePreviewModal
          record={selectedPreviewRecord}
          onClose={() => setSelectedPreviewRecord(null)}
        />
      )}
    </>
  );
};
