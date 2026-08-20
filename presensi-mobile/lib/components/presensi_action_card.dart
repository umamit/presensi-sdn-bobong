import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:ntp/ntp.dart';
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';
import '../services/gps_service.dart';
import '../services/supabase_service.dart';
import '../views/camera_view.dart';

class PresensiActionCard extends StatefulWidget {
  final Map<String, dynamic> user;
  final VoidCallback onAttendanceSuccess;
  const PresensiActionCard({super.key, required this.user, required this.onAttendanceSuccess});

  @override
  State<PresensiActionCard> createState() => _PresensiActionCardState();
}

class _PresensiActionCardState extends State<PresensiActionCard> {
  final GpsService _gpsService = GpsService();
  final SupabaseService _supabaseService = SupabaseService();

  bool _isCheckingGps = false;
  Position? _currentPosition;
  double _distanceToSchool = 999.0;
  bool _isInRadius = false;
  bool _hasFaceMaster = false;
  bool _isDinasLuar = false;
  bool _isMockLocation = false; // true jika terdeteksi Fake GPS
  String _gpsStatusText = 'Membaca Lokasi GPS...';

  // Koordinat SDN Bobong (default fallback)
  double _schoolLat = -1.8329623838275916;
  double _schoolLng = 124.39121966030999;
  double _allowedRadius = 100.0; // 100 meter

  // Jam shift dari school_settings (mengikuti Vite GuruDashboard.tsx)
  String _pagiCheckInOpen   = '06:00';
  String _pagiWorkStart     = '07:15';
  String _pagiCheckOutStart = '11:45';
  String _pagiCheckOutEnd   = '12:00';
  String _siangCheckInOpen   = '12:10';
  String _siangWorkStart     = '12:45';
  String _siangCheckOutStart = '16:00';
  String _siangCheckOutEnd   = '16:45';

  Timer? _gpsTimer;

  // Status absensi hari ini
  Map<String, dynamic>? _todayRecord;
  bool _isLoadingTodayRecord = true;

  // Status Keamanan NTP & Root
  bool _isTimeAccurate = true;
  String _timeStatusText = '';
  bool _isDeviceSecured = true;
  String _deviceSecurityText = '';

  @override
  void initState() {
    super.initState();
    _checkFaceMasterStatus();
    _loadSchoolSettings();
    _startLocationTracking();
    _loadTodayRecord();
    _checkNtpTime();
    _checkJailbreakStatus();
  }

  @override
  void dispose() {
    _gpsTimer?.cancel();
    super.dispose();
  }

  void _checkFaceMasterStatus() {
    final descriptor = widget.user['face_descriptor'];
    setState(() {
      _hasFaceMaster = descriptor != null && descriptor.toString().trim().isNotEmpty;
    });
  }

  Future<void> _checkNtpTime() async {
    try {
      final DateTime deviceTime = DateTime.now();
      // Bandingkan dengan server NTP pool (5 detik timeout)
      final DateTime ntpTime = await NTP.now().timeout(const Duration(seconds: 5));
      final difference = deviceTime.difference(ntpTime).inMinutes.abs();

      if (difference > 5) {
        setState(() {
          _isTimeAccurate = false;
          _timeStatusText = 'Waktu HP Anda tidak akurat (Selisih $difference menit). Harap aktifkan "Atur Waktu Otomatis" di Pengaturan HP Anda.';
        });
      } else {
        setState(() {
          _isTimeAccurate = true;
          _timeStatusText = '';
        });
      }
    } catch (e) {
      print('Gagal memverifikasi waktu NTP global: $e');
      setState(() {
        _isTimeAccurate = true; // Jangan blokir jika gagal koneksi ntp karena offline
        _timeStatusText = '';
      });
    }
  }

  Future<void> _checkJailbreakStatus() async {
    try {
      bool jailbroken = await FlutterJailbreakDetection.jailbroken;
      if (jailbroken) {
        setState(() {
          _isDeviceSecured = false;
          _deviceSecurityText = '⚠️ HP Terdeteksi Modifikasi (Root/Jailbroken). Presensi dinonaktifkan demi keamanan.';
        });
      } else {
        setState(() {
          _isDeviceSecured = true;
          _deviceSecurityText = '';
        });
      }
    } catch (e) {
      print('Gagal mendeteksi status jailbreak: $e');
    }
  }

  Future<void> _loadTodayRecord() async {
    final nip = widget.user['nip']?.toString() ?? '';
    if (nip.isEmpty) return;
    final nowWit = DateTime.now().toUtc().add(const Duration(hours: 9));
    final dateStr = nowWit.toString().substring(0, 10);
    setState(() => _isLoadingTodayRecord = true);
    final record = await _supabaseService.fetchTodayRecord(nip, dateStr);
    if (mounted) {
      setState(() {
        _todayRecord = record;
        _isLoadingTodayRecord = false;
      });
    }
  }

