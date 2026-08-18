import { supabase } from './supabaseClient';

export async function uploadSelfie(imageDataUrl: string, userId: string): Promise<string | null> {
  if (!supabase) return imageDataUrl;

  try {
    const res = await fetch(imageDataUrl);
    const blob = await res.blob();

    const fileName = `selfies/${userId}_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('presensi-selfies')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      console.warn('Supabase Storage Warning (presensi-selfies):', error.message);
      return imageDataUrl; // Fallback gunakan base64 jika bucket belum dibuat
    }

    const { data: urlData } = supabase.storage
      .from('presensi-selfies')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.warn('Selfie upload error:', err);
    return imageDataUrl;
  }
}

export async function uploadLeaveDocument(imageDataUrl: string, userId: string): Promise<string | null> {
  if (!supabase) return imageDataUrl;

  try {
    const res = await fetch(imageDataUrl);
    const blob = await res.blob();

    const fileName = `documents/leave_${userId}_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('presensi-selfies')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      console.warn('Error uploading leave document to Supabase Storage:', error.message);
      return imageDataUrl;
    }

    const { data: urlData } = supabase.storage
      .from('presensi-selfies')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.warn('Document upload error:', err);
    return imageDataUrl;
  }
}
