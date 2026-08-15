import { supabase } from './supabase';

export async function logPengajarActivity(userId: string | null, action: string, details?: string) {
  try {
    const { error } = await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action,
        details: details || null,
      },
    ]);
    if (error) {
      console.error('Failed to log activity:', error.message);
    }
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}
