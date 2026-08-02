import React from 'react';
import { AttendanceRecord } from '../../types';
import { CheckCircle2, Clock } from 'lucide-react';
import { formatDateIndo, formatTime } from '../../utils/haversine';

interface PresensiActionCardProps {
  todayStr: string;
  userTodayRecord: AttendanceRecord | undefined;
  notes: string;
  setNotes: (val: string) => void;
  isInRadius: boolean;
  handleCheckInSubmit: () => void;
  handleCheckOutSubmit: () => void;
}

export const PresensiActionCard: React.FC<PresensiActionCardProps> = ({
  todayStr,
  userTodayRecord,
  notes,
  setNotes,
  isInRadius,
  handleCheckInSubmit,
  handleCheckOutSubmit
}) => {
  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 500 }}>
        Presensi Hari Ini — {formatDateIndo(todayStr)}
      </div>

      {!userTodayRecord ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Catatan (opsional — misal: Piket, Daring...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="glass-input"
          />
          <button
            onClick={handleCheckInSubmit}
            disabled={!isInRadius}
            className="btn btn-success"
            style={{
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              width: '100%',
              opacity: isInRadius ? 1 : 0.4,
              cursor: isInRadius ? 'pointer' : 'not-allowed',
              borderRadius: 'var(--radius-md)',
              letterSpacing: '-0.01em',
            }}
          >
            <CheckCircle2 size={20} />
            {isInRadius ? 'Absen Masuk Sekarang' : 'Di Luar Radius Sekolah'}
          </button>
        </div>
      ) : (
        <div className="ios-group">
          <div className="ios-row">
            <div style={{ background: 'var(--success-bg)', padding: '0.4rem', borderRadius: '8px' }}>
              <CheckCircle2 size={16} color="var(--success)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>Sudah Absen Masuk</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Jam masuk: {formatTime(userTodayRecord.checkInTime)} &nbsp;•&nbsp;
                <span className={`badge badge-${userTodayRecord.status}`}>{userTodayRecord.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
          {!userTodayRecord.checkOutTime ? (
            <div style={{ padding: '0.75rem 1rem' }}>
              <button
                onClick={handleCheckOutSubmit}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <Clock size={18} />
                Absen Pulang — {formatTime(new Date().toISOString())} WIT
              </button>
            </div>
          ) : (
            <div className="ios-row" style={{ justifyContent: 'center' }}>
              <CheckCircle2 size={15} color="var(--success)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Presensi lengkap hari ini &nbsp;·&nbsp; Pulang: {formatTime(userTodayRecord.checkOutTime)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
