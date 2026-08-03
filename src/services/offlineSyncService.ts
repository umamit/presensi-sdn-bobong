import { AttendanceRecord } from '../types';
import { saveAttendanceLive } from './attendanceService';
import { uploadSelfie } from './storageService';

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
}

export function getOfflineAttendanceQueue(): OfflineAttendanceItem[] {
  try {
    const raw = sessionStorage.getItem(OFFLINE_ATTENDANCE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOfflineAttendanceItem(item: OfflineAttendanceItem): void {
  const queue = getOfflineAttendanceQueue();
  queue.push(item);
  sessionStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(queue));
}

export async function syncOfflineAttendanceQueue(): Promise<number> {
  const queue = getOfflineAttendanceQueue();
  if (queue.length === 0) return 0;

  let syncedCount = 0;
  const remainingItems: OfflineAttendanceItem[] = [];

  for (const item of queue) {
    try {
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
        checkInTime: item.type === 'in' ? item.time : undefined,
        checkOutTime: item.type === 'out' ? item.time : undefined,
        selfieUrl: selfieUrl || undefined,
        distanceMeters: item.distanceMeters,
        status: 'hadir',
        notes: item.notes || `Presensi ${item.type === 'in' ? 'Masuk' : 'Pulang'} (Offline Sync)`
      };

      const success = await saveAttendanceLive(rec);
      if (success) {
        syncedCount++;
      } else {
        remainingItems.push(item);
      }
    } catch (err) {
      remainingItems.push(item);
    }
  }

  sessionStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(remainingItems));
  return syncedCount;
}
