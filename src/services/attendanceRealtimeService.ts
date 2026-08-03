import { AttendanceRecord } from '../types';
import { supabase } from '../services/supabaseClient';

/**
 * Service khusus Realtime Notification Supabase (Poin 1 Kode 1 File)
 * Mendengarkan secara realtime ketika ada guru yang melakukan presensi baru di Supabase DB
 */
export function subscribeAttendanceRealtime(
  onNewAttendance: (record: AttendanceRecord) => void
): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime_attendance_notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'attendance' },
      (payload) => {
        const item = payload.new;
        let extractedSelfie = item.selfie_url;
        if (!extractedSelfie && item.notes && item.notes.includes('https://')) {
          const match = item.notes.match(/https:\/\/[^\s]+\.(jpg|jpeg|png)/i);
          if (match) extractedSelfie = match[0];
        }

        const newRecord: AttendanceRecord = {
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
          selfieUrl: extractedSelfie
        };

        // Kirim Notifikasi Push Browser jika diizinkan
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Presensi Guru Terbaru! 🔔', {
            body: `${newRecord.userName} (${newRecord.userNip}) telah melakukan presensi masuk (${newRecord.status.toUpperCase()}).`,
            icon: '/apple-touch-icon.png'
          });
        }

        onNewAttendance(newRecord);
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}
