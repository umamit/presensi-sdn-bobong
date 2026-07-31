import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings } from '../types';
import { calculateDistanceMeters, formatTime, formatDateIndo, isPointInPolygon } from '../utils/haversine';
import { MapPin, Navigation, Clock, CheckCircle2, AlertTriangle, Calendar, FileText, Send, RefreshCw, Compass, ShieldCheck, Camera } from 'lucide-react';
import { GeofenceMap } from './GeofenceMap';
import { SelfieModal } from './SelfieModal';

interface GuruDashboardProps {
  user: UserProfile;
  schoolSettings: SchoolSettings;
  attendanceRecords: AttendanceRecord[];
  onCheckIn: (record: Partial<AttendanceRecord>) => void;
  onCheckOut: (recordId: string, checkOutTime: string) => void;
  onOpenLeaveModal: () => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({
  user,
  schoolSettings,
  attendanceRecords,
  onCheckIn,
  onCheckOut,
  onOpenLeaveModal
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
  const [pendingCheckIn, setPendingCheckIn] = useState<Partial<AttendanceRecord> | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter attendance records for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayRecord = attendanceRecords.find(
    r => r.userId === user.id && r.date === todayStr
  );
  const userHistory = attendanceRecords
    .filter(r => r.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        setGpsError('Perangkat ini belum mengizinkan akses lokasi. Klik tombol di bawah untuk mengizinkan akses GPS perangkat Anda.');
        setUserCoords(null);
        setDistance(null);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Simulasi lokasi untuk kemudahan demo/pengujian
  const simulateLocation = (inRadius: boolean) => {
    setIsSimulated(true);
    setGpsError(null);
    if (inRadius) {
      // Koordinat di dalam Polygon KML area presensi SD Negeri Bobong
      const lat = schoolSettings.latitude;
      const lng = schoolSettings.longitude;
      setUserCoords({ lat, lng });
      setDistance(calculateDistanceMeters(lat, lng, schoolSettings.latitude, schoolSettings.longitude));
    } else {
      // Koordinat di luar area presensi (~450m)
      const lat = schoolSettings.latitude + 0.004;
      const lng = schoolSettings.longitude + 0.004;
      setUserCoords({ lat, lng });
      setDistance(calculateDistanceMeters(lat, lng, schoolSettings.latitude, schoolSettings.longitude));
    }
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
    if (!isInRadius) {
      alert(`Gagal Absen: Anda berada di luar radius sekolah (${distance}m dari max ${schoolSettings.radiusMeters}m).`);
      return;
    }

    const nowISO = new Date().toISOString();
    const nowTimeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Cek apakah presensi dibuka (mulai jam 06:00)
    if (nowTimeStr < (schoolSettings.checkInOpenTime || '06:00')) {
      alert(`Presensi masuk belum dibuka. Presensi dibuka mulai jam ${schoolSettings.checkInOpenTime || '06:00'}.`);
      return;
    }

    const isLate = nowTimeStr > schoolSettings.workStartTime;
    const status = isLate ? 'terlambat' : 'hadir';

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
      notes: notes || (isLate ? 'Presensi Masuk (Terlambat)' : 'Presensi Masuk Tepat Waktu')
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
    
    if (nowTimeStr < (schoolSettings.workEndTime || '16:00')) {
      if (!confirm(`Belum memasuki jam pulang resmi (${schoolSettings.workEndTime || '16:00'}). Yakin ingin absen pulang sekarang?`)) {
        return;
      }
    }
    
    onCheckOut(userTodayRecord.id, new Date().toISOString());
  };

  return (
    <>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      
      {/* LEFT COLUMN: Main Presensi GPS Card */}
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '1.75rem' }}>
        
        {/* User Greeting & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Selamat Datang,</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{user.fullName}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>NIP: {user.nip} • {user.subject || 'Guru'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
              {currentTime.toLocaleTimeString('id-ID')} <span style={{ fontSize: '1.1rem' }}>WIT</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {formatDateIndo(currentTime.toISOString())}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '0.2rem', background: 'rgba(99,102,241,0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(99,102,241,0.25)', display: 'inline-block' }}>
              Masuk: {schoolSettings.checkInOpenTime || '06:00'} - {schoolSettings.workStartTime} WIT • Pulang: {schoolSettings.workEndTime} - {schoolSettings.checkOutEndTime || '17:00'} WIT
            </div>
          </div>
        </div>

        {/* GPS Location & Radius Status Box */}
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className={`gps-pulse ${!isInRadius ? 'gps-pulse-out' : ''}`}></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Status Deteksi Lokasi GPS</h3>
            </div>
            <button
              onClick={fetchGpsLocation}
              disabled={gpsLoading}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
            >
              <RefreshCw size={12} className={gpsLoading ? 'spin' : ''} />
              <span>{gpsLoading ? 'Mendapatkan GPS...' : 'Refresh Lokasi'}</span>
            </button>
          </div>

          {/* Distance Indicator Bar */}
          {distance !== null ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Navigation size={14} color="var(--secondary)" /> Jarak dari Sekolah:
                </span>
                <strong style={{ color: isInRadius ? '#34d399' : '#f87171' }}>
                  {distance} Meter {isInRadius ? '(Dalam Radius)' : '(Di Luar Radius)'}
                </strong>
              </div>

              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                <div style={{
                  width: `${Math.min(100, (distance / (schoolSettings.radiusMeters * 2)) * 100)}%`,
                  height: '100%',
                  background: isInRadius
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                  transition: 'width 0.5s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span>Batas Radius Sekolah: <strong>{schoolSettings.radiusMeters} Meter</strong></span>
                <span>Koordinat: {userCoords?.lat.toFixed(5)}, {userCoords?.lng.toFixed(5)}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mendeteksi posisi perangkat...</p>
          )}

          {gpsError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--warning-bg)', border: '1px solid var(--warning)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', fontSize: '0.8rem', color: '#fbbf24' }}>
              <AlertTriangle size={16} />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Location Simulator Switches for Testing */}
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Compass size={12} /> Simulasi GPS (Demo):
            </span>
            <button
              onClick={() => simulateLocation(true)}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', background: isSimulated && isInRadius ? 'rgba(16,185,129,0.2)' : undefined }}
            >
              <Navigation size={12} color="#34d399" /> Dalam Radius (15m)
            </button>
            <button
              onClick={() => simulateLocation(false)}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', background: isSimulated && !isInRadius ? 'rgba(239,68,68,0.2)' : undefined }}
            >
              <MapPin size={12} color="#f87171" /> Di Luar Radius (450m)
            </button>
          </div>

          {/* Visual Geofence Polygon Map Component */}
          <GeofenceMap
            userCoords={userCoords}
            centerCoords={{ lat: schoolSettings.latitude, lng: schoolSettings.longitude }}
            polygonCoords={schoolSettings.polygonCoords}
            radiusMeters={schoolSettings.radiusMeters}
            isInRadius={isInRadius}
            distanceMeters={distance}
          />

        </div>

        {/* PRESENSI ACTIONS (Check-In / Check-Out) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.85rem' }}>
            Presensi Hari Ini ({formatDateIndo(todayStr)})
          </h3>

          {!userTodayRecord ? (
            /* Form Absen Masuk */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Catatan presensi (opsional, misal: Piket / Daring)..."
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
                  fontSize: '1.05rem',
                  width: '100%',
                  opacity: isInRadius ? 1 : 0.5,
                  cursor: isInRadius ? 'pointer' : 'not-allowed'
                }}
              >
                <CheckCircle2 size={22} />
                <span>Absen Masuk Sekarang ({isInRadius ? 'Siap' : 'Di Luar Radius'})</span>
              </button>
            </div>
          ) : (
            /* Status Terabsen & Option Absen Pulang */
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={24} color="#34d399" />
                  <div>
                    <strong style={{ color: '#34d399', fontSize: '1rem', display: 'block' }}>
                      Anda Sudah Absen Masuk
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Jam Masuk: {formatTime(userTodayRecord.checkInTime)} • Status: <span className={`badge badge-${userTodayRecord.status}`}>{userTodayRecord.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {!userTodayRecord.checkOutTime ? (
                <button
                  onClick={handleCheckOutSubmit}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  <Clock size={18} />
                  <span>Absen Pulang Sekarang ({formatTime(new Date().toISOString())})</span>
                </button>
              ) : (
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="#34d399" /> Presensi Lengkap Hari Ini! (Jam Pulang: {formatTime(userTodayRecord.checkOutTime)})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action: Permohonan Izin / Sakit */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>Halangan / Sakit / Cuti?</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kirimkan surat permohonan izin langsung ke sekolah</span>
          </div>
          <button onClick={onOpenLeaveModal} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <FileText size={16} />
            <span>Ajukan Izin</span>
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: Personal Attendance History Table */}
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Calendar size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Riwayat Kehadiran Anda</h3>
        </div>

        {userHistory.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Belum ada catatan riwayat presensi.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {userHistory.map((rec) => (
              <div key={rec.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{formatDateIndo(rec.date)}</strong>
                  <span className={`badge badge-${rec.status}`}>{rec.status.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Masuk: {formatTime(rec.checkInTime)}</span>
                  <span>Pulang: {formatTime(rec.checkOutTime)}</span>
                  <span>Jarak: {rec.distanceMeters ?? '-'}m</span>
                </div>
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
  </>
  );
};
