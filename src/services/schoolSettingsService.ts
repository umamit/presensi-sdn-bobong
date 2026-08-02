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
    schoolName: data.school_name,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    radiusMeters: data.radius_meters,
    polygonCoords: data.polygon_coords,
    pagiCheckInOpen: data.pagi_check_in_open,
    pagiWorkStart: data.pagi_work_start,
    pagiCheckOutStart: data.pagi_check_out_start,
    pagiCheckOutEnd: data.pagi_check_out_end,
    siangCheckInOpen: data.siang_check_in_open,
    siangWorkStart: data.siang_work_start,
    siangCheckOutStart: data.siang_check_out_start,
    siangCheckOutEnd: data.siang_check_out_end
  };
}

export async function saveSchoolSettingsLive(s: SchoolSettings): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('school_settings')
    .upsert([{
      id: 1,
      school_name: s.schoolName,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      radius_meters: s.radiusMeters,
      polygon_coords: s.polygonCoords,
      pagi_check_in_open: s.pagiCheckInOpen,
      pagi_work_start: s.pagiWorkStart,
      pagi_check_out_start: s.pagiCheckOutStart,
      pagi_check_out_end: s.pagiCheckOutEnd,
      siang_check_in_open: s.siangCheckInOpen,
      siang_work_start: s.siangWorkStart,
      siang_check_out_start: s.siangCheckOutStart,
      siang_check_out_end: s.siangCheckOutEnd
    }]);

  if (error) {
    console.error('Error saving school settings to Supabase:', error.message);
    return false;
  }
  return true;
}
