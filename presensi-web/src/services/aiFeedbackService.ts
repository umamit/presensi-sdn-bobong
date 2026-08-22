import { supabase } from './supabaseClient';
import { AIFeedbackLog } from '../types';

/**
 * Menyimpan catatan evaluasi AI baru untuk guru tertentu ke database Supabase.
 */
export const saveFeedbackLog = async (userNip: string, feedbackText: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('ai_feedback_logs')
      .insert([
        {
          user_nip: userNip,
          feedback_text: feedbackText,
          is_read: false
        }
      ]);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error in saveFeedbackLog:', e);
    return false;
  }
};

/**
 * Mengambil catatan evaluasi AI terbaru yang belum dibaca milik guru tertentu.
 */
export const fetchUnreadFeedback = async (userNip: string): Promise<AIFeedbackLog | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('ai_feedback_logs')
      .select('*')
      .eq('user_nip', userNip)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: String(data.id),
      userNip: data.user_nip,
      feedbackText: data.feedback_text,
      isRead: data.is_read,
      createdAt: data.created_at
    };
  } catch (e) {
    console.error('Error in fetchUnreadFeedback:', e);
    return null;
  }
};

/**
 * Menandai log evaluasi AI tertentu sebagai sudah dibaca (is_read = true).
 */
export const markFeedbackAsRead = async (logId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('ai_feedback_logs')
      .update({ is_read: true })
      .eq('id', logId);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error in markFeedbackAsRead:', e);
    return false;
  }
};

/**
 * Mengambil seluruh riwayat catatan evaluasi AI milik guru tertentu.
 */
export const fetchFeedbackHistory = async (userNip: string): Promise<AIFeedbackLog[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ai_feedback_logs')
      .select('*')
      .eq('user_nip', userNip)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(item => ({
      id: String(item.id),
      userNip: item.user_nip,
      feedbackText: item.feedback_text,
      isRead: item.is_read,
      createdAt: item.created_at
    }));
  } catch (e) {
    console.error('Error in fetchFeedbackHistory:', e);
    return [];
  }
};
