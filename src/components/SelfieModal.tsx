import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCcw, CheckCircle2, User } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      setCameraError('Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan di browser Anda.');
      console.warn('Camera error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image (selfie effect)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
  }, [stopCamera]);

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

  // Auto-start camera on mount
  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '1.5rem',
        background: '#0a0f1a'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera color="var(--secondary)" size={20} />
            Foto Selfie Bukti Kehadiran
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Guru Name Badge */}
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#a5b4fc' }}>
          <User size={15} />
          <span>{guruName}</span>
          <span style={{ color: 'var(--text-dim)' }}>• {new Date().toLocaleString('id-ID')}</span>
        </div>

        {/* Camera Error */}
        {cameraError && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {cameraError}
          </div>
        )}

        {/* Camera Viewfinder / Captured Preview */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          background: '#000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          border: `2px solid ${capturedImage ? '#10b981' : 'var(--border-color)'}`
        }}>
          {/* Live Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: capturedImage ? 'none' : 'block',
              transform: 'scaleX(-1)' // Mirror for selfie
            }}
          />

          {/* Captured Image Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Selfie preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.9rem' }}>
              Memuat kamera...
            </div>
          )}

          {/* Face Guide Overlay (only when camera active, not captured) */}
          {isCameraActive && !capturedImage && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -55%)',
              width: '160px',
              height: '200px',
              border: '2px dashed rgba(99,102,241,0.7)',
              borderRadius: '50% 50% 45% 45%',
              pointerEvents: 'none'
            }} />
          )}

          {/* Captured Badge */}
          {capturedImage && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#10b981',
              color: '#fff',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <CheckCircle2 size={13} /> Foto Diambil
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!capturedImage ? (
            <>
              <button onClick={handleClose} className="btn btn-secondary" style={{ flex: 1 }}>
                <X size={16} /> Batal
              </button>
              <button
                onClick={capturePhoto}
                disabled={!isCameraActive || isLoading}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                <Camera size={16} />
                <span>Ambil Foto Selfie</span>
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
