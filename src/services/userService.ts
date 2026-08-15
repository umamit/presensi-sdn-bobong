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
    password: item.password,
    faceDescriptor: item.face_descriptor || undefined
  }));
}

export async function addUserLive(user: UserProfile): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('users').insert([{
    id: user.id || `usr-${Date.now()}`,
    nip: user.nip,
    full_name: user.fullName,
    email: user.email,
    role: user.role,
    subject: user.subject,
    password: user.password
  }]);

  if (error) {
    console.error('Error adding user to Supabase:', error.message);
    return false;
  }
  return true;
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

export async function updateUserFaceDescriptorLive(userId: string, descriptor: string | null): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('users')
    .update({ face_descriptor: descriptor })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user face descriptor in Supabase:', error.message);
    return false;
  }
  return true;
}

export async function deleteUserLive(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user in Supabase:', error.message);
    return false;
  }
  return true;
}

export async function updateUserLive(user: UserProfile): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('users')
    .update({
      nip: user.nip,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      subject: user.subject,
      password: user.password
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating user in Supabase:', error.message);
    return false;
  }
  return true;
}



