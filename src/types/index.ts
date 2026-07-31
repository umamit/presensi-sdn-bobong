export type UserRole = 'guru' | 'admin';

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
}

export interface SchoolSettings {
  id: number;
  schoolName: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  polygonCoords?: Array<[number, number]>; // Geofence polygon KML [lat, lng]
  workStartTime: string; // e.g. "07:15"
  workEndTime: string;   // e.g. "13:00"
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
