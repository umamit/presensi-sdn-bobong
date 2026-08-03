import { useState, useEffect } from 'react';
import { SchoolSettings } from '../types';
import { calculateDistanceMeters, isPointInPolygon } from '../utils/haversine';
import { validateSchoolNetwork } from '../services/networkValidationService';
import { Geolocation } from '@capacitor/geolocation';

interface UseGpsLocationResult {
  userCoords: { lat: number; lng: number } | null;
  distance: number | null;
  gpsLoading: boolean;
  gpsError: string | null;
  isInRadius: boolean;
  isWifiMatched: boolean;
  networkInfo: string;
  fetchGpsLocation: () => void;
}

export function useGpsLocation(schoolSettings: SchoolSettings): UseGpsLocationResult {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isWifiMatched, setIsWifiMatched] = useState(false);
  const [networkInfo, setNetworkInfo] = useState('');

  const fetchGpsLocation = async () => {
    setGpsLoading(true);
    setGpsError(null);

    validateSchoolNetwork().then(res => {
      setIsWifiMatched(res.isWifiMatched);
      setNetworkInfo(res.networkInfo);
    });

    try {
      // Minta izin lokasi secara native jika belum diizinkan
      const permResult = await Geolocation.checkPermissions();
      if (permResult.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

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
    } catch (error: any) {
      console.warn('Capacitor Geolocation Error:', error?.message);
      setGpsError('Akses lokasi ditolak atau GPS tidak aktif. Silakan izinkan akses lokasi.');
      setUserCoords(null);
      setDistance(null);
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    fetchGpsLocation();
  }, [schoolSettings]);

  const inPolygon = (userCoords && schoolSettings.polygonCoords)
    ? isPointInPolygon([userCoords.lat, userCoords.lng], schoolSettings.polygonCoords)
    : false;

  const isInRadius = (distance !== null && distance <= schoolSettings.radiusMeters) || inPolygon || isWifiMatched;

  return { userCoords, distance, gpsLoading, gpsError, isInRadius, isWifiMatched, networkInfo, fetchGpsLocation };
}
