import { UserProfile } from '../types';
import { supabase } from './supabaseClient';

export async function fetchUsersLive(): Promise<UserProfile[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.warn('Error fetching users from Supabase:', error.message);
    return null;
  }

  return data.map(item => ({
    id: item.id,
    nip: item.nip,
    fullName: item.full_name,
    email: item.email,
    role: item.role,
    subject: item.subject,
    password: item.password
  }));
}

export async function updateUserPasswordLive(userId: string, newPassword: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user password in Supabase:', error.message);
    return false;
  }
  return true;
}
