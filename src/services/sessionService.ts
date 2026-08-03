import { UserProfile } from '../types';

const SESSION_KEY = 'sdn_bobong_session_user';

/**
 * Menyimpan sesi pengguna di sessionStorage (otomatis terhapus saat tab browser ditutup, tidak menggunakan localStorage)
 */
export function saveSessionUser(user: UserProfile | null): void {
  try {
    if (!user) {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.warn('SessionStorage Error:', e);
  }
}

/**
 * Mengambil sesi pengguna aktif dari sessionStorage saat halaman di-refresh
 */
export function getSessionUser(): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('SessionStorage Read Error:', e);
    return null;
  }
}
