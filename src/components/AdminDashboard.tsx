import React, { useState } from 'react';
import { UserProfile, SchoolSettings, LeaveRequest } from '../types';
import { FileSpreadsheet, Settings, ShieldCheck, RefreshCw, UserX, Clock, MapPin } from 'lucide-react';
import { AdminStatBar } from './attendance/AdminStatBar';
import { AdminGpsRow } from './admin/AdminGpsRow';
import { AttendanceTable } from './attendance/AttendanceTable';
import { LeaveApprovalSection } from './admin/LeaveApprovalSection';
import { getLocalDateString } from '../utils/haversine';
import { useAttendanceFetcher } from '../hooks/useAttendanceFetcher';
import { SkeletonTable } from './attendance/SkeletonTable';
import { EmptyState } from './attendance/EmptyState';
import { SmartInsightsSection } from './attendance/SmartInsightsSection';

import { exportAttendanceCsv } from '../utils/exportCsv';

interface AdminDashboardProps {
  allUsers: UserProfile[];
  schoolSettings: SchoolSettings;
  leaveRequests: LeaveRequest[];
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onUpdateLeaveStatus: (requestId: string, newStatus: 'approved' | 'rejected') => void;
  onOpenGpsSettings: () => void;
  onOpenTimeSettings: () => void;
  onGenerateAlfa: (todayStr: string) => void;
}

