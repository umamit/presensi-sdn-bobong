import React, { useState } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings, LeaveRequest } from '../types';
import { formatDateIndo, formatTime } from '../utils/haversine';
import { Users, CheckCircle, Clock, AlertTriangle, FileSpreadsheet, Settings, ShieldCheck, MapPin, Check, X, Search, Filter } from 'lucide-react';

interface AdminDashboardProps {
  allUsers: UserProfile[];
  attendanceRecords: AttendanceRecord[];
  schoolSettings: SchoolSettings;
  leaveRequests: LeaveRequest[];
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onUpdateLeaveStatus: (requestId: string, newStatus: 'approved' | 'rejected') => void;
  onExportReport: () => void;
  onOpenSettingsModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  allUsers,
  attendanceRecords,
  schoolSettings,
  leaveRequests,
  onUpdateLeaveStatus,
  onExportReport,
  onOpenSettingsModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Statistics calculation for selected date
  const totalGuru = allUsers.filter(u => u.role === 'guru').length;
  const recordsToday = attendanceRecords.filter(r => r.date === selectedDate);
  
  const totalHadir = recordsToday.filter(r => r.status === 'hadir').length;
  const totalTerlambat = recordsToday.filter(r => r.status === 'terlambat').length;
  const totalIzin = recordsToday.filter(r => r.status === 'izin').length;
  const totalBelumAbsen = Math.max(0, totalGuru - (totalHadir + totalTerlambat + totalIzin));

  // Filter records based on search term
  const filteredRecords = recordsToday.filter(
    r => r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.userNip.includes(searchTerm)
  );

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER BAR & METRIC CARDS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="var(--warning)" /> Panel Pengelola / Kepala Sekolah
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Monitor kehadiran guru secara realtime, atur lokasi GPS sekolah, dan persetujuan izin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={onOpenSettingsModal} className="btn btn-secondary">
            <Settings size={16} />
            <span>Pengaturan GPS & Jam Sekolah</span>
          </button>
          <button onClick={onExportReport} className="btn btn-success">
            <FileSpreadsheet size={16} />
            <span>Ekspor Rekap (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Tenaga Pengajar</span>
            <Users size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{totalGuru} Guru</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hadir Tepat Waktu</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>{totalHadir}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Terlambat</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>{totalTerlambat}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Belum Presensi</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171' }}>{totalBelumAbsen}</div>
        </div>
      </div>

      {/* PENGATURAN GPS DISPLAY CARD */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(15,23,42,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
            <MapPin size={22} color="var(--primary)" />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>
              Lokasi GPS Terdaftar: {schoolSettings.schoolName}
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Lat: {schoolSettings.latitude}, Lng: {schoolSettings.longitude} • Radius Max: <strong>{schoolSettings.radiusMeters} Meter</strong> • Jam Kerja: {schoolSettings.workStartTime} - {schoolSettings.workEndTime}
            </span>
          </div>
        </div>
        <button onClick={onOpenSettingsModal} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          Ubah Titik GPS Sekolah
        </button>
      </div>

      {/* MONITORING TABEL KEHADIRAN GURU */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Daftar Presensi Guru Hari Ini</h3>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Filter Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="glass-input"
              style={{ width: 'auto' }}
            />
            {/* Search input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Cari nama atau NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>NIP & Nama Guru</th>
                <th style={{ padding: '0.75rem 1rem' }}>Foto Selfie</th>
                <th style={{ padding: '0.75rem 1rem' }}>Jam Masuk</th>
                <th style={{ padding: '0.75rem 1rem' }}>Jam Pulang</th>
                <th style={{ padding: '0.75rem 1rem' }}>Jarak GPS</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Tidak ada catatan presensi untuk tanggal ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: '#fff', display: 'block' }}>{rec.userName}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rec.userNip}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {rec.selfieUrl ? (
                        <a href={rec.selfieUrl} target="_blank" rel="noreferrer">
                          <img
                            src={rec.selfieUrl}
                            alt="Bukti Selfie"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5 solid var(--secondary)' }}
                          />
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tanpa Foto</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#fff' }}>{formatTime(rec.checkInTime)}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#fff' }}>{formatTime(rec.checkOutTime)}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--secondary)' }}>{rec.distanceMeters ?? 0} Meter</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge badge-${rec.status}`}>{rec.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {rec.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PERSETUJUAN IZIN / CUTI GURU */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
          Permohonan Izin / Cuti Menunggu Persetujuan ({pendingLeaves.length})
        </h3>

        {pendingLeaves.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tidak ada permohonan izin/sakit yang perlu ditinjau saat ini.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {pendingLeaves.map((req) => (
              <div key={req.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(15,23,42,0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{req.userName}</strong>
                  <span className="badge badge-terlambat">{req.leaveType.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Tanggal: {formatDateIndo(req.startDate)} - {formatDateIndo(req.endDate)}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  "{req.description}"
                </p>
                {req.documentUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <a href={req.documentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', display: 'inline-flex', gap: '0.3rem' }}>
                      Lihat Foto Surat Dokter / Lampiran
                    </a>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onUpdateLeaveStatus(req.id, 'approved')}
                    className="btn btn-success"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                  >
                    <Check size={14} /> Setujui
                  </button>
                  <button
                    onClick={() => onUpdateLeaveStatus(req.id, 'rejected')}
                    className="btn btn-danger"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                  >
                    <X size={14} /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
