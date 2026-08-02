import { LeaveRequest } from '../types';
import { supabase } from './supabaseClient';

export async function fetchLeavesLive(): Promise<LeaveRequest[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching leave_requests from Supabase:', error.message);
    return null;
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    userName: item.user_name,
    userNip: item.user_nip,
    startDate: item.start_date,
    endDate: item.end_date,
    leaveType: item.leave_type,
    description: item.description,
    documentUrl: item.document_url,
    status: item.status,
    createdAt: item.created_at
  }));
}

export async function saveLeaveLive(req: LeaveRequest): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leave_requests').insert([{
    user_id: req.userId,
    user_name: req.userName,
    user_nip: req.userNip,
    start_date: req.startDate,
    end_date: req.endDate,
    leave_type: req.leaveType,
    description: req.description,
    document_url: req.documentUrl,
    status: req.status
  }]);

  if (error) {
    console.error('Error saving leave request to Supabase:', error.message);
    return false;
  }
  return true;
}

export async function updateLeaveStatusLive(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('leave_requests')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating leave status in Supabase:', error.message);
    return false;
  }
  return true;
}
