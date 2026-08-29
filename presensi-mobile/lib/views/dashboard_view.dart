import 'dart:async';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../services/supabase_service.dart';
import '../services/offline_service.dart';
import '../components/presensi_action_card.dart';
import 'login_view.dart';
import 'package:package_info_plus/package_info_plus.dart';

class DashboardView extends StatefulWidget {
  final Map<String, dynamic> user;
  const DashboardView({super.key, required this.user});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  final SupabaseService _supabaseService = SupabaseService();
  final OfflineService _offlineService = OfflineService();
  late Map<String, dynamic> _currentUser;
  bool _isLoading = false;
  bool _isSyncing = false;
  bool _isOnline = true;
  int _offlineQueueCount = 0;
  List<Map<String, dynamic>> _history = [];
  String _appVersion = '1.0.0';
  bool _isAppVersionBlocked = false;
  String _requiredVersion = '1.0.0';

  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    _currentUser = Map<String, dynamic>.from(widget.user);
    _checkAppVersion();
    _loadHistory();
    _refreshOfflineCount();
    _initConnectivity();
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  void _initConnectivity() {
    // Cek kondisi koneksi awal
    Connectivity().checkConnectivity().then((results) {
      if (mounted) {
        setState(() {
          _isOnline = results.any((r) => r != ConnectivityResult.none);
        });
      }
    });

    // Langganan perubahan koneksi secara real-time
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((results) {
      final online = results.any((r) => r != ConnectivityResult.none);
      if (mounted) {
        setState(() {
          _isOnline = online;
        });
        // Auto-sinkron jika baru terhubung kembali dan ada antrean
        if (online && _offlineQueueCount > 0) {
          _syncOfflineQueue();
        }
      }
    });
  }

  void _refreshOfflineCount() {
    if (mounted) {
      setState(() {
        _offlineQueueCount = _offlineService.queueCount;
      });
    }
  }

  Future<void> _loadHistory() async {
    setState(() {
      _isLoading = true;
    });
    final nip = widget.user['nip'] ?? '';
    
    // Refresh user profile details dynamically
    final freshUser = await _supabaseService.fetchUserByNip(nip);
    final list = await _supabaseService.fetchPersonalHistory(nip);
    
    if (mounted) {
      setState(() {
        if (freshUser != null) {
          _currentUser = freshUser;
        }
        _history = list;
        _isLoading = false;
      });
      _checkAIFeedback();
    }
  }

