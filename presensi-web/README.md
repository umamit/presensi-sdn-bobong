# Sistem Presensi Online SD Negeri Bobong (PWA & Geofencing GPS)

Aplikasi Web Progressive (PWA) berbasis **Geolocation GPS & Geofencing KML** yang dirancang khusus untuk pengelolaan presensi guru dan tenaga pendidik di **SD Negeri Bobong** (`sdnegeribobong.sch.id`).

---

## Fitur Utama

- **PWA Ready**: Dapat diinstal langsung ke *Home Screen* HP Android & iOS tanpa melalui App Store/Play Store.
- **Geofencing GPS KML**: Deteksi posisi presisi guru menggunakan polygon KML Google Earth (`area presensi` SD Negeri Bobong) & Haversine Distance Engine.
- **Multi-Role Dashboard**:
  - **Panel Guru**: Absen Masuk & Pulang, Status Terlambat/Tepat Waktu, Pengajuan Izin/Sakit, dan Peta Visual Geofencing.
  - **Panel Admin / Kepsek**: Monitoring Kehadiran Realtime, Pengaturan Titik GPS & Jam Sekolah, Approval Izin Guru, dan Ekspor Rekap data ke CSV/Excel.
- **Supabase PostgreSQL Ready**: Langsung bekerja dengan *Mock Local Store (Demo)* dan siap dihubungkan ke Supabase Cloud.

---

## Cara Menjalankan Project

### 1. Install Dependensi
```bash
npm install
```

### 2. Jalankan Server Dev Lokal
```bash
npm run dev
```
Akses di browser: `http://localhost:3000`

### 3. Build Production
```bash
npm run build
```

---

## Struktur Folder Project
```text
presensi/
├── public/              # Aset statis & PWA icons
├── src/
│   ├── components/      # Navbar, GuruDashboard, AdminDashboard, GeofenceMap, Modals
│   ├── lib/             # Supabase client & Mock Store data
│   ├── types/           # Definisi tipe TypeScript
│   ├── utils/           # Haversine distance & Point-in-Polygon KML engine
│   ├── App.tsx          # Main App Routing & State Management
│   ├── index.css        # Glassmorphic Design System
│   └── main.tsx         # Entry point React
├── index.html           # Meta tags PWA & font Google
├── vite.config.ts       # Vite & Service Worker PWA config
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies & Scripts
```
