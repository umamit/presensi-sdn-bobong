import React, { useState } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings } from '../types';
import { GeofenceMap } from './GeofenceMap';
import { SelfieModal } from './SelfieModal';
import { GuideModal } from './GuideModal';
import { ChangePasswordModal } from './ChangePasswordModal';

import { GuruHeader } from './guru/GuruHeader';
import { GpsStatusCard } from './guru/GpsStatusCard';
import { PresensiActionCard } from './guru/PresensiActionCard';
import { QuickActionButtons } from './guru/QuickActionButtons';
import { PersonalHistoryList } from './guru/PersonalHistoryList';

import { useGpsLocation } from '../hooks/useGpsLocation';
import { useAttendanceTimer, useClockTick } from '../hooks/useAttendanceTimer';
import { getLocalDateString } from '../utils/haversine';
import { Fingerprint, History, Menu, Map } from 'lucide-react';

interface GuruDashboardProps {
  user: UserProfile;
  schoolSettings: SchoolSettings;
  attendanceRecords: AttendanceRecord[];
  onCheckIn: (record: Partial<AttendanceRecord>) => void;
  onCheckOut: (recordId: string, checkOutTime: string, selfieUrl?: string, bypassNote?: string) => void;
  onOpenLeaveModal: () => void;
  onUpdatePassword: (userId: string, newPass: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({
  user, schoolSettings, attendanceRecords,
  onCheckIn, onCheckOut, onOpenLeaveModal, onUpdatePassword
}) => {
  const [notes, setNotes] = useState('');
  const [isSelfieOpen, setIsSelfieOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<Partial<AttendanceRecord> | null>(null);
  const [selfieMode, setSelfieMode] = useState<'in' | 'out' | null>(null);
  const [activeTab, setActiveTab] = useState<'absen' | 'riwayat' | 'menu'>('absen');
  const [showMap, setShowMap] = useState(false);
  const [isDinasLuar, setIsDinasLuar] = useState(false);

  const todayStr = getLocalDateString();
  const userTodayRecord = attendanceRecords.find(r => r.userNip === user.nip && r.date === todayStr);
  const userHistory = attendanceRecords
    .filter(r => r.userNip === user.nip)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentTime = useClockTick();
  useAttendanceTimer(userTodayRecord, schoolSettings);
  const { userCoords, distance, gpsLoading, gpsError, isInRadius, fetchGpsLocation } = useGpsLocation(schoolSettings);

  const requestNotificationAccess = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleCheckInSubmit = () => {
    requestNotificationAccess();
    if (!isDinasLuar && !isInRadius) {
      alert(`Gagal Absen: Anda berada di luar radius sekolah (${distance}m dari max ${schoolSettings.radiusMeters}m).`);
      return;
    }

    const nowISO = new Date().toISOString();
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\./g, ':');
    const detectedShift: 'pagi' | 'siang' = user.shift || (nowTimeStr < '12:00' ? 'pagi' : 'siang');

    const checkInOpen   = detectedShift === 'pagi' ? (schoolSettings.pagiCheckInOpen   || '06:00') : (schoolSettings.siangCheckInOpen   || '12:00');
    const workStart     = detectedShift === 'pagi' ? (schoolSettings.pagiWorkStart      || '07:15') : (schoolSettings.siangWorkStart      || '12:45');
    const checkOutStart = detectedShift === 'pagi' ? (schoolSettings.pagiCheckOutStart  || '11:45') : (schoolSettings.siangCheckOutStart  || '16:00');

    if (nowTimeStr < checkInOpen) {
      alert(`Presensi Shift ${detectedShift === 'pagi' ? 'Pagi' : 'Siang'} belum dibuka (Mulai ${checkInOpen} WIT).`); return;
    }
    if (nowTimeStr >= checkOutStart) {
      alert(`Batas waktu absen masuk Shift ${detectedShift === 'pagi' ? 'Pagi' : 'Siang'} telah berakhir (${checkOutStart} WIT). Anda tidak dapat absen lagi.`); return;
    }

    // Hitung status & durasi keterlambatan
    let attendanceStatus: 'hadir' | 'terlambat' | 'dinas_luar' = 'hadir';
    let latenessNote = notes || `Presensi Masuk Shift ${detectedShift.toUpperCase()}`;

    if (isDinasLuar) {
      attendanceStatus = 'dinas_luar';
      latenessNote = notes ? `Dinas Luar: ${notes}` : 'Tugas Dinas Luar';
    } else if (nowTimeStr > workStart) {
      attendanceStatus = 'terlambat';
      // Hitung selisih detik antara nowTimeStr dan workStart
      const toSecs = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 3600 + m * 60;
      };
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jayapura',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
      const parts = formatter.formatToParts(currentTime);
      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      const s = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);
      const nowSecs = h * 3600 + m * 60 + s;
      const workSecs = toSecs(workStart);
      const diffSecs = nowSecs - workSecs;
      const jm = Math.floor(diffSecs / 3600);
      const mn = Math.floor((diffSecs % 3600) / 60);
      const dt = diffSecs % 60;
      const durasiText = [
        jm > 0 ? `${jm} jam` : '',
        mn > 0 ? `${mn} menit` : '',
        `${dt} detik`
      ].filter(Boolean).join(' ');
      latenessNote = `Terlambat: ${durasiText}${notes ? ` — ${notes}` : ''}`;
    }

    setPendingCheckIn({
      userId: user.id, userName: user.fullName, userNip: user.nip,
      date: todayStr, checkInTime: nowISO,
      checkInLat: userCoords?.lat, checkInLng: userCoords?.lng,
      distanceMeters: distance || 0, status: attendanceStatus, shift: detectedShift,
      notes: latenessNote
    });
    setSelfieMode('in');
    setIsSelfieOpen(true);
  };

