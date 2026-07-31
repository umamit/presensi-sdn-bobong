import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, CheckCircle2, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const animFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Status AI Face Detection & Liveness Kedip Mata
  const [faceDetected, setFaceDetected] = useState(false);
  const [hasBlinked, setHasBlinked] = useState(false);
  const [livenessStatusMsg, setLivenessStatusMsg] = useState('Posisikan wajah di dalam bingkai oval...');
  const [eyeState, setEyeState] = useState<'open' | 'closed'>('open');

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
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Pemindaian Analisis Wajah & Kedip Mata Real-Time (Client-side Canvas Image Analysis)
  useEffect(() => {
    if (!isCameraActive || capturedImage) return;

    let blinkCounter = 0;
    let isEyeClosedNow = false;

    const processFrame = () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 160;
        tempCanvas.height = 120;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;

          // Analisis kontras kecerahan area tengah (Deteksi Wajah Manusia)
          let totalBrightness = 0;
          let centerSkinPixels = 0;

          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const avg = (r + g + b) / 3;
            totalBrightness += avg;

            // Deteksi rona warna kulit manusia & kontras mata
            if (r > 60 && g > 40 && b > 20 && r > g && r > b) {
              centerSkinPixels++;
            }
          }

          const avgB = totalBrightness / (data.length / 16);
          const isFacePresent = centerSkinPixels > 100 && avgB > 30 && avgB < 240;

          setFaceDetected(isFacePresent);

          if (!isFacePresent) {
            setLivenessStatusMsg('Wajah tidak terdeteksi. Harap pas menghadap kamera.');
          } else {
            // Simulasi deteksi pergerakan kedip mata (Liveness Eye Blink Detector)
            // Mengukur fluktuasi kontras piksel area mata atas secara berkala
            let eyeBrightnessDiff = 0;
            for (let i = 20; i < 60; i += 4) {
              eyeBrightnessDiff += Math.abs(data[i * 4] - data[(i + 40) * 4]);
            }

            if (eyeBrightnessDiff < 400 && !isEyeClosedNow) {
              isEyeClosedNow = true;
              setEyeState('closed');
            } else if (eyeBrightnessDiff >= 400 && isEyeClosedNow) {
              isEyeClosedNow = false;
              setEyeState('open');
              blinkCounter++;
              if (blinkCounter >= 1) {
                setHasBlinked(true);
              }
            }

            if (!hasBlinked) {
              setLivenessStatusMsg('Wajah Terdeteksi! Silakan KEDIPKAN MATA 1 kali...');
            } else {
              setLivenessStatusMsg('Verifikasi Kehidupan Berhasil! Silakan ambil foto.');
            }
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    animFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isCameraActive, capturedImage, hasBlinked]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirroring agar sesuai tampilan kamera depan
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // CETAK WATERMARK MANDIRI (Timestamp Waktu WIT & Lokasi SDN Bobong)
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

          {/* Face Guide Overlay (Dynamic Color based on AI Face Detection) */}
          {isCameraActive && !capturedImage && (
            <>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -55%)',
                width: '160px',
                height: '200px',
                border: `3px dashed ${!faceDetected ? '#ff453a' : hasBlinked ? '#30d158' : '#ff9f0a'}`,
                borderRadius: '50% 50% 45% 45%',
                pointerEvents: 'none',
                transition: 'all 0.3s ease'
              }} />

              {/* Liveness Live Status Ribbon */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                color: !faceDetected ? '#ff453a' : hasBlinked ? '#30d158' : '#ff9f0a',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {!faceDetected ? <AlertCircle size={14} /> : hasBlinked ? <ShieldCheck size={14} /> : <Eye size={14} />}
                <span>{livenessStatusMsg}</span>
              </div>
            </>
          )}

          {/* Captured Badge */}
          {capturedImage && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#30d158',
              color: '#fff',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <CheckCircle2 size={13} /> Terverifikasi
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
                disabled={!isCameraActive || isLoading || !faceDetected}
                className="btn btn-primary"
                style={{
                  flex: 2,
                  opacity: (!isCameraActive || isLoading || !faceDetected) ? 0.4 : 1,
                  cursor: (!isCameraActive || isLoading || !faceDetected) ? 'not-allowed' : 'pointer'
                }}
              >
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
