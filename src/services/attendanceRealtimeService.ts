import { AttendanceRecord } from '../types';
import { supabase } from '../services/supabaseClient';

/** Konversi raw Supabase row → AttendanceRecord */
function mapRow(item: any): AttendanceRecord {
  let extractedShift = item.shift || undefined;
  if (!extractedShift && item.notes) {
    const match = item.notes.match(/Shift:\s*(\w+)/i);
    if (match) {
      extractedShift = match[1].toLowerCase();
    }
  }

  return {
    id: item.id,
    userId: item.user_id,
    userName: item.user_name,
    userNip: item.user_nip,
    date: item.date,
    checkInTime: item.check_in_time,
    checkOutTime: item.check_out_time,
    checkInLat: item.check_in_lat,
    checkInLng: item.check_in_lng,
    distanceMeters: item.distance_meters,
    status: item.status,
    notes: item.notes,
    selfieUrl: item.selfie_url || undefined,
    selfieOutUrl: item.selfie_out_url || undefined,
    shift: extractedShift,
  };
}

export function subscribeAttendanceRealtime(
  onInsert: (record: AttendanceRecord) => void,
  onUpdate: (record: AttendanceRecord) => void,
  onDelete: (id: string) => void,
): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime_attendance_all')
    // Fix #5a: Tangani INSERT
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, (payload) => {
      const record = mapRow(payload.new);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Presensi Guru Terbaru! 🔔', {
          body: `${record.userName} telah presensi masuk (${record.status.toUpperCase()}).`,
          icon: '/apple-touch-icon.png'
        });
      }
      onInsert(record);
    })
    // Fix #5b: Tangani UPDATE (mis. checkout, perubahan status)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'attendance' }, (payload) => {
      onUpdate(mapRow(payload.new));
    })
    // Fix #5c: Tangani DELETE (mis. admin hapus record langsung di Supabase)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'attendance' }, (payload) => {
      onDelete(payload.old.id as string);
    })
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}
