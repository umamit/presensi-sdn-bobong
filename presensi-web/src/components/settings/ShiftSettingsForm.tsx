import React from 'react';
import { SchoolSettings } from '../../types';

interface ShiftSettingsFormProps {
  formData: SchoolSettings;
  setFormData: (data: SchoolSettings) => void;
}

export const ShiftSettingsForm: React.FC<ShiftSettingsFormProps> = ({ formData, setFormData }) => (
  <>
    {/* Shift Pagi */}
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
      <h4 style={{ fontSize: '0.85rem', color: '#0a84ff', marginBottom: '0.75rem', fontWeight: 700 }}>Shift Pagi</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Buka Absen Masuk</label>
          <input type="time" value={formData.pagiCheckInOpen || '06:00'} onChange={(e) => setFormData({ ...formData, pagiCheckInOpen: e.target.value })} className="glass-input" />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Tepat Waktu (Masuk)</label>
          <input type="time" value={formData.pagiWorkStart || '08:00'} onChange={(e) => setFormData({ ...formData, pagiWorkStart: e.target.value })} className="glass-input" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Absen Pulang</label>
          <input type="time" value={formData.pagiCheckOutStart || '11:45'} onChange={(e) => setFormData({ ...formData, pagiCheckOutStart: e.target.value })} className="glass-input" />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Akhir Pulang</label>
          <input type="time" value={formData.pagiCheckOutEnd || '12:00'} onChange={(e) => setFormData({ ...formData, pagiCheckOutEnd: e.target.value })} className="glass-input" />
        </div>
      </div>
    </div>

    {/* Shift Siang */}
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
      <h4 style={{ fontSize: '0.85rem', color: '#ff9f0a', marginBottom: '0.75rem', fontWeight: 700 }}>Shift Siang</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Buka Absen Masuk</label>
          <input type="time" value={formData.siangCheckInOpen || '12:00'} onChange={(e) => setFormData({ ...formData, siangCheckInOpen: e.target.value })} className="glass-input" />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Tepat Waktu (Masuk)</label>
          <input type="time" value={formData.siangWorkStart || '12:30'} onChange={(e) => setFormData({ ...formData, siangWorkStart: e.target.value })} className="glass-input" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Absen Pulang</label>
          <input type="time" value={formData.siangCheckOutStart || '16:00'} onChange={(e) => setFormData({ ...formData, siangCheckOutStart: e.target.value })} className="glass-input" />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Akhir Pulang</label>
          <input type="time" value={formData.siangCheckOutEnd || '16:45'} onChange={(e) => setFormData({ ...formData, siangCheckOutEnd: e.target.value })} className="glass-input" />
        </div>
      </div>
    </div>
  </>
);
