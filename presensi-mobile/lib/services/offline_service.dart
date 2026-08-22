import 'package:hive_flutter/hive_flutter.dart';
import 'supabase_service.dart';

class OfflineService {
  static final OfflineService _instance = OfflineService._internal();
  factory OfflineService() => _instance;
  OfflineService._internal();

  static const String _boxName = 'offline_attendance_box';

  /// Inisialisasi database lokal Hive
  Future<void> initialize() async {
    await Hive.initFlutter();
    await Hive.openBox(_boxName);
  }

  Box get _box => Hive.box(_boxName);

  /// Memasukkan data presensi baru ke dalam antrean offline
  Future<void> enqueueRecord(Map<String, dynamic> record) async {
    final String id = record['id'] ?? 'att-off-${DateTime.now().millisecondsSinceEpoch}';
    await _box.put(id, record);
    print('Absensi offline berhasil dimasukkan antrean local: $id');
  }

  /// Mendapatkan semua antrean absensi offline yang tersimpan
  List<Map<String, dynamic>> getQueuedRecords() {
    final List<Map<String, dynamic>> list = [];
    for (var key in _box.keys) {
      if (key == 'logged_in_user') continue; // Abaikan data sesi user
      final data = _box.get(key);
      if (data != null) {
        list.add(Map<String, dynamic>.from(data));
      }
    }
    return list;
  }

  /// Menghapus item tertentu dari antrean berdasarkan ID
  Future<void> removeRecord(String id) async {
    await _box.delete(id);
  }

  /// Menyimpan sesi user login lokal
  Future<void> saveSession(Map<String, dynamic> user) async {
    await _box.put('logged_in_user', user);
  }

  /// Mengambil sesi user login saat ini (null jika belum login)
  Map<String, dynamic>? getSession() {
    final data = _box.get('logged_in_user');
    if (data != null) {
      return Map<String, dynamic>.from(data);
    }
    return null;
  }

  /// Menghapus sesi user login (logout)
  Future<void> clearSession() async {
    await _box.delete('logged_in_user');
  }

  /// Sinkronisasi otomatis seluruh data offline ke Supabase
  Future<int> syncOfflineData() async {
    final List<Map<String, dynamic>> queue = getQueuedRecords();
    if (queue.isEmpty) return 0;

    final SupabaseService supabaseService = SupabaseService();
    int successCount = 0;

    print('Memulai sinkronisasi ${queue.length} data presensi offline...');
    for (var record in queue) {
      final String id = record['id'];
      final bool isCheckOutOnly = record['type'] == 'out';

      bool success = false;
      if (isCheckOutOnly) {
        // Jika hanya absen pulang (check-out)
        success = await supabaseService.updateCheckOut(
          recordId: record['record_id'] ?? '',
          checkOutTime: record['check_out_time'] ?? record['time'] ?? '',
          selfieUrl: record['selfie_url'],
          notes: record['notes'],
          userNip: record['user_nip'],
          date: record['date'],
          appVersion: record['app_version'],
        );
      } else {
        // Jika absen masuk (check-in)
        success = await supabaseService.saveAttendance(record);
      }

      if (success) {
        await removeRecord(id);
        successCount++;
        print('Berhasil sinkron data offline ID: $id');
      } else {
        print('Gagal sinkron data offline ID: $id (Koneksi masih terputus)');
        break; // Berhenti sinkron jika koneksi masih bermasalah
      }
    }

    return successCount;
  }

  /// Jumlah data antrean offline saat ini
  int get queueCount {
    int count = 0;
    for (var key in _box.keys) {
      if (key != 'logged_in_user') count++;
    }
    return count;
  }
}
