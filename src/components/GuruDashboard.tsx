import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings } from '../types';
import { calculateDistanceMeters, formatTime, formatDateIndo, isPointInPolygon } from '../utils/haversine';
import { MapPin, Navigation, Clock, CheckCircle2, AlertTriangle, Calendar, FileText, Send, RefreshCw, Compass, ShieldCheck, Camera, HelpCircle, Key } from 'lucide-react';
import { GeofenceMap } from './GeofenceMap';
import { SelfieModal } from './SelfieModal';
import { GuideModal } from './GuideModal';
import { ChangePasswordModal } from './ChangePasswordModal';

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
  user,
  schoolSettings,
  attendanceRecords,
  onCheckIn,
  onCheckOut,
  onOpenLeaveModal,
  onUpdatePassword
}) => {
  // Live clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // GPS Geolocation state
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSelfieOpen, setIsSelfieOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<Partial<AttendanceRecord> | null>(null);

  // Filter attendance records for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayRecord = attendanceRecords.find(
    r => r.userId === user.id && r.date === todayStr
  );
  const userHistory = attendanceRecords
    .filter(r => r.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Function to safely request push notification permissions on user interaction
  const requestNotificationAccess = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Update clock every second & check for notification reminder
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Cek jam 07:00 WIT & belum absen
      const hoursStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (hoursStr === '07:00' && !userTodayRecord && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Pengingat Presensi SD Negeri Bobong', {
          body: 'Jangan lupa melakukan presensi masuk hari ini sebelum jam 07:15 WIT!',
          icon: '/icon-192.png'
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [userTodayRecord]);

  // Function to get GPS location
  const fetchGpsLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation GPS.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Cek akurasi sinyal GPS (Fake GPS di HP Root/Jailbreak sering menghasilkan accuracy = 0 atau angka bulat sempurna tanpa desimal)
        const accuracy = position.coords.accuracy;
        
        // Peringatan jika akurasi mencurigakan / terlalu rendah (> 100m) atau 0 (indikator Mock Provider)
        if (accuracy === 0) {
          setGpsError('Terdeteksi lokasi tidak valid (Mock GPS). Mohon matikan aplikasi pengubah lokasi atau gunakan perangkat standar.');
        } else if (accuracy > 100) {
          setGpsError(`Sinyal GPS kurang akurat (Tingkat ketelitian: ${Math.round(accuracy)}m). Mohon buka tempat terbuka atau aktifkan GPS Akurasi Tinggi.`);
        }

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        const dist = calculateDistanceMeters(
          lat,
          lng,
          schoolSettings.latitude,
          schoolSettings.longitude
        );
        setDistance(dist);
        setIsSimulated(false);
        setGpsLoading(false);
      },
      (error) => {
        console.warn('GPS Error:', error.message);
        setGpsError('Akses lokasi/GPS terlanjur ditolak di HP Anda. Silakan tekan tombol "Panduan Absen" di bawah untuk melihat 3 langkah mudah mengizinkan kembali GPS.');
        setUserCoords(null);
        setDistance(null);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };



  // Langsung minta lokasi GPS perangkat saat komponen dibuka
  useEffect(() => {
    fetchGpsLocation();
  }, [schoolSettings]);

  // Point in Polygon check + Radius check
  const inPolygon = (userCoords && schoolSettings.polygonCoords)
    ? isPointInPolygon([userCoords.lat, userCoords.lng], schoolSettings.polygonCoords)
    : false;

  const isInRadius = (distance !== null && distance <= schoolSettings.radiusMeters) || inPolygon;

  // Handle Absen Masuk Click — Buka kamera selfie terlebih dahulu
  const handleCheckInSubmit = () => {
    requestNotificationAccess();
    if (!isInRadius) {
      alert(`Gagal Absen: Anda berada di luar radius sekolah (${distance}m dari max ${schoolSettings.radiusMeters}m).`);
      return;
    }

    const nowISO = new Date().toISOString();
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // OTOMATIS VERIFIKASI BATAS KETAT JADWAL 2 SHIFT
    // Shift Pagi:
    // - Masuk: 06:00 - 11:45 WIT (06:00-08:00 Tepat Waktu, >08:00 Terlambat)
    // - Pulang: 11:45 - 12:00 WIT (Di atas 12:00 WIT Jendela Pagi Ditutup!)
    // Shift Siang:
    // - Masuk: 12:00 - 16:00 WIT (12:00-12:30 Tepat Waktu, >12:30 Terlambat)
    // - Pulang: 16:00 - 16:45 WIT (Di atas 16:45 WIT Jendela Siang Ditutup!)
    let detectedShift: 'pagi' | 'siang' = user.shift || (nowTimeStr < '12:00' ? 'pagi' : 'siang');
    let isLate = false;

    if (detectedShift === 'pagi') {
      if (nowTimeStr < (schoolSettings.pagiCheckInOpen || '06:00')) {
        alert(`Presensi Shift Pagi belum dibuka. Jendela presensi pagi dimulai jam ${schoolSettings.pagiCheckInOpen || '06:00'} WIT.`);
        return;
      }
      if (nowTimeStr > (schoolSettings.pagiWorkStart || '08:00')) {
        alert(`Batas waktu presensi masuk Shift Pagi telah berakhir (Maksimal jam ${schoolSettings.pagiWorkStart || '08:00'} WIT). Silakan hubungi Kepala Sekolah.`);
        return;
      }
    } else {
      if (nowTimeStr < (schoolSettings.siangCheckInOpen || '12:00')) {
        alert(`Presensi Shift Siang belum dibuka. Jendela presensi siang dimulai jam ${schoolSettings.siangCheckInOpen || '12:00'} WIT.`);
        return;
      }
      if (nowTimeStr > (schoolSettings.siangWorkStart || '12:30')) {
        alert(`Batas waktu presensi masuk Shift Siang telah berakhir (Maksimal jam ${schoolSettings.siangWorkStart || '12:30'} WIT). Silakan hubungi Kepala Sekolah.`);
        return;
      }
    }

    const status = 'hadir';

    // Simpan data absen sementara, tunggu selfie dikonfirmasi
    setPendingCheckIn({
      userId: user.id,
      userName: user.fullName,
      userNip: user.nip,
      date: todayStr,
      checkInTime: nowISO,
      checkInLat: userCoords?.lat,
      checkInLng: userCoords?.lng,
      distanceMeters: distance || 0,
      status: status,
      shift: detectedShift,
      notes: notes || (isLate ? `Presensi Masuk Shift ${detectedShift.toUpperCase()} (Terlambat)` : `Presensi Masuk Shift ${detectedShift.toUpperCase()} (Tepat Waktu)`)
    });

    // Buka modal kamera selfie
    setIsSelfieOpen(true);
  };

  // Setelah selfie dikonfirmasi, simpan rekap presensi dengan URL foto
  const handleSelfieCapture = (imageDataUrl: string) => {
    if (!pendingCheckIn) return;
    onCheckIn({ ...pendingCheckIn, selfieUrl: imageDataUrl });
    setPendingCheckIn(null);
    setIsSelfieOpen(false);
  };

  // Tutup modal selfie tanpa menyimpan
  const handleSelfieClose = () => {
    setPendingCheckIn(null);
    setIsSelfieOpen(false);
  };

  // Handle Absen Pulang Click
  const handleCheckOutSubmit = () => {
    if (!userTodayRecord) return;
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const userShift = userTodayRecord.shift || 'pagi';
    const targetCheckOutStart = userShift === 'pagi' ? (schoolSettings.pagiCheckOutStart || '11:45') : (schoolSettings.siangCheckOutStart || '16:00');
    const targetCheckOutEnd = userShift === 'pagi' ? (schoolSettings.pagiCheckOutEnd || '12:00') : (schoolSettings.siangCheckOutEnd || '16:45');

    if (nowTimeStr < targetCheckOutStart) {
      alert(`Absen pulang Shift ${userShift.toUpperCase()} belum dibuka. Jam pulang resmi dimulai pukul ${targetCheckOutStart} WIT.`);
      return;
    }

    if (nowTimeStr > targetCheckOutEnd) {
      alert(`Batas waktu presensi telah berakhir (Batas maksimal ${targetCheckOutEnd} WIT). Silakan hubungi Kepala Sekolah.`);
      return;
    }
    
    onCheckOut(userTodayRecord.id, new Date().toISOString());
  };

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* HEADER: Greeting + Clock */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.25rem 0', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Selamat datang,</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{user.fullName.split(' ').slice(0,2).join(' ')}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user.subject || 'Guru'} • NIP {user.nip}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>WIT • {formatDateIndo(currentTime.toISOString())}</div>
        </div>
      </div>

      {/* SHIFT INFO */}
      <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.78rem', color: 'var(--primary)' }}>
        Shift Pagi 06:00–08:00 / Pulang 11:45–12:00 &nbsp;|&nbsp; Shift Siang 12:00–12:30 / Pulang 16:00–16:45 WIT
      </div>

      {/* GPS CARD */}
      <div className="ios-group">
        <div className="ios-row" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className={`gps-pulse ${!isInRadius ? 'gps-pulse-out' : ''}`} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Lokasi GPS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isInRadius ? 'var(--success)' : 'var(--danger)' }}>
              {distance !== null ? `${distance}m — ${isInRadius ? 'Dalam Radius' : 'Di Luar'}` : 'Mendeteksi...'}
            </span>
            <button
              onClick={fetchGpsLocation}
              disabled={gpsLoading}
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <RefreshCw size={12} className={gpsLoading ? 'spin' : ''} />
              {gpsLoading ? 'GPS...' : 'Refresh'}
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="ios-row" style={{ background: 'var(--danger-bg)' }}>
            <AlertTriangle size={14} color="var(--danger)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--danger)', lineHeight: 1.4 }}>{gpsError}</span>
          </div>
        )}

        {/* Progress bar */}
        {distance !== null && (
          <div style={{ padding: '0 1rem 0.85rem' }}>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (distance / (schoolSettings.radiusMeters * 2)) * 100)}%`,
                height: '100%',
                background: isInRadius ? 'var(--success)' : 'var(--danger)',
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
              <span>Batas: {schoolSettings.radiusMeters}m</span>
              <span>{userCoords?.lat.toFixed(5)}, {userCoords?.lng.toFixed(5)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Geofence Map */}
      <GeofenceMap
        userCoords={userCoords}
        centerCoords={{ lat: schoolSettings.latitude, lng: schoolSettings.longitude }}
        polygonCoords={schoolSettings.polygonCoords}
        radiusMeters={schoolSettings.radiusMeters}
        isInRadius={isInRadius}
        distanceMeters={distance}
      />

      {/* PRESENSI ACTION */}
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

      {/* QUICK ACTIONS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setIsChangePassOpen(true)} className="btn btn-secondary" style={{ fontSize: '0.82rem', flex: 1 }}>
          <Key size={14} /> Ubah Sandi
        </button>
        <button onClick={() => setIsGuideOpen(true)} className="btn btn-secondary" style={{ fontSize: '0.82rem', flex: 1 }}>
          <HelpCircle size={14} /> Panduan
        </button>
        <button onClick={onOpenLeaveModal} className="btn btn-secondary" style={{ fontSize: '0.82rem', flex: 1 }}>
          <FileText size={14} /> Ajukan Izin
        </button>
      </div>

      {/* HISTORY */}
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

    </div>
        
    {/* Selfie Modal - Muncul saat Absen Masuk ditekan */}
    {isSelfieOpen && (
      <SelfieModal
        guruName={user.fullName}
        onCapture={handleSelfieCapture}
        onClose={handleSelfieClose}
      />
    )}

    {/* Guide Modal - Muncul saat tombol Panduan ditekan */}
    {isGuideOpen && (
      <GuideModal onClose={() => setIsGuideOpen(false)} />
    )}

    {/* Change Password Modal */}
    {isChangePassOpen && (
      <ChangePasswordModal
        currentUser={user}
        onClose={() => setIsChangePassOpen(false)}
        onUpdatePassword={onUpdatePassword}
      />
    )}
  </>
  );
};
