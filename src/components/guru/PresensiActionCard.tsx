import React from 'react';
import { AttendanceRecord, SchoolSettings } from '../../types';
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
  currentTime?: Date;
  schoolSettings?: SchoolSettings;
  userShift?: 'pagi' | 'siang';
}

export const PresensiActionCard: React.FC<PresensiActionCardProps> = ({
  todayStr,
  userTodayRecord,
  notes,
  setNotes,
  isInRadius,
  handleCheckInSubmit,
  handleCheckOutSubmit,
  currentTime = new Date(),
  schoolSettings,
  userShift = 'pagi'
}) => {
  const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  const openTime = userShift === 'pagi' ? (schoolSettings?.pagiCheckInOpen || '06:00') : (schoolSettings?.siangCheckInOpen || '12:00');
  const closeTime = userShift === 'pagi' ? (schoolSettings?.pagiWorkStart || '08:00') : (schoolSettings?.siangWorkStart || '12:30');

  const isTooEarly = nowTimeStr < openTime;
  const isTooLate = nowTimeStr > closeTime;
  const isTimeValid = !isTooEarly && !isTooLate;

  const isButtonEnabled = isInRadius && isTimeValid;

  let buttonText = 'Absen Masuk Sekarang';
  if (!isInRadius) {
    buttonText = 'Di Luar Radius Sekolah';
  } else if (isTooEarly) {
    buttonText = `Belum Buka (Mulai ${openTime} WIT)`;
  } else if (isTooLate) {
    buttonText = `Absen Tutup (Batas ${closeTime} WIT)`;
  }

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
            disabled={!isButtonEnabled}
            className="btn btn-success"
            style={{
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              width: '100%',
              opacity: isButtonEnabled ? 1 : 0.45,
              cursor: isButtonEnabled ? 'pointer' : 'not-allowed',
              borderRadius: 'var(--radius-md)',
              letterSpacing: '-0.01em',
            }}
          >
            <CheckCircle2 size={20} />
            {buttonText}
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
            (() => {
              const outStart = userShift === 'pagi' ? (schoolSettings?.pagiCheckOutStart || '11:45') : (schoolSettings?.siangCheckOutStart || '16:00');
              const outEnd = userShift === 'pagi' ? (schoolSettings?.pagiCheckOutEnd || '12:00') : (schoolSettings?.siangCheckOutEnd || '16:45');
              const isOutTooEarly = nowTimeStr < outStart;
              const isOutTooLate = nowTimeStr > outEnd;
              const isOutEnabled = isInRadius && !isOutTooEarly && !isOutTooLate;

              let outButtonText = `Absen Pulang (${nowTimeStr} WIT)`;
              if (!isInRadius) {
                outButtonText = 'Di Luar Radius Sekolah';
              } else if (isOutTooEarly) {
                outButtonText = `Pulang Belum Buka (Mulai ${outStart} WIT)`;
              } else if (isOutTooLate) {
                outButtonText = `Absen Pulang Tutup (Batas ${outEnd} WIT)`;
              }

              return (
                <div style={{ padding: '0.75rem 1rem' }}>
                  <button
                    onClick={handleCheckOutSubmit}
                    disabled={!isOutEnabled}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      opacity: isOutEnabled ? 1 : 0.5,
                      cursor: isOutEnabled ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Clock size={18} />
                    {outButtonText}
                  </button>
                </div>
              );
            })()
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
