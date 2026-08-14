import { SchoolSettings, UserProfile, AttendanceRecord, LeaveRequest } from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  id: 1,
  schoolName: 'SD Negeri Bobong',
  address: 'Area Presensi SD Negeri Bobong, Taliabu Barat, Maluku Utara',
  latitude: -1.955536,
  longitude: 124.384367,
  radiusMeters: 10,
  polygonCoords: [
    [-1.955656974304001, 124.3842430227951],
    [-1.955653769665803, 124.3844916213357],
    [-1.955441463594634, 124.384483466394],
    [-1.955444588304861, 124.3842415717484]
  ],
  pagiCheckInOpen: '06:00',
  pagiWorkStart: '07:15',
  pagiCheckOutStart: '11:45',
  pagiCheckOutEnd: '12:00',
  siangCheckInOpen: '12:10',
  siangWorkStart: '12:45',
  siangCheckOutStart: '16:00',
  siangCheckOutEnd: '16:45',
  latestVersion: '1.0.0'
};

export const INITIAL_OFFLINE_USERS: UserProfile[] = [
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

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_LEAVES: LeaveRequest[] = [];
