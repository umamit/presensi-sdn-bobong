import React, { useState } from 'react';
import { isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { GuruDashboard } from './components/GuruDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LeaveRequestModal } from './components/LeaveRequestModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { TeacherManagementModal } from './components/TeacherManagementModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useAppData } from './hooks/useAppData';
import { exportAttendanceCsv } from './utils/exportCsv';

import { PwaGuidePage } from './components/login/PwaGuidePage';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { WifiOff, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'guru'>('admin');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const { isOnline, pendingSyncCount, syncOfflineData } = useNetworkStatus();
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const { isPwaInstallable, handleInstallPwa } = usePwaInstall();

  const {
    allUsers, currentUser, schoolSettings, attendanceRecords, leaveRequests,
    handleLoginSuccess, handleLogout,
    handleAddTeacher, handleDeleteTeacher, handleUpdateTeacher, handleUpdateSettings,
    handleCheckIn, handleCheckOut,
    handleLeaveSubmit, handleUpdateLeaveStatus, handleUpdateUserPassword,
    handleGenerateAlfa
  } = useAppData();

  // Deteksi mode pembukaan aplikasi (PWA/APK) dengan bypass untuk Laptop/PC & Localhost
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches || 
    (navigator as any).standalone || 
    (window as any).Capacitor?.isNativePlatform() ||
    isLocalHost ||
    !isMobileDevice; // Bebaskan akses jika dibuka dari komputer / laptop admin

  if (!isStandalone) {
    return <PwaGuidePage schoolName={schoolSettings.schoolName} />;
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} allUsers={allUsers} schoolName={schoolSettings.schoolName} />;
  }

  return (
    <div>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenTeacherManagement={() => setIsTeacherModalOpen(true)}
        isPwaInstallable={isPwaInstallable}
        onInstallPwa={handleInstallPwa}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        isSupabaseActive={isSupabaseConfigured}
        schoolName={schoolSettings.schoolName}
        activeViewMode={adminViewMode}
        onToggleViewMode={() => setAdminViewMode(prev => prev === 'admin' ? 'guru' : 'admin')}
      />

      <main className="app-container">
        {!isOnline && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(255, 69, 58, 0.15)', border: '1px solid rgba(255, 69, 58, 0.4)',
            borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem',
            fontSize: '0.82rem', color: '#ffb3b3', lineHeight: 1.4
          }}>
            <WifiOff size={16} color="#ff453a" style={{ flexShrink: 0 }} />
            <span>
              <strong>Koneksi Offline (Tanpa Internet)</strong>. Presensi masuk/pulang Anda akan disimpan aman di HP sementara, dan disinkronkan otomatis ke server saat sinyal kembali bagus.
            </span>
          </div>
        )}

        {isOnline && pendingSyncCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            background: 'rgba(10, 132, 255, 0.15)', border: '1px solid rgba(10, 132, 255, 0.4)',
            borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem',
            fontSize: '0.82rem', color: '#b3d7ff', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
              <Clock size={16} color="#0a84ff" style={{ flexShrink: 0 }} />
              <span>
                Ada <strong>{pendingSyncCount} data presensi offline</strong> belum disinkronkan ke server.
              </span>
            </div>
            <button
              onClick={() => {
                syncOfflineData().then(count => {
                  if (count > 0) alert(`Berhasil sinkronisasi ${count} data presensi offline ke server!`);
                });
              }}
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              Sinkronkan Sekarang
            </button>
          </div>
        )}


        {(currentUser.role === 'guru' || (currentUser.role === 'admin' && adminViewMode === 'guru')) ? (
          <GuruDashboard
            user={currentUser}
            schoolSettings={schoolSettings}
            attendanceRecords={attendanceRecords}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
            onUpdatePassword={handleUpdateUserPassword}
          />
        ) : (
          <AdminDashboard
            allUsers={allUsers}
            schoolSettings={schoolSettings}
            leaveRequests={leaveRequests}
            onUpdateSettings={handleUpdateSettings}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onExportReport={() => exportAttendanceCsv(attendanceRecords)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onGenerateAlfa={handleGenerateAlfa}
          />
        )}
      </main>

      {isLeaveModalOpen && <LeaveRequestModal currentUser={currentUser} onClose={() => setIsLeaveModalOpen(false)} onSubmit={handleLeaveSubmit} />}
      {isSettingsModalOpen && <SchoolSettingsModal settings={schoolSettings} onClose={() => setIsSettingsModalOpen(false)} onSave={handleUpdateSettings} />}
      {isSupabaseModalOpen && <SupabaseConfigModal onClose={() => setIsSupabaseModalOpen(false)} isConfigured={isSupabaseConfigured} />}
      {isTeacherModalOpen && <TeacherManagementModal allUsers={allUsers} onClose={() => setIsTeacherModalOpen(false)} onAddTeacher={handleAddTeacher} onDeleteTeacher={handleDeleteTeacher} onEditTeacher={handleUpdateTeacher} />}
      {isPwaInstallable && <PwaInstallBanner onInstall={handleInstallPwa} />}
    </div>
  );
};
