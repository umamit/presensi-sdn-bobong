# Aturan Penghematan Token Google Antigravity (AGY) - SD Negeri Bobong Project

## 1. Modularitas & Batas Ukuran File
- **Maksimal 300 baris per file**: Jangan pernah membuat satu file komponen/modul lebih dari 300-400 baris.
- **Setiap fungsi/fitur di file terpisah**: Ekstrak fungsi pembantu, modal, dan hook ke dalam file khusus (Single Responsibility Principle).
- **Manfaat Token**: Pembacaan dan pengeditan file kecil memakan token yang jauh lebih sedikit dibanding memuat file raksasa.

## 2. Strategi Pengeditan & Pembacaan Kode
- **Gunakan line-range spesifik**: Saat me-view file (`view_file`), selalu tentukan `StartLine` dan `EndLine` yang dibutuhkan saja.
- **Hindari baca file utuh secara berulang**: Baca bagian kode yang akan diubah saja.
- **Gunakan edit bertarget (`replace_file_content`)**: Jangan mengganti seluruh isi file jika hanya mengubah 5-10 baris kode.

## 3. Komunikasi Ringkas & Padat
- **Jawaban to-the-point**: Berikan tanggapan yang singkat, lugas, dan jelas tanpa penjelasan bertele-tele.
- **Tanpa Pengulangan Ringkasan**: Jangan mengulang kembali seluruh kode yang sudah diubah jika tidak diminta.
- **Gunakan Bahasa Indonesia yang Efisien**: Singkat dan jelas.

## 4. Eksekusi Terminal & Log
- **Batasi output log terminal**: Gunakan filter seperti `head -n 20` atau `tail -n 20` saat menjalankan perintah terminal untuk mencegah output besar memenuhi konteks token.
- **Jalankan build hanya jika diperlukan**: Jangan jalankan tes/build berulang-ulang tanpa perubahan kode yang signifikan.

## 5. Menjaga Kode Tetap Clean Slate
- **Tidak ada Mock Data Palsu**: Jangan menambahkan data dummy/placeholder tambahan yang tidak perlu.
- **Gunakan HANYA 19 Guru Resmi SD Negeri Bobong**: Jaga file data agar tidak membengkak dengan data tidak relevan.

## 6. Prinsip Utamakan Layar Smartphone (Mobile-First)
- **Desain Khusus Smartphone**: Sebelum membuat/mengubah UI (halaman, modal, tombol, tabel, atau form), SELALU rancang dan uji untuk layar smartphone HP (width 320px–430px) terlebih dahulu.
- **Tanpa Overlap & Tanpa Horizontal Scroll Liar**: Komponen harus fleksibel (flex-col/responsive grid), tombol minimal 44px, dan modal harus muat tanpa terpotong di HP.
