import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import { X, Save, MapPin, Navigation } from 'lucide-react';
import { ShiftSettingsForm } from './settings/ShiftSettingsForm';
import { Geolocation } from '@capacitor/geolocation';

interface SchoolSettingsModalProps {
  settings: SchoolSettings;
  onClose: () => void;
  onSave: (updated: SchoolSettings) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });

  const handleGetCurrentLocation = async () => {
    try {
      const permResult = await Geolocation.checkPermissions();
      if (permResult.location !== 'granted') await Geolocation.requestPermissions();
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(pos.coords.latitude.toFixed(6)),
        longitude: parseFloat(pos.coords.longitude.toFixed(6))
      }));
    } catch (e) {
      console.warn('GPS error:', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const DEFAULT_SCHOOL_LAT = -1.955536;
  const DEFAULT_SCHOOL_LNG = 124.384367;

  const isAtDefaultSchoolCoords = 
    Math.abs(formData.latitude - DEFAULT_SCHOOL_LAT) < 0.000001 &&
    Math.abs(formData.longitude - DEFAULT_SCHOOL_LNG) < 0.000001;

  const handleResetSchoolCoords = () => {
    setFormData(prev => ({
      ...prev,
      latitude: DEFAULT_SCHOOL_LAT,
      longitude: DEFAULT_SCHOOL_LNG
    }));
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '1.5rem', background: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin color="var(--primary)" /> Pengaturan Titik GPS Sekolah & Jam Masuk
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Nama Instansi Sekolah</label>
            <input type="text" value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} className="glass-input" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Latitude GPS</label>
              <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} className="glass-input" required />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Longitude GPS</label>
              <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} className="glass-input" required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleGetCurrentLocation} className="btn btn-secondary" style={{ padding: '0.45rem 0.6rem', fontSize: '0.78rem', gap: '0.4rem', flex: 1 }}>
              <Navigation size={14} color="var(--secondary)" />
              <span>Gunakan Posisi Saya</span>
            </button>
            <button
              type="button"
              onClick={handleResetSchoolCoords}
              disabled={isAtDefaultSchoolCoords}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.6rem',
                fontSize: '0.78rem',
                gap: '0.4rem',
                flex: 1,
                opacity: isAtDefaultSchoolCoords ? 0.45 : 1,
                cursor: isAtDefaultSchoolCoords ? 'not-allowed' : 'pointer'
              }}
            >
              <MapPin size={14} color={isAtDefaultSchoolCoords ? 'var(--text-dim)' : 'var(--warning)'} />
              <span>Kembali ke Koordinat Sekolah</span>
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Radius Toleransi Maksimal Absensi: <strong style={{ color: 'var(--secondary)' }}>{formData.radiusMeters} Meter</strong>
            </label>
            <input type="range" min="3" max="500" step="1" value={formData.radiusMeters} onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value) || 3 })} style={{ width: '100%', accentColor: 'var(--primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <span>3m (Super Strict)</span><span>100m (Standard)</span><span>500m (Long Range)</span>
            </div>
          </div>

          <ShiftSettingsForm formData={formData} setFormData={setFormData} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Save size={16} /> Simpan Lokasi & Aturan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
