import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

interface UseNetworkStatusResult {
  isOnline: boolean;
}

export function useNetworkStatus(): UseNetworkStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

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
      });
    } catch (e) {
      const handleOnline = () => setIsOnline(true);
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

  return { isOnline };
}
