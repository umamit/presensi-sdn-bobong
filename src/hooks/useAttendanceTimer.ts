import { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord } from '../types';

export function useClockTick(): Date {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  return currentTime;
}

export function useAttendanceTimer(userTodayRecord: AttendanceRecord | undefined): Date {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const hoursStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (hoursStr === '07:00' && !userTodayRecord && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Pengingat Presensi SD Negeri Bobong', {
          body: 'Jangan lupa melakukan presensi masuk hari ini sebelum jam 07:15 WIT!',
          icon: '/icon-192.png'
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [userTodayRecord]);

  return currentTime;
}
