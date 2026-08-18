import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import { X, Save, Clock } from 'lucide-react';
import { ShiftSettingsForm } from './settings/ShiftSettingsForm';

interface ShiftSettingsModalProps {
  settings: SchoolSettings;
  onClose: () => void;
  onSave: (updated: SchoolSettings) => void;
}

export const ShiftSettingsModal: React.FC<ShiftSettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '1.5rem', background: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock color="var(--primary)" size={20} /> Pengaturan Jam Kerja & Shift Sekolah
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ShiftSettingsForm formData={formData} setFormData={setFormData} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Save size={16} /> Simpan Setelan Waktu</button>
          </div>
        </form>
      </div>
    </div>
  );
};
