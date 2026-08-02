import { AttendanceRecord } from '../types';

export function exportAttendanceCsv(attendanceRecords: AttendanceRecord[]) {
  const headers = ['NIP', 'Nama Guru', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Jarak GPS (Meter)', 'Status', 'Catatan'];
  const rows = attendanceRecords.map(r => [
    `"${r.userNip}"`,
    `"${r.userName}"`,
    r.date,
    r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('id-ID') : '-',
    r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('id-ID') : '-',
    r.distanceMeters ?? 0,
    r.status.toUpperCase(),
    `"${r.notes || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rekap_presensi_sdn_bobong_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