  Future<void> _loadSchoolSettings() async {
    final settings = await _supabaseService.fetchSchoolSettings();
    if (settings != null) {
      setState(() {
        _schoolLat = double.tryParse(settings['latitude']?.toString() ?? '') ?? _schoolLat;
        _schoolLng = double.tryParse(settings['longitude']?.toString() ?? '') ?? _schoolLng;
        _allowedRadius = double.tryParse(settings['radius_meters']?.toString() ?? '') ?? _allowedRadius;

        // Ekstrak data jam presensi pagi & siang dari kolom address (mengikuti logika parser Vite)
        final String rawAddress = settings['address']?.toString() ?? '';
        String workingText = rawAddress;
        
        // Ekstrak groq key jika ada
        if (workingText.contains('|| groq_key:')) {
          workingText = workingText.split('|| groq_key:')[0].trim();
        }
        
        // Ekstrak times
        if (workingText.contains('|| times:')) {
          final parts = workingText.split('|| times:');
          final timeString = parts[1].trim();
          final timeParts = timeString.split('|');
          
          if (timeParts.length == 8) {
            _pagiCheckInOpen    = timeParts[0].replaceAll('.', ':').trim();
            _pagiWorkStart      = timeParts[1].replaceAll('.', ':').trim();
            _pagiCheckOutStart  = timeParts[2].replaceAll('.', ':').trim();
            _pagiCheckOutEnd    = timeParts[3].replaceAll('.', ':').trim();
            _siangCheckInOpen   = timeParts[4].replaceAll('.', ':').trim();
            _siangWorkStart     = timeParts[5].replaceAll('.', ':').trim();
            _siangCheckOutStart = timeParts[6].replaceAll('.', ':').trim();
            _siangCheckOutEnd   = timeParts[7].replaceAll('.', ':').trim();
          }
        }
      });
    }
  }

