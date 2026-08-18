import 'package:flutter/material.dart';
import 'services/supabase_service.dart';
import 'services/offline_service.dart';
import 'views/login_view.dart';

void main() async {
  // Pastikan inisialisasi binding widget Flutter selesai
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Ambil kredensial database Supabase aman (compile-time fallback)
  const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://nzqmjqydeyjcrktborxk.supabase.co',
  );
  const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cW1qcXlkZXlqY3JrdGJvcnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NjA5MjUsImV4cCI6MjEwMTAzNjkyNX0.a2uEpwu1IohYJ41bLcmlUA4ydOHPA4JRNRsAhwPIG38',
  );

  // 2. Inisialisasi Supabase SDK
  final SupabaseService supabaseService = SupabaseService();
  await supabaseService.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);

  // 3. Inisialisasi Hive Database (Luring Cache)
  final OfflineService offlineService = OfflineService();
  await offlineService.initialize();

  // 4. Jalankan aplikasi utama
  runApp(const PresensiApp());
}

class PresensiApp extends StatelessWidget {
  const PresensiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Presensi SDN Bobong',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF0A84FF),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0A84FF),
          secondary: Color(0xFF30D158),
          surface: Color(0xFF111827),
        ),
        fontFamily: 'Inter',
      ),
      home: const LoginView(),
    );
  }
}
