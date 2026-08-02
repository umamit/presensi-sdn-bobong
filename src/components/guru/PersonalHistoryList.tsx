import React from 'react';
import { AttendanceRecord } from '../../types';
import { Calendar } from 'lucide-react';
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
          {userHistory.map((rec, idx) => (
            <div key={rec.id} className="ios-row" style={{ borderBottom: idx < userHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#fff' }}>{formatDateIndo(rec.date)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Masuk {formatTime(rec.checkInTime)} &nbsp;·&nbsp; Pulang {formatTime(rec.checkOutTime)} &nbsp;·&nbsp; {rec.distanceMeters ?? '-'}m
                </div>
              </div>
              <span className={`badge badge-${rec.status}`}>{rec.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
