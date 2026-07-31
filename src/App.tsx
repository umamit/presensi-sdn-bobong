import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings, LeaveRequest } from './types';
import {
  MOCK_USERS,
  MOCK_ATTENDANCE_INITIAL,
  MOCK_LEAVES_INITIAL,
  INITIAL_SCHOOL_SETTINGS,
  isSupabaseConfigured,
  fetchAttendanceLive,
  saveAttendanceLive,
  updateCheckOutLive,
  fetchLeavesLive,
  saveLeaveLive,
  updateLeaveStatusLive,
  fetchUsersLive,
  updateUserPasswordLive
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

export const App: React.FC = () => {
  // All registered users list (Admin can add new teachers)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('presensi_all_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse saved users, resetting to defaults');
      }
    }
    return MOCK_USERS;
  });

  // Active Authenticated Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('presensi_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Admin View Mode: 'admin' (default) or 'guru' (to take attendance)
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'guru'>('admin');

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('presensi_school_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.schoolName && parsed.schoolName.includes('SMA Negeri 1')) {
        localStorage.setItem('presensi_school_settings', JSON.stringify(INITIAL_SCHOOL_SETTINGS));
        return INITIAL_SCHOOL_SETTINGS;
      }
      return parsed;
    }
    return INITIAL_SCHOOL_SETTINGS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('presensi_attendance');
    return saved ? JSON.parse(saved) : MOCK_ATTENDANCE_INITIAL;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('presensi_leaves');
    return saved ? JSON.parse(saved) : MOCK_LEAVES_INITIAL;
  });

  // Modal States
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // PWA Install Event Handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);

  // Synchronize Live Data if Supabase is connected
  useEffect(() => {
    fetchUsersLive().then(liveUsers => {
      if (liveUsers && liveUsers.length > 0) {
        setAllUsers(liveUsers);
      }
    });
    if (isSupabaseConfigured) {
      fetchAttendanceLive().then(liveAtt => {
        if (liveAtt && liveAtt.length > 0) setAttendanceRecords(liveAtt);
      });
      fetchLeavesLive().then(liveLeaves => {
        if (liveLeaves && liveLeaves.length > 0) setLeaveRequests(liveLeaves);
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    });
  }, []);

  const handleInstallPwa = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA installation');
        }
        setDeferredPrompt(null);
        setIsPwaInstallable(false);
      });
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('presensi_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('presensi_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('presensi_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('presensi_school_settings', JSON.stringify(schoolSettings));
  }, [schoolSettings]);

  useEffect(() => {
    localStorage.setItem('presensi_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('presensi_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  // Handlers for Authentication
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddTeacher = (newTeacher: UserProfile) => {
    setAllUsers(prev => [newTeacher, ...prev]);
  };

  // Handlers for Presensi
  const handleCheckIn = async (newRecord: Partial<AttendanceRecord>) => {
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
      notes: newRecord.notes
    };

    setAttendanceRecords(prev => [fullRecord, ...prev]);

    if (isSupabaseConfigured) {
      await saveAttendanceLive(fullRecord);
    }
  };

  const handleCheckOut = async (recordId: string, checkOutTime: string) => {
    setAttendanceRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, checkOutTime } : r))
    );

    if (isSupabaseConfigured) {
      await updateCheckOutLive(recordId, checkOutTime);
    }
  };

  const handleLeaveSubmit = async (req: Partial<LeaveRequest>) => {
    const fullReq: LeaveRequest = {
      id: `lv-${Date.now()}`,
      userId: req.userId!,
      userName: req.userName!,
      userNip: req.userNip!,
      startDate: req.startDate!,
      endDate: req.endDate!,
      leaveType: req.leaveType!,
      description: req.description!,
      documentUrl: req.documentUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setLeaveRequests(prev => [fullReq, ...prev]);

    if (isSupabaseConfigured) {
      await saveLeaveLive(fullReq);
    }
  };

  const handleUpdateLeaveStatus = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    setLeaveRequests(prev =>
      prev.map(l => (l.id === requestId ? { ...l, status: newStatus } : l))
    );

    if (isSupabaseConfigured) {
      await updateLeaveStatusLive(requestId, newStatus);
    }

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
        if (isSupabaseConfigured) {
          await saveAttendanceLive(leaveAtt);
        }
      }
    }
  };

  // Export Rekap Data to CSV
  const handleExportReport = () => {
    const headers = ['NIP', 'Nama Guru', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Jarak GPS (Meter)', 'Status', 'Catatan'];
    const rows = attendanceRecords.map(r => [
      `"${r.userNip}"`,
      `"${r.userName}"`,
      r.date,
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('id-ID') : '-',
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('id-ID') : '-',
      r.distanceMeters ?? 0,
      r.status.toUpperCase(),
      `"${r.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_presensi_sdn_bobong_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateUserPassword = async (userId: string, newPass: string) => {
    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: newPass } : u))
    );
    if (currentUser && currentUser.id === userId) {
      const updated = { ...currentUser, password: newPass };
      setCurrentUser(updated);
      localStorage.setItem('presensi_active_user', JSON.stringify(updated));
    }
    if (isSupabaseConfigured) {
      await updateUserPasswordLive(userId, newPass);
    }
  };

  // If user is not logged in, render LoginPage
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        allUsers={allUsers}
        schoolName={schoolSettings.schoolName}
      />
    );
  }

  return (
    <div>
      {/* Top Navbar */}
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

      {/* Main Content View based on User Role & View Mode */}
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
            onUpdateSettings={setSchoolSettings}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onExportReport={handleExportReport}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      {isLeaveModalOpen && (
        <LeaveRequestModal
          currentUser={currentUser}
          onClose={() => setIsLeaveModalOpen(false)}
          onSubmit={handleLeaveSubmit}
        />
      )}

      {isSettingsModalOpen && (
        <SchoolSettingsModal
          settings={schoolSettings}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={setSchoolSettings}
        />
      )}

      {isSupabaseModalOpen && (
        <SupabaseConfigModal
          onClose={() => setIsSupabaseModalOpen(false)}
          isConfigured={isSupabaseConfigured}
        />
      )}

      {isTeacherModalOpen && (
        <TeacherManagementModal
          allUsers={allUsers}
          onClose={() => setIsTeacherModalOpen(false)}
          onAddTeacher={handleAddTeacher}
        />
      )}

      {/* Floating PWA Install Banner on Mobile */}
      {isPwaInstallable && (
        <PwaInstallBanner onInstall={handleInstallPwa} />
      )}
    </div>
  );
};
