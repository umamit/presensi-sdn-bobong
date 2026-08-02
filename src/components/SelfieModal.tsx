import React, { useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, CheckCircle2, User, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useLivenessDetection } from '../hooks/useLivenessDetection';

interface SelfieModalProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  guruName: string;
}

export const SelfieModal: React.FC<SelfieModalProps> = ({
  onCapture,
  onClose,
  guruName
}) => {
  const { videoRef, canvasRef, isCameraActive, cameraError, isLoading, startCamera, stopCamera } = useCamera();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const { faceDetected, hasBlinked, livenessStatusMsg } = useLivenessDetection({
    videoRef,
    isCameraActive,
    capturedImage
  });

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jayapura' }) + ' WIT';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(10, canvas.height - 45, canvas.width - 20, 35);

      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`SDN Bobong • ${nowStr}`, 20, canvas.height - 22);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  }, [videoRef, canvasRef, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', background: '#0a0f1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera color="var(--secondary)" size={20} />
            Foto Selfie Bukti Kehadiran
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#a5b4fc' }}>
          <User size={15} />
          <span>{guruName}</span>
          <span style={{ color: 'var(--text-dim)' }}>• {new Date().toLocaleString('id-ID')}</span>
        </div>

        {cameraError && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {cameraError}
          </div>
        )}

        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem', border: `2px solid ${capturedImage ? '#10b981' : 'var(--border-color)'}` }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: capturedImage ? 'none' : 'block', transform: 'scaleX(-1)' }} />

          {capturedImage && <img src={capturedImage} alt="Selfie preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}

          {isLoading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.9rem' }}>Memuat kamera...</div>}

          {isCameraActive && !capturedImage && (
            <>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)', width: '160px', height: '200px', border: `3px dashed ${!faceDetected ? '#ff453a' : hasBlinked ? '#30d158' : '#ff9f0a'}`, borderRadius: '50% 50% 45% 45%', pointerEvents: 'none', transition: 'all 0.3s ease' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.85rem', borderRadius: '20px', color: !faceDetected ? '#ff453a' : hasBlinked ? '#30d158' : '#ff9f0a', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.1)' }}>
                {!faceDetected ? <AlertCircle size={14} /> : hasBlinked ? <ShieldCheck size={14} /> : <Eye size={14} />}
                <span>{livenessStatusMsg}</span>
              </div>
            </>
          )}

          {capturedImage && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#30d158', color: '#fff', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> Terverifikasi
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!capturedImage ? (
            <>
              <button onClick={handleClose} className="btn btn-secondary" style={{ flex: 1 }}>
                <X size={16} /> Batal
              </button>
              <button onClick={capturePhoto} disabled={!isCameraActive || isLoading || !faceDetected} className="btn btn-primary" style={{ flex: 2, opacity: (!isCameraActive || isLoading || !faceDetected) ? 0.4 : 1, cursor: (!isCameraActive || isLoading || !faceDetected) ? 'not-allowed' : 'pointer' }}>
                <Camera size={16} />
                <span>{!faceDetected ? 'Arahkan Wajah ke Oval' : 'Ambil Foto Selfie'}</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={retakePhoto} className="btn btn-secondary" style={{ flex: 1 }}>
                <RotateCcw size={16} /> Ulangi
              </button>
              <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 2 }}>
                <CheckCircle2 size={16} />
                <span>Gunakan Foto Ini</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