export const AdminDashboard: React.FC<React.PropsWithChildren<AdminDashboardProps>> = ({
  allUsers, schoolSettings, leaveRequests,
  onUpdateLeaveStatus, onOpenGpsSettings, onOpenTimeSettings, onGenerateAlfa
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  // Memakai Custom Hook useAttendanceFetcher untuk data presensi realtime + loading state
  const { 
    allRecords,
    filteredRecords, 
    recordsToday, 
    loading, 
    error, 
    refetch 
  } = useAttendanceFetcher(selectedDate, searchTerm);

  const formatMonthIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 7);
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).replace(/\s/g, '_');
    } catch {
      return dateStr.substring(0, 7);
    }
  };

  const handleExportWithRange = (range: 'day' | 'month' | 'year' | 'all') => {
    if (!allRecords || allRecords.length === 0) {
      alert('Tidak ada data presensi untuk diekspor.');
      return;
    }

    let recordsToExport = [...allRecords];
    let filename = '';

    if (range === 'day') {
      recordsToExport = allRecords.filter(r => r.date === selectedDate);
      filename = `rekap_presensi_sdn_bobong_hari_${selectedDate}.csv`;
    } else if (range === 'month') {
      const monthPrefix = selectedDate.substring(0, 7); // YYYY-MM
      recordsToExport = allRecords.filter(r => r.date.startsWith(monthPrefix));
      filename = `rekap_presensi_sdn_bobong_bulan_${formatMonthIndo(selectedDate)}.csv`;
    } else if (range === 'year') {
      const yearPrefix = selectedDate.substring(0, 4); // YYYY
      recordsToExport = allRecords.filter(r => r.date.startsWith(yearPrefix));
      filename = `rekap_presensi_sdn_bobong_tahun_${yearPrefix}.csv`;
    } else {
      filename = `rekap_presensi_sdn_bobong_semua_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (recordsToExport.length === 0) {
      alert(`Tidak ada data presensi ditemukan untuk rentang waktu yang dipilih.`);
      return;
    }

    exportAttendanceCsv(recordsToExport, filename);
  };

  const totalGuru = allUsers.filter(u => u.role === 'guru').length;
  const totalHadir = recordsToday.filter(r => r.status === 'hadir').length;
  const totalTerlambat = recordsToday.filter(r => r.status === 'terlambat').length;
  const totalIzin = recordsToday.filter(r => r.status === 'izin').length;
  const totalBelumAbsen = Math.max(0, totalGuru - (totalHadir + totalTerlambat + totalIzin));
  // Fix #14: Hitung guru yang sudah absen pulang
  const totalSudahPulang = recordsToday.filter(r => r.checkOutTime).length;

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.02em' }}>
            <ShieldCheck color="var(--warning)" size={22} /> Panel Pengelola / Kepala Sekolah
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Monitor kehadiran guru secara realtime, atur lokasi GPS sekolah, dan persetujuan izin.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={refetch} className="btn btn-secondary" style={{ padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }} title="Refresh Data" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button onClick={onOpenGpsSettings} className="btn btn-secondary" style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={14} /><span>Setelan GPS</span>
          </button>
          <button onClick={onOpenTimeSettings} className="btn btn-secondary" style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} /><span>Setelan Waktu</span>
          </button>
          <button
            onClick={() => {
              // Fix #15: Konfirmasi sebelum generate alfa
              if (confirm(`Buat rekap ALFA untuk semua guru yang belum hadir pada ${selectedDate}?\nTindakan ini tidak dapat dibatalkan.`)) {
                onGenerateAlfa(selectedDate);
              }
            }}
            className="btn"
            title="Buat rekap ALFA untuk guru yang belum absen pada tanggal dipilih"
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', background: 'rgba(255,69,58,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,69,58,0.3)' }}
          >
            <UserX size={14} /><span>Rekap Alfa</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--success)', borderRadius: '8px', padding: '0 0.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            <FileSpreadsheet size={14} color="#fff" />
            <select
              onChange={(e) => {
                const val = e.target.value as 'day' | 'month' | 'year' | 'all';
                if (val) {
                  handleExportWithRange(val);
                  e.target.value = ''; // Reset ke placeholder
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                padding: '0.55rem 0.35rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
              defaultValue=""
            >
              <option value="" disabled style={{ background: '#1c1c1e', color: '#fff' }}>Ekspor CSV</option>
              <option value="day" style={{ background: '#1c1c1e', color: '#fff' }}>Hari Ini</option>
              <option value="month" style={{ background: '#1c1c1e', color: '#fff' }}>Bulan Ini</option>
              <option value="year" style={{ background: '#1c1c1e', color: '#fff' }}>Tahun Ini</option>
              <option value="all" style={{ background: '#1c1c1e', color: '#fff' }}>Semua Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menampilkan Statistik SaaS Modern */}
      <AdminStatBar
        totalGuru={totalGuru}
        totalHadir={totalHadir}
        totalTerlambat={totalTerlambat}
        totalIzin={totalIzin}
        totalBelumAbsen={totalBelumAbsen}
        totalSudahPulang={totalSudahPulang}
      />

      {/* Tampilan Gps Row Sekolah */}
      <AdminGpsRow schoolSettings={schoolSettings} onOpenGpsSettings={onOpenGpsSettings} />

      {/* Analisis Laporan Cerdas AI Groq */}
      <SmartInsightsSection 
        records={recordsToday} 
        totalGuru={totalGuru} 
        schoolSettings={schoolSettings} 
        onOpenSettingsModal={onOpenGpsSettings} 
      />

      {/* Loading & Empty State Handling */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)', borderColor: 'rgba(255, 69, 58, 0.15)' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>Terjadi Kesalahan</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{error}</p>
          <button onClick={refetch} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}>Coba Lagi</button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Sediakan input filter tanggal & cari agar pengguna bisa mengubah filter ketika kosong */}
          <AttendanceTable 
            filteredRecords={[]} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
            onRefresh={refetch}
          />
          <EmptyState 
            onRefresh={refetch} 
            message={searchTerm ? `Tidak ditemukan data untuk pencarian "${searchTerm}" pada tanggal ${selectedDate}.` : `Belum ada catatan presensi guru pada tanggal ${selectedDate}.`} 
          />
        </div>
      ) : (
        <AttendanceTable 
          filteredRecords={filteredRecords} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate} 
          onRefresh={refetch}
        />
      )}

      {/* Daftar Pengajuan Izin Guru */}
      <LeaveApprovalSection pendingLeaves={pendingLeaves} onUpdateLeaveStatus={onUpdateLeaveStatus} />
    </div>
  );
};
