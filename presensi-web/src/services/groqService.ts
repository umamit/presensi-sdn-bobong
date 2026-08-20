import { AttendanceRecord } from '../types';

export interface GroqInsightResponse {
  insights: string;
}

export async function fetchAttendanceInsights(
  records: AttendanceRecord[],
  totalGuru: number,
  apiKey: string
): Promise<string | null> {
  const activeKey = apiKey || (import.meta.env.VITE_GROQ_API_KEY as string) || '';
  if (!activeKey) return null;

  // Siapkan data ringkasan kehadiran guru hari ini untuk dikirim secara aman dan anonim ke AI
  const summaryData = records.map((r, i) => ({
    no: i + 1,
    nama: r.userName,
    status: r.status,
    masuk: r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
    pulang: r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
    jarak: r.distanceMeters ? `${r.distanceMeters}m` : '0m',
    catatan: r.notes || '-'
  }));

  const totalHadir = records.filter(r => r.status === 'hadir').length;
  const totalTerlambat = records.filter(r => r.status === 'terlambat').length;
  const totalIzin = records.filter(r => r.status === 'izin').length;
  const totalDinasLuarApproved = records.filter(r => r.status === 'dinas_luar_approved').length;
  const totalDinasLuarPending = records.filter(r => r.status === 'dinas_luar').length;
  const totalDinasLuar = totalDinasLuarApproved + totalDinasLuarPending;
  const totalBelumAbsen = Math.max(0, totalGuru - (totalHadir + totalTerlambat + totalIzin + totalDinasLuar));
  const totalAbsenDarurat = records.filter(r => r.notes && r.notes.includes('Darurat:')).length;

  const prompt = `Anda adalah seorang Konsultan Manajemen Sekolah dan Asisten AI Kepala Sekolah SDN Bobong yang ahli, bijaksana, dan profesional.
Tugas Anda adalah menganalisis data kehadiran guru hari ini dan memberikan ringkasan eksekutif (Executive Summary Insights) yang bernilai tinggi bagi Kepala Sekolah.

Berikut Ringkasan Statistik Hari Ini:
- Total Guru Terdaftar: ${totalGuru} orang
- Hadir Tepat Waktu: ${totalHadir} orang
- Terlambat: ${totalTerlambat} orang
- Izin/Sakit: ${totalIzin} orang
- Dinas Luar (Disetujui Kepsek): ${totalDinasLuarApproved} orang
- Dinas Luar (Menunggu Konfirmasi): ${totalDinasLuarPending} orang
- Absen Darurat (Bypass Wajah Gagal 3x): ${totalAbsenDarurat} orang
- Belum Presensi: ${totalBelumAbsen} orang

Konteks Aturan & Fitur Absensi SDN Bobong:
1. Absensi biasa menggunakan deteksi Liveness (kedipan mata + senyuman) dan pencocokan wajah AI (Face Recognition 1-to-1) yang dicocokkan dengan data wajah master guru.
2. Jika guru gagal mencocokkan wajah sebanyak 3 kali (kamera bermasalah, pencahayaan redup, dll), tombol darurat akan muncul dan mereka diizinkan melakukan 'Absen Darurat' dengan menyertakan keterangan alasan darurat khusus (catatan diawali kata 'Darurat:').
3. Guru yang dinas di luar sekolah menggunakan fitur 'Dinas Luar' (tanpa geofencing GPS). Absen masuk dinas luar awalnya berstatus 'dinas_luar' (Pending/Menunggu Konfirmasi). Kepala Sekolah harus menekan tombol konfirmasi untuk menyetujuinya sehingga status berubah menjadi 'dinas_luar_approved' (Disetujui).

Berikut rincian data mentah presensi guru:
${JSON.stringify(summaryData, null, 2)}

Format Jawaban Anda WAJIB mengikuti struktur berikut (gunakan bahasa Indonesia yang ringkas, lugas, profesional, dan berwibawa):

### 📊 RINGKASAN DISIPLIN HARI INI
(Satu paragraf singkat yang merangkum tingkat kedisiplinan guru hari ini secara keseluruhan dan persentase kehadiran)

### ⚠️ PERHATIAN / TEMUAN KHUSUS
(Sebutkan secara spesifik jika ada temuan penting, misalnya: 
- Guru yang melakukan 'Absen Darurat' beserta alasannya untuk diverifikasi.
- Guru dengan status Dinas Luar yang 'Menunggu Konfirmasi' Kepsek agar segera ditindaklanjuti.
- Guru yang terlambat beserta jam keterlambatannya, guru yang belum absen, atau catatan izin yang mencurigakan)

### 💡 REKOMENDASI UNTUK KEPALA SEKOLAH
(Berikan 2-3 butir rekomendasi taktis atau apresiasi yang dapat dilakukan Kepala Sekolah hari ini untuk meningkatkan disiplin atau mengelola kelas kosong bagi guru yang berhalangan hadir)

*PENTING: Jangan bertele-tele, langsung ke poin-poin analisis utama, dan jangan gunakan jargon chatbot.*`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah Asisten Eksekutif Kepala Sekolah yang bijak dan berwibawa. Berikan jawaban dalam markdown yang bersih dan profesional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result?.choices?.[0]?.message?.content || 'Gagal menganalisis laporan.';
  } catch (error: any) {
    console.error('Error calling Groq API:', error);
    throw new Error(error?.message || 'Koneksi ke AI Groq terputus. Pastikan API Key Anda aktif.');
  }
}