  const handleSelfieCapture = (imageDataUrl: string, bypassNote?: string) => {
    if (selfieMode === 'in') {
      if (!pendingCheckIn) return;
      let finalCheckIn = { ...pendingCheckIn, selfieUrl: imageDataUrl };
      if (bypassNote) {
        finalCheckIn.notes = finalCheckIn.notes 
          ? `${finalCheckIn.notes} | ${bypassNote}` 
          : bypassNote;
      }
      onCheckIn(finalCheckIn);
      setPendingCheckIn(null);
    } else if (selfieMode === 'out') {
      if (!userTodayRecord) return;
      onCheckOut(userTodayRecord.id, new Date().toISOString(), imageDataUrl, bypassNote);
    }
    setSelfieMode(null);
    setIsSelfieOpen(false);
  };

  const handleCheckOutSubmit = () => {
    if (!userTodayRecord) return;
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\./g, ':');
    const userShift = userTodayRecord.shift || 'pagi';
    const targetCheckOutStart = userShift === 'pagi' ? (schoolSettings.pagiCheckOutStart || '11:45') : (schoolSettings.siangCheckOutStart || '16:00');
    const targetCheckOutEnd = userShift === 'pagi' ? (schoolSettings.pagiCheckOutEnd || '12:00') : (schoolSettings.siangCheckOutEnd || '16:45');

    if (nowTimeStr < targetCheckOutStart) { alert(`Absen pulang belum dibuka (Mulai ${targetCheckOutStart} WIT).`); return; }
    if (nowTimeStr > targetCheckOutEnd) { alert(`Batas waktu presensi telah berakhir (${targetCheckOutEnd} WIT).`); return; }
    
    // Minta deteksi GPS pulang terlebih dahulu (kecuali jika berstatus Dinas Luar)
    const activeDinasLuar = userTodayRecord.status === 'dinas_luar';
    if (!activeDinasLuar && !isInRadius) {
      alert(`Gagal Absen Pulang: Anda berada di luar radius sekolah (${distance}m dari max ${schoolSettings.radiusMeters}m).`);
      return;
    }

