import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings, LeaveRequest } from './types';
import {
  MOCK_USERS,
  INITIAL_SCHOOL_SETTINGS,
  isSupabaseConfigured,
  fetchAttendanceLive,
  saveAttendanceLive,
  updateCheckOutLive,
  fetchLeavesLive,
  saveLeaveLive,
  updateLeaveStatusLive,
  fetchUsersLive,
  addUserLive,
  deleteUserLive,
  updateUserPasswordLive,
  uploadSelfie,
  uploadLeaveDocument,
  fetchSchoolSettingsLive,
  saveSchoolSettingsLive
} from './lib/supabase';
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
import { exportAttendanceCsv } from './utils/exportCsv';

export const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'guru'>('admin');
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(INITIAL_SCHOOL_SETTINGS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const { isPwaInstallable, handleInstallPwa } = usePwaInstall();

  // Load ALL data dynamically directly from Supabase DB on startup
  useEffect(() => {
    fetchUsersLive().then((liveUsers: UserProfile[] | null) => {
      if (liveUsers && liveUsers.length > 0) setAllUsers(liveUsers);
    });

    fetchSchoolSettingsLive().then((liveSettings: SchoolSettings | null) => {
      if (liveSettings) setSchoolSettings(liveSettings);
    });

    if (isSupabaseConfigured) {
      fetchAttendanceLive().then((liveAtt: AttendanceRecord[] | null) => {
        if (liveAtt) setAttendanceRecords(liveAtt);
      });
      fetchLeavesLive().then((liveLeaves: LeaveRequest[] | null) => {
        if (liveLeaves) setLeaveRequests(liveLeaves);
      });
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  const handleAddTeacher = async (newTeacher: UserProfile) => {
    setAllUsers(prev => [newTeacher, ...prev]);
    if (isSupabaseConfigured) {
      await addUserLive(newTeacher);
    }
  };

  const handleDeleteTeacher = async (userId: string, fullName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${fullName}?`)) return;
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    if (isSupabaseConfigured) {
      await deleteUserLive(userId);
    }
  };

  const handleUpdateSettings = async (newSettings: SchoolSettings) => {
    setSchoolSettings(newSettings);
    if (isSupabaseConfigured) {
      await saveSchoolSettingsLive(newSettings);
    }
  };

  const handleCheckIn = async (newRecord: Partial<AttendanceRecord>) => {
    let cloudSelfieUrl = newRecord.selfieUrl;
    if (newRecord.selfieUrl && newRecord.selfieUrl.startsWith('data:image')) {
      const uploaded = await uploadSelfie(newRecord.selfieUrl, newRecord.userId!);
      if (uploaded) cloudSelfieUrl = uploaded;
    }

    const fullRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: newRecord.userId!,
      userName: newRecord.userName!,
      userNip: newRecord.userNip!,
      date: newRecord.date!,
      checkInTime: newRecord.checkInTime,
      checkInLat: newRecord.checkInLat,
      checkInLng: newRecord.checkInLng,
      distanceMeters: newRecord.distanceMeters,
      status: newRecord.status || 'hadir',
      notes: newRecord.notes,
      selfieUrl: cloudSelfieUrl
    };

    setAttendanceRecords(prev => [fullRecord, ...prev]);
    if (isSupabaseConfigured) await saveAttendanceLive(fullRecord);
  };

  const handleCheckOut = async (recordId: string, checkOutTime: string) => {
    setAttendanceRecords(prev => prev.map(r => (r.id === recordId ? { ...r, checkOutTime } : r)));
    if (isSupabaseConfigured) await updateCheckOutLive(recordId, checkOutTime);
  };

  const handleLeaveSubmit = async (req: Partial<LeaveRequest>) => {
    let cloudDocUrl = req.documentUrl;
    if (req.documentUrl && req.documentUrl.startsWith('data:image')) {
      const uploaded = await uploadLeaveDocument(req.documentUrl, req.userId!);
      if (uploaded) cloudDocUrl = uploaded;
    }

    const fullReq: LeaveRequest = {
      id: `lv-${Date.now()}`,
      userId: req.userId!,
      userName: req.userName!,
      userNip: req.userNip!,
      startDate: req.startDate!,
      endDate: req.endDate!,
      leaveType: req.leaveType!,
      description: req.description!,
      documentUrl: cloudDocUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setLeaveRequests(prev => [fullReq, ...prev]);
    if (isSupabaseConfigured) await saveLeaveLive(fullReq);
  };

  const handleUpdateLeaveStatus = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    setLeaveRequests(prev => prev.map(l => (l.id === requestId ? { ...l, status: newStatus } : l)));
    if (isSupabaseConfigured) await updateLeaveStatusLive(requestId, newStatus);

    if (newStatus === 'approved') {
      const targetReq = leaveRequests.find(l => l.id === requestId);
      if (targetReq) {
        const leaveAtt: AttendanceRecord = {
          id: `att-leave-${Date.now()}`,
          userId: targetReq.userId,
          userName: targetReq.userName,
          userNip: targetReq.userNip,
          date: targetReq.startDate,
          status: 'izin',
          notes: `Izin Disetujui: ${targetReq.description}`
        };
        setAttendanceRecords(prev => [leaveAtt, ...prev]);
        if (isSupabaseConfigured) await saveAttendanceLive(leaveAtt);
      }
    }
  };

  const handleUpdateUserPassword = async (userId: string, newPass: string) => {
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, password: newPass } : u)));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPass } : null);
    }
    if (isSupabaseConfigured) await updateUserPasswordLive(userId, newPass);
  };

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
