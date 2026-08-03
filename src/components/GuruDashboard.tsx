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
  onCheckOut: (recordId: string, checkOutTime: string) => void;
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

  const todayStr = getLocalDateString();
  const userTodayRecord = attendanceRecords.find(r => r.userId === user.id && r.date === todayStr);
  const userHistory = attendanceRecords
    .filter(r => r.userId === user.id)
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
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Perbaikan: Shift Pagi mencakup jam 00:00 - 12:00 WIT. Jam 08:00 - 12:00 WIT adalah waktu TERKUNCI (Telah lewat batas pagi)
    let detectedShift: 'pagi' | 'siang' = user.shift || (nowTimeStr < '12:00' ? 'pagi' : 'siang');

    if (detectedShift === 'pagi') {
      if (nowTimeStr < (schoolSettings.pagiCheckInOpen || '06:00')) {
        alert(`Presensi Shift Pagi belum dibuka (Mulai ${schoolSettings.pagiCheckInOpen || '06:00'} WIT).`); return;
      }
      if (nowTimeStr > (schoolSettings.pagiWorkStart || '08:00')) {
        alert(`Batas waktu presensi Shift Pagi telah berakhir (${schoolSettings.pagiWorkStart || '08:00'} WIT). Anda tidak dapat absen lagi.`); return;
      }
    } else {
      if (nowTimeStr < (schoolSettings.siangCheckInOpen || '12:00')) {
        alert(`Presensi Shift Siang belum dibuka (Mulai ${schoolSettings.siangCheckInOpen || '12:00'} WIT).`); return;
      }
      if (nowTimeStr > (schoolSettings.siangWorkStart || '12:30')) {
        alert(`Batas waktu presensi Shift Siang telah berakhir (${schoolSettings.siangWorkStart || '12:30'} WIT). Anda tidak dapat absen lagi.`); return;
      }
    }

    setPendingCheckIn({
      userId: user.id, userName: user.fullName, userNip: user.nip,
      date: todayStr, checkInTime: nowISO,
      checkInLat: userCoords?.lat, checkInLng: userCoords?.lng,
      distanceMeters: distance || 0, status: 'hadir', shift: detectedShift,
      notes: notes || `Presensi Masuk Shift ${detectedShift.toUpperCase()}`
    });
    setIsSelfieOpen(true);
  };

  const handleSelfieCapture = (imageDataUrl: string) => {
    if (!pendingCheckIn) return;
    onCheckIn({ ...pendingCheckIn, selfieUrl: imageDataUrl });
    setPendingCheckIn(null);
    setIsSelfieOpen(false);
  };

  const handleCheckOutSubmit = () => {
    if (!userTodayRecord) return;
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const userShift = userTodayRecord.shift || 'pagi';
    const targetCheckOutStart = userShift === 'pagi' ? (schoolSettings.pagiCheckOutStart || '11:45') : (schoolSettings.siangCheckOutStart || '16:00');
    const targetCheckOutEnd = userShift === 'pagi' ? (schoolSettings.pagiCheckOutEnd || '12:00') : (schoolSettings.siangCheckOutEnd || '16:45');

    if (nowTimeStr < targetCheckOutStart) { alert(`Absen pulang belum dibuka (Mulai ${targetCheckOutStart} WIT).`); return; }
    if (nowTimeStr > targetCheckOutEnd) { alert(`Batas waktu presensi telah berakhir (${targetCheckOutEnd} WIT).`); return; }
    onCheckOut(userTodayRecord.id, new Date().toISOString());
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <GuruHeader user={user} currentTime={currentTime} schoolSettings={schoolSettings} />
        <GpsStatusCard isInRadius={isInRadius} distance={distance} gpsLoading={gpsLoading} gpsError={gpsError} userCoords={userCoords} schoolSettings={schoolSettings} fetchGpsLocation={fetchGpsLocation} />
        <GeofenceMap userCoords={userCoords} centerCoords={{ lat: schoolSettings.latitude, lng: schoolSettings.longitude }} polygonCoords={schoolSettings.polygonCoords} radiusMeters={schoolSettings.radiusMeters} isInRadius={isInRadius} distanceMeters={distance} />
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
