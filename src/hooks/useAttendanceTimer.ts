import { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useClockTick(): Date {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return currentTime;
}

// Inisialisasi dan penjadwalan alarm notifikasi lokal sekali saja
async function setupLocalNotifications() {
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Bersihkan notifikasi terjadwal sebelumnya agar tidak menumpuk duplikat
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    // Jadwalkan notifikasi harian berulang
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101,
          title: 'Presensi Masuk Pagi',
          body: 'Ayo absen masuk pagi sekarang! Batas toleransi jam 07:15 WIT.',
          schedule: {
            on: { hour: 6, minute: 45 },
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 102,
          title: 'Peringatan Batas Absen Pagi',
          body: 'Segera lakukan absen masuk! 5 menit lagi batas jam 07:15 WIT.',
          schedule: {
            on: { hour: 7, minute: 10 },
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 103,
          title: 'Presensi Masuk Siang',
          body: 'Sudah jam 12:10 WIT, jangan lupa lakukan absen masuk shift siang!',
          schedule: {
            on: { hour: 12, minute: 10 },
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 104,
          title: 'Peringatan Batas Absen Siang',
          body: 'Segera absen masuk siang! 5 menit lagi batas jam 12:45 WIT.',
          schedule: {
            on: { hour: 12, minute: 40 },
            repeats: true,
            allowWhileIdle: true
          }
        }
      ]
    });
    console.log('✅ Capacitor Local Notifications successfully scheduled!');
  } catch (err) {
    console.warn('Failed to schedule local notifications:', err);
  }
}

export function useAttendanceTimer(userTodayRecord: AttendanceRecord | undefined): Date {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Setup notifikasi lokal native saat hook pertama kali berjalan
    setupLocalNotifications();

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Fallback web notification jika berjalan di browser non-mobile
      const hoursStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (hoursStr === '06:45' && !userTodayRecord && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Pengingat Presensi SD Negeri Bobong', {
          body: 'Ayo lakukan presensi masuk pagi sekarang sebelum jam 07:15 WIT!',
          icon: '/icon-192.png'
        });
      }
    }, 60000); // Cek per menit untuk fallback web

    return () => clearInterval(timer);
  }, [userTodayRecord]);

  return currentTime;
}
