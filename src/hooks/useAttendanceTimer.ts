import { useState, useEffect } from 'react';
import { AttendanceRecord, SchoolSettings } from '../types';
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

// Helper: hitung jam & menit X menit sebelum dari string "HH:MM"
function getAlarmTimeBefore(timeStr: string, minutesBefore: number): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m - minutesBefore;
  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60
  };
}

// Jadwalkan alarm notifikasi lokal secara dinamis berdasarkan schoolSettings
async function setupLocalNotifications(s: SchoolSettings) {
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

    const pagiMasukAlarm  = getAlarmTimeBefore(s.pagiWorkStart     || '07:15', 15);
    const pagiPulangAlarm = getAlarmTimeBefore(s.pagiCheckOutStart  || '11:45',  0);
    const siangMasukAlarm  = getAlarmTimeBefore(s.siangWorkStart    || '12:45', 15);
    const siangPulangAlarm = getAlarmTimeBefore(s.siangCheckOutStart || '16:00',  0);

    // Jadwalkan notifikasi harian berulang sesuai 2 shift SDN Bobong (dinamis)
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 201,
          title: 'Presensi Masuk Pagi',
          body: `Ayo lakukan absen masuk pagi! Batas jam masuk adalah ${s.pagiWorkStart || '07:15'} WIT.`,
          schedule: {
            on: pagiMasukAlarm,
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 202,
          title: 'Presensi Pulang Pagi',
          body: `Jam pulang pagi sudah dibuka. Jangan lupa absen pulang pagi sebelum ${s.pagiCheckOutEnd || '12:00'} WIT!`,
          schedule: {
            on: pagiPulangAlarm,
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 203,
          title: 'Presensi Masuk Siang',
          body: `Ayo lakukan absen masuk siang! Batas jam masuk adalah ${s.siangWorkStart || '12:45'} WIT.`,
          schedule: {
            on: siangMasukAlarm,
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 204,
          title: 'Presensi Pulang Siang',
          body: `Jam pulang siang sudah dibuka. Jangan lupa absen pulang siang sebelum ${s.siangCheckOutEnd || '16:45'} WIT!`,
          schedule: {
            on: siangPulangAlarm,
            repeats: true,
            allowWhileIdle: true
          }
        }
      ]
    });
    console.log('✅ Capacitor Local Notifications successfully scheduled (dynamic shifts)!');
  } catch (err) {
    console.warn('Failed to schedule local notifications:', err);
  }
}

export function useAttendanceTimer(
  userTodayRecord: AttendanceRecord | undefined,
  schoolSettings?: SchoolSettings
): Date {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Setup notifikasi lokal native saat hook pertama kali berjalan
    if (schoolSettings) {
      setupLocalNotifications(schoolSettings);
    }

    const pagiMasukStr = schoolSettings?.pagiWorkStart || '06:45';
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Fallback web notification jika berjalan di browser non-mobile
      const hoursStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\./g, ':');
      if (hoursStr === pagiMasukStr && !userTodayRecord && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Pengingat Presensi SD Negeri Bobong', {
          body: `Ayo lakukan presensi masuk pagi sekarang sebelum jam ${schoolSettings?.pagiWorkStart || '07:15'} WIT!`,
          icon: '/icon-192.png'
        });
      }
    }, 60000); // Cek per menit untuk fallback web

    return () => clearInterval(timer);
  }, [userTodayRecord, schoolSettings]);

  return currentTime;
}
