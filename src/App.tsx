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

export const App: React.FC = () => {
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'guru'>('admin');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const { isPwaInstallable, handleInstallPwa } = usePwaInstall();
  const { isOnline, pendingSyncCount, syncOfflineData } = useNetworkStatus();

  const {
    allUsers, currentUser, schoolSettings, attendanceRecords, leaveRequests,
    handleLoginSuccess, handleLogout,
    handleAddTeacher, handleDeleteTeacher, handleUpdateTeacher, handleUpdateSettings,
    handleCheckIn, handleCheckOut,
    handleLeaveSubmit, handleUpdateLeaveStatus, handleUpdateUserPassword,
    handleGenerateAlfa
  } = useAppData();

  // Deteksi mode pembukaan aplikasi
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches || 
    (navigator as any).standalone || 
    (window as any).Capacitor?.isNativePlatform();

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
        {/* Indikator Offline & Antrean Sync */}
        {pendingSyncCount > 0 && (
          <div
            className="glass-panel animate-pulse"
            style={{
              padding: '0.85rem 1.15rem',
              background: 'rgba(251, 146, 60, 0.08)',
              borderColor: 'rgba(251, 146, 60, 0.25)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
              <span className="dot-ping" style={{ width: '8px', height: '8px' }}>
                <span className="dot-ping-wave" style={{ backgroundColor: '#fb923c' }} />
                <span className="dot-ping-core" style={{ backgroundColor: '#fb923c' }} />
              </span>
              <div style={{ fontSize: '0.78rem', color: '#fb923c', fontWeight: 500, lineHeight: 1.3 }}>
                Koneksi offline / lambat. Terdeteksi <strong>{pendingSyncCount} data presensi</strong> mengantre di memori HP. Data akan dikirim otomatis saat internet stabil.
              </div>
            </div>
            <button
              onClick={async () => {
                const count = await syncOfflineData();
                if (count > 0) alert(`${count} data presensi berhasil disinkronkan ke server!`);
                else alert('Belum dapat terhubung ke server. Silakan coba lagi nanti.');
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                background: 'rgba(251, 146, 60, 0.15)',
                color: '#fb923c',
                border: '1px solid rgba(251, 146, 60, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
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
