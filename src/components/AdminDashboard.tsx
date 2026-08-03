import React, { useState } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings, LeaveRequest } from '../types';
import { FileSpreadsheet, Settings, ShieldCheck } from 'lucide-react';
import { AdminStatBar } from './admin/AdminStatBar';
import { AdminGpsRow } from './admin/AdminGpsRow';
import { AttendanceTable } from './admin/AttendanceTable';
import { LeaveApprovalSection } from './admin/LeaveApprovalSection';
import { getLocalDateString } from '../utils/haversine';

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

export const AdminDashboard: React.FC<React.PropsWithChildren<AdminDashboardProps>> = ({
  allUsers, attendanceRecords, schoolSettings, leaveRequests,
  onUpdateLeaveStatus, onExportReport, onOpenSettingsModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const totalGuru = allUsers.filter(u => u.role === 'guru').length;
  const recordsToday = attendanceRecords.filter(r => r.date === selectedDate);
  const totalHadir = recordsToday.filter(r => r.status === 'hadir').length;
  const totalTerlambat = recordsToday.filter(r => r.status === 'terlambat').length;
  const totalIzin = recordsToday.filter(r => r.status === 'izin').length;
  const totalBelumAbsen = Math.max(0, totalGuru - (totalHadir + totalTerlambat + totalIzin));

  const filteredRecords = recordsToday.filter(
    r => r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || r.userNip.includes(searchTerm)
  );

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <Settings size={16} /><span>Pengaturan GPS & Jam Sekolah</span>
          </button>
          <button onClick={onExportReport} className="btn btn-success">
            <FileSpreadsheet size={16} /><span>Ekspor Rekap (Excel/CSV)</span>
          </button>
        </div>
      </div>

      <AdminStatBar totalGuru={totalGuru} totalHadir={totalHadir} totalTerlambat={totalTerlambat} totalIzin={totalIzin} totalBelumAbsen={totalBelumAbsen} />
      <AdminGpsRow schoolSettings={schoolSettings} onOpenSettingsModal={onOpenSettingsModal} />
      <AttendanceTable filteredRecords={filteredRecords} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <LeaveApprovalSection pendingLeaves={pendingLeaves} onUpdateLeaveStatus={onUpdateLeaveStatus} />
    </div>
  );
};
