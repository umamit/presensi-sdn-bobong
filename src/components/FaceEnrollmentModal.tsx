import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { useCamera } from '../hooks/useCamera';

interface FaceEnrollmentModalProps {
  onRegister: (faceDescriptorStr: string) => void;
  onClose: () => void;
  guruName: string;
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const FaceEnrollmentModal: React.FC<FaceEnrollmentModalProps> = ({
  onRegister,
  onClose,
  guruName
}) => {
  const { videoRef, canvasRef, isCameraActive, cameraError, isLoading: cameraLoading, startCamera, stopCamera } = useCamera();
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('Memulai sistem kamera...');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [enrollSuccess, setEnrollSuccess] = useState<boolean>(false);

  // Load face-api models from high-speed CDN if not already loaded
  useEffect(() => {
    let active = true;

    async function loadModels() {
      try {
        setStatusMsg('Mengunduh modul pengenalan wajah (AI)...');
        
        // Periksa apakah model sudah dimuat sebelumnya
        const ssdLoaded = faceapi.nets.ssdMobilenetv1.params;
        const landmarkLoaded = faceapi.nets.faceLandmark68Net.params;
        const recogLoaded = faceapi.nets.faceRecognitionNet.params;

        if (!ssdLoaded) {
          await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        }
        if (!landmarkLoaded) {
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        }
        if (!recogLoaded) {
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        }

        if (active) {
          setModelLoading(false);
          setStatusMsg('Modul AI siap. Posisikan wajah Anda di depan kamera.');
          startCamera();
        }
      } catch (err: any) {
        console.error('Error loading face-api models:', err);
        if (active) {
          setModelError('Gagal memuat modul wajah AI dari CDN. Harap periksa jaringan internet Anda.');
          setModelLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      active = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleEnroll = useCallback(async () => {
    if (!videoRef.current || isProcessing) return;

    setIsProcessing(true);
    setStatusMsg('Memindai struktur wajah Anda... Mohon tidak bergerak.');

    try {
      const video = videoRef.current;
      
      // Deteksi wajah, landmark, dan deskriptor wajah
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatusMsg('Wajah tidak terdeteksi secara jelas. Mohon posisikan wajah tepat di depan kamera dan pastikan cahaya cukup.');
        setIsProcessing(false);
        return;
      }

      // Konversi Float32Array ke Array standar lalu ubah ke string JSON
      const descriptorArray = Array.from(detection.descriptor);
      const descriptorJson = JSON.stringify(descriptorArray);

      setStatusMsg('Wajah berhasil terekam!');
      setIsProcessing(false);
      setEnrollSuccess(true);

      // Berikan jeda efek visual sukses sebelum menutup modal
      setTimeout(() => {
        onRegister(descriptorJson);
      }, 1500);

    } catch (err: any) {
      console.error('Error during face enrollment:', err);
      setStatusMsg('Terjadi kesalahan saat memproses deteksi wajah. Silakan coba lagi.');
      setIsProcessing(false);
    }
  }, [videoRef, isProcessing, onRegister]);

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem', background: '#0a0f1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="var(--secondary)" size={20} />
            Pendaftaran Sidik Jari Wajah
          </h3>
          <button onClick={onClose} disabled={isProcessing || enrollSuccess} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#a5b4fc', lineHeight: 1.4 }}>
          Halo <strong>{guruName}</strong>, foto wajah master Anda dibutuhkan sebagai referensi absensi untuk mencegah titip absen. Proses ini hanya dilakukan sekali.
        </div>

        {/* Video Camera Container */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', background: '#111827', border: '2px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.25rem' }}>
          {modelLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <RefreshCw className="spin" size={24} color="var(--secondary)" />
              <span>Memuat modul wajah AI...</span>
            </div>
          ) : modelError ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#f87171', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={24} />
              <span>{modelError}</span>
            </div>
          ) : cameraError ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#f87171', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={24} />
              <span>{cameraError}</span>
            </div>
          ) : enrollSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
              <CheckCircle2 size={48} />
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>Pendaftaran Sukses!</span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* Face Guide Frame Overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '75%',
                border: isProcessing ? '3px dashed var(--secondary)' : '2px dashed rgba(255, 255, 255, 0.4)',
                borderRadius: '50% / 45%',
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(10, 15, 26, 0.5)'
              }} />
            </>
          )}
        </div>

        {/* Status Message */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '0.75rem',
          fontSize: '0.82rem',
          color: enrollSuccess ? 'var(--success)' : isProcessing ? 'var(--secondary)' : 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '1.25rem',
          minHeight: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {statusMsg}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            disabled={isProcessing || enrollSuccess}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            Batal
          </button>
          <button
            onClick={handleEnroll}
            disabled={modelLoading || !!modelError || !!cameraError || isProcessing || enrollSuccess}
            className="btn btn-primary"
            style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            {isProcessing && <RefreshCw className="spin" size={14} />}
            {isProcessing ? 'Memproses...' : 'Daftarkan Wajah'}
          </button>
        </div>
      </div>
    </div>
  );
};
