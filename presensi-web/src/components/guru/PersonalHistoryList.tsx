import React from 'react';
import { AttendanceRecord } from '../../types';
import { Calendar, AlertTriangle } from 'lucide-react';
import { formatDateIndo, formatTime } from '../../utils/haversine';

interface PersonalHistoryListProps {
  userHistory: AttendanceRecord[];
}

export const PersonalHistoryList: React.FC<PersonalHistoryListProps> = ({ userHistory }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <Calendar size={15} color="var(--text-muted)" />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Riwayat Kehadiran</span>
      </div>

      {userHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Belum ada riwayat presensi.
        </div>
      ) : (
        <div className="ios-group" style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {userHistory.map((rec, idx) => {
            // Fix #10: Ekstrak durasi terlambat dari notes
            let durasiTerlambat = '';
            if (rec.status === 'terlambat' && rec.notes) {
              const match = rec.notes.match(/Terlambat:\s*([^|]+)/);
              if (match) durasiTerlambat = match[1].trim();
            }

            return (
              <div
                key={rec.id}
                className="ios-row"
                style={{
                  borderBottom: idx < userHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.3rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#fff' }}>{formatDateIndo(rec.date)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Masuk {formatTime(rec.checkInTime)} &nbsp;·&nbsp; Pulang {formatTime(rec.checkOutTime)} &nbsp;·&nbsp; {rec.distanceMeters ?? '-'}m
                    </div>
                  </div>
                  <span className={`badge badge-${rec.status}`}>{rec.status.toUpperCase()}</span>
                </div>

                {/* Fix #10: Tampilkan durasi keterlambatan jika ada */}
                {durasiTerlambat && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    fontSize: '0.72rem', color: '#fb923c',
                    paddingLeft: '0.1rem'
                  }}>
                    <AlertTriangle size={11} />
                    <span>{durasiTerlambat}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
