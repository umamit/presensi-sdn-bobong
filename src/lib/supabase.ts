import { createClient } from '@supabase/supabase-js';
import { UserProfile, AttendanceRecord, SchoolSettings, LeaveRequest } from '../types';

// Ambil variabel lingkungan jika ada
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// DEMO MOCK STORE (Untuk Penggunaan Instant Tanpa Setup Server)
// ==========================================

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  id: 1,
  schoolName: 'SD Negeri Bobong',
  address: 'Area Presensi SD Negeri Bobong, Taliabu Barat, Maluku Utara',
  latitude: -1.955549,   // Koordinat titik tengah dari KML terbaru
  longitude: 124.384365, // Koordinat titik tengah dari KML terbaru
  radiusMeters: 10,      // Toleransi radius absensi (Super Strict 10 Meter)
  polygonCoords: [       // Polygon Geofence presisi dari KML terbaru [lat, lng]
    [-1.955656974304001, 124.3842430227951],
    [-1.955653769665803, 124.3844916213357],
    [-1.955441463594634, 124.384483466394],
    [-1.955444588304861, 124.3842415717484]
  ],
  pagiCheckInOpen: '06:00',
  pagiWorkStart: '08:00',
  pagiCheckOutStart: '11:45',
  pagiCheckOutEnd: '12:00',
  siangCheckInOpen: '12:00',
  siangWorkStart: '12:30',
  siangCheckOutStart: '16:00',
  siangCheckOutEnd: '16:45'
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    nip: '199610272019032006',
    fullName: 'Husnita Usman, M.Pd.',
    email: 'husnita.usman@sdnegeribobong.sch.id',
    role: 'admin',
    subject: 'Plt. Kepala Sekolah / Bahasa Inggris',
    password: '230900'
  }
];

export const MOCK_ATTENDANCE_INITIAL: AttendanceRecord[] = [];

export const MOCK_LEAVES_INITIAL: LeaveRequest[] = [];

// ==========================================
// SUPABASE LIVE DATA SERVICES
// ==========================================

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

  return data.map(item => ({
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
    selfieUrl: item.selfie_url
  }));
}

export async function saveAttendanceLive(rec: AttendanceRecord): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('attendance').insert([{
    user_id: rec.userId,
    user_name: rec.userName,
    user_nip: rec.userNip,
    date: rec.date,
    check_in_time: rec.checkInTime,
    check_in_lat: rec.checkInLat,
    check_in_lng: rec.checkInLng,
    distance_meters: rec.distanceMeters,
    status: rec.status,
    notes: rec.notes,
    selfie_url: rec.selfieUrl
  }]);

  if (error) {
    console.error('Error saving attendance to Supabase:', error.message);
    return false;
  }
  return true;
}

// Upload selfie foto ke Supabase Storage
export async function uploadSelfie(imageDataUrl: string, userId: string): Promise<string | null> {
  // Jika Supabase belum tersambung, kembalikan data URL langsung (disimpan lokal)
  if (!supabase) return imageDataUrl;

  try {
    // Konversi base64 data URL menjadi Blob
    const res = await fetch(imageDataUrl);
    const blob = await res.blob();

    const fileName = `selfies/${userId}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('presensi-selfies')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      console.warn('Error uploading selfie to Supabase Storage:', error.message);
      return imageDataUrl; // Fallback ke base64 lokal
    }

    const { data: urlData } = supabase.storage
      .from('presensi-selfies')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.warn('Selfie upload error, using local base64:', err);
    return imageDataUrl; // Fallback ke base64 lokal
  }
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

export async function fetchLeavesLive(): Promise<LeaveRequest[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching leave_requests from Supabase:', error.message);
    return null;
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    userName: item.user_name,
    userNip: item.user_nip,
    startDate: item.start_date,
    endDate: item.end_date,
    leaveType: item.leave_type,
    description: item.description,
    documentUrl: item.document_url,
    status: item.status,
    createdAt: item.created_at
  }));
}

export async function saveLeaveLive(req: LeaveRequest): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leave_requests').insert([{
    user_id: req.userId,
    user_name: req.userName,
    user_nip: req.userNip,
    start_date: req.startDate,
    end_date: req.endDate,
    leave_type: req.leaveType,
    description: req.description,
    document_url: req.documentUrl,
    status: req.status
  }]);

  if (error) {
    console.error('Error saving leave request to Supabase:', error.message);
    return false;
  }
  return true;
}

export async function updateLeaveStatusLive(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('leave_requests')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating leave status in Supabase:', error.message);
    return false;
  }
  return true;
}

export async function fetchUsersLive(): Promise<UserProfile[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.warn('Error fetching users from Supabase:', error.message);
    return null;
  }

  return data.map(item => ({
    id: item.id,
    nip: item.nip,
    fullName: item.full_name,
    email: item.email,
    role: item.role,
    subject: item.subject,
    password: item.password
  }));
}

export async function updateUserPasswordLive(userId: string, newPassword: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user password in Supabase:', error.message);
    return false;
  }
  return true;
}
