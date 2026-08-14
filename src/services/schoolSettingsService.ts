import { SchoolSettings } from '../types/index';
import { supabase } from './supabaseClient';

export function parseSchoolSettingsRow(data: any): SchoolSettings {
  const rawAddress = data.address || 'Taliabu Barat';
  let workingText = rawAddress;
  let groqApiKey = '';
  let pagiCheckInOpen = '06:00';
  let pagiWorkStart = '07:15';
  let pagiCheckOutStart = '11:45';
  let pagiCheckOutEnd = '12:00';
  let siangCheckInOpen = '12:10';
  let siangWorkStart = '12:45';
  let siangCheckOutStart = '16:00';
  let siangCheckOutEnd = '16:45';

  // 1. Ekstrak Groq API Key jika ada
  if (workingText.includes('|| groq_key:')) {
    const parts = workingText.split('|| groq_key:');
    groqApiKey = parts[1].trim();
    workingText = parts[0].trim();
  }

  // 2. Ekstrak data jam presensi pagi & siang jika ada
  if (workingText.includes('|| times:')) {
    const parts = workingText.split('|| times:');
    const timeString = parts[1].trim();
    workingText = parts[0].trim();

    const timeParts = timeString.split('|');
    if (timeParts.length === 8) {
      pagiCheckInOpen = timeParts[0];
      pagiWorkStart = timeParts[1];
      pagiCheckOutStart = timeParts[2];
      pagiCheckOutEnd = timeParts[3];
      siangCheckInOpen = timeParts[4];
      siangWorkStart = timeParts[5];
      siangCheckOutStart = timeParts[6];
      siangCheckOutEnd = timeParts[7];
    }
  }

  const cleanAddress = workingText.trim();

  return {
    id: data.id,
    schoolName: data.school_name || 'SD Negeri Bobong',
    address: cleanAddress,
    latitude: data.latitude,
    longitude: data.longitude,
    radiusMeters: data.radius_meters || 10,
    polygonCoords: data.polygon_coords,
    pagiCheckInOpen,
    pagiWorkStart,
    pagiCheckOutStart,
    pagiCheckOutEnd,
    siangCheckInOpen,
    siangWorkStart,
    siangCheckOutStart,
    siangCheckOutEnd,
    groqApiKey
  };
}

export async function fetchSchoolSettingsLive(): Promise<SchoolSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('school_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.warn('Error fetching school settings from Supabase:', error?.message);
    return null;
  }

  return parseSchoolSettingsRow(data);
}

export function subscribeSchoolSettingsRealtime(onUpdate: (settings: SchoolSettings) => void): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime_school_settings')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'school_settings', filter: 'id=eq.1' },
      (payload) => {
        onUpdate(parseSchoolSettingsRow(payload.new));
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}

export async function saveSchoolSettingsLive(s: SchoolSettings): Promise<boolean> {
  if (!supabase) return false;

  // 1. Pack times & groq key ke dalam string alamat untuk disimpan di Supabase
  let dbAddress = s.address;
  const timeString = `${s.pagiCheckInOpen}|${s.pagiWorkStart}|${s.pagiCheckOutStart}|${s.pagiCheckOutEnd}|${s.siangCheckInOpen}|${s.siangWorkStart}|${s.siangCheckOutStart}|${s.siangCheckOutEnd}`;
  dbAddress = `${dbAddress} || times: ${timeString}`;

  if (s.groqApiKey) {
    dbAddress = `${dbAddress} || groq_key: ${s.groqApiKey}`;
  }

  // 2. Format waktu kerja utama untuk kompatibilitas kolom di Supabase
  const formattedWorkStart = s.pagiWorkStart ? `${s.pagiWorkStart}:00` : '07:15:00';
  const formattedWorkEnd = s.pagiCheckOutEnd ? `${s.pagiCheckOutEnd}:00` : '12:00:00';

  const payload: any = {
    id: 1,
    school_name: s.schoolName,
    address: dbAddress,
    latitude: s.latitude,
    longitude: s.longitude,
    radius_meters: s.radiusMeters,
    work_start_time: formattedWorkStart,
    work_end_time: formattedWorkEnd
  };

  if (s.polygonCoords) payload.polygon_coords = s.polygonCoords;

  const { error } = await supabase
    .from('school_settings')
    .upsert([payload]);

  if (error) {
    console.error('Error saving school settings to Supabase:', error.message);
    return false;
  }
  return true;
}
