import { useState, useEffect } from 'react';
import { SchoolSettings } from '../types';
import { calculateDistanceMeters } from '../utils/haversine';
import { Geolocation } from '@capacitor/geolocation';

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
    let watchId: string | null = null;

    const startWatch = async () => {
      setGpsLoading(true);
      try {
        const permResult = await Geolocation.checkPermissions();
        if (permResult.location !== 'granted') {
          await Geolocation.requestPermissions({ permissions: ['location'] });
        }

        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 },
          (position, err) => {
            if (err || !position) {
              setGpsError('Akses lokasi ditolak atau GPS tidak aktif.');
              setGpsLoading(false);
              return;
            }

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
          }
        );
      } catch (error: any) {
        console.warn('Capacitor Watch Position Error:', error?.message);
        setGpsError('Akses lokasi ditolak atau GPS tidak aktif.');
        setGpsLoading(false);
      }
    };

    startWatch();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [schoolSettings.latitude, schoolSettings.longitude]);

  const isInRadius = (distance !== null && distance <= schoolSettings.radiusMeters);

  return { userCoords, distance, gpsLoading, gpsError, isInRadius, accuracy };
}
