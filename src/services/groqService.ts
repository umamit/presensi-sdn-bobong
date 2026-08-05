import { AttendanceRecord } from '../types';

export interface GroqInsightResponse {
  insights: string;
}

export async function fetchAttendanceInsights(
  records: AttendanceRecord[],
  totalGuru: number,
  apiKey: string
): Promise<string | null> {
  if (!apiKey) return null;

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
  const totalBelumAbsen = Math.max(0, totalGuru - (totalHadir + totalTerlambat + totalIzin));

  const prompt = `Anda adalah seorang Konsultan Manajemen Sekolah dan Asisten AI Kepala Sekolah SDN Bobong yang ahli, bijaksana, dan profesional.
Tugas Anda adalah menganalisis data kehadiran guru hari ini dan memberikan ringkasan eksekutif (Executive Summary Insights) yang bernilai tinggi bagi Kepala Sekolah.

Berikut Ringkasan Statistik Hari Ini:
- Total Guru Terdaftar: ${totalGuru} orang
- Hadir Tepat Waktu: ${totalHadir} orang
- Terlambat: ${totalTerlambat} orang
- Izin/Sakit: ${totalIzin} orang
- Belum Presensi: ${totalBelumAbsen} orang

Berikut rincian data mentah presensi guru:
${JSON.stringify(summaryData, null, 2)}

Format Jawaban Anda WAJIB mengikuti struktur berikut (gunakan bahasa Indonesia yang ringkas, lugas, profesional, dan berwibawa):

### 📊 RINGKASAN DISIPLIN HARI INI
(Satu paragraf singkat yang merangkum tingkat kedisiplinan guru hari ini secara keseluruhan dan persentase kehadiran)

### ⚠️ PERHATIAN / TEMUAN KHUSUS
(Sebutkan secara spesifik jika ada temuan penting, misalnya: guru yang terlambat beserta jam keterlambatannya, guru yang belum absen, atau catatan izin yang mencurigakan)

### 💡 REKOMENDASI UNTUK KEPALA SEKOLAH
(Berikan 2-3 butir rekomendasi taktis atau apresiasi yang dapat dilakukan Kepala Sekolah hari ini untuk meningkatkan disiplin atau mengelola kelas kosong bagi guru yang berhalangan hadir)

*PENTING: Jangan bertele-tele, langsung ke poin-poin analisis utama, dan jangan gunakan jargon chatbot.*`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
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
