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

    // Jadwalkan notifikasi harian berulang sesuai 2 shift SDN Bobong
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 201,
          title: 'Presensi Masuk Pagi',
          body: 'Ayo lakukan absen masuk pagi! Batas jam masuk adalah 07:15 WIT.',
          schedule: {
            on: { hour: 6, minute: 45 }, // 15 menit sebelum batas masuk pagi
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 202,
          title: 'Presensi Pulang Pagi',
          body: 'Jam pulang pagi sudah dibuka. Jangan lupa absen pulang pagi sebelum 12:00 WIT!',
          schedule: {
            on: { hour: 11, minute: 45 }, // Tepat saat checkout pagi dibuka
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 203,
          title: 'Presensi Masuk Siang',
          body: 'Ayo lakukan absen masuk siang! Batas jam masuk adalah 12:45 WIT.',
          schedule: {
            on: { hour: 12, minute: 20 }, // Sebelum batas masuk siang
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 204,
          title: 'Presensi Pulang Siang',
          body: 'Jam pulang siang sudah dibuka. Jangan lupa absen pulang siang sebelum 16:45 WIT!',
          schedule: {
            on: { hour: 16, minute: 0 }, // Tepat saat checkout siang dibuka
            repeats: true,
            allowWhileIdle: true
          }
        }
      ]
    });
    console.log('✅ Capacitor Local Notifications successfully scheduled for 2 shifts!');
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
      const hoursStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', hour12: false });
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
