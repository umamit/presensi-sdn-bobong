# Aturan Penghematan Token Google Antigravity (AGY) - SD Negeri Bobong Project

## 1. Modularitas & Batas Ukuran File
- **Aturan Mutlak 1 Fungsi / 1 Komponen = 1 File**: Setiap fungsi pembantu (utility), modul service, custom hook, dan sub-komponen UI WAJIB dipisah dalam file khusus tersendiri (Single Responsibility Principle). Jangan pernah menumpuk banyak fungsi/komponen di dalam satu file.
- **Maksimal 300 baris per file**: Batas keras ukuran file adalah 300-400 baris. Jika file mendekati batas ini, WAKTUnya di-refaktor dan dipecah ke file-file terpisah.
- **Manfaat Token & Pemeliharaan**: Pembacaan dan pengeditan file kecil berfokus tunggal memakan token yang jauh lebih sedikit dan mencegah bug regresi.

## 2. Strategi Pengeditan & Pembacaan Kode
- **Gunakan line-range spesifik**: Saat me-view file (`view_file`), selalu tentukan `StartLine` dan `EndLine` yang dibutuhkan saja.
- **Hindari baca file utuh secara berulang**: Baca bagian kode yang akan diubah saja.
- **Gunakan edit bertarget (`replace_file_content`)**: Jangan mengganti seluruh isi file jika hanya mengubah 5-10 baris kode.

## 3. Komunikasi Ringkas & Padat
- **Jawaban to-the-point**: Berikan tanggapan yang singkat, lugas, dan jelas tanpa penjelasan bertele-tele.
- **Tanpa Pengulangan Ringkasan**: Jangan mengulang kembali seluruh kode yang sudah diubah jika tidak diminta.
- **Gunakan Bahasa Indonesia yang Efisien**: Singkat dan jelas.
- **Verifikasi Sebelum Merespon**: WAJIB melakukan inspeksi/pemindaian menyeluruh terlebih dahulu ke seluruh file untuk memastikan apakah suatu fitur/masalah sudah ada atau belum, SEBELUM memberikan laporan atau respon kepada pengguna.

## 4. Eksekusi Terminal & Log
- **Batasi output log terminal**: Gunakan filter seperti `head -n 20` atau `tail -n 20` saat menjalankan perintah terminal untuk mencegah output besar memenuhi konteks token.
- **Jalankan build hanya jika diperlukan**: Jangan jalankan tes/build berulang-ulang tanpa perubahan kode yang signifikan.

## 5. Menjaga Kode Tetap Clean Slate & Full Supabase Integrasi
- **Dilarang Gunakan LocalStorage**: Seluruh operasi data (baca, simpan, edit, hapus) WAJIB 100% terhubung langsung ke Supabase DB & Supabase Cloud Storage. Jangan pernah menyimpan state aplikasi atau data presensi/user ke `localStorage`.
- **Tidak ada Mock Data Palsu**: Jangan menambahkan data dummy/placeholder tambahan yang tidak perlu.
- **Gunakan HANYA 19 Guru Resmi SD Negeri Bobong**: Jaga file data agar tidak membengkak dengan data tidak relevan.

## 6. Prinsip Utamakan Layar Smartphone (Mobile-First)
- **Desain Khusus Smartphone**: Sebelum membuat/mengubah UI (halaman, modal, tombol, tabel, atau form), SELALU rancang dan uji untuk layar smartphone HP (width 320px–430px) terlebih dahulu.
- **Tanpa Overlap & Tanpa Horizontal Scroll Liar**: Komponen harus fleksibel (flex-col/responsive grid), tombol minimal 44px, dan modal harus muat tanpa terpotong di HP.

## 7. Struktur Folder Modular (Wajib Diikuti)
```
src/
├── App.tsx                        # Shell utama (state modal & routing saja, <100 baris)
├── main.tsx
├── types/index.ts                 # Semua TypeScript interfaces
├── lib/supabase.ts                # Re-export dari services/ (backward compat)
├── services/
│   ├── supabaseClient.ts          # Inisialisasi supabase client
│   ├── attendanceService.ts       # CRUD attendance
│   ├── attendanceRealtimeService.ts # Realtime Listener Notification Supabase (Bulan & Absen Realtime)
│   ├── leaveService.ts            # CRUD leave_requests
│   ├── userService.ts             # CRUD users
│   ├── storageService.ts          # Upload selfie & dokumen
│   ├── schoolSettingsService.ts   # CRUD school_settings
│   ├── networkValidationService.ts # Validasi Jaringan IP & WiFi Sekolah (Poin 4)
│   └── initialData.ts         # Data initial offline fallback
├── hooks/
│   ├── useAppData.ts              # State global App + semua handler
│   ├── useGpsLocation.ts          # Logika GPS & radius check
│   ├── useGpsWatchLocation.ts     # Real-time background GPS watch position (Poin 3)
│   ├── useAttendanceTimer.ts      # Timer clock + notifikasi pengingat
│   ├── useCamera.ts               # Akses kamera
│   ├── useLivenessDetection.ts    # Deteksi wajah liveness
│   └── usePwaInstall.ts           # PWA install prompt
├── utils/
│   ├── haversine.ts               # GPS distance, polygon, format date/time
│   └── exportCsv.ts               # Export laporan CSV
└── components/
    ├── AdminDashboard.tsx          # Orchestrator admin (<70 baris)
    ├── GuruDashboard.tsx           # Orchestrator guru (<130 baris)
    ├── Navbar.tsx                  # Header + hamburger toggle
    ├── LoginPage.tsx               # Halaman login (<50 baris)
    ├── SelfieModal.tsx             # Modal selfie kamera
    ├── SelfiePreviewModal.tsx      # Modal pop-up pratinjau foto presensi HD
    ├── LeaveRequestModal.tsx       # Modal pengajuan izin
    ├── SchoolSettingsModal.tsx     # Modal pengaturan GPS & shift
    ├── TeacherManagementModal.tsx  # Modal kelola guru
    ├── ChangePasswordModal.tsx     # Modal ganti password
    ├── GeofenceMap.tsx             # Peta GPS radius
    ├── GuideModal.tsx              # Modal panduan penggunaan
    ├── SupabaseConfigModal.tsx     # Modal info koneksi Supabase
    ├── PwaInstallBanner.tsx        # Banner install PWA
    ├── admin/
    │   ├── AdminStatBar.tsx        # Bar statistik kehadiran
    │   ├── AdminGpsRow.tsx         # Row info GPS sekolah
    │   ├── AttendanceTable.tsx     # Tabel presensi guru
    │   └── LeaveApprovalSection.tsx # Seksi persetujuan izin
    ├── guru/
    │   ├── GuruHeader.tsx          # Header info guru + jam
    │   ├── GpsStatusCard.tsx       # Kartu status GPS
    │   ├── PresensiActionCard.tsx  # Kartu tombol absen masuk/pulang
    │   ├── QuickActionButtons.tsx  # Tombol aksi cepat (izin, panduan, ganti pass)
    │   └── PersonalHistoryList.tsx # Riwayat presensi pribadi
    ├── login/
    │   ├── LoginHeader.tsx         # Logo + judul login
    │   └── LoginForm.tsx           # Form input NIP + password
    ├── navbar/
    │   └── NavbarMenu.tsx          # Dropdown hamburger menu
    ├── settings/
    │   └── ShiftSettingsForm.tsx   # Form pengaturan 2 shift
    └── teacher/
        └── TeacherComponents.tsx   # TeacherAddForm + TeacherListItem
```
