import { AttendanceRecord } from '../types';
import { supabase } from './supabaseClient';

export async function fetchAttendanceLive(): Promise<AttendanceRecord[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching attendance from Supabase:', error.message);
    return null;
  }

  return data.map(item => {
    let extractedSelfie = item.selfie_url;
    if (!extractedSelfie && item.notes && item.notes.includes('https://')) {
      const match = item.notes.match(/https:\/\/[^\s]+\.(jpg|jpeg|png)/i);
      if (match) extractedSelfie = match[0];
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
      selfieUrl: extractedSelfie
    };
  });
}

export async function saveAttendanceLive(rec: AttendanceRecord): Promise<boolean> {
  if (!supabase) return false;

  // Cek apakah rec.userId berbentuk UUID valid. Jika tidak, kosongkan user_id agar Supabase tidak menolak syntax UUID
  const isUuid = rec.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rec.userId);

  const payload: any = {
    user_name: rec.userName,
    user_nip: rec.userNip,
    date: rec.date,
    check_in_time: rec.checkInTime,
    check_in_lat: rec.checkInLat,
    check_in_lng: rec.checkInLng,
    distance_meters: rec.distanceMeters,
    status: rec.status,
    notes: rec.notes || 'Presensi Verified',
    selfie_url: rec.selfieUrl || undefined
  };

  if (isUuid) {
    payload.user_id = rec.userId;
  }

  const { error } = await supabase.from('attendance').insert([payload]);

  if (error) {
    console.error('Error saving attendance to Supabase DB:', error.message);
    return false;
  }
  return true;
}

export async function updateCheckOutLive(id: string, checkOutTime: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('attendance')
    .update({ check_out_time: checkOutTime })
    .eq('id', id);

  if (error) {
    console.error('Error updating checkout in Supabase:', error.message);
    return false;
  }
  return true;
}
