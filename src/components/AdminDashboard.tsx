import React, { useState } from 'react';
import { UserProfile, SchoolSettings, LeaveRequest } from '../types';
import { FileSpreadsheet, Settings, ShieldCheck, RefreshCw } from 'lucide-react';
import { AdminStatBar } from './attendance/AdminStatBar';
import { AdminGpsRow } from './admin/AdminGpsRow';
import { AttendanceTable } from './attendance/AttendanceTable';
import { LeaveApprovalSection } from './admin/LeaveApprovalSection';
import { getLocalDateString } from '../utils/haversine';
import { useAttendanceFetcher } from '../hooks/useAttendanceFetcher';
import { SkeletonTable } from './attendance/SkeletonTable';
import { EmptyState } from './attendance/EmptyState';
import { SmartInsightsSection } from './attendance/SmartInsightsSection';

interface AdminDashboardProps {
  allUsers: UserProfile[];
  schoolSettings: SchoolSettings;
  leaveRequests: LeaveRequest[];
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onUpdateLeaveStatus: (requestId: string, newStatus: 'approved' | 'rejected') => void;
  onExportReport: () => void;
  onOpenSettingsModal: () => void;
}

export const AdminDashboard: React.FC<React.PropsWithChildren<AdminDashboardProps>> = ({
  allUsers, schoolSettings, leaveRequests,
  onUpdateLeaveStatus, onExportReport, onOpenSettingsModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  // Memakai Custom Hook useAttendanceFetcher untuk data presensi realtime + loading state
  const { 
    filteredRecords, 
    recordsToday, 
    loading, 
    error, 
    refetch 
  } = useAttendanceFetcher(selectedDate, searchTerm);

  const totalGuru = allUsers.filter(u => u.role === 'guru').length;
  const totalHadir = recordsToday.filter(r => r.status === 'hadir').length;
  const totalTerlambat = recordsToday.filter(r => r.status === 'terlambat').length;
  const totalIzin = recordsToday.filter(r => r.status === 'izin').length;
  const totalBelumAbsen = Math.max(0, totalGuru - (totalHadir + totalTerlambat + totalIzin));

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
          <button 
            onClick={refetch} 
            className="btn btn-secondary" 
            style={{ padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button onClick={onOpenSettingsModal} className="btn btn-secondary" style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px' }}>
            <Settings size={14} /><span>Pengaturan GPS</span>
          </button>
          <button onClick={onExportReport} className="btn btn-success" style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', background: 'var(--success)' }}>
            <FileSpreadsheet size={14} /><span>Ekspor Rekap (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* Menampilkan Statistik SaaS Modern */}
      <AdminStatBar 
        totalGuru={totalGuru} 
        totalHadir={totalHadir} 
        totalTerlambat={totalTerlambat} 
        totalIzin={totalIzin} 
        totalBelumAbsen={totalBelumAbsen} 
      />

      {/* Tampilan Gps Row Sekolah */}
      <AdminGpsRow schoolSettings={schoolSettings} onOpenSettingsModal={onOpenSettingsModal} />

      {/* Analisis Laporan Cerdas AI Groq */}
      <SmartInsightsSection 
        records={recordsToday} 
        totalGuru={totalGuru} 
        schoolSettings={schoolSettings} 
        onOpenSettingsModal={onOpenSettingsModal} 
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
