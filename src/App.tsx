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

export const App: React.FC = () => {
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'guru'>('admin');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const { isPwaInstallable, handleInstallPwa } = usePwaInstall();

  const {
    allUsers, currentUser, schoolSettings, attendanceRecords, leaveRequests,
    handleLoginSuccess, handleLogout,
    handleAddTeacher, handleDeleteTeacher, handleUpdateSettings,
    handleCheckIn, handleCheckOut,
    handleLeaveSubmit, handleUpdateLeaveStatus, handleUpdateUserPassword
  } = useAppData();

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
            attendanceRecords={attendanceRecords}
            schoolSettings={schoolSettings}
            leaveRequests={leaveRequests}
            onUpdateSettings={handleUpdateSettings}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onExportReport={() => exportAttendanceCsv(attendanceRecords)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          />
        )}
      </main>

      {isLeaveModalOpen && <LeaveRequestModal currentUser={currentUser} onClose={() => setIsLeaveModalOpen(false)} onSubmit={handleLeaveSubmit} />}
      {isSettingsModalOpen && <SchoolSettingsModal settings={schoolSettings} onClose={() => setIsSettingsModalOpen(false)} onSave={handleUpdateSettings} />}
      {isSupabaseModalOpen && <SupabaseConfigModal onClose={() => setIsSupabaseModalOpen(false)} isConfigured={isSupabaseConfigured} />}
      {isTeacherModalOpen && <TeacherManagementModal allUsers={allUsers} onClose={() => setIsTeacherModalOpen(false)} onAddTeacher={handleAddTeacher} onDeleteTeacher={handleDeleteTeacher} />}
      {isPwaInstallable && <PwaInstallBanner onInstall={handleInstallPwa} />}
    </div>
  );
};