  Future<void> _syncOfflineQueue() async {
    if (_isSyncing || !_isOnline) return;
    setState(() {
      _isSyncing = true;
    });

    final synced = await _offlineService.syncOfflineData();
    _refreshOfflineCount();

    if (mounted) {
      setState(() {
        _isSyncing = false;
      });
      if (synced > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ $synced absensi berhasil tersinkronisasi ke server.'),
            backgroundColor: Colors.green.shade700,
          ),
        );
        _loadHistory();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tidak ada data antrean atau sinkronisasi gagal.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  Future<void> _handleLogout() async {
    await _offlineService.clearSession();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginView()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = _currentUser['full_name'] ?? 'Guru Sekolah';
    final nip = _currentUser['nip'] ?? '-';
    final subject = _currentUser['subject'] ?? 'Guru Kelas';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        title: const Text(
          'Presensi Guru',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          _refreshOfflineCount();
          await _loadHistory();
        },
        color: const Color(0xFF0A84FF),
        backgroundColor: const Color(0xFF111827),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Welcome Card + Badge Status Jaringan
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.03),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Info profil guru
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: const Color(0xFF0A84FF).withValues(alpha: 0.15),
                          radius: 24,
                          child: const Icon(Icons.person_outline_rounded, color: Color(0xFF0A84FF)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'NIP: $nip • $subject',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.4),
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Badge Status Jaringan
                    Row(
                      children: [
                        // Badge Online / Offline
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: _isOnline
                                ? Colors.green.withValues(alpha: 0.12)
                                : Colors.orange.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: _isOnline
                                  ? Colors.greenAccent.withValues(alpha: 0.4)
                                  : Colors.orangeAccent.withValues(alpha: 0.4),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _isOnline ? Icons.wifi_rounded : Icons.wifi_off_rounded,
                                color: _isOnline ? Colors.greenAccent : Colors.orangeAccent,
                                size: 13,
                              ),
                              const SizedBox(width: 5),
                              Text(
                                _isOnline ? 'Terhubung' : 'Modus Offline',
                                style: TextStyle(
                                  color: _isOnline ? Colors.greenAccent : Colors.orangeAccent,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Badge Antrean Offline (hanya tampil jika ada)
                        if (_offlineQueueCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.red.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.pending_actions_rounded, color: Colors.redAccent, size: 13),
                                const SizedBox(width: 5),
                                Text(
                                  '$_offlineQueueCount belum tersinkron',
                                  style: const TextStyle(
                                    color: Colors.redAccent,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),

                    // Tombol Sinkronisasi Manual (hanya tampil jika ada antrean offline)
                    if (_offlineQueueCount > 0) ...[
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _isOnline && !_isSyncing ? _syncOfflineQueue : null,
                          icon: _isSyncing
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.sync_rounded, size: 16, color: Colors.white),
                          label: Text(
                            _isSyncing
                                ? 'Menyinkronkan...'
                                : 'Sinkronisasikan Sekarang ($_offlineQueueCount)',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0A84FF),
                            disabledBackgroundColor: Colors.white.withValues(alpha: 0.05),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const DigitalClock(),
              const SizedBox(height: 16),
              if (_isAppVersionBlocked) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.15),
                    border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'APLIKASI TERKUNCI (VERSI USANG)',
                            style: TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Versi aplikasi Anda ($_appVersion) sudah usang. Kepala Sekolah mewajibkan versi minimal $_requiredVersion.\n\nSilakan unduh APK rilis terbaru di Desktop Anda untuk melanjutkan presensi!',
                        style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
              AbsorbPointer(
                absorbing: _isAppVersionBlocked,
                child: Opacity(
                  opacity: _isAppVersionBlocked ? 0.4 : 1.0,
                  child: PresensiActionCard(
                    user: _currentUser,
                    onAttendanceSuccess: () {
                      _refreshOfflineCount();
                      _loadHistory();
                    },
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Attendance History Header
              const Text(
                'Riwayat Presensi Terbaru (15 Hari)',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 12),

              // History list
              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(color: Color(0xFF0A84FF)),
                  ),
                )
              else if (_history.isEmpty)
                Container(
                  padding: const EdgeInsets.all(32),
                  alignment: Alignment.center,
                  child: Text(
                    'Belum ada riwayat presensi.',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 13),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _history.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = _history[index];
                    final date = item['date'] ?? '-';
                    final status = (item['status'] ?? 'hadir').toString().toUpperCase();
                    final checkIn = item['check_in_time'] != null
                        ? DateTime.parse(item['check_in_time'])
                            .toLocal()
                            .toString()
                            .substring(11, 16)
                        : '-';
                    final checkOut = item['check_out_time'] != null
                        ? DateTime.parse(item['check_out_time'])
                            .toLocal()
                            .toString()
                            .substring(11, 16)
                        : '-';

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.02),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                date,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Masuk: $checkIn WIT • Pulang: $checkOut WIT',
                                style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 11),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: status.contains('HADIR')
                                  ? Colors.green.withValues(alpha: 0.15)
                                  : Colors.orange.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              status,
                              style: TextStyle(
                                color: status.contains('HADIR') ? Colors.greenAccent : Colors.orangeAccent,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _checkAIFeedback() async {
    if (!_isOnline) return;
    final nip = _currentUser['nip'] ?? '';
    if (nip.isEmpty) return;

    final unreadLog = await _supabaseService.fetchUnreadFeedback(nip);
    if (unreadLog != null && mounted) {
      _showAIFeedbackDialog(unreadLog);
    }
  }

  void _showAIFeedbackDialog(Map<String, dynamic> log) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return AlertDialog(
            backgroundColor: const Color(0xFF1C1C1E),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: const [
                Icon(Icons.auto_awesome, color: Colors.blueAccent, size: 20),
                SizedBox(width: 8),
                Text(
                  'Evaluasi Kinerja AI',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            content: SingleChildScrollView(
              child: Text(
                (log['feedback_text'] ?? '').toString().replaceAll('**', ''),
                style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  // Sesuai permintaan user: jangan tandai sebagai dibaca di database Supabase
                  // agar feedback ini tetap muncul kembali saat masuk aplikasi berikutnya.
                },
                child: const Text(
                  'Saya Paham & Mengerti',
                  style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          );
        },
      );
    });
  }

  Future<void> _checkAppVersion() async {
    try {
      final PackageInfo packageInfo = await PackageInfo.fromPlatform();
      final String localVersion = packageInfo.version;
      
      final Map<String, dynamic>? settings = await _supabaseService.fetchSchoolSettings();
      final String minVersion = settings?['min_app_version']?.toString() ?? '1.0.0';

      final bool isBlocked = _isVersionOlder(localVersion, minVersion);
      
      if (mounted) {
        setState(() {
          _appVersion = localVersion;
          _requiredVersion = minVersion;
          _isAppVersionBlocked = isBlocked;
        });
      }
    } catch (e) {
      print('Error checking app version: $e');
    }
  }

  bool _isVersionOlder(String current, String required) {
    try {
      final curParts = current.split('.').map(int.parse).toList();
      final reqParts = required.split('.').map(int.parse).toList();
      for (var i = 0; i < 3; i++) {
        final curVal = i < curParts.length ? curParts[i] : 0;
        final reqVal = i < reqParts.length ? reqParts[i] : 0;
        if (curVal < reqVal) return true;
        if (curVal > reqVal) return false;
      }
      return false;
    } catch (e) {
      return current.compareTo(required) < 0;
    }
  }
}

class DigitalClock extends StatefulWidget {
  const DigitalClock({super.key});

  @override
  State<DigitalClock> createState() => _DigitalClockState();
}

class _DigitalClockState extends State<DigitalClock> {
  late Timer _timer;
  late DateTime _currentTime;

  @override
  void initState() {
    super.initState();
    _currentTime = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _currentTime = DateTime.now();
        });
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String _formatNumber(int val) => val.toString().padLeft(2, '0');

  String _getDayName(int day) {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return days[day - 1];
  }

  String _getMonthName(int month) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  }

  @override
  Widget build(BuildContext context) {
    // Jam WIT (UTC+9) sebagai jam operasional
    final nowWit = _currentTime.toUtc().add(const Duration(hours: 9));
    final timeStr = '${_formatNumber(nowWit.hour)}:${_formatNumber(nowWit.minute)}:${_formatNumber(nowWit.second)}';
    final dateStr = '${_getDayName(nowWit.weekday)}, ${nowWit.day} ${_getMonthName(nowWit.month)} ${nowWit.year}';

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A84FF).withValues(alpha: 0.06),
        border: Border.all(color: const Color(0xFF0A84FF).withValues(alpha: 0.15)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'WAKTU OPERASIONAL (WIT)',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                dateStr,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          Text(
            timeStr,
            style: const TextStyle(
              color: Color(0xFF0A84FF),
              fontSize: 22,
              fontWeight: FontWeight.bold,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}
