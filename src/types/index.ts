export type UserRole = 'guru' | 'admin';

export type ShiftType = 'pagi' | 'siang';

export interface UserProfile {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  role: UserRole;
  subject?: string;
  avatarUrl?: string;
  phone?: string;
  password?: string;
  shift?: ShiftType; // 'pagi' | 'siang'
}

export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'alfa';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // ISO String
  checkOutTime?: string; // ISO String
  checkInLat?: number;
  checkInLng?: number;
  distanceMeters?: number;
  status: AttendanceStatus;
  notes?: string;
  selfieUrl?: string;
  shift?: ShiftType;
}

export interface SchoolSettings {
  id: number;
  schoolName: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  polygonCoords?: Array<[number, number]>; // Geofence polygon KML [lat, lng]
  
  // Shift Pagi
  pagiCheckInOpen: string;  // "06:00"
  pagiWorkStart: string;    // "08:00"
  pagiCheckOutStart: string; // "11:45"
  pagiCheckOutEnd: string;   // "12:00"

  // Shift Siang
  siangCheckInOpen: string;  // "12:00"
  siangWorkStart: string;    // "12:30"
  siangCheckOutStart: string; // "16:00"
  siangCheckOutEnd: string;   // "16:45"
  groqApiKey?: string;
}

export type LeaveType = 'sakit' | 'izin' | 'cuti';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  description: string;
  documentUrl?: string;
  status: LeaveStatus;
  createdAt: string;
}
