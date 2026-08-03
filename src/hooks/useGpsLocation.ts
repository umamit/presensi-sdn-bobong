import { useState, useEffect } from 'react';
import { SchoolSettings } from '../types';
import { calculateDistanceMeters } from '../utils/haversine';
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

// Fungsi pembantu mengecek Fake GPS menggunakan plugin native gpsmockchecker
const detectMockLocation = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const win = window as any;
    if (win.Capacitor?.isNativePlatform() && win.gpsmockchecker) {
      win.gpsmockchecker.check(
        [],
        (result: any) => {
          resolve(!!result.isMock);
        },
        (error: any) => {
          console.warn('GPS Mock check error:', error);
          resolve(false);
        }
      );
    } else {
      resolve(false);
    }
  });
};

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
      const permResult = await Geolocation.checkPermissions();
      if (permResult.location !== 'granted') {
        await Geolocation.requestPermissions({ permissions: ['location'] });
      }

      // 1. Pengecekan GPS palsu native Android
      const isMockLocation = await detectMockLocation();
      if (isMockLocation) {
        setGpsError('Terdeteksi Fake GPS aktif! Silakan nonaktifkan lokasi palsu di HP Anda.');
        setUserCoords(null);
        setDistance(null);
        setGpsLoading(false);
        return;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      // 2. Pengecekan GPS palsu fallback akurasi
      const accuracy = position.coords.accuracy;
      if (accuracy === 0) {
        setGpsError('Terdeteksi lokasi tidak valid (Mock GPS).');
        setUserCoords(null);
        setDistance(null);
        setGpsLoading(false);
        return;
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
      const errMsg = error?.message?.toLowerCase() || '';
      if (errMsg.includes('disabled') || errMsg.includes('provider')) {
        setGpsError('Sensor GPS Anda MATI! Aktifkan Lokasi/GPS di menu atas HP Anda.');
      } else if (errMsg.includes('denied') || errMsg.includes('permission')) {
        setGpsError('Izin Lokasi ditolak! Izinkan akses GPS untuk aplikasi ini di Pengaturan HP.');
      } else {
        setGpsError('Gagal mendeteksi lokasi. Pastikan GPS aktif dan Anda di luar ruangan.');
      }
      setUserCoords(null);
      setDistance(null);
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    fetchGpsLocation();
  }, [schoolSettings]);

  const isInRadius = distance !== null && distance <= schoolSettings.radiusMeters;

  return { userCoords, distance, gpsLoading, gpsError, isInRadius, isWifiMatched, networkInfo, fetchGpsLocation };
}
