import React, { useState } from 'react';
import { Sparkles, Key, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AttendanceRecord, SchoolSettings } from '../../types';
import { fetchAttendanceInsights } from '../../services/groqService';

interface SmartInsightsSectionProps {
  records: AttendanceRecord[];
  totalGuru: number;
  schoolSettings: SchoolSettings;
  onOpenSettingsModal: () => void;
}

export const SmartInsightsSection: React.FC<SmartInsightsSectionProps> = ({
  records,
  totalGuru,
  schoolSettings,
  onOpenSettingsModal
}) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const apiKey = schoolSettings.groqApiKey || '';

  const handleGenerateInsights = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAttendanceInsights(records, totalGuru, apiKey);
      setInsights(result);
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses data laporan AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '1.25rem', 
        borderColor: apiKey ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        background: apiKey ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(0, 0, 0, 0) 100%)' : '#1c1c1e',
        borderRadius: '12px'
      }}
    >
      {/* Header Panel */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color={apiKey ? 'var(--primary)' : 'var(--text-muted)'} className={loading ? 'spin' : ''} />
          <strong style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
            Laporan Cerdas AI (Groq)
          </strong>
          {apiKey && (
            <span 
              style={{ 
                fontSize: '0.62rem', 
                background: 'rgba(99, 102, 241, 0.12)', 
                color: 'var(--primary)', 
                padding: '0.15rem 0.4rem', 
                borderRadius: '4px',
                fontWeight: 600
              }}
            >
              LLAMA 3.1 READY
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </div>

      {/* Body Panel */}
      {isOpen && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.85rem' }}>
          {!apiKey ? (
            /* Jika API Key belum dikonfigurasi */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0, textAlign: 'left' }}>
                Gunakan kecerdasan buatan (AI Groq) untuk menganalisis data rekapitulasi presensi secara instan sekali klik. Membutuhkan API Key gratis dari Groq Cloud Console.
              </p>
              <button 
                onClick={onOpenSettingsModal} 
                className="btn btn-secondary" 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.45rem 0.75rem', 
                  gap: '0.35rem', 
                  borderRadius: '6px',
                  borderColor: 'rgba(255, 159, 10, 0.2)' 
                }}
              >
                <Key size={12} color="var(--warning)" />
                <span>Pasang API Key Groq Gratis</span>
              </button>
            </div>
          ) : (
            /* Jika API Key sudah terpasang */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Tombol Minta Analisis */}
              {!insights && !loading && (
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
                    Kumpulkan data presensi aktif hari ini secara aman untuk dianalisis oleh AI Groq. AI akan merangkum persentase, pola keterlambatan, dan memberikan saran kepemimpinan sekolah.
                  </p>
                  <button 
                    onClick={handleGenerateInsights} 
                    className="btn btn-primary"
                    style={{ 
                      fontSize: '0.78rem', 
                      padding: '0.5rem 0.95rem', 
                      borderRadius: '8px',
                      background: 'var(--primary)',
                      gap: '0.4rem'
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Mulai Analisis AI Sekarang</span>
                  </button>
                </div>
              )}

              {/* Status Loading */}
              {loading && (
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }} className="animate-pulse">
                  <RefreshCw size={20} className="spin" color="var(--primary)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    AI Groq sedang meneliti data kehadiran guru...
                  </span>
                </div>
              )}

              {/* Tampilan Error */}
              {error && (
                <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: '#f87171', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                  <button onClick={handleGenerateInsights} style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', marginLeft: 'auto', fontSize: '0.75rem' }}>Ulangi</button>
                </div>
              )}

              {/* Hasil Analisis Insights */}
              {insights && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div 
                    style={{ 
                      padding: '1.15rem', 
                      background: '#18181b', // SaaS dark background
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.9)',
                      lineHeight: 1.6,
                      textAlign: 'left',
                      maxHeight: '380px',
                      overflowY: 'auto'
                    }}
                  >
                    {/* Render Markdown Manual Sederhana untuk Keamanan Tanpa Eksternal parser */}
                    {insights.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) {
                        return <h4 key={idx} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', margin: '1rem 0 0.4rem 0', letterSpacing: '-0.01em' }}>{line.replace('###', '').trim()}</h4>;
                      }
                      if (line.startsWith('-')) {
                        return <li key={idx} style={{ marginLeft: '1rem', listStyleType: 'disc', marginBottom: '0.25rem' }}>{line.substring(1).trim()}</li>;
                      }
                      if (line.trim() === '') {
                        return <div key={idx} style={{ height: '0.5rem' }} />;
                      }
                      return <p key={idx} style={{ margin: '0 0 0.5rem 0' }}>{line}</p>;
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={handleGenerateInsights} 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.72rem', padding: '0.4rem 0.75rem', gap: '0.35rem', borderRadius: '6px' }}
                    >
                      <RefreshCw size={11} />
                      <span>Analisis Ulang</span>
                    </button>
                    <button 
                      onClick={() => setInsights(null)} 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.72rem', padding: '0.4rem 0.75rem', borderRadius: '6px' }}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
