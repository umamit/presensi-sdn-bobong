import { useState, useEffect } from 'react';
import { SchoolSettings } from '../types';
import { calculateDistanceMeters, isPointInPolygon } from '../utils/haversine';

interface UseGpsLocationResult {
  userCoords: { lat: number; lng: number } | null;
  distance: number | null;
  gpsLoading: boolean;
  gpsError: string | null;
  isInRadius: boolean;
  fetchGpsLocation: () => void;
}

export function useGpsLocation(schoolSettings: SchoolSettings): UseGpsLocationResult {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const fetchGpsLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation GPS.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        if (accuracy === 0) {
          setGpsError('Terdeteksi lokasi tidak valid (Mock GPS).');
        } else if (accuracy > 100) {
          setGpsError(`Sinyal GPS kurang akurat (${Math.round(accuracy)}m).`);
        }

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        const dist = calculateDistanceMeters(lat, lng, schoolSettings.latitude, schoolSettings.longitude);
        setDistance(dist);
        setGpsLoading(false);
      },
      (error) => {
        console.warn('GPS Error:', error.message);
        setGpsError('Akses lokasi ditolak. Tekan Panduan untuk bantuan.');
        setUserCoords(null);
        setDistance(null);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchGpsLocation();
  }, [schoolSettings]);

  const inPolygon = (userCoords && schoolSettings.polygonCoords)
    ? isPointInPolygon([userCoords.lat, userCoords.lng], schoolSettings.polygonCoords)
    : false;

  const isInRadius = (distance !== null && distance <= schoolSettings.radiusMeters) || inPolygon;

  return { userCoords, distance, gpsLoading, gpsError, isInRadius, fetchGpsLocation };
}
