import React from 'react';
import { AttendanceRecord, SchoolSettings } from '../../types';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatDateIndo, formatTime, formatTimeWIT24h } from '../../utils/haversine';

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
  isDinasLuar?: boolean;
  onToggleDinasLuar?: (val: boolean) => void;
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
  userShift = 'pagi',
  isDinasLuar = false,
  onToggleDinasLuar
}) => {
  const nowTimeStr = formatTimeWIT24h(currentTime);
  const openTime = userShift === 'pagi' ? (schoolSettings?.pagiCheckInOpen || '06:00') : (schoolSettings?.siangCheckInOpen || '12:00');
  const workStart = userShift === 'pagi' ? (schoolSettings?.pagiWorkStart || '07:15') : (schoolSettings?.siangWorkStart || '12:45');
  const closeTime = userShift === 'pagi' ? (schoolSettings?.pagiCheckOutStart || '11:45') : (schoolSettings?.siangCheckOutStart || '16:00');

  const isTooEarly = nowTimeStr < openTime;
  const isTooLate = nowTimeStr > closeTime;
  const isLateness = nowTimeStr > workStart && !isTooLate;
  const isTimeValid = !isTooEarly && !isTooLate;

  // Jika sedang Dinas Luar, abaikan pengecekan radius GPS sekolah
  const activeDinasLuar = userTodayRecord ? (userTodayRecord.status === 'dinas_luar' || userTodayRecord.status === 'dinas_luar_approved') : isDinasLuar;
  const isEffectiveInRadius = activeDinasLuar || isInRadius;
  const isButtonEnabled = isEffectiveInRadius && isTimeValid;

  let buttonText = 'Absen Masuk Sekarang';
  if (isDinasLuar) {
    buttonText = 'Absen Masuk Dinas Luar';
  } else if (!isInRadius) {
    buttonText = 'Di Luar Radius Sekolah';
  } else if (isTooEarly) {
    buttonText = `Belum Buka (Mulai ${openTime} WIT)`;
  } else if (isTooLate) {
    buttonText = `Absen Tutup (Batas ${closeTime} WIT)`;
  } else if (isLateness) {
    buttonText = 'Absen Masuk (Terlambat)';
  }

  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 500 }}>
        Presensi Hari Ini — {formatDateIndo(todayStr)}
      </div>

      {!userTodayRecord && onToggleDinasLuar && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '0.65rem 0.85rem',
          marginBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Dinas Luar / Tugas Luar</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Presensi dinas di luar lingkungan sekolah</span>
          </div>
          <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
            <input
              type="checkbox"
              checked={isDinasLuar}
              onChange={(e) => onToggleDinasLuar(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0, left: 0, right: 0, bottom: 0,
              background: isDinasLuar ? 'var(--primary)' : '#3a3a3c',
              borderRadius: '24px',
              transition: '0.3s'
            }}>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '18px', width: '18px',
                left: isDinasLuar ? '22px' : '3px',
                bottom: '3px',
                background: '#fff',
                borderRadius: '50%',
                transition: '0.3s'
              }} />
            </span>
          </label>
        </div>
      )}

      {!userTodayRecord ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Catatan (opsional — misal: Piket, Daring...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="glass-input"
          />
          {isLateness && isButtonEnabled && (
            <div style={{
              background: 'rgba(251, 146, 60, 0.12)',
              border: '1px solid rgba(251, 146, 60, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.78rem', color: '#fb923c'
            }}>
              <AlertTriangle size={14} />
              <span>Anda melewati jam masuk <strong>{workStart} WIT</strong>. Presensi akan tercatat sebagai <strong>TERLAMBAT</strong>.</span>
            </div>
          )}
          <button
            onClick={handleCheckInSubmit}
            disabled={!isButtonEnabled}
            className={isLateness ? 'btn' : 'btn btn-success'}
            style={{
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              width: '100%',
              opacity: isButtonEnabled ? 1 : 0.45,
              cursor: isButtonEnabled ? 'pointer' : 'not-allowed',
              borderRadius: 'var(--radius-md)',
              letterSpacing: '-0.01em',
              ...(isLateness ? {
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 14px rgba(249,115,22,0.4)'
              } : {})
            }}
          >
            {isLateness ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
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
              const isOutEnabled = isEffectiveInRadius && !isOutTooEarly && !isOutTooLate;

              let outButtonText = `Absen Pulang (${nowTimeStr} WIT)`;
              if (activeDinasLuar) {
                outButtonText = 'Absen Pulang Dinas Luar';
              } else if (!isInRadius) {
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
