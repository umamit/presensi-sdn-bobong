import { AttendanceRecord } from '../types';

export function exportAttendanceCsv(attendanceRecords: AttendanceRecord[], filename?: string) {
  // Fix #9: Tambah kolom Shift dan Durasi Terlambat
  const headers = [
    'NIP', 'Nama Guru', 'Tanggal', 'Shift',
    'Jam Masuk', 'Jam Pulang', 'Jarak GPS (Meter)',
    'Status', 'Durasi Terlambat', 'Catatan'
  ];

  const rows = attendanceRecords.map(r => {
    // Ekstrak durasi terlambat dari notes jika ada
    let durasiTerlambat = '-';
    if (r.status === 'terlambat' && r.notes) {
      const match = r.notes.match(/Terlambat:\s*([^|]+)/);
      if (match) durasiTerlambat = match[1].trim();
    }

    // Bersihkan notes dari prefix durasi untuk kolom catatan
    const catatanBersih = r.notes
      ? r.notes.replace(/Terlambat:[^|]+\|?\s*/g, '').replace(/Pulang:[^|]+/g, '').trim().replace(/\|$/, '').trim()
      : '';

    return [
      `"${r.userNip}"`,
      `"${r.userName}"`,
      r.date,
      (r.shift || '-').toUpperCase(),
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('id-ID') : '-',
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('id-ID') : '-',
      r.distanceMeters ?? 0,
      r.status.toUpperCase(),
      `"${durasiTerlambat}"`,
      `"${catatanBersih}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  const downloadName = filename || `rekap_presensi_sdn_bobong_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', downloadName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
