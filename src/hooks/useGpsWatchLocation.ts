import { useState, useEffect } from 'react';
import { SchoolSettings } from '../types';
import { calculateDistanceMeters, isPointInPolygon } from '../utils/haversine';

interface UseGpsWatchLocationResult {
  userCoords: { lat: number; lng: number } | null;
  distance: number | null;
  gpsLoading: boolean;
  gpsError: string | null;
  isInRadius: boolean;
  accuracy: number | null;
}

export function useGpsWatchLocation(schoolSettings: SchoolSettings): UseGpsWatchLocationResult {
  const [gpsLoading, setGpsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation GPS.');
      setGpsLoading(false);
      return;
    }

    setGpsLoading(true);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const acc = position.coords.accuracy;
        setAccuracy(acc);

        if (acc === 0) {
          setGpsError('Terdeteksi lokasi tidak valid (Mock GPS).');
        } else if (acc > 100) {
          setGpsError(`Sinyal GPS kurang akurat (${Math.round(acc)}m).`);
        } else {
          setGpsError(null);
        }

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        const dist = calculateDistanceMeters(lat, lng, schoolSettings.latitude, schoolSettings.longitude);
        setDistance(dist);
        setGpsLoading(false);
      },
      (error) => {
        console.warn('GPS Watch Error:', error.message);
        setGpsError('Akses lokasi ditolak. Tekan Panduan untuk bantuan.');
        setUserCoords(null);
        setDistance(null);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [schoolSettings.latitude, schoolSettings.longitude]);

  const inPolygon = (userCoords && schoolSettings.polygonCoords)
    ? isPointInPolygon([userCoords.lat, userCoords.lng], schoolSettings.polygonCoords)
    : false;

  const isInRadius = (distance !== null && distance <= schoolSettings.radiusMeters) || inPolygon;

  return { userCoords, distance, gpsLoading, gpsError, isInRadius, accuracy };
}
