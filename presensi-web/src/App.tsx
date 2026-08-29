import React, { useState } from 'react';
import { isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { GuruDashboard } from './components/GuruDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LeaveRequestModal } from './components/LeaveRequestModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { ShiftSettingsModal } from './components/ShiftSettingsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { TeacherManagementModal } from './components/TeacherManagementModal';
import { FaceEnrollmentModal } from './components/FaceEnrollmentModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useAppData } from './hooks/useAppData';
import { exportAttendanceCsv } from './utils/exportCsv';

import { PwaGuidePage } from './components/login/PwaGuidePage';

export const App: React.FC = () => {
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'guru'>('admin');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isGpsSettingsOpen, setIsGpsSettingsOpen] = useState(false);
  const [isTimeSettingsOpen, setIsTimeSettingsOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const { isPwaInstallable, handleInstallPwa } = usePwaInstall();

  const {
    allUsers, currentUser, schoolSettings, attendanceRecords, leaveRequests,
    handleLoginSuccess, handleLogout,
    handleAddTeacher, handleDeleteTeacher, handleUpdateTeacher, handleUpdateSettings,
    handleCheckIn, handleCheckOut,
    handleLeaveSubmit, handleUpdateLeaveStatus, handleUpdateUserPassword,
    handleGenerateAlfa, handleRegisterFace, handleConfirmDinasLuar
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
            onOpenGpsSettings={() => setIsGpsSettingsOpen(true)}
            onOpenTimeSettings={() => setIsTimeSettingsOpen(true)}
            onGenerateAlfa={handleGenerateAlfa}
            onConfirmDinasLuar={handleConfirmDinasLuar}
          />
        )}
      </main>

      {isLeaveModalOpen && <LeaveRequestModal currentUser={currentUser} onClose={() => setIsLeaveModalOpen(false)} onSubmit={handleLeaveSubmit} />}
      {isGpsSettingsOpen && <SchoolSettingsModal settings={schoolSettings} onClose={() => setIsGpsSettingsOpen(false)} onSave={handleUpdateSettings} />}
      {isTimeSettingsOpen && <ShiftSettingsModal settings={schoolSettings} onClose={() => setIsTimeSettingsOpen(false)} onSave={handleUpdateSettings} />}
      {isSupabaseModalOpen && <SupabaseConfigModal onClose={() => setIsSupabaseModalOpen(false)} isConfigured={isSupabaseConfigured} />}
      {isTeacherModalOpen && (
        <TeacherManagementModal
          allUsers={allUsers}
          onClose={() => setIsTeacherModalOpen(false)}
          onAddTeacher={handleAddTeacher}
          onDeleteTeacher={handleDeleteTeacher}
          onEditTeacher={handleUpdateTeacher}
          onResetFace={(userId, fullName) => {
            if (confirm(`Reset pendaftaran wajah guru ${fullName}?\nSetelah di-reset, guru wajib mendaftarkan wajahnya kembali saat login berikutnya.`)) {
              handleRegisterFace(userId, '');
            }
          }}
        />
      )}
      {isPwaInstallable && <PwaInstallBanner onInstall={handleInstallPwa} />}

      {currentUser && currentUser.role === 'guru' && !currentUser.faceDescriptor && (
        <FaceEnrollmentModal
          guruName={currentUser.fullName}
          onRegister={(desc) => handleRegisterFace(currentUser.id, desc)}
          onClose={() => handleLogout()}
        />
      )}
    </div>
  );
};
