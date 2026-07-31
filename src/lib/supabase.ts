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
  checkInOpenTime: '06:00',
  workStartTime: '07:15',
  workEndTime: '16:00',
  checkOutEndTime: '17:00'
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    nip: '199610272019032006',
    fullName: 'Husnita Usman, M.Pd.',
    email: 'husnita.usman@sdnegeribobong.sch.id',
    role: 'admin',
    subject: 'Plt. Kepala Sekolah / Bahasa Inggris',
    password: '230900',
  },
  {
    id: 'usr-3',
    nip: '198004042009042005',
    fullName: 'Wa Sutini Idris',
    email: 'wa.sutini@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Tata Usaha / Administrasi Sekolah',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-4',
    nip: '198808152011012009',
    fullName: 'YUSNIAR, S.Pd., Gr.',
    email: 'yusniar@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Bendahara Sekolah / Wali Kelas 4B',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-5',
    nip: '197111032006042004',
    fullName: 'DJAYANI A.GAFAR, A.Ma',
    email: 'djayani@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 1B',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-6',
    nip: '199510012025212017',
    fullName: 'RINI LAILA, S.Pd., Gr',
    email: 'rini.laila@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 1A',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-7',
    nip: '199512022025212010',
    fullName: 'AYU LESTARI, S.Pd., Gr',
    email: 'ayu.lestari@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 2A',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-8',
    nip: '199007102020012015',
    fullName: 'MARDIANA, S.Pd',
    email: 'mardiana@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 2B',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-9',
    nip: '198503092010012009',
    fullName: 'Jumraeni La Mbone',
    email: 'jumraeni@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 2C',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-10',
    nip: '199705072025212015',
    fullName: 'FITRI HAMZA, S.Pd., Gr',
    email: 'fitri.hamza@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 3A',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-11',
    nip: '197708182023212000',
    fullName: 'SUKMA ANI, S.Pd., Gr',
    email: 'sukma.ani@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 3B',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-12',
    nip: '101502',
    fullName: 'Surahmi Wambes, S.Pd',
    email: 'surahmi.wambes@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 4A',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-13',
    nip: '198805012025211027',
    fullName: 'MAHARUDIN, S.Pd., Gr',
    email: 'maharudin@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 5A',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-14',
    nip: '198509162009032002',
    fullName: 'SURYANI NARIA, M.Pd',
    email: 'suryani.naria@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 5B',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-15',
    nip: '199108202014092001',
    fullName: 'Hasnia La Kepe',
    email: 'hasnia.lakepe@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 6A',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-16',
    nip: '101504',
    fullName: 'SISKA ANDAYANI, S.Pd',
    email: 'siska.andayani@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Guru Kelas 6B',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-17',
    nip: '198707082015031002',
    fullName: 'Abdul Kadir, S.Pd.I., Gr., M.Pd',
    email: 'abdul.kadir@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Pendidikan Agama Islam',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-18',
    nip: '101505',
    fullName: 'SUKMAWATI ARSAN, S.Pd.I',
    email: 'sukmawati.arsan@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Pendidikan Agama Islam',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-19',
    nip: '101503',
    fullName: 'KRISMAN',
    email: 'krisman@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Tenaga Administrasi',
    password: 'sdnbobong123',
  },
  {
    id: 'usr-20',
    nip: '198004042009042006',
    fullName: 'WA ODE SAMRIDA',
    email: 'waode.samrida@sdnegeribobong.sch.id',
    role: 'guru',
    subject: 'Tenaga Administrasi',
    password: 'sdnbobong123',
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
