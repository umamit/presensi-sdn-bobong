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
  latitude: -1.955544,   // Koordinat titik tengah area presensi dari KML
  longitude: 124.384388, // Koordinat titik tengah area presensi dari KML
  radiusMeters: 40,      // Toleransi radius absensi
  polygonCoords: [       // Polygon Geofence presisi dari Google Earth KML
    [-1.955389, 124.384231],
    [-1.955707, 124.384250],
    [-1.955692, 124.384539],
    [-1.955389, 124.384530]
  ],
  workStartTime: '07:15',
  workEndTime: '13:00'
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-guru-1',
    nip: '198504122010011005',
    fullName: 'Drs. Ahmad Fauzi, M.Pd',
    email: 'ahmad.fauzi@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas VI',
    phone: '081234567890',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'usr-guru-2',
    nip: '199008232015022003',
    fullName: 'Siti Nurhaliza, S.Pd',
    email: 'siti.nurhaliza@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Agama & BP',
    phone: '082198765432',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'usr-admin-1',
    nip: '197801012005011001',
    fullName: 'Budi Santoso, S.Pd (Kepala Sekolah)',
    email: 'admin@sdnegeribobong.sch.id',
    role: 'admin',
    subject: 'Kepala Sekolah / Admin',
    phone: '081122334455',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
  }
];

export const MOCK_ATTENDANCE_INITIAL: AttendanceRecord[] = [
  {
    id: 'att-1',
    userId: 'usr-guru-1',
    userName: 'Drs. Ahmad Fauzi, M.Pd',
    userNip: '198504122010011005',
    date: new Date().toISOString().split('T')[0],
    checkInTime: new Date(new Date().setHours(6, 50, 0)).toISOString(),
    checkInLat: -1.955544,
    checkInLng: 124.384388,
    distanceMeters: 12,
    status: 'hadir',
    notes: 'Presensi Masuk Tepat Waktu'
  },
  {
    id: 'att-2',
    userId: 'usr-guru-2',
    userName: 'Siti Nurhaliza, S.Pd',
    userNip: '199008232015022003',
    date: new Date().toISOString().split('T')[0],
    checkInTime: new Date(new Date().setHours(7, 25, 0)).toISOString(),
    checkInLat: -1.955540,
    checkInLng: 124.384390,
    distanceMeters: 18,
    status: 'terlambat',
    notes: 'Macet jalan'
  }
];

export const MOCK_LEAVES_INITIAL: LeaveRequest[] = [
  {
    id: 'lv-1',
    userId: 'usr-guru-2',
    userName: 'Siti Nurhaliza, S.Pd',
    userNip: '199008232015022003',
    startDate: '2026-08-03',
    endDate: '2026-08-04',
    leaveType: 'sakit',
    description: 'Demam tinggi dan pemeriksaan dokter.',
    documentUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

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
    notes: item.notes
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
    notes: rec.notes
  }]);

  if (error) {
    console.error('Error saving attendance to Supabase:', error.message);
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
