import React, { useState, useEffect } from 'react';
import { Sparkles, X, Printer, RefreshCw, AlertTriangle } from 'lucide-react';
import { AttendanceRecord, SchoolSettings } from '../../types';
import { fetchTeacherPerformanceReport } from '../../services/groqService';

interface TeacherPerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  records: AttendanceRecord[];
  schoolSettings: SchoolSettings;
}

export const TeacherPerformanceReportModal: React.FC<TeacherPerformanceReportModalProps> = ({
  isOpen,
  onClose,
  teacherName,
  records,
  schoolSettings
}) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = schoolSettings.groqApiKey || (import.meta.env.VITE_GROQ_API_KEY as string) || '';

  const generateReport = async () => {
    if (!apiKey) {
      setError('API Key Groq belum diatur. Harap masukkan API Key di Pengaturan Sekolah.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTeacherPerformanceReport(teacherName, records, apiKey);
      setReport(result);
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat laporan evaluasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && teacherName) {
      setReport(null);
      setError(null);
      generateReport();
    }
  }, [isOpen, teacherName]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Convert markdown headings to HTML representation for clean printing layout
    const formattedReport = (report || '')
      .replace(/### (.*)/g, '<h3 style="color:#111;margin-top:1.5rem;border-bottom:1px solid #ddd;padding-bottom:0.25rem;">$1</h3>')
      .replace(/#### (.*)/g, '<h4 style="color:#333;margin-top:1rem;margin-bottom:0.5rem;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    printWindow.document.write(`
      <html>
        <head>
          <title>Rapor Kinerja - ${teacherName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 2rem; color: #333; line-height: 1.6; }
            .header { margin-bottom: 2rem; }
            .content { font-size: 14px; }
            h3 { font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
            h4 { font-size: 15px; }
            .footer { margin-top: 4rem; display: flex; justify-content: space-between; font-size: 12px; }
            .sign-box { width: 200px; text-align: center; }
            @media print {
              body { padding: 1rem; }
            }
          </style>
        </head>
        <body>
          <div class="header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 4px double #000; padding-bottom: 8px; margin-bottom: 2rem;">
            <div style="flex: 0 0 75px; text-align: left;">
              <img src="/logo-taliabu.png" style="width: 70px; height: auto;" />
            </div>
            <div style="flex: 1; text-align: center; font-family: 'Times New Roman', Times, serif; color: #000; padding: 0 10px;">
              <h3 style="margin: 0; font-size: 15px; font-weight: bold; text-transform: uppercase; line-height: 1.2;">PEMERINTAH KABUPATEN PULAU TALIABU</h3>
              <h2 style="margin: 3px 0 2px 0; font-size: 19px; font-weight: bold; text-transform: uppercase; line-height: 1.2;">SD NEGERI BOBONG</h2>
              <p style="margin: 0; font-size: 11px; line-height: 1.3;">Jalan. Mansur Sou Desa Wayo Kecamatan Taliabu Barat</p>
              <p style="margin: 0; font-size: 11px; line-height: 1.3;">Pulau Taliabu, Maluku Utara</p>
              <p style="margin: 0; font-size: 11px; line-height: 1.3; font-weight: bold;">Kode Pos. 97794 Laman sdnegeribobong.sch.id</p>
            </div>
            <div style="flex: 0 0 75px; text-align: right;">
              <img src="/logo-sdn-bobong-hd.png" style="width: 70px; height: auto;" />
            </div>
          </div>
          <div class="content">
            ${formattedReport}
          </div>
          <div class="footer">
            <div class="sign-box">
              <p>Mengetahui,</p>
              <p style="margin-top: 4rem; font-weight: bold; text-decoration: underline;">Kepala Sekolah SDN Bobong</p>
            </div>
            <div class="sign-box">
              <p>Bobong, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin-top: 4rem; font-weight: bold; text-decoration: underline;">Evaluator AI</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        backgroundColor: '#1c1c1e',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, rgba(99, 102, 241, 0.08), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 600 }}>
              Rapor Evaluasi Kinerja Guru (Cerdik AI)
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          fontSize: '0.88rem',
          color: 'var(--text)',
          lineHeight: 1.6
        }}>
          {!apiKey ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <AlertTriangle size={36} color="var(--warning)" style={{ marginBottom: '1rem' }} />
              <strong style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>API Key Groq Belum Diatur</strong>
              Harap masukkan API Key Groq Anda di modal Pengaturan Sekolah agar dapat membuat laporan analisis otomatis bulanan untuk guru.
            </div>
          ) : loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1rem',
              color: 'var(--text-muted)',
              gap: '0.75rem'
            }}>
              <RefreshCw size={24} color="var(--primary)" className="spin" />
              <span>Cerdik AI sedang menyusun surat evaluasi untuk <strong>{teacherName}</strong>...</span>
            </div>
          ) : error ? (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
              <div>
                <strong>Gagal Membuat Lapor:</strong> {error}
                <button 
                  onClick={generateReport}
                  className="btn btn-primary"
                  style={{
                    display: 'block',
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '4px'
                  }}
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : report ? (
            <div 
              className="ai-report-body" 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                padding: '1.25rem',
                color: '#e4e4e7',
                whiteSpace: 'pre-wrap'
              }}
            >
              {report}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button 
            onClick={onClose} 
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '6px' }}
          >
            Tutup
          </button>
          
          {report && !loading && (
            <button 
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                fontSize: '0.8rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={15} />
              Cetak Rapor (PDF)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
