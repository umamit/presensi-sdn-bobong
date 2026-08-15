import React, { useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, CheckCircle2, User, Eye, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { useCamera } from '../hooks/useCamera';
import { useLivenessDetection } from '../hooks/useLivenessDetection';

interface SelfieModalProps {
  onCapture: (imageDataUrl: string, bypassNote?: string) => void;
  onClose: () => void;
  guruName: string;
  faceDescriptor?: string;
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const SelfieModal: React.FC<SelfieModalProps> = ({
  onCapture,
  onClose,
  guruName,
  faceDescriptor
}) => {
  const { videoRef, canvasRef, isCameraActive, cameraError, isLoading, startCamera, stopCamera } = useCamera();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // States for face recognition
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [failCount, setFailCount] = useState<number>(0);
  const [bypassAllowed, setBypassAllowed] = useState<boolean>(false);
  const [bypassReason, setBypassReason] = useState<string>('Kamera HP buram/kotor');

  const { faceDetected, hasBlinked, hasSmiled, livenessStatusMsg } = useLivenessDetection({
    videoRef,
    isCameraActive,
    capturedImage
  });

  // Preload face-api models if faceDescriptor is present
  useEffect(() => {
    if (!faceDescriptor) return;
    let active = true;

    async function preload() {
      try {
        setModelLoading(true);
        const ssdLoaded = faceapi.nets.ssdMobilenetv1.params;
        const landmarkLoaded = faceapi.nets.faceLandmark68Net.params;
        const recogLoaded = faceapi.nets.faceRecognitionNet.params;

        if (!ssdLoaded) await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        if (!landmarkLoaded) await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        if (!recogLoaded) await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        if (active) {
          setModelLoading(false);
        }
      } catch (err: any) {
        console.error('Error preloading face-api models:', err);
        if (active) {
          setModelError('Gagal memuat modul pencocokan wajah AI.');
          setModelLoading(false);
        }
      }
    }

    preload();
    return () => {
      active = false;
    };
  }, [faceDescriptor]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isVerifying) return;

    const video = videoRef.current;
    
    // Jika user memiliki data wajah terdaftar, jalankan verifikasi wajah
    if (faceDescriptor && !modelLoading && !modelError) {
      setIsVerifying(true);
      setVerificationError(null);

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setIsVerifying(false);
          setVerificationError('Wajah tidak terdeteksi oleh AI. Harap posisikan wajah lurus di depan kamera.');
          
          const newFails = failCount + 1;
          setFailCount(newFails);
          if (newFails >= 3) {
            setBypassAllowed(true);
          }
          return;
        }

        const masterDescriptor = new Float32Array(JSON.parse(faceDescriptor));
        const distance = faceapi.euclideanDistance(detection.descriptor, masterDescriptor);

        // Ambang batas kemiripan (threshold: 0.55). Lebih kecil = lebih ketat.
        if (distance > 0.55) {
          setIsVerifying(false);
          setVerificationError('Wajah tidak sesuai dengan pemilik akun sekolah ini!');
          
          const newFails = failCount + 1;
          setFailCount(newFails);
          if (newFails >= 3) {
            setBypassAllowed(true);
          }
          return;
        }

      } catch (err: any) {
        console.error('Error during face verification:', err);
        setIsVerifying(false);
        setVerificationError('Gagal memproses verifikasi wajah. Silakan coba lagi.');
        return;
      }
    }

    // Eksekusi pemotretan ke canvas jika lolos verifikasi (atau tidak memiliki data wajah master/bypass)
    executePhotoCapture();
  }, [videoRef, canvasRef, isVerifying, faceDescriptor, modelLoading, modelError, failCount]);

  const executePhotoCapture = () => {
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
      setIsVerifying(false);
      stopCamera();
    }
  };

  const handleBypassCapture = () => {
    // Absen darurat: Lewati deteksi wajah dan catat alasan daruratnya
    executePhotoCapture();
  };

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setVerificationError(null);
    startCamera();
  }, [startCamera]);

  const handleConfirm = () => {
    if (capturedImage) {
      const bypassNote = failCount >= 3 ? `Bypass Wajah (Alasan: ${bypassReason})` : undefined;
      onCapture(capturedImage, bypassNote);
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
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', background: '#0a0f1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera color="var(--secondary)" size={20} />
            Foto Selfie Bukti Kehadiran
          </h3>
          <button onClick={handleClose} disabled={isVerifying} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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

        {verificationError && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
              <AlertCircle size={14} /> Gagal Verifikasi Wajah ({failCount}/3)
            </div>
            <span>{verificationError}</span>
          </div>
        )}

        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem', border: `2px solid ${capturedImage ? '#10b981' : 'var(--border-color)'}` }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: capturedImage ? 'none' : 'block', transform: 'scaleX(-1)' }} />

          {capturedImage && <img src={capturedImage} alt="Selfie preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}

          {(isLoading || modelLoading) && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.88rem' }}>
              <RefreshCw className="spin" size={24} color="var(--secondary)" />
              <span>{modelLoading ? 'Memuat modul wajah AI...' : 'Memulai kamera...'}</span>
            </div>
          )}

          {isVerifying && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.88rem' }}>
              <RefreshCw className="spin" size={24} color="var(--secondary)" />
              <span>Memproses pencocokan wajah AI...</span>
            </div>
          )}

          {isCameraActive && !capturedImage && !isVerifying && (
            <>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)', width: '160px', height: '200px', border: `3px dashed ${!faceDetected ? '#ff453a' : (hasBlinked && hasSmiled) ? '#30d158' : '#ff9f0a'}`, borderRadius: '50% 50% 45% 45%', pointerEvents: 'none', transition: 'all 0.3s ease' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.85rem', borderRadius: '20px', color: !faceDetected ? '#ff453a' : (hasBlinked && hasSmiled) ? '#30d158' : '#ff9f0a', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.1)' }}>
                {!faceDetected ? <AlertCircle size={14} /> : (hasBlinked && hasSmiled) ? <ShieldCheck size={14} /> : <Eye size={14} />}
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

        {/* Emergency Bypass Mode UI (Jika sudah gagal 3 kali) */}
        {bypassAllowed && !capturedImage && (
          <div style={{ background: 'rgba(255,159,10,0.1)', border: '1px solid #ff9f0a', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ff9f0a', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <AlertCircle size={15} /> Deteksi Gagal 3x: Opsi Absen Darurat
            </div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Pilih Alasan Darurat:</label>
            <select
              value={bypassReason}
              onChange={(e) => setBypassReason(e.target.value)}
              style={{ width: '100%', background: '#1c1c1e', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.45rem', fontSize: '0.82rem', outline: 'none' }}
            >
              <option value="Kamera HP buram/kotor">Kamera HP buram/kotor</option>
              <option value="Pencahayaan sekitar redup/gelap">Pencahayaan sekitar redup/gelap</option>
              <option value="Gangguan pemrosesan AI perangkat">Gangguan pemrosesan AI perangkat</option>
              <option value="Perubahan penampilan fisik wajar">Perubahan penampilan fisik wajar</option>
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!capturedImage ? (
            <>
              <button onClick={handleClose} disabled={isVerifying} className="btn btn-secondary" style={{ flex: 1 }}>
                <X size={16} /> Batal
              </button>
              
              {bypassAllowed ? (
                <button onClick={handleBypassCapture} className="btn btn-primary" style={{ flex: 2, background: 'var(--warning)', borderColor: 'var(--warning)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={16} />
                  <span>Absen Darurat</span>
                </button>
              ) : (
                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive || isLoading || modelLoading || isVerifying || !faceDetected || !hasBlinked || !hasSmiled}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    opacity: (!isCameraActive || isLoading || modelLoading || isVerifying || !faceDetected || !hasBlinked || !hasSmiled) ? 0.4 : 1,
                    cursor: (!isCameraActive || isLoading || modelLoading || isVerifying || !faceDetected || !hasBlinked || !hasSmiled) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Camera size={16} />
                  <span>
                    {modelLoading ? 'Memuat AI Wajah...' : !faceDetected ? 'Arahkan Wajah ke Oval' : !hasBlinked ? 'Kedipkan Mata 1x' : !hasSmiled ? 'Tersenyumlah 😊' : 'Ambil Foto Selfie'}
                  </span>
                </button>
              )}
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
