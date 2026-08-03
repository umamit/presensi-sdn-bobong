import { SchoolSettings } from '../types';
import { supabase } from './supabaseClient';

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

  return {
    id: data.id,
    schoolName: data.school_name || 'SD Negeri Bobong',
    address: data.address || 'Taliabu Barat',
    latitude: data.latitude,
    longitude: data.longitude,
    radiusMeters: data.radius_meters || 10,
    polygonCoords: data.polygon_coords,
    pagiCheckInOpen: data.pagi_check_in_open || '06:00',
    pagiWorkStart: data.pagi_work_start || data.work_start_time || '08:00',
    pagiCheckOutStart: data.pagi_check_out_start || '11:45',
    pagiCheckOutEnd: data.pagi_check_out_end || data.work_end_time || '12:00',
    siangCheckInOpen: data.siang_check_in_open || '12:00',
    siangWorkStart: data.siang_work_start || '12:30',
    siangCheckOutStart: data.siang_check_out_start || '16:00',
    siangCheckOutEnd: data.siang_check_out_end || '16:45'
  };
}

export async function saveSchoolSettingsLive(s: SchoolSettings): Promise<boolean> {
  if (!supabase) return false;

  const payload: any = {
    id: 1,
    school_name: s.schoolName,
    address: s.address,
    latitude: s.latitude,
    longitude: s.longitude,
    radius_meters: s.radiusMeters,
    work_start_time: s.pagiWorkStart || '08:00',
    work_end_time: s.pagiCheckOutEnd || '12:00'
  };

  if (s.polygonCoords) payload.polygon_coords = s.polygonCoords;
  if (s.pagiCheckInOpen) payload.pagi_check_in_open = s.pagiCheckInOpen;
  if (s.pagiWorkStart) payload.pagi_work_start = s.pagiWorkStart;
  if (s.pagiCheckOutStart) payload.pagi_check_out_start = s.pagiCheckOutStart;
  if (s.pagiCheckOutEnd) payload.pagi_check_out_end = s.pagiCheckOutEnd;
  if (s.siangCheckInOpen) payload.siang_check_in_open = s.siangCheckInOpen;
  if (s.siangWorkStart) payload.siang_work_start = s.siangWorkStart;
  if (s.siangCheckOutStart) payload.siang_check_out_start = s.siangCheckOutStart;
  if (s.siangCheckOutEnd) payload.siang_check_out_end = s.siangCheckOutEnd;

  const { error } = await supabase
    .from('school_settings')
    .upsert([payload]);

  if (error) {
    console.error('Error saving school settings to Supabase:', error.message);
    return false;
  }
  return true;
}
