import React from 'react';
import { Key, HelpCircle, FileText } from 'lucide-react';

interface QuickActionButtonsProps {
  setIsChangePassOpen: (val: boolean) => void;
  setIsGuideOpen: (val: boolean) => void;
  onOpenLeaveModal: () => void;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  setIsChangePassOpen,
  setIsGuideOpen,
  onOpenLeaveModal
}) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <button onClick={() => setIsChangePassOpen(true)} className="btn btn-secondary" style={{ fontSize: '0.82rem', flex: 1 }}>
        <Key size={14} /> Ubah Sandi
      </button>
      <button onClick={() => setIsGuideOpen(true)} className="btn btn-secondary" style={{ fontSize: '0.82rem', flex: 1 }}>
        <HelpCircle size={14} /> Panduan
      </button>
      <button onClick={onOpenLeaveModal} className="btn btn-secondary" style={{ fontSize: '0.82rem', flex: 1 }}>
        <FileText size={14} /> Ajukan Izin
      </button>
    </div>
  );
};