export async function fetchTeacherPerformanceReport(
  teacherName: string,
  records: AttendanceRecord[],
  apiKey: string
): Promise<string | null> {
  const activeKey = apiKey || (import.meta.env.VITE_GROQ_API_KEY as string) || '';
  if (!activeKey) return null;

  // Filter records belonging to this specific teacher
  const teacherRecords = records.filter(r => r.userName === teacherName);

  const totalHadir = teacherRecords.filter(r => r.status === 'hadir').length;
  const totalTerlambat = teacherRecords.filter(r => r.status === 'terlambat').length;
  const totalIzin = teacherRecords.filter(r => r.status === 'izin').length;
  const totalDinasLuar = teacherRecords.filter(r => r.status === 'dinas_luar_approved' || r.status === 'dinas_luar').length;
  const totalAbsenDarurat = teacherRecords.filter(r => r.notes && r.notes.includes('Darurat:')).length;

  const summary = teacherRecords.map((r, i) => ({
    no: i + 1,
    tanggal: r.date,
    status: r.status,
    masuk: r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
    pulang: r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
    catatan: r.notes || '-'
  }));

  const prompt = `Anda adalah Konsultan Manajemen SDM Sekolah dan Asisten AI Kepala Sekolah SDN Bobong yang objektif, bijaksana, dan formal.
Tugas Anda adalah menganalisis data kehadiran Guru individual untuk menghasilkan "Surat Evaluasi Kinerja Kedisiplinan Guru".

Nama Guru: ${teacherName}

Ringkasan Statistik Kehadiran Guru:
- Total Kehadiran Tercatat: ${teacherRecords.length} hari
- Hadir Tepat Waktu: ${totalHadir} hari
- Terlambat: ${totalTerlambat} hari
- Izin/Sakit: ${totalIzin} hari
- Dinas Luar: ${totalDinasLuar} hari
- Absen Darurat (Gagal Verifikasi Wajah): ${totalAbsenDarurat} kali

Detail Presensi Guru:
${JSON.stringify(summary, null, 2)}

Format Jawaban Anda WAJIB mengikuti struktur surat resmi evaluasi berikut (gunakan bahasa Indonesia formal, berwibawa, dan santun):

---
### 📝 SURAT EVALUASI KINERJA KEDISIPLINAN GURU

**Nama Guru:** ${teacherName}
**Satuan Pendidikan:** SDN Bobong

#### 1. ANALISIS KEDISIPLINAN KEHADIRAN
(Satu paragraf objektif yang menganalisis kepatuhan guru terhadap jam masuk dan kepulangan berdasarkan data di atas)

#### 2. KEPATUHAN METODE PRESENSI
(Ulas jika ada catatan khusus mengenai Absen Darurat atau Dinas Luar. Apresiasi jika guru selalu melakukan verifikasi liveness wajah biasa dengan sukses)

#### 3. CATATAN & REKOMENDASI KEPALA SEKOLAH
(Berikan 1-2 butir saran taktis untuk pembinaan kinerja kedisiplinan guru ini, atau kalimat apresiasi apresiatif jika kinerjanya sudah sangat baik)

---
*PENTING: Tulis jawaban langsung ke poin-poin di atas. Jangan gunakan jargon asisten AI.*`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah Asisten Evaluator Kedisiplinan Guru SDN Bobong yang profesional dan bijaksana. Tulis surat evaluasi resmi.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result?.choices?.[0]?.message?.content || 'Gagal menyusun laporan evaluasi.';
  } catch (error: any) {
    console.error('Error calling Groq API for teacher report:', error);
    throw new Error(error?.message || 'Koneksi ke AI Groq terputus. Pastikan API Key Anda aktif.');
  }
}
