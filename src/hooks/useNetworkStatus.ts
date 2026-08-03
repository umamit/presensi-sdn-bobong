import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { syncOfflineAttendanceQueue, getOfflineAttendanceQueue } from '../services/offlineSyncService';

interface UseNetworkStatusResult {
  isOnline: boolean;
  pendingSyncCount: number;
  syncOfflineData: () => Promise<number>;
}

export function useNetworkStatus(): UseNetworkStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => getOfflineAttendanceQueue().length);

  const syncOfflineData = async (): Promise<number> => {
    const count = await syncOfflineAttendanceQueue();
    setPendingSyncCount(getOfflineAttendanceQueue().length);
    return count;
  };

  useEffect(() => {
    const checkInitial = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
      } catch (e) {
        setIsOnline(navigator.onLine);
      }
    };

    checkInitial();

    let networkListener: any = null;
    try {
      networkListener = Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
        if (status.connected) {
          syncOfflineData();
        }
      });
    } catch (e) {
      const handleOnline = () => {
        setIsOnline(true);
        syncOfflineData();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      if (networkListener && typeof networkListener.remove === 'function') {
        networkListener.remove();
      }
    };
  }, []);

  return { isOnline, pendingSyncCount, syncOfflineData };
}
