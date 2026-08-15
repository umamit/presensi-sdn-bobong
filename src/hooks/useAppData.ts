import { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord, SchoolSettings, LeaveRequest } from '../types';
import {
  INITIAL_OFFLINE_USERS, INITIAL_SCHOOL_SETTINGS, isSupabaseConfigured,
  fetchAttendanceLive, saveAttendanceLive, updateCheckOutLive,
  fetchLeavesLive, saveLeaveLive, updateLeaveStatusLive,
  fetchUsersLive, addUserLive, deleteUserLive, updateUserPasswordLive, updateUserLive,
  uploadSelfie, uploadLeaveDocument,
  fetchSchoolSettingsLive, saveSchoolSettingsLive, subscribeSchoolSettingsRealtime,
  updateUserFaceDescriptorLive, updateAttendanceStatusLive
} from '../lib/supabase';

import { getSessionUser, saveSessionUser } from '../services/sessionService';
import { subscribeAttendanceRealtime } from '../services/attendanceRealtimeService';
import { saveOfflineAttendanceItem } from '../services/offlineSyncService';
import { detectAppType } from '../utils/haversine';

export function useAppData() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_OFFLINE_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getSessionUser());
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const cached = localStorage.getItem('sdn_bobong_school_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached school settings:', e);
      }
    }
    return INITIAL_SCHOOL_SETTINGS;
  });
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
      if (liveSettings) {
        setSchoolSettings(liveSettings);
        localStorage.setItem('sdn_bobong_school_settings', JSON.stringify(liveSettings));
      }
    });
    if (isSupabaseConfigured) {
      fetchAttendanceLive().then((liveAtt: AttendanceRecord[] | null) => {
        if (liveAtt) setAttendanceRecords(liveAtt);
      });
      fetchLeavesLive().then((liveLeaves: LeaveRequest[] | null) => {
        if (liveLeaves) setLeaveRequests(liveLeaves);
      });

      // Berlangganan Realtime Supabase: INSERT, UPDATE, DELETE
      const unsubscribeAtt = subscribeAttendanceRealtime(
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

      // Berlangganan Realtime Perubahan Pengaturan Sekolah
      const unsubscribeSettings = subscribeSchoolSettingsRealtime((updatedSettings) => {
        setSchoolSettings(updatedSettings);
        localStorage.setItem('sdn_bobong_school_settings', JSON.stringify(updatedSettings));
      });

      return () => {
        unsubscribeAtt();
        unsubscribeSettings();
      };
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
    localStorage.setItem('sdn_bobong_school_settings', JSON.stringify(newSettings));
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
      if (uploaded) {
        cloudSelfieUrl = uploaded;
      } else {
        alert('Gagal mengirim presensi: Koneksi internet lambat / gagal mengunggah foto selfie ke server.');
        return;
      }
    }

    const appType = detectAppType();
    const finalNotes = newRecord.notes 
      ? `${newRecord.notes} | Lewat: ${appType}`
      : `Lewat: ${appType}`;

    // Fix 4: Sertakan field shift agar tersimpan ke Supabase
    const fullRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: newRecord.userId!, userName: newRecord.userName!, userNip: newRecord.userNip!,
      date: newRecord.date!, checkInTime: newRecord.checkInTime,
      checkInLat: newRecord.checkInLat, checkInLng: newRecord.checkInLng,
      distanceMeters: newRecord.distanceMeters, status: newRecord.status || 'hadir',
      notes: finalNotes, selfieUrl: cloudSelfieUrl,
      shift: newRecord.shift
    };

    if (isSupabaseConfigured) {
      const success = await saveAttendanceLive(fullRecord);
      if (success) {
        setAttendanceRecords(prev => [fullRecord, ...prev]);
        alert('Presensi masuk berhasil tersimpan dan tersinkronisasi ke server cloud.');
      } else {
        // Simpan ke antrean offline jika gagal (misal koneksi down)
        const offlineItem = {
          id: fullRecord.id,
          userId: fullRecord.userId,
          userName: fullRecord.userName,
          userNip: fullRecord.userNip,
          date: fullRecord.date,
          time: fullRecord.checkInTime || new Date().toISOString(),
          type: 'in' as const,
          selfieBase64: newRecord.selfieUrl || '',
          distanceMeters: fullRecord.distanceMeters || 0,
          notes: fullRecord.notes,
          timestamp: Date.now(),
          shift: fullRecord.shift,
          status: fullRecord.status
        };
        saveOfflineAttendanceItem(offlineItem);
        
        setAttendanceRecords(prev => [fullRecord, ...prev]);
        alert('Jaringan terganggu. Presensi disimpan sementara di HP lokal dan akan otomatis tersinkronisasi saat sinyal kembali pulih.');
      }
    } else {
      setAttendanceRecords(prev => [fullRecord, ...prev]);
    }
  };

  const handleCheckOut = async (recordId: string, checkOutTime: string, selfieUrl?: string, bypassNote?: string) => {
    const targetRecord = attendanceRecords.find(r => r.id === recordId);
    let cloudSelfieOutUrl = undefined;

    if (selfieUrl && selfieUrl.startsWith('data:image')) {
      const userId = targetRecord?.userId || 'unknown';
      const uploaded = await uploadSelfie(selfieUrl, userId);
      if (uploaded) {
        cloudSelfieOutUrl = uploaded;
      } else {
        alert('Gagal mengirim presensi pulang: Gagal mengunggah foto selfie pulang ke server.');
        return;
      }
    }

    if (isSupabaseConfigured) {
      const success = await updateCheckOutLive(
        recordId,
        checkOutTime,
        targetRecord?.userNip,
        targetRecord?.date,
        cloudSelfieOutUrl,
        bypassNote
      );
      if (success) {
        setAttendanceRecords(prev => prev.map(r => (r.id === recordId ? { 
          ...r, 
          checkOutTime, 
          selfieOutUrl: cloudSelfieOutUrl || r.selfieOutUrl,
          notes: bypassNote ? `${r.notes || ''} | ${bypassNote}` : r.notes
        } : r)));
        alert('Presensi pulang berhasil tersimpan dan tersinkronisasi ke server cloud.');
      } else {
        // Simpan ke antrean offline jika gagal (offline)
        const offlineItem = {
          id: recordId,
          userId: targetRecord?.userId || 'unknown',
          userName: targetRecord?.userName || 'unknown',
          userNip: targetRecord?.userNip || 'unknown',
          date: targetRecord?.date || new Date().toISOString().split('T')[0],
          time: checkOutTime,
          type: 'out' as const,
          selfieBase64: selfieUrl || '',
          distanceMeters: targetRecord?.distanceMeters || 0,
          notes: bypassNote,
          timestamp: Date.now(),
          shift: targetRecord?.shift,
          status: targetRecord?.status
        };
        saveOfflineAttendanceItem(offlineItem);

        setAttendanceRecords(prev => prev.map(r => (r.id === recordId ? { 
          ...r, 
          checkOutTime, 
          selfieOutUrl: selfieUrl,
          notes: bypassNote ? `${r.notes || ''} | ${bypassNote}` : r.notes
        } : r)));
        alert('Jaringan terganggu. Presensi pulang disimpan sementara di HP lokal dan akan otomatis tersinkronisasi saat sinyal kembali pulih.');
      }
    } else {
      setAttendanceRecords(prev => prev.map(r => (r.id === recordId ? { 
        ...r, 
        checkOutTime, 
        selfieOutUrl: selfieUrl,
        notes: bypassNote ? `${r.notes || ''} | ${bypassNote}` : r.notes
      } : r)));
    }
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

  const handleConfirmDinasLuar = async (recordId: string) => {
    setAttendanceRecords(prev => prev.map(r => (r.id === recordId ? { ...r, status: 'dinas_luar_approved' } : r)));
    if (isSupabaseConfigured) {
      const success = await updateAttendanceStatusLive(recordId, 'dinas_luar_approved');
      if (success) {
        alert('Kehadiran Dinas Luar berhasil dikonfirmasi oleh Admin!');
      } else {
        alert('Gagal memperbarui status di database.');
      }
    } else {
      alert('Mode luring: Status dinas luar dikonfirmasi lokal.');
    }
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

  const handleRegisterFace = async (userId: string, faceDescriptorStr: string) => {
    if (isSupabaseConfigured) {
      const success = await updateUserFaceDescriptorLive(userId, faceDescriptorStr);
      if (!success) {
        alert('Gagal menyimpan sidik jari wajah ke server database. Periksa koneksi internet Anda.');
        return;
      }
    }

    // Perbarui state lokal untuk users
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, faceDescriptor: faceDescriptorStr } : u));

    // Perbarui session & currentUser jika user aktif
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, faceDescriptor: faceDescriptorStr };
      setCurrentUser(updatedUser);
      saveSessionUser(updatedUser);
    }
  };

  return {
    allUsers, currentUser, schoolSettings, attendanceRecords, leaveRequests,
    handleLoginSuccess, handleLogout,
    handleAddTeacher, handleDeleteTeacher, handleUpdateTeacher, handleUpdateSettings,
    handleCheckIn, handleCheckOut,
    handleLeaveSubmit, handleUpdateLeaveStatus, handleUpdateUserPassword,
    handleGenerateAlfa, handleRegisterFace, handleConfirmDinasLuar
  };
}
