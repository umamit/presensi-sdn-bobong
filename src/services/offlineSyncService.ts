import { AttendanceRecord, AttendanceStatus } from '../types';
import { saveAttendanceLive, updateCheckOutLive } from './attendanceService';
import { uploadSelfie } from './storageService';

// Fix #12: Ganti sessionStorage → localStorage agar antrean offline bertahan walau tab/browser ditutup
const OFFLINE_ATTENDANCE_KEY = 'sdn_bobong_offline_attendance_queue';

export interface OfflineAttendanceItem {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  date: string;
  time: string;
  type: 'in' | 'out';
  selfieBase64: string;
  distanceMeters: number;
  notes?: string;
  timestamp: number;
  // Fix #11: Tambah field shift dan status agar tidak hilang saat sync
  shift?: 'pagi' | 'siang';
  status?: AttendanceStatus;
}

export function getOfflineAttendanceQueue(): OfflineAttendanceItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_ATTENDANCE_KEY); // Fix #12
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOfflineAttendanceItem(item: OfflineAttendanceItem): void {
  const queue = getOfflineAttendanceQueue();
  queue.push(item);
  localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(queue)); // Fix #12
}

export async function syncOfflineAttendanceQueue(): Promise<number> {
  const queue = getOfflineAttendanceQueue();
  if (queue.length === 0) return 0;

  let syncedCount = 0;
  const remainingItems: OfflineAttendanceItem[] = [];

  for (const item of queue) {
    try {
      let success = false;
      
      if (item.type === 'in') {
        let selfieUrl = '';
        if (item.selfieBase64) {
          const uploaded = await uploadSelfie(item.selfieBase64, item.userId);
          selfieUrl = uploaded || '';
        }

        const rec: AttendanceRecord = {
          id: item.id,
          userId: item.userId,
          userName: item.userName,
          userNip: item.userNip,
          date: item.date,
          checkInTime: item.time,
          selfieUrl: selfieUrl || undefined,
          distanceMeters: item.distanceMeters,
          // Fix #11: Gunakan status & shift yang tersimpan, bukan hardcode 'hadir'
          status: item.status || 'hadir',
          shift: item.shift,
          notes: item.notes || `Presensi Masuk (Offline Sync)`
        };

        success = await saveAttendanceLive(rec);
      } else {
        let selfieOutUrl = undefined;
        if (item.selfieBase64) {
          const uploaded = await uploadSelfie(item.selfieBase64, item.userId);
          selfieOutUrl = uploaded || undefined;
        }
        // Fix offline check-out: unggah selfieOutUrl dan teruskan catatan darurat (jika ada) ke updateCheckOutLive
        success = await updateCheckOutLive(
          item.id, 
          item.time, 
          item.userNip, 
          item.date, 
          selfieOutUrl, 
          item.notes
        );
      }

      if (success) {
        syncedCount++;
      } else {
        remainingItems.push(item);
      }
    } catch (err) {
      remainingItems.push(item);
    }
  }

  localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(remainingItems)); // Fix #12
  return syncedCount;
}
