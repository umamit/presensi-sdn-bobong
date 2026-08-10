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
    const extractedSelfie = item.selfie_url || undefined;

    // Ekstrak shift: gunakan kolom shift database, jika kosong gunakan fallback notes (data lama)
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
      selfieUrl: extractedSelfie,
      shift: extractedShift
    };
  });
}

export async function saveAttendanceLive(rec: AttendanceRecord): Promise<boolean> {
  if (!supabase) return false;

  // Fix #8: Validasi duplikat di Supabase — cegah absen ganda dari device berbeda
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_nip', rec.userNip)
    .eq('date', rec.date)
    .maybeSingle();

  if (existing) {
    console.warn(`Duplikat presensi terdeteksi di Supabase untuk NIP ${rec.userNip} tanggal ${rec.date}. Insert dibatalkan.`);
    return false;
  }

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
    selfie_url: rec.selfieUrl || null,
    shift: rec.shift || null // Simpan langsung ke kolom baru di Supabase
  };

  if (isUuid) payload.user_id = rec.userId;

  const { error } = await supabase.from('attendance').insert([payload]);
  if (error) {
    console.error('Error saving attendance to Supabase DB:', error.message);
    return false;
  }
  return true;
}

export async function updateCheckOutLive(
  id: string,
  checkOutTime: string,
  userNip?: string,
  date?: string
): Promise<boolean> {
  if (!supabase) return false;

  // Fix #6: Fetch notes lama dulu, lalu append info jam pulang tanpa menimpa notes masuk
  const checkOutTimeStr = new Date(checkOutTime).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  // Cari record yang ada: utamakan ID jika UUID valid, jika tidak gunakan userNip + date
  let query = supabase.from('attendance').select('id, notes');
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUuid) {
    query = query.eq('id', id);
  } else if (userNip && date) {
    query = query.eq('user_nip', userNip).eq('date', date);
  } else {
    query = query.eq('id', id);
  }

  const { data: existing } = await query.maybeSingle();

  const recordId = existing?.id || id;
  const existingNotes = existing?.notes || '';
  const updatedNotes = existingNotes
    ? `${existingNotes} | Pulang: ${checkOutTimeStr} WIT`
    : `Pulang: ${checkOutTimeStr} WIT`;

  const { error } = await supabase
    .from('attendance')
    .update({ check_out_time: checkOutTime, notes: updatedNotes })
    .eq('id', recordId);

  if (error) {
    console.error('Error updating checkout in Supabase:', error.message);
    return false;
  }
  return true;
}
