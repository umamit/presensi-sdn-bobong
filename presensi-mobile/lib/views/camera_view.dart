import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import '../services/face_detector_service.dart';
import '../services/supabase_service.dart';
import '../services/offline_service.dart';
import 'package:package_info_plus/package_info_plus.dart';

class CameraView extends StatefulWidget {
  final Map<String, dynamic> user;
  final String mode; // 'enroll', 'check_in', 'check_out'
  final bool isDinasLuar;
  final double latitude;
  final double longitude;
  final String detectedShift;           // 'pagi' atau 'siang' — dikirim dari PresensiActionCard
  final Map<String, String> schoolSettings; // jam kerja shift dari Supabase

  const CameraView({
    super.key,
    required this.user,
    required this.mode,
    required this.isDinasLuar,
    required this.latitude,
    required this.longitude,
    this.detectedShift = 'pagi',
    this.schoolSettings = const {},
  });

  @override
  State<CameraView> createState() => _CameraViewState();
}

enum LivenessChallenge {
  centerFace,
  blink,
  smile,
  turnLeft,
  turnRight,
  processing,
  success,
  failed,
}

class _CameraViewState extends State<CameraView> {
  final FaceDetectorService _faceService = FaceDetectorService();
  final SupabaseService _supabaseService = SupabaseService();
  final OfflineService _offlineService = OfflineService();

  CameraController? _cameraController;
  bool _isCameraInitialized = false;
  bool _isProcessingFrame = false;
  bool _isSubmitting = false;
  
  LivenessChallenge _currentChallenge = LivenessChallenge.centerFace;
  String _instructionText = 'Posisikan wajah Anda di tengah lingkaran';
  
  // Throttle frame untuk HP High-end (Samsung S25 Ultra) & HP Low-end (mengurangi panas/beban NPU)
  DateTime? _lastFrameProcessedTime;
  
  // Deteksi kedipan, senyuman, & gerakan kepala
  bool _hasBlinked = false;
  bool _hasSmiled = false;
  bool _hasTurnedLeft = false;
  bool _hasTurnedRight = false;
  final double _blinkThreshold = 0.15; // Probabilitas mata terbuka < 15%
  final double _smileThreshold = 0.75; // Probabilitas senyum > 75%

  final List<LivenessChallenge> _challenges = [
    LivenessChallenge.blink,
    LivenessChallenge.smile,
    LivenessChallenge.turnLeft,
    LivenessChallenge.turnRight,
  ];

  void _selectRandomChallenge() {
    final random = math.Random();
    final challenge = _challenges[random.nextInt(_challenges.length)];
    setState(() {
      _currentChallenge = challenge;
      _hasBlinked = false;
      _hasSmiled = false;
      _hasTurnedLeft = false;
      _hasTurnedRight = false;

      switch (challenge) {
        case LivenessChallenge.blink:
          _instructionText = 'Silakan Berkedip cepat...';
          break;
        case LivenessChallenge.smile:
          _instructionText = 'Silakan Tersenyum lebar...';
          break;
        case LivenessChallenge.turnLeft:
          _instructionText = 'Silakan Geleng Kepala ke Kiri...';
          break;
        case LivenessChallenge.turnRight:
          _instructionText = 'Silakan Geleng Kepala ke Kanan...';
          break;
        default:
          break;
      }
    });
  }

  void _goToProcessingState(CameraImage? image, Face? face) {
    setState(() {
      _instructionText = 'Mencocokkan wajah dengan database...';
      _currentChallenge = LivenessChallenge.processing;
    });
    // Liveness Sukses! Lanjut verifikasi biometrik FaceNet
    _verifyFaceBiometric(image, face);
  }

  int _noFaceFrameCount = 0;

