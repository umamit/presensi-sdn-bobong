import React, { useState } from 'react';
import { X, Sparkles, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { AIFeedbackLog } from '../../types';

interface AIFeedbackHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AIFeedbackLog[];
}

export const AIFeedbackHistoryModal: React.FC<AIFeedbackHistoryModalProps> = ({ isOpen, onClose, logs }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '90%', 
          maxWidth: '540px', 
          maxHeight: '80vh',
          padding: '1.25rem', 
          background: '#1c1c1e', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <Sparkles size={16} color="var(--primary)" /> Riwayat Catatan AI Saya
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}><X size={20} /></button>
        </div>

        {/* List of Log Items */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.15rem' }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Belum ada catatan evaluasi kinerja dari Kepala Sekolah.
            </div>
          ) : (
            logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const formattedDate = new Date(log.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              // Format text for snippet preview (remove formatting, limit characters)
              const cleanText = log.feedbackText
                .replace(/\*\*/g, '')
                .replace(/\n/g, ' ');
              const textSnippet = cleanText.length > 90 ? `${cleanText.substring(0, 85)}...` : cleanText;

              const formattedFullText = log.feedbackText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>');

              return (
                <div 
                  key={log.id} 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.04)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                    borderRadius: '12px', 
                    padding: '0.75rem 0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Summary Bar */}
                  <div 
                    onClick={() => toggleExpand(log.id)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="var(--primary)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{formattedDate}</span>
                      {!log.isRead && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }}></span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>

                  {/* Snippet / Expanded Content */}
                  <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                    {isExpanded ? (
                      <div 
                        style={{ 
                          paddingTop: '0.5rem', 
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          color: '#e5e5ea',
                          lineHeight: '1.5'
                        }}
                        dangerouslySetInnerHTML={{ __html: formattedFullText }}
                      />
                    ) : (
                      <span>{textSnippet}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
