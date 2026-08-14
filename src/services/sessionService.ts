import { UserProfile } from '../types';

const SESSION_KEY = 'sdn_bobong_session_user';

/**
 * Menyimpan sesi pengguna di localStorage agar bertahan saat APK ditutup & dibuka kembali
 */
export function saveSessionUser(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.warn('LocalStorage Error:', e);
  }
}

/**
 * Mengambil sesi pengguna aktif dari localStorage saat aplikasi dibuka kembali
 */
export function getSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage Read Error:', e);
    return null;
  }
}
