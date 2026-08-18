import 'dart:math';
import 'package:geolocator/geolocator.dart';

class GpsService {
  static final GpsService _instance = GpsService._internal();
  factory GpsService() => _instance;
  GpsService._internal();

  /// Menghitung jarak antara dua koordinat (Haversine) dalam satuan Meter
  double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
    const double r = 6371000; // Radius bumi dalam meter
    final double phi1 = lat1 * pi / 180;
    final double phi2 = lat2 * pi / 180;
    final double deltaPhi = (lat2 - lat1) * pi / 180;
    final double deltaLambda = (lon2 - lon1) * pi / 180;

    final double a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
        cos(phi1) * cos(phi2) *
        sin(deltaLambda / 2) * sin(deltaLambda / 2);
    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return r * c;
  }

  /// Mengecek apakah koordinat user berada di dalam area geofence polygon sekolah
  bool isPointInPolygon(double lat, double lng, List<List<double>> polygon) {
    if (polygon.isEmpty) return false;
    bool isInside = false;
    int j = polygon.length - 1;
    for (int i = 0; i < polygon.length; i++) {
      final double xi = polygon[i][0];
      final double yi = polygon[i][1];
      final double xj = polygon[j][0];
      final double yj = polygon[j][1];

      final bool intersect = ((yi > lat) != (yj > lat)) &&
          (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
      j = i;
    }
    return isInside;
  }

  /// Membaca koordinat GPS HP saat ini
  Future<Position?> getCurrentPosition() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location services are disabled.');
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied.');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied.');
      }

      // Mengambil lokasi dengan akurasi tinggi (LocationAccuracy.high)
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );
    } catch (e) {
      print('Geolocator error: $e');
      return null;
    }
  }
}