  void _startLocationTracking() {
    _updateLocation();
    // Refresh lokasi GPS setiap 15 detik secara real-time
    _gpsTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      _updateLocation();
    });
  }

  Future<void> _updateLocation() async {
    if (_isCheckingGps) return;
    setState(() {
      _isCheckingGps = true;
    });

    try {
      final position = await _gpsService.getCurrentPosition();

      if (position != null) {
        final distance = _gpsService.calculateDistanceMeters(
          position.latitude,
          position.longitude,
          _schoolLat,
          _schoolLng,
        );

        setState(() {
          _isMockLocation = false;
          _currentPosition = position;
          _distanceToSchool = distance;
          _isInRadius = distance <= _allowedRadius;
          _gpsStatusText = _isInRadius
              ? 'Anda berada di area sekolah (${distance.toStringAsFixed(1)}m)'
              : 'Di luar area sekolah (${distance.toStringAsFixed(1)}m)';
          _isCheckingGps = false;
        });
      } else {
        setState(() {
          _isMockLocation = false;
          _gpsStatusText = 'Gagal membaca GPS. Aktifkan GPS Anda.';
          _isCheckingGps = false;
        });
      }
    } catch (e) {
      if (e.toString().contains('mock_location')) {
        setState(() {
          _isMockLocation = true;
          _isInRadius = false;
          _currentPosition = null;
          _gpsStatusText = 'Aplikasi Fake GPS Terdeteksi! Presensi Dinonaktifkan.';
          _isCheckingGps = false;
        });
      } else {
        setState(() {
          _isMockLocation = false;
          _gpsStatusText = 'Gagal membaca GPS. Aktifkan GPS Anda.';
          _isCheckingGps = false;
        });
      }
    }
  }

  /// Deteksi shift berdasarkan profil guru atau jam saat ini (mengikuti Vite L68)
  String _detectShift() {
    final profileShift = widget.user['shift']?.toString() ?? '';
    if (profileShift == 'pagi' || profileShift == 'siang') return profileShift;
    // Fallback: deteksi otomatis dari jam saat ini (WIT = UTC+9)
    final now = DateTime.now().toUtc().add(const Duration(hours: 9));
    final timeStr = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    return timeStr.compareTo('12:00') < 0 ? 'pagi' : 'siang';
  }

  /// Validasi jendela waktu absen masuk — mengikuti logika Vite handleCheckInSubmit()
  String? _validateCheckInTime() {
    final now = DateTime.now().toUtc().add(const Duration(hours: 9));
    final timeStr = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    final shift = _detectShift();

    final checkInOpen   = shift == 'pagi' ? _pagiCheckInOpen   : _siangCheckInOpen;
    final checkOutStart = shift == 'pagi' ? _pagiCheckOutStart : _siangCheckOutStart;
    final shiftLabel    = shift == 'pagi' ? 'Pagi' : 'Siang';

    if (timeStr.compareTo(checkInOpen) < 0) {
      return 'Presensi Shift $shiftLabel belum dibuka (Mulai $checkInOpen WIT).';
    }
    if (timeStr.compareTo(checkOutStart) >= 0) {
      return 'Batas waktu absen masuk Shift $shiftLabel telah berakhir ($checkOutStart WIT).';
    }
    return null; // valid
  }

  /// Validasi jendela waktu absen pulang — mengikuti logika Vite handleCheckOutSubmit()
  String? _validateCheckOutTime() {
    final now = DateTime.now().toUtc().add(const Duration(hours: 9));
    final timeStr = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    final shift = _detectShift();

    final checkOutStart = shift == 'pagi' ? _pagiCheckOutStart : _siangCheckOutStart;
    final checkOutEnd   = shift == 'pagi' ? _pagiCheckOutEnd   : _siangCheckOutEnd;

    if (timeStr.compareTo(checkOutStart) < 0) {
      return 'Absen pulang belum dibuka (Mulai $checkOutStart WIT).';
    }
    if (timeStr.compareTo(checkOutEnd) > 0) {
      return 'Batas waktu presensi telah berakhir ($checkOutEnd WIT).';
    }
    return null; // valid
  }

  Future<void> _openCameraView(String mode) async {
    if (_currentPosition == null && !_isDinasLuar) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tunggu hingga lokasi GPS terdeteksi.')),
      );
      return;
    }

    // Refresh school settings (jam masuk, pulang, radius) secara real-time tepat sebelum validasi & buka kamera
    await _loadSchoolSettings();

    // Validasi radius geofence (mengikuti Vite handleCheckInSubmit/handleCheckOutSubmit)
    if (mode != 'enroll' && !_isDinasLuar && !_isInRadius) {
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.gpp_maybe_rounded, color: Colors.redAccent, size: 24),
              SizedBox(width: 8),
              Text('Gagal Absen', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            'Anda berada di luar radius sekolah (${_distanceToSchool.toStringAsFixed(1)}m dari max ${_allowedRadius.toStringAsFixed(1)}m).',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK', style: TextStyle(color: Color(0xFF0A84FF), fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    // Validasi jendela waktu shift (mengikuti Vite)
    final String? timeError = mode == 'check_in'
        ? _validateCheckInTime()
        : (mode == 'check_out' ? _validateCheckOutTime() : null);

    if (timeError != null) {
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.access_time_rounded, color: Colors.orangeAccent, size: 24),
              SizedBox(width: 8),
              Text('Belum Waktunya', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(timeError, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK', style: TextStyle(color: Color(0xFF0A84FF), fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    if (!mounted) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CameraView(
          user: widget.user,
          mode: mode,
          isDinasLuar: _isDinasLuar,
          latitude: _currentPosition?.latitude ?? 0.0,
          longitude: _currentPosition?.longitude ?? 0.0,
          detectedShift: _detectShift(),
          schoolSettings: {
            'pagi_work_start' : _pagiWorkStart,
            'siang_work_start': _siangWorkStart,
          },
        ),
      ),
    ).then((success) {
      if (success == true) {
        widget.onAttendanceSuccess();
        _checkFaceMasterStatus();
        _loadTodayRecord(); // Refresh status absen hari ini
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Geofencing Status Header
          Row(
            children: [
              Icon(
                _isMockLocation
                    ? Icons.block_rounded
                    : (_isDinasLuar
                        ? Icons.work_history_rounded
                        : (_isInRadius ? Icons.verified_rounded : Icons.gpp_maybe_rounded)),
                color: _isMockLocation
                    ? Colors.redAccent
                    : (_isDinasLuar
                        ? Colors.orangeAccent
                        : (_isInRadius ? Colors.greenAccent : Colors.redAccent)),
                size: 24,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _isMockLocation
                      ? 'Aplikasi Fake GPS Terdeteksi! Presensi Dinonaktifkan.'
                      : (_isDinasLuar ? 'Mode Dinas Luar Aktif' : _gpsStatusText),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              if (_isCheckingGps)
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0A84FF)),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // Dinas Luar Checkbox Toggle
          CheckboxListTile(
            title: const Text(
              'Absen Dinas Luar (Luar Sekolah)',
              style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
            ),
            subtitle: const Text(
              'Centang jika sedang tugas luar kota/kegiatan dinas.',
              style: TextStyle(color: Colors.grey, fontSize: 11),
            ),
            value: _isDinasLuar,
            activeColor: const Color(0xFF0A84FF),
            checkColor: Colors.white,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) {
              setState(() {
                _isDinasLuar = val ?? false;
              });
            },
          ),
          const Divider(color: Colors.white12, height: 24),

          // Banner peringatan Fake GPS
           if (_isMockLocation) ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.12),
                border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                children: [
                  Icon(Icons.block_rounded, color: Colors.redAccent, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '⚠️ Aplikasi Fake GPS / Mock Location terdeteksi! Nonaktifkan aplikasi tersebut dan coba lagi.',
                      style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Banner peringatan Jam Tidak Akurat (NTP)
          if (!_isTimeAccurate) ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.12),
                border: Border.all(color: Colors.amber.withValues(alpha: 0.5)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.alarm_off_rounded, color: Colors.amber, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _timeStatusText,
                      style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Banner peringatan Perangkat Root/Jailbreak
          if (!_isDeviceSecured) ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.12),
                border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.security_update_warning_rounded, color: Colors.redAccent, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _deviceSecurityText,
                      style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Action Buttons depending on Face Enrollment Status
          if (!_hasFaceMaster) ...[
            // Status jika wajah belum didaftarkan
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.1),
                border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.orangeAccent, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Wajah Master belum terdaftar di database. Silakan rekam wajah Anda terlebih dahulu.',
                      style: TextStyle(color: Colors.orangeAccent, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton.icon(
              onPressed: (_isMockLocation || !_isTimeAccurate || !_isDeviceSecured) ? null : () => _openCameraView('enroll'),
              icon: const Icon(Icons.face_retouching_natural_rounded, color: Colors.white),
              label: const Text(
                'Daftarkan Wajah Master',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                disabledBackgroundColor: Colors.white.withValues(alpha: 0.05),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ] else ...[
            // Status absensi hari ini
            if (_isLoadingTodayRecord)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0A84FF)),
                  ),
                ),
              )
            else if (_todayRecord != null) ...[
              // Banner status absen hari ini
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: (_todayRecord!['check_out_time'] != null
                          ? Colors.green
                          : Colors.blue)
                      .withValues(alpha: 0.12),
                  border: Border.all(
                    color: (_todayRecord!['check_out_time'] != null
                            ? Colors.green
                            : Colors.blue)
                        .withValues(alpha: 0.4),
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Icon(
                      _todayRecord!['check_out_time'] != null
                          ? Icons.check_circle_rounded
                          : Icons.login_rounded,
                      color: _todayRecord!['check_out_time'] != null
                          ? Colors.greenAccent
                          : const Color(0xFF0A84FF),
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _todayRecord!['check_out_time'] != null
                            ? 'Presensi hari ini selesai. Masuk & pulang sudah tercatat.'
                            : 'Sudah absen masuk. Tombol masuk dikunci.',
                        style: TextStyle(
                          color: _todayRecord!['check_out_time'] != null
                              ? Colors.greenAccent
                              : const Color(0xFF0A84FF),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Tombol Masuk & Pulang
            if (!_isLoadingTodayRecord)
              Row(
                children: [
                  // Tombol Absen Masuk — terkunci jika sudah ada check_in_time
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: (_isMockLocation || !_isTimeAccurate || !_isDeviceSecured || _todayRecord != null)
                          ? null
                          : () => _openCameraView('check_in'),
                      icon: Icon(
                        _todayRecord != null
                            ? Icons.check_rounded
                            : Icons.login_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      label: Text(
                        _todayRecord != null ? 'Sudah Masuk' : 'Masuk',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0A84FF),
                        disabledBackgroundColor: Colors.white.withValues(alpha: 0.06),
                        disabledForegroundColor: Colors.white38,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Tombol Absen Pulang — aktif hanya jika sudah masuk tapi belum pulang
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: (_isMockLocation ||
                              !_isTimeAccurate ||
                              !_isDeviceSecured ||
                              _todayRecord == null ||
                              _todayRecord!['check_out_time'] != null)
                          ? null
                          : () => _openCameraView('check_out'),
                      icon: Icon(
                        _todayRecord?['check_out_time'] != null
                            ? Icons.check_rounded
                            : Icons.logout_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      label: Text(
                        _todayRecord?['check_out_time'] != null
                            ? 'Sudah Pulang'
                            : 'Pulang',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF30D158),
                        disabledBackgroundColor: Colors.white.withValues(alpha: 0.06),
                        disabledForegroundColor: Colors.white38,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ],
      ),
    );
  }
}
