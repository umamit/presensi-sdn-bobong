import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import { X, Save, MapPin, Navigation } from 'lucide-react';

interface SchoolSettingsModalProps {
  settings: SchoolSettings;
  onClose: () => void;
  onSave: (updated: SchoolSettings) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  settings,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6))
        }));
      });
    }
  };

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
            <MapPin color="var(--primary)" /> Pengaturan Titik GPS Sekolah & Jam Masuk
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Nama Instansi Sekolah</label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Latitude GPS</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className="glass-input"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Longitude GPS</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className="glass-input"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="btn btn-secondary"
            style={{ padding: '0.45rem', fontSize: '0.8rem', gap: '0.4rem' }}
          >
            <Navigation size={14} color="var(--secondary)" />
            <span>Gunakan Koordinat Posisi Saya Saat Ini</span>
          </button>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Radius Toleransi Maksimal Absensi: <strong style={{ color: 'var(--secondary)' }}>{formData.radiusMeters} Meter</strong>
            </label>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={formData.radiusMeters}
              onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <span>20m (Strict)</span>
              <span>100m (Standard)</span>
              <span>500m (Long Range)</span>
            </div>
          </div>

          {/* JADWALS 2 SHIFT */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#0a84ff', marginBottom: '0.75rem', fontWeight: 700 }}>Shift Pagi</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Buka Absen Masuk</label>
                <input
                  type="time"
                  value={formData.pagiCheckInOpen || '06:00'}
                  onChange={(e) => setFormData({ ...formData, pagiCheckInOpen: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Tepat Waktu (Masuk)</label>
                <input
                  type="time"
                  value={formData.pagiWorkStart || '08:00'}
                  onChange={(e) => setFormData({ ...formData, pagiWorkStart: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Absen Pulang</label>
                <input
                  type="time"
                  value={formData.pagiCheckOutStart || '11:45'}
                  onChange={(e) => setFormData({ ...formData, pagiCheckOutStart: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Akhir Pulang</label>
                <input
                  type="time"
                  value={formData.pagiCheckOutEnd || '12:00'}
                  onChange={(e) => setFormData({ ...formData, pagiCheckOutEnd: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#ff9f0a', marginBottom: '0.75rem', fontWeight: 700 }}>Shift Siang</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Buka Absen Masuk</label>
                <input
                  type="time"
                  value={formData.siangCheckInOpen || '12:00'}
                  onChange={(e) => setFormData({ ...formData, siangCheckInOpen: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Tepat Waktu (Masuk)</label>
                <input
                  type="time"
                  value={formData.siangWorkStart || '12:30'}
                  onChange={(e) => setFormData({ ...formData, siangWorkStart: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Absen Pulang</label>
                <input
                  type="time"
                  value={formData.siangCheckOutStart || '16:00'}
                  onChange={(e) => setFormData({ ...formData, siangCheckOutStart: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batas Akhir Pulang</label>
                <input
                  type="time"
                  value={formData.siangCheckOutEnd || '16:45'}
                  onChange={(e) => setFormData({ ...formData, siangCheckOutEnd: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Save size={16} /> Simpan Lokasi & Aturan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
