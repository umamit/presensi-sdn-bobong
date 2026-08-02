import { useState, useEffect, useRef, RefObject } from 'react';

interface UseLivenessOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  isCameraActive: boolean;
  capturedImage: string | null;
}

export function useLivenessDetection({ videoRef, isCameraActive, capturedImage }: UseLivenessOptions) {
  const [faceDetected, setFaceDetected] = useState(false);
  const [hasBlinked, setHasBlinked] = useState(false);
  const [livenessStatusMsg, setLivenessStatusMsg] = useState('Posisikan wajah di dalam bingkai oval...');
  const [eyeState, setEyeState] = useState<'open' | 'closed'>('open');
  const animFrameRef = useRef<number | null>(null);

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

          let totalBrightness = 0;
          let centerSkinPixels = 0;

          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const avg = (r + g + b) / 3;
            totalBrightness += avg;

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
  }, [isCameraActive, capturedImage, hasBlinked, videoRef]);

  return {
    faceDetected,
    hasBlinked,
    livenessStatusMsg,
    eyeState
  };
}
