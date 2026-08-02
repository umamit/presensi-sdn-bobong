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
      console.warn('Error uploading selfie to Supabase Storage:', error.message);
      return imageDataUrl;
    }

    const { data: urlData } = supabase.storage
      .from('presensi-selfies')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.warn('Selfie upload error, using local base64:', err);
    return imageDataUrl;
  }
}
