import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'sch.sdnegeribobong.presensi',
  appName: 'Presensi SD Negeri Bobong',
  webDir: 'dist',
  server: {
    // APK selalu memuat versi terbaru dari server Vercel
    // Guru cukup install APK sekali, update otomatis berlaku tanpa reinstall
    url: 'https://presensi-sdn-bobong.vercel.app',
    cleartext: false
  }
};

export default config;
