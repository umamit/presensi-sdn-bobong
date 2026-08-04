import { useState, useEffect, useCallback } from 'react';
import { AttendanceRecord } from '../types';
import { fetchAttendanceLive, isSupabaseConfigured } from '../lib/supabase';
import { subscribeAttendanceRealtime } from '../services/attendanceRealtimeService';

export function useAttendanceFetcher(selectedDate: string, searchTerm: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAttendanceLive();
      if (data) {
        setRecords(data);
      }
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setError(err?.message || 'Gagal memuat data presensi');
    } finally {
      // Tambahkan jeda visual halus agar transisi skeleton tidak flicker jika load terlalu cepat
      setTimeout(() => {
        setLoading(false);
      }, 350);
    }
  }, []);

  useEffect(() => {
    loadData();

    if (isSupabaseConfigured) {
      // Dengarkan update realtime agar dashboard admin langsung sinkron saat guru absen
      const unsubscribe = subscribeAttendanceRealtime((newRecord) => {
        setRecords((prev) => {
          // Update record jika sudah ada (misal checkout), atau tambahkan baru jika belum ada
          const existsIdx = prev.findIndex((r) => r.id === newRecord.id);
          if (existsIdx > -1) {
            const updated = [...prev];
            updated[existsIdx] = newRecord;
            return updated;
          }
          return [newRecord, ...prev];
        });
      });

      return () => unsubscribe();
    }
  }, [loadData]);

  // Filter berdasarkan tanggal dan pencarian (nama / NIP)
  const recordsToday = records.filter(r => r.date === selectedDate);
  
  const filteredRecords = recordsToday.filter(
    r => r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || r.userNip.includes(searchTerm)
  );

  return {
    allRecords: records,
    filteredRecords,
    recordsToday,
    loading,
    error,
    refetch: loadData
  };
}
