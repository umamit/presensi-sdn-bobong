import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { AIFeedbackLog } from '../../types';

interface AIFeedbackPopupProps {
  log: AIFeedbackLog;
  onConfirm: () => void;
}

export const AIFeedbackPopup: React.FC<AIFeedbackPopupProps> = ({ log, onConfirm }) => {
  // Convert basic markdown/newlines to HTML
  const formattedText = log.feedbackText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '90%', 
          maxWidth: '480px', 
          padding: '1.5rem', 
          background: 'rgba(28, 28, 30, 0.95)', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <Sparkles size={20} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Catatan Evaluasi Cerdik AI</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Dikirim pada: {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            maxHeight: '260px',
            overflowY: 'auto',
            fontSize: '0.85rem',
            color: '#e5e5ea',
            lineHeight: '1.5',
            marginBottom: '1.25rem'
          }}
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />

        {/* Footer Action Button */}
        <button 
          onClick={onConfirm} 
          className="btn btn-primary" 
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            gap: '0.5rem',
            padding: '0.65rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <Check size={16} />
          <span>Saya Paham & Mengerti</span>
        </button>
      </div>
    </div>
  );
};
