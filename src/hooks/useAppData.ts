import { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings, LeaveRequest } from '../types';
import {
  INITIAL_OFFLINE_USERS, INITIAL_SCHOOL_SETTINGS, isSupabaseConfigured,
  fetchAttendanceLive, saveAttendanceLive, updateCheckOutLive,
  fetchLeavesLive, saveLeaveLive, updateLeaveStatusLive,
  fetchUsersLive, addUserLive, deleteUserLive, updateUserPasswordLive, updateUserLive,
  uploadSelfie, uploadLeaveDocument,
  fetchSchoolSettingsLive, saveSchoolSettingsLive
} from '../lib/supabase';

import { getSessionUser, saveSessionUser } from '../services/sessionService';
import { subscribeAttendanceRealtime } from '../services/attendanceRealtimeService';

export function useAppData() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_OFFLINE_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getSessionUser());
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(INITIAL_SCHOOL_SETTINGS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    const sessionUser = getSessionUser();
    fetchUsersLive().then((liveUsers: UserProfile[] | null) => {
      if (liveUsers && liveUsers.length > 0) {
        setAllUsers(liveUsers);
        if (sessionUser) {
          const freshUser = liveUsers.find(u => u.nip === sessionUser.nip || u.id === sessionUser.id);
          if (freshUser) {
            setCurrentUser(freshUser);
            saveSessionUser(freshUser);
          }
        }
      }
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

      // Berlangganan Realtime Supabase: INSERT, UPDATE, DELETE
      const unsubscribe = subscribeAttendanceRealtime(
        // onInsert
        (newRecord) => {
          setAttendanceRecords(prev => {
            if (prev.some(r => r.id === newRecord.id)) return prev;
            return [newRecord, ...prev];
          });
        },
        // onUpdate — sync checkout & perubahan status dari Supabase langsung
        (updatedRecord) => {
          setAttendanceRecords(prev =>
            prev.map(r => r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r)
          );
        },
        // onDelete — hapus dari state jika record dihapus di Supabase
        (deletedId) => {
          setAttendanceRecords(prev => prev.filter(r => r.id !== deletedId));
        }
      );

      return () => unsubscribe();
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveSessionUser(user);
  };
  const handleLogout = () => {
    setCurrentUser(null);
    saveSessionUser(null);
  };

  const handleAddTeacher = async (newTeacher: UserProfile) => {
    setAllUsers(prev => [newTeacher, ...prev]);
    if (isSupabaseConfigured) await addUserLive(newTeacher);
  };

  const handleDeleteTeacher = async (userId: string, fullName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${fullName}?`)) return;
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    if (isSupabaseConfigured) await deleteUserLive(userId);
  };

  const handleUpdateTeacher = async (updatedUser: UserProfile) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (isSupabaseConfigured) await updateUserLive(updatedUser);
  };

  const handleUpdateSettings = async (newSettings: SchoolSettings) => {
    setSchoolSettings(newSettings);
    if (isSupabaseConfigured) await saveSchoolSettingsLive(newSettings);
  };

  const handleCheckIn = async (newRecord: Partial<AttendanceRecord>) => {
    // Fix 1: Cegah absen ganda — cek apakah sudah ada record hari ini untuk user ini
    const alreadyExists = attendanceRecords.some(
      r => r.userNip === newRecord.userNip && r.date === newRecord.date
    );
    if (alreadyExists) {
      alert('Anda sudah melakukan presensi masuk hari ini.');
      return;
    }

    let cloudSelfieUrl = newRecord.selfieUrl;
    if (newRecord.selfieUrl && newRecord.selfieUrl.startsWith('data:image')) {
      const uploaded = await uploadSelfie(newRecord.selfieUrl, newRecord.userId!);
      if (uploaded) cloudSelfieUrl = uploaded;
    }

    // Fix 4: Sertakan field shift agar tersimpan ke Supabase
    const fullRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: newRecord.userId!, userName: newRecord.userName!, userNip: newRecord.userNip!,
      date: newRecord.date!, checkInTime: newRecord.checkInTime,
      checkInLat: newRecord.checkInLat, checkInLng: newRecord.checkInLng,
      distanceMeters: newRecord.distanceMeters, status: newRecord.status || 'hadir',
      notes: newRecord.notes, selfieUrl: cloudSelfieUrl,
      shift: newRecord.shift
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
      userId: req.userId!, userName: req.userName!, userNip: req.userNip!,
      startDate: req.startDate!, endDate: req.endDate!,
      leaveType: req.leaveType!, description: req.description!,
      documentUrl: cloudDocUrl, status: 'pending', createdAt: new Date().toISOString()
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
        // Fix 2: Buat attendance record untuk SEMUA hari dari startDate sampai endDate
        const start = new Date(targetReq.startDate);
        const end = new Date(targetReq.endDate);
        const newRecords: AttendanceRecord[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          // Lewati jika sudah ada record untuk tanggal ini
          const exists = attendanceRecords.some(r => r.userNip === targetReq.userNip && r.date === dateStr);
          if (exists) continue;
          newRecords.push({
            id: `att-leave-${Date.now()}-${dateStr}`,
            userId: targetReq.userId, userName: targetReq.userName,
            userNip: targetReq.userNip, date: dateStr,
            status: 'izin', notes: `Izin Disetujui (${targetReq.leaveType}): ${targetReq.description}`
          });
        }
        setAttendanceRecords(prev => [...newRecords, ...prev]);
        if (isSupabaseConfigured) {
          for (const rec of newRecords) await saveAttendanceLive(rec);
        }
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

  // Fix 3: Generate rekap alfa untuk semua guru yang tidak punya record hari ini
  const handleGenerateAlfa = async (todayStr: string) => {
    const guruList = allUsers.filter(u => u.role === 'guru');
    const newAlfaRecords: AttendanceRecord[] = [];
    for (const guru of guruList) {
      const hasRecord = attendanceRecords.some(r => r.userNip === guru.nip && r.date === todayStr);
      if (!hasRecord) {
        newAlfaRecords.push({
          id: `att-alfa-${Date.now()}-${guru.nip}`,
          userId: guru.id, userName: guru.fullName, userNip: guru.nip,
          date: todayStr, status: 'alfa',
          notes: 'Tidak hadir tanpa keterangan (dibuat otomatis oleh Admin)'
        });
      }
    }
    if (newAlfaRecords.length === 0) {
      alert('Semua guru sudah memiliki catatan kehadiran hari ini.');
      return;
    }
    setAttendanceRecords(prev => [...newAlfaRecords, ...prev]);
    if (isSupabaseConfigured) {
      for (const rec of newAlfaRecords) await saveAttendanceLive(rec);
    }
    alert(`${newAlfaRecords.length} rekap ALFA berhasil dibuat untuk: ${newAlfaRecords.map(r => r.userName).join(', ')}.`);
  };

  return {
    allUsers, currentUser, schoolSettings, attendanceRecords, leaveRequests,
    handleLoginSuccess, handleLogout,
    handleAddTeacher, handleDeleteTeacher, handleUpdateTeacher, handleUpdateSettings,
    handleCheckIn, handleCheckOut,
    handleLeaveSubmit, handleUpdateLeaveStatus, handleUpdateUserPassword,
    handleGenerateAlfa
  };
}
