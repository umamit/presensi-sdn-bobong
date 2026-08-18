import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
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
  String _gpsStatusText = 'Membaca Lokasi GPS...';

  // Koordinat SDN Bobong (default fallback)
  double _schoolLat = -1.8329623838275916;
  double _schoolLng = 124.39121966030999;
  double _allowedRadius = 100.0; // 100 meter

  Timer? _gpsTimer;

  @override
  void initState() {
    super.initState();
    _checkFaceMasterStatus();
    _loadSchoolSettings();
    _startLocationTracking();
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

  Future<void> _loadSchoolSettings() async {
    final settings = await _supabaseService.fetchSchoolSettings();
    if (settings != null) {
      setState(() {
        _schoolLat = double.tryParse(settings['latitude']?.toString() ?? '') ?? _schoolLat;
        _schoolLng = double.tryParse(settings['longitude']?.toString() ?? '') ?? _schoolLng;
        _allowedRadius = double.tryParse(settings['radius']?.toString() ?? '') ?? _allowedRadius;
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

    final position = await _gpsService.getCurrentPosition();

    if (position != null) {
      final distance = _gpsService.calculateDistanceMeters(
        position.latitude,
        position.longitude,
        _schoolLat,
        _schoolLng,
      );

      setState(() {
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
        _gpsStatusText = 'Gagal membaca GPS. Aktifkan GPS Anda.';
        _isCheckingGps = false;
      });
    }
  }

  void _openCameraView(String mode) {
    if (_currentPosition == null && !_isDinasLuar) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tunggu hingga lokasi GPS terdeteksi.')),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CameraView(
          user: widget.user,
          mode: mode,
          isDinasLuar: _isDinasLuar,
          latitude: _currentPosition?.latitude ?? 0.0,
          longitude: _currentPosition?.longitude ?? 0.0,
        ),
      ),
    ).then((success) {
      if (success == true) {
        widget.onAttendanceSuccess();
        _checkFaceMasterStatus(); // Segar status wajah master
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Geofencing Status Header
          Row(
            children: [
              Icon(
                _isDinasLuar
                    ? Icons.work_history_rounded
                    : (_isInRadius ? Icons.verified_rounded : Icons.gpp_maybe_rounded),
                color: _isDinasLuar
                    ? Colors.orangeAccent
                    : (_isInRadius ? Colors.greenAccent : Colors.redAccent),
                size: 24,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _isDinasLuar ? 'Mode Dinas Luar Aktif' : _gpsStatusText,
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

          // Action Buttons depending on Face Enrollment Status
          if (!_hasFaceMaster) ...[
            // Status jika wajah belum didaftarkan
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.bottom(16),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.orangeAccent, size: 20),
                  const SizedBox(width: 8),
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
              onPressed: () => _openCameraView('enroll'),
              icon: const Icon(Icons.face_retouching_natural_rounded, color: Colors.white),
              label: const Text(
                'Daftarkan Wajah Master',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ] else ...[
            // Status jika wajah sudah terdaftar (Tombol Absen Masuk & Pulang)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: (_isInRadius || _isDinasLuar) ? () => _openCameraView('check_in') : null,
                    icon: const Icon(Icons.login_rounded, color: Colors.white, size: 20),
                    label: const Text(
                      'Masuk',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0A84FF),
                      disabledBackgroundColor: Colors.white.withOpacity(0.05),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: (_isInRadius || _isDinasLuar) ? () => _openCameraView('check_out') : null,
                    icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 20),
                    label: const Text(
                      'Pulang',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF30D158),
                      disabledBackgroundColor: Colors.white.withOpacity(0.05),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