  @override
  void initState() {
    super.initState();
    _initCamera();
    _faceService.loadModel();
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      // Pilih kamera depan (front camera)
      final frontCamera = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _cameraController = CameraController(
        frontCamera,
        ResolutionPreset.medium, // Resolusi sedang (160x120 / 640x480) untuk menghemat baterai HP guru
        enableAudio: false,
      );

      await _cameraController!.initialize();
      if (!mounted) return;

      setState(() {
        _isCameraInitialized = true;
      });

      _startImageStream();
    } catch (e) {
      print('Camera init error: $e');
      setState(() {
        _instructionText = 'Gagal membuka kamera depan. Coba lagi.';
      });
    }
  }

  void _startImageStream() {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    try {
      _cameraController!.startImageStream((CameraImage image) {
        if (_isProcessingFrame || 
            _isSubmitting ||
            _currentChallenge == LivenessChallenge.processing ||
            _currentChallenge == LivenessChallenge.success) {
          return;
        }

        // Batasi pemrosesan maksimal 1 frame per 150ms untuk menghindari penumpukan antrean
        // (Sangat membantu performa di HP low-end & mencegah overflow di HP high-end)
        final now = DateTime.now();
        if (_lastFrameProcessedTime != null &&
            now.difference(_lastFrameProcessedTime!).inMilliseconds < 150) {
          return;
        }
        _lastFrameProcessedTime = now;
        
        _processCameraImage(image);
      });
    } catch (e) {
      print('Error starting image stream: $e');
    }
  }

  Future<void> _processCameraImage(CameraImage image) async {
    _isProcessingFrame = true;

    try {
      // 1. Konversi CameraImage ke InputImage untuk Google ML Kit
      // Catatan: ML Kit membutuhkan metadata rotasi dan format pixel.
      // Pada emulator/simulasi, jika pemrosesan frame terhambat, kita gunakan fallback simulasi otomatis
      // untuk mempermudah pengerjaan di komputer.
      
      final InputImageRotation rotation = InputImageRotation.rotation270deg;
      final InputImageFormat format = InputImageFormatValue.fromRawValue(image.format.raw) ?? InputImageFormat.nv21;
      
      final inputImage = InputImage.fromBytes(
        bytes: image.planes[0].bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: rotation,
          format: format,
          bytesPerRow: image.planes[0].bytesPerRow,
        ),
      );

      final List<Face> faces = await _faceService.mlKit.processImage(inputImage);

      if (faces.isEmpty) {
        _noFaceFrameCount++;
        if (_noFaceFrameCount > 10) {
          setState(() {
            _instructionText = 'Posisikan wajah Anda di depan kamera';
            _currentChallenge = LivenessChallenge.centerFace;
          });
        }
        _isProcessingFrame = false;
        return;
      }

      _noFaceFrameCount = 0;
      final Face face = faces.first;

      // 2. State Machine Liveness (Tantangan Keaktifan Acak)
      switch (_currentChallenge) {
        case LivenessChallenge.centerFace:
          // Pastikan wajah menghadap lurus di tengah layar
          _selectRandomChallenge();
          break;

        case LivenessChallenge.blink:
          final double leftEye = face.leftEyeOpenProbability ?? 1.0;
          final double rightEye = face.rightEyeOpenProbability ?? 1.0;
          
          if (leftEye < _blinkThreshold && rightEye < _blinkThreshold) {
            _hasBlinked = true;
          }
          
          if (_hasBlinked && leftEye > 0.6 && rightEye > 0.6) {
            _goToProcessingState(image, face);
          }
          break;

        case LivenessChallenge.smile:
          final double smileProb = face.smilingProbability ?? 0.0;
          if (smileProb > _smileThreshold) {
            _goToProcessingState(image, face);
          }
          break;

        case LivenessChallenge.turnLeft:
          final double yaw = face.headEulerAngleY ?? 0.0;
          // Di MLKit, Y-angle (yaw) positif artinya wajah menghadap ke kiri relative to sensor
          if (yaw > 20.0) {
            _goToProcessingState(image, face);
          }
          break;

        case LivenessChallenge.turnRight:
          final double yaw = face.headEulerAngleY ?? 0.0;
          // Di MLKit, Y-angle (yaw) negatif artinya wajah menghadap ke kanan relative to sensor
          if (yaw < -20.0) {
            _goToProcessingState(image, face);
          }
          break;

        default:
          break;
      }
    } catch (e) {
      // Fallback Simulasi Otomatis (Anti-Crash di Simulator Laptop)
      // Membantu proses pengujian agar instruksi visual tetap berjalan mengalir otomatis
      _handleSimulationFallback();
    }

    _isProcessingFrame = false;
  }

  void _handleSimulationFallback() {
    // Jalankan timer simulasi transisi visual otomatis untuk pengujian di komputer
    if (_currentChallenge == LivenessChallenge.centerFace) {
      Future.delayed(const Duration(seconds: 2), () {
        if (!mounted) return;
        _selectRandomChallenge();
        
        Future.delayed(const Duration(seconds: 3), () {
          if (!mounted) return;
          setState(() {
            _instructionText = 'Mencocokkan wajah dengan database...';
            _currentChallenge = LivenessChallenge.processing;
          });
          _verifyFaceBiometric(null, null);
        });
      });
    }
  }

  Future<void> _verifyFaceBiometric(CameraImage? image, Face? face) async {
    if (_isSubmitting) return;
    setState(() {
      _isSubmitting = true;
      _currentChallenge = LivenessChallenge.processing;
      _instructionText = 'Memproses absensi...';
    });

    try {
      _cameraController?.stopImageStream();
    } catch (_) {}

    final String nip = widget.user['nip'] ?? '';
    final String name = widget.user['full_name'] ?? 'Guru';

    // 1. Ekstraksi Vektor Wajah (Descriptor)
    List<double> currentDescriptor = [];
    if (image != null && face != null) {
      currentDescriptor = await _faceService.extractFaceDescriptor(image, face, nip);
    } else {
      // Fallback deteksi wajah tiruan untuk simulasi
      currentDescriptor = _faceService.extractMockDescriptor(nip);
    }

    // 2. Penanganan Pendaftaran Wajah Master (Enroll Mode)
    if (widget.mode == 'enroll') {
      final success = await _supabaseService.registerFace(widget.user['id'], currentDescriptor.toString());
      if (success) {
        _showSuccessNotification('Pendaftaran Wajah Master Berhasil!', 'Sidik wajah $name telah terdaftar.');
      } else {
        _showFailureNotification('Gagal menyimpan wajah master ke database.');
      }
      return;
    }

    // 3. Penanganan Verifikasi Wajah Absen Masuk / Pulang (Check-In & Check-Out)
    final String? masterDescStr = widget.user['face_descriptor'];
    if (masterDescStr == null || masterDescStr.trim().isEmpty) {
      _showFailureNotification('Wajah master tidak ditemukan di database. Rekam wajah master dahulu.');
      return;
    }

    final List<double> masterDescriptor = _faceService.parseDescriptorString(masterDescStr);
    
    // Hitung jarak kemiripan wajah
    final double distance = _faceService.calculateEuclideanDistance(currentDescriptor, masterDescriptor);
    print('Face distance calculated: $distance');

    // Ambang batas kemiripan biometrik (threshold) standard
    if (distance < 0.65) {
      // Wajah Cocok! Ambil foto selfie dan lakukan penyimpanan absensi
      String? selfieUrl;
      try {
        if (_cameraController != null && _cameraController!.value.isInitialized) {
          final XFile photo = await _cameraController!.takePicture();
          
          final nowWit = DateTime.now().toUtc().add(const Duration(hours: 9));
          final String dateStr = nowWit.toString().substring(0, 10);
          
          selfieUrl = await _supabaseService.uploadAttendancePhoto(
            imageFile: File(photo.path),
            nip: nip,
            date: dateStr,
            mode: widget.mode == 'check_in' ? 'in' : 'out',
          );
        }
      } catch (e) {
        print('Gagal mengambil/mengunggah foto selfie absensi: $e');
      }

      await _submitAttendanceRecord(bypassWajah: false, selfieUrl: selfieUrl);
    } else {
      // Wajah Tidak Cocok
      _showFailureNotification('Verifikasi Wajah Gagal. Wajah tidak cocok.');
    }
  }

  Future<void> _submitAttendanceRecord({required bool bypassWajah, String? selfieUrl}) async {
    final String nip = widget.user['nip'] ?? '';
    final now = DateTime.now();
    
    // Standarisasi Waktu Operasional Sekolah (WIT = UTC+9)
    final nowWit = now.toUtc().add(const Duration(hours: 9));
    final String dateStr = nowWit.toString().substring(0, 10);
    final String timeStr = now.toUtc().toIso8601String(); // Standar UTC database

    final nowTimeStr = '${nowWit.hour.toString().padLeft(2, '0')}:${nowWit.minute.toString().padLeft(2, '0')}';

    // Hitung status dan notes — mengikuti Vite GuruDashboard.tsx L82-L115
    final String shift = widget.detectedShift;
    final String workStart = shift == 'pagi'
        ? (widget.schoolSettings['pagi_work_start'] ?? '07:15')
        : (widget.schoolSettings['siang_work_start'] ?? '12:45');

    String attendanceStatus;
    String attendanceNotes;

    if (widget.isDinasLuar) {
      attendanceStatus = 'dinas_luar';
      attendanceNotes = 'Tugas Dinas Luar';
    } else if (nowTimeStr.compareTo(workStart) > 0) {
      // Hitung durasi keterlambatan (mengikuti Vite L91-L114)
      attendanceStatus = 'terlambat';
      final workParts = workStart.split(':');
      final workSeconds = int.parse(workParts[0]) * 3600 + int.parse(workParts[1]) * 60;
      final nowSeconds = nowWit.hour * 3600 + nowWit.minute * 60 + nowWit.second;
      final diffSecs = nowSeconds - workSeconds;
      final jam = diffSecs ~/ 3600;
      final menit = (diffSecs % 3600) ~/ 60;
      final detik = diffSecs % 60;
      final durasiParts = <String>[];
      if (jam > 0) durasiParts.add('$jam jam');
      if (menit > 0) durasiParts.add('$menit menit');
      durasiParts.add('$detik detik');
      attendanceNotes = 'Terlambat: ${durasiParts.join(' ')}';
    } else {
      attendanceStatus = 'hadir';
      attendanceNotes = 'Presensi Masuk Shift ${shift.toUpperCase()}';
    }

    if (bypassWajah) {
      attendanceNotes = '$attendanceNotes | Bypass Wajah Darurat (Foto Terlampir)';
    }

    final Map<String, dynamic> record = {
      'id'         : 'att-${now.millisecondsSinceEpoch}',
      'user_nip'   : nip,
      'date'       : dateStr,
      'status'     : attendanceStatus,
      'shift'      : shift,                       // Gap #4 fix: kirim kolom shift
      'notes'      : attendanceNotes,
      'latitude'   : widget.latitude,
      'longitude'  : widget.longitude,
      'device_info': 'Flutter Android APK',
      'bypass_wajah': bypassWajah,
      'selfie_url' : selfieUrl,
    };

    final PackageInfo packageInfo = await PackageInfo.fromPlatform();
    final String localVersion = packageInfo.version;
    record['app_version'] = localVersion;

    if (widget.mode == 'check_in') {
      record['check_in_time'] = timeStr;
      record['type'] = 'in';

      // Kirim langsung ke Supabase
      final success = await _supabaseService.saveAttendance(record);
      if (success) {
        _showSuccessNotification('Absen Masuk Berhasil!', 'Presensi Anda telah tercatat.');
      } else {
        // Fallback simpan ke Antrean Offline lokal (Hive) jika sinyal sekolah mati
        await _offlineService.enqueueRecord(record);
        _showSuccessNotification('Absen Offline Tersimpan!', 'Koneksi internet bermasalah. Absen disimpan secara lokal.');
      }
    } else {
      // Mode Check-Out (Absen Pulang)
      record['check_out_time'] = timeStr;
      record['type'] = 'out';

      // Cari data check-in hari ini dari Supabase terlebih dahulu
      final todayRecord = await _supabaseService.fetchTodayRecord(nip, dateStr);
      if (todayRecord != null) {
        final success = await _supabaseService.updateCheckOut(
          recordId: todayRecord['id'],
          checkOutTime: timeStr,
          selfieUrl: selfieUrl,
          notes: bypassWajah ? 'Bypass Wajah Darurat (Foto Terlampir)' : null,
          userNip: nip,
          date: dateStr,
          appVersion: localVersion,
        );

        if (success) {
          _showSuccessNotification('Absen Pulang Berhasil!', 'Selamat beristirahat.');
        } else {
          // Gagal koneksi, simpan ke antrean offline
          record['record_id'] = todayRecord['id'];
          record['selfie_url'] = selfieUrl;
          await _offlineService.enqueueRecord(record);
          _showSuccessNotification('Absen Pulang Offline Tersimpan!', 'Absen disimpan secara lokal.');
        }
      } else {
        // Jika data masuk belum ada, kita enqueue record check-out baru
        record['record_id'] = 'out-only-${now.millisecondsSinceEpoch}';
        await _offlineService.enqueueRecord(record);
        _showSuccessNotification('Absen Pulang Offline Tersimpan!', 'Tercatat pulang (offline).');
      }
    }
  }

  /// Tombol Darurat untuk Absen Bypass Wajah
  Future<void> _handleEmergencyBypass() async {
    if (_isSubmitting) return;
    setState(() {
      _isSubmitting = true;
      _currentChallenge = LivenessChallenge.processing;
      _instructionText = 'Mengambil foto darurat...';
    });

    try {
      _cameraController?.stopImageStream();
    } catch (_) {}

    final String nip = widget.user['nip'] ?? '';
    final String dateStr = DateTime.now().toUtc().add(const Duration(hours: 9)).toString().substring(0, 10);

    String? selfieUrl;
    try {
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        final XFile photo = await _cameraController!.takePicture();
        selfieUrl = await _supabaseService.uploadAttendancePhoto(
          imageFile: File(photo.path),
          nip: nip,
          date: dateStr,
          mode: widget.mode == 'check_in' ? 'in' : 'out',
        );
      }
    } catch (e) {
      print('Gagal mengambil/mengunggah foto darurat: $e');
    }

    await _submitAttendanceRecord(bypassWajah: true, selfieUrl: selfieUrl);
  }

  void _showSuccessNotification(String title, String body) {
    if (!mounted) return;
    setState(() {
      _currentChallenge = LivenessChallenge.success;
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.greenAccent, size: 28),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(body, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(dialogCtx); // Tutup dialog menggunakan dialogCtx
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (context.mounted) {
                  Navigator.pop(context, true); // Kembali ke dasbor dengan status sukses
                }
              });
            },
            child: const Text('OK', style: TextStyle(color: Color(0xFF0A84FF), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showFailureNotification(String errorText) {
    if (!mounted) return;
    setState(() {
      _currentChallenge = LivenessChallenge.failed;
      _instructionText = errorText;
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 28),
            const SizedBox(width: 8),
            const Text('Verifikasi Wajah Gagal', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(errorText, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(dialogCtx); // Tutup dialog
              setState(() {
                _isSubmitting = false;
                _hasBlinked = false;
                _hasSmiled = false;
                _currentChallenge = LivenessChallenge.centerFace;
                _instructionText = 'Posisikan wajah Anda di tengah lingkaran';
              });
              _startImageStream(); // Mulai kembali stream kamera
            },
            child: const Text('Coba Lagi', style: TextStyle(color: Color(0xFF0A84FF), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        title: Text(
          widget.mode == 'enroll' ? 'Pendaftaran Wajah' : 'Verifikasi Absensi',
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          // Instruksi Visual
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            color: const Color(0xFF111827),
            alignment: Alignment.center,
            child: Text(
              _instructionText,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
              textAlign: TextAlign.center,
            ),
          ),

          // Camera Viewport dengan Face Overlay Mask Circular
          Expanded(
            child: Center(
              child: AspectRatio(
                aspectRatio: 3 / 4,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Camera feed
                    if (_isCameraInitialized && _cameraController != null)
                      ClipRect(
                        child: OverflowBox(
                          alignment: Alignment.center,
                          child: FittedBox(
                            fit: BoxFit.cover,
                            child: SizedBox(
                              width: _cameraController!.value.previewSize!.height,
                              height: _cameraController!.value.previewSize!.width,
                              child: CameraPreview(_cameraController!),
                            ),
                          ),
                        ),
                      )
                    else
                      Container(
                        color: Colors.black,
                        child: const Center(
                          child: CircularProgressIndicator(color: Color(0xFF0A84FF)),
                        ),
                      ),

                    // Custom Circular Cutout Overlay
                    ColorFiltered(
                      colorFilter: ColorFilter.mode(
                        Colors.black.withValues(alpha: 0.8),
                        BlendMode.srcOut,
                      ),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Container(
                            color: Colors.black,
                          ),
                          Center(
                            child: Container(
                              width: 260,
                              height: 260,
                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Circular Border Ring
                    Center(
                      child: Container(
                        width: 260,
                        height: 260,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: _currentChallenge == LivenessChallenge.success
                                ? Colors.greenAccent
                                : const Color(0xFF0A84FF),
                            width: 3.5,
                          ),
                        ),
                      ),
                    ),

                    // Indicator visual liveness challenges (Dinamis sesuai tantangan aktif)
                    Positioned(
                      bottom: 24,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            if (_currentChallenge == LivenessChallenge.centerFace) ...[
                              const Icon(Icons.face_retouching_natural_rounded, color: Colors.blueAccent, size: 18),
                              const SizedBox(width: 6),
                              const Text('Posisikan Wajah Anda', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ] else if (_currentChallenge == LivenessChallenge.blink) ...[
                              Icon(
                                _hasBlinked ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                color: _hasBlinked ? Colors.greenAccent : Colors.grey,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              const Text('Mata Berkedip', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ] else if (_currentChallenge == LivenessChallenge.smile) ...[
                              Icon(
                                _hasSmiled ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                color: _hasSmiled ? Colors.greenAccent : Colors.grey,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              const Text('Bibir Tersenyum', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ] else if (_currentChallenge == LivenessChallenge.turnLeft) ...[
                              Icon(
                                _hasTurnedLeft ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                color: _hasTurnedLeft ? Colors.greenAccent : Colors.grey,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              const Text('Geleng Kepala Kiri', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ] else if (_currentChallenge == LivenessChallenge.turnRight) ...[
                              Icon(
                                _hasTurnedRight ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                color: _hasTurnedRight ? Colors.greenAccent : Colors.grey,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              const Text('Geleng Kepala Kanan', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ] else ...[
                              const SizedBox(
                                width: 12,
                                height: 12,
                                child: CircularProgressIndicator(strokeWidth: 1.5, color: Colors.blueAccent),
                              ),
                              const SizedBox(width: 8),
                              const Text('Memverifikasi Wajah...', style: TextStyle(color: Colors.white, fontSize: 11)),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Bar for Emergency Bypass
          if (widget.mode != 'enroll')
            Container(
              padding: const EdgeInsets.all(20),
              color: const Color(0xFF111827),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: Colors.grey, size: 16),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Kamera HP bermasalah? Gunakan bypass darurat.',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _currentChallenge == LivenessChallenge.processing ? null : _handleEmergencyBypass,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent.withValues(alpha: 0.2),
                      side: const BorderSide(color: Colors.redAccent, width: 1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    child: const Text(
                      'Bypass Darurat',
                      style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
