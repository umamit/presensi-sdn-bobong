import React from 'react';
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
import { useAttendanceTimer } from '../hooks/useAttendanceTimer';
import { getLocalDateString } from '../utils/haversine';
import { useState } from 'react';

interface GuruDashboardProps {
  user: UserProfile;
  schoolSettings: SchoolSettings;
  attendanceRecords: AttendanceRecord[];
  onCheckIn: (record: Partial<AttendanceRecord>) => void;
  onCheckOut: (recordId: string, checkOutTime: string, selfieUrl?: string) => void;
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

  const todayStr = getLocalDateString();
  const userTodayRecord = attendanceRecords.find(r => r.userNip === user.nip && r.date === todayStr);
  const userHistory = attendanceRecords
    .filter(r => r.userNip === user.nip)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentTime = useAttendanceTimer(userTodayRecord);
  const { userCoords, distance, gpsLoading, gpsError, isInRadius, fetchGpsLocation } = useGpsLocation(schoolSettings);

  const requestNotificationAccess = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleCheckInSubmit = () => {
    requestNotificationAccess();
    if (!isInRadius) {
      alert(`Gagal Absen: Anda berada di luar radius sekolah (${distance}m dari max ${schoolSettings.radiusMeters}m).`);
      return;
    }

    const nowISO = new Date().toISOString();
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', hour12: false });
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
    let attendanceStatus: 'hadir' | 'terlambat' = 'hadir';
    let latenessNote = notes || `Presensi Masuk Shift ${detectedShift.toUpperCase()}`;

    if (nowTimeStr > workStart) {
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

  const handleSelfieCapture = (imageDataUrl: string) => {
    if (selfieMode === 'in') {
      if (!pendingCheckIn) return;
      onCheckIn({ ...pendingCheckIn, selfieUrl: imageDataUrl });
      setPendingCheckIn(null);
    } else if (selfieMode === 'out') {
      if (!userTodayRecord) return;
      onCheckOut(userTodayRecord.id, new Date().toISOString(), imageDataUrl);
    }
    setSelfieMode(null);
    setIsSelfieOpen(false);
  };

  const handleCheckOutSubmit = () => {
    if (!userTodayRecord) return;
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', hour12: false });
    const userShift = userTodayRecord.shift || 'pagi';
    const targetCheckOutStart = userShift === 'pagi' ? (schoolSettings.pagiCheckOutStart || '11:45') : (schoolSettings.siangCheckOutStart || '16:00');
    const targetCheckOutEnd = userShift === 'pagi' ? (schoolSettings.pagiCheckOutEnd || '12:00') : (schoolSettings.siangCheckOutEnd || '16:45');

    if (nowTimeStr < targetCheckOutStart) { alert(`Absen pulang belum dibuka (Mulai ${targetCheckOutStart} WIT).`); return; }
    if (nowTimeStr > targetCheckOutEnd) { alert(`Batas waktu presensi telah berakhir (${targetCheckOutEnd} WIT).`); return; }
    
    // Minta deteksi GPS pulang terlebih dahulu untuk memastikan guru berada di lokasi saat pulang
    if (!isInRadius) {
      alert(`Gagal Absen Pulang: Anda berada di luar radius sekolah (${distance}m dari max ${schoolSettings.radiusMeters}m).`);
      return;
    }

    setSelfieMode('out');
    setIsSelfieOpen(true);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <GuruHeader user={user} currentTime={currentTime} schoolSettings={schoolSettings} />
        <GpsStatusCard isInRadius={isInRadius} distance={distance} gpsLoading={gpsLoading} gpsError={gpsError} userCoords={userCoords} schoolSettings={schoolSettings} fetchGpsLocation={fetchGpsLocation} />
        <GeofenceMap userCoords={userCoords} centerCoords={{ lat: schoolSettings.latitude, lng: schoolSettings.longitude }} radiusMeters={schoolSettings.radiusMeters} isInRadius={isInRadius} distanceMeters={distance} />
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
        />
        <QuickActionButtons setIsChangePassOpen={setIsChangePassOpen} setIsGuideOpen={setIsGuideOpen} onOpenLeaveModal={onOpenLeaveModal} />
        <PersonalHistoryList userHistory={userHistory} />
      </div>

      {isSelfieOpen && <SelfieModal guruName={user.fullName} onCapture={handleSelfieCapture} onClose={() => { setPendingCheckIn(null); setIsSelfieOpen(false); }} />}
      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
      {isChangePassOpen && <ChangePasswordModal currentUser={user} onClose={() => setIsChangePassOpen(false)} onUpdatePassword={onUpdatePassword} />}
    </>
  );
};