    setSelfieMode('out');
    setIsSelfieOpen(true);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '75px' }}>
        {activeTab === 'absen' && (
          <>
            <GuruHeader user={user} currentTime={currentTime} schoolSettings={schoolSettings} />
            <GpsStatusCard isInRadius={isInRadius} distance={distance} gpsLoading={gpsLoading} gpsError={gpsError} userCoords={userCoords} schoolSettings={schoolSettings} fetchGpsLocation={fetchGpsLocation} />
            
            <button
              onClick={() => setShowMap(!showMap)}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                padding: '0.5rem 1rem',
                width: '100%',
                marginTop: '-0.5rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              <Map size={14} />
              {showMap ? 'Sembunyikan Peta Lokasi' : 'Tampilkan Peta Lokasi'}
            </button>

            {showMap && (
              <GeofenceMap userCoords={userCoords} centerCoords={{ lat: schoolSettings.latitude, lng: schoolSettings.longitude }} radiusMeters={schoolSettings.radiusMeters} isInRadius={isInRadius} distanceMeters={distance} />
            )}

            <PresensiActionCard
              todayStr={todayStr}
              userTodayRecord={userTodayRecord}
              notes={notes}
              setNotes={setNotes}
              isInRadius={isInRadius}
              handleCheckInSubmit={handleCheckInSubmit}
              handleCheckOutSubmit={handleCheckOutSubmit}
              currentTime={currentTime}
              schoolSettings={schoolSettings}
              userShift={user.shift || 'pagi'}
              isDinasLuar={isDinasLuar}
              onToggleDinasLuar={setIsDinasLuar}
            />
          </>
        )}

        {activeTab === 'riwayat' && (
          <>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', paddingLeft: '0.25rem', marginBottom: '-0.5rem' }}>RIWAYAT KEHADIRAN PRIBADI</div>
            <PersonalHistoryList userHistory={userHistory} />
          </>
        )}

        {activeTab === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>PILIHAN MENU</div>
            <QuickActionButtons setIsChangePassOpen={setIsChangePassOpen} setIsGuideOpen={setIsGuideOpen} onOpenLeaveModal={onOpenLeaveModal} />
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'rgba(28,28,30,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setActiveTab('absen')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: activeTab === 'absen' ? 'var(--primary)' : 'var(--text-muted)',
            gap: '3px',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            flex: 1
          }}
        >
          <Fingerprint size={20} color={activeTab === 'absen' ? 'var(--primary)' : 'var(--text-muted)'} />
          <span>Presensi</span>
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: activeTab === 'riwayat' ? 'var(--primary)' : 'var(--text-muted)',
            gap: '3px',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            flex: 1
          }}
        >
          <History size={20} color={activeTab === 'riwayat' ? 'var(--primary)' : 'var(--text-muted)'} />
          <span>Riwayat</span>
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: activeTab === 'menu' ? 'var(--primary)' : 'var(--text-muted)',
            gap: '3px',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            flex: 1
          }}
        >
          <Menu size={20} color={activeTab === 'menu' ? 'var(--primary)' : 'var(--text-muted)'} />
          <span>Menu</span>
        </button>
      </div>

      {isSelfieOpen && <SelfieModal guruName={user.fullName} faceDescriptor={user.faceDescriptor} onCapture={handleSelfieCapture} onClose={() => { setPendingCheckIn(null); setIsSelfieOpen(false); }} />}
      {isGuideOpen && <GuideModal schoolSettings={schoolSettings} onClose={() => setIsGuideOpen(false)} />}
      {isChangePassOpen && <ChangePasswordModal currentUser={user} onClose={() => setIsChangePassOpen(false)} onUpdatePassword={onUpdatePassword} />}
    </>
  );
};
